import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";
import { sessionApi, type Session } from "../api/sessions";

interface TimerUpdate {
  sessionId: string;
  deviceId: string;
  remainingMs: number;
  endTime: string;
}

interface SessionEndedPayload {
  sessionId: string;
  deviceId: string;
  deviceName?: string;
}

type ConnectionMode = "connecting" | "realtime" | "polling";

const SOUND_ENABLED_KEY = "gz_end_reminder_sound";
const VISUAL_ENABLED_KEY = "gz_end_reminder_visual";

function readStoredPreference(key: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;

  const value = window.localStorage.getItem(key);
  if (value == null) return fallback;
  return value === "true";
}

interface SocketContextValue {
  connected: boolean;
  connectionMode: ConnectionMode;
  timers: Record<string, TimerUpdate>; // keyed by deviceId
  reminderActive: boolean;
  soundEnabled: boolean;
  visualEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setVisualEnabled: (enabled: boolean) => void;
  stopReminder: () => void;
  on: (event: string, cb: (data: unknown) => void) => void;
  off: (event: string, cb: (data: unknown) => void) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const hasEverConnectedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioIntervalRef = useRef<number | null>(null);
  const audioTimeoutRef = useRef<number | null>(null);
  const reminderToastIdsRef = useRef<Set<string>>(new Set());
  const [connected, setConnected] = useState(false);
  const [connectionMode, setConnectionMode] =
    useState<ConnectionMode>("connecting");
  const [timers, setTimers] = useState<Record<string, TimerUpdate>>({});
  const [reminderActive, setReminderActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() =>
    readStoredPreference(SOUND_ENABLED_KEY, true),
  );
  const [visualEnabled, setVisualEnabled] = useState(() =>
    readStoredPreference(VISUAL_ENABLED_KEY, true),
  );
  const soundEnabledRef = useRef(soundEnabled);
  const visualEnabledRef = useRef(visualEnabled);

  const stopReminder = useCallback(() => {
    if (audioIntervalRef.current != null) {
      window.clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    if (audioTimeoutRef.current != null) {
      window.clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }

    setReminderActive(false);
  }, []);

  const dismissReminderNotifications = useCallback(() => {
    for (const toastId of reminderToastIdsRef.current) {
      toast.dismiss(toastId);
    }
    reminderToastIdsRef.current.clear();
  }, []);

  const ensureAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;

    const AudioContextConstructor =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextConstructor) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor();
    }

    return audioContextRef.current;
  }, []);

  const playBeep = useCallback(() => {
    const audioContext = ensureAudioContext();
    if (!audioContext) return;

    if (audioContext.state === "suspended") {
      void audioContext.resume().catch(() => undefined);
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const startAt = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, startAt);
    gainNode.gain.setValueAtTime(0.0001, startAt);
    gainNode.gain.exponentialRampToValueAtTime(0.08, startAt + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.22);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.24);
  }, [ensureAudioContext]);

  const startReminder = useCallback(() => {
    if (!soundEnabledRef.current) return;

    stopReminder();
    setReminderActive(true);
    playBeep();

    audioIntervalRef.current = window.setInterval(() => {
      playBeep();
    }, 800);
    audioTimeoutRef.current = window.setTimeout(() => {
      stopReminder();
    }, 10_000);
  }, [playBeep, stopReminder]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    window.localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled));

    if (!soundEnabled) {
      stopReminder();
    }
  }, [soundEnabled, stopReminder]);

  useEffect(() => {
    visualEnabledRef.current = visualEnabled;
    window.localStorage.setItem(VISUAL_ENABLED_KEY, String(visualEnabled));

    if (!visualEnabled) {
      dismissReminderNotifications();
    }
  }, [dismissReminderNotifications, visualEnabled]);

  useEffect(() => {
    const unlockAudio = () => {
      const audioContext = ensureAudioContext();
      if (audioContext?.state === "suspended") {
        void audioContext.resume().catch(() => undefined);
      }
    };

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [ensureAudioContext]);

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

    socket.on("sessionEnded", (payload: SessionEndedPayload) => {
      setTimers((prev) => {
        const next = { ...prev };
        delete next[payload.deviceId];
        return next;
      });

      if (visualEnabledRef.current) {
        const deviceLabel = payload.deviceName?.trim() || "A device";
        const toastId = `session-ended-${payload.sessionId}`;
        reminderToastIdsRef.current.add(toastId);
        toast.success(`${deviceLabel} time has ended.`, {
          id: toastId,
          duration: 10_000,
        });
      }

      startReminder();
    });

    return () => {
      window.clearTimeout(connectTimeoutId);
      stopReminder();
      dismissReminderNotifications();
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        void audioContextRef.current.close().catch(() => undefined);
        audioContextRef.current = null;
      }
      socket.disconnect();
    };
  }, [dismissReminderNotifications, startReminder, stopReminder]);

  // Polling-based session-end detection (when socket is not connected)
  const prevActiveSessionIdsRef = useRef<Set<string>>(new Set());
  const prevActiveSessionNamesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (connectionMode !== "polling") return;

    let cancelled = false;

    const pollActiveSessions = async () => {
      try {
        const activeSessions: Session[] = await sessionApi.active();
        if (cancelled) return;

        const currentIds = new Set(activeSessions.map((s) => s.id));
        const prevIds = prevActiveSessionIdsRef.current;
        const prevNames = prevActiveSessionNamesRef.current;

        // Detect sessions that ended (were active before but not anymore)
        if (prevIds.size > 0) {
          for (const prevId of prevIds) {
            if (!currentIds.has(prevId)) {
              // Session ended
              const deviceLabel = prevNames.get(prevId)?.trim() || "A device";

              if (visualEnabledRef.current) {
                const toastId = `session-ended-${prevId}`;
                reminderToastIdsRef.current.add(toastId);
                toast.success(`${deviceLabel} time has ended.`, {
                  id: toastId,
                  duration: 10_000,
                });
              }

              startReminder();
            }
          }
        }

        // Update refs for next poll
        prevActiveSessionIdsRef.current = currentIds;
        const nameMap = new Map<string, string>();
        for (const s of activeSessions) {
          nameMap.set(s.id, s.device.name);
        }
        prevActiveSessionNamesRef.current = nameMap;
      } catch {
        // Ignore polling errors silently
      }
    };

    // Initial poll to populate the refs (no notification on first poll)
    void sessionApi
      .active()
      .then((sessions) => {
        if (cancelled) return;
        prevActiveSessionIdsRef.current = new Set(sessions.map((s) => s.id));
        const nameMap = new Map<string, string>();
        for (const s of sessions) {
          nameMap.set(s.id, s.device.name);
        }
        prevActiveSessionNamesRef.current = nameMap;
      })
      .catch(() => undefined);

    const intervalId = window.setInterval(pollActiveSessions, 15_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [connectionMode, startReminder]);

  const on = (event: string, cb: (data: unknown) => void) => {
    socketRef.current?.on(event, cb);
  };
  const off = (event: string, cb: (data: unknown) => void) => {
    socketRef.current?.off(event, cb);
  };

  return (
    <SocketContext.Provider
      value={{
        connected,
        connectionMode,
        timers,
        reminderActive,
        soundEnabled,
        visualEnabled,
        setSoundEnabled,
        setVisualEnabled,
        stopReminder,
        on,
        off,
      }}
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
