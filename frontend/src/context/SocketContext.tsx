import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";

interface TimerUpdate {
  sessionId: string;
  deviceId: string;
  remainingMs: number;
  endTime: string;
}

type ConnectionMode = "connecting" | "realtime" | "polling";

interface SocketContextValue {
  connected: boolean;
  connectionMode: ConnectionMode;
  timers: Record<string, TimerUpdate>; // keyed by deviceId
  on: (event: string, cb: (data: unknown) => void) => void;
  off: (event: string, cb: (data: unknown) => void) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const hasEverConnectedRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("connecting");
  const [timers, setTimers] = useState<Record<string, TimerUpdate>>({});

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL || "/";
    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ["polling"],
    });
    socketRef.current = socket;

    const fallbackToPolling = () => {
      if (hasEverConnectedRef.current) return;
      setConnectionMode("polling");
      setConnected(false);
      socket.disconnect();
    };

    const connectTimeoutId = window.setTimeout(fallbackToPolling, 4000);

    socket.on("connect", () => {
      hasEverConnectedRef.current = true;
      setConnected(true);
      setConnectionMode("realtime");
      window.clearTimeout(connectTimeoutId);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      if (hasEverConnectedRef.current) {
        setConnectionMode("connecting");
      }
    });

    socket.on("connect_error", () => {
      fallbackToPolling();
    });

    socket.on("timerUpdate", (updates: TimerUpdate[]) => {
      setTimers((prev) => {
        const next = { ...prev };
        for (const u of updates) next[u.deviceId] = u;
        return next;
      });
    });

    socket.on("sessionEnded", ({ deviceId }: { deviceId: string }) => {
      setTimers((prev) => {
        const next = { ...prev };
        delete next[deviceId];
        return next;
      });
    });

    return () => {
      window.clearTimeout(connectTimeoutId);
      socket.disconnect();
    };
  }, []);

  const on = (event: string, cb: (data: unknown) => void) => {
    socketRef.current?.on(event, cb);
  };
  const off = (event: string, cb: (data: unknown) => void) => {
    socketRef.current?.off(event, cb);
  };

  return (
    <SocketContext.Provider
      value={{ connected, connectionMode, timers, on, off }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
