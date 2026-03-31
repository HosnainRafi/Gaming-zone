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

interface SocketContextValue {
  connected: boolean;
  timers: Record<string, TimerUpdate>; // keyed by deviceId
  on: (event: string, cb: (data: unknown) => void) => void;
  off: (event: string, cb: (data: unknown) => void) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [timers, setTimers] = useState<Record<string, TimerUpdate>>({});

  useEffect(() => {
    const socket = io("/", { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

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
    <SocketContext.Provider value={{ connected, timers, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used inside SocketProvider");
  return ctx;
}
