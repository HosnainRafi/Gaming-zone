import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { env } from "../config/env";
import { prisma } from "../prisma/client";

export type SocketServer = SocketIOServer;

let _io: SocketIOServer | null = null;

export function getIO(): SocketIOServer {
  if (!_io) throw new Error("Socket.io not initialized");
  return _io;
}

export function initSocket(httpServer: HttpServer): SocketServer {
  _io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : true,
      credentials: true,
    },
  });

  _io.on("connection", (socket) => {
    socket.emit("connected", { ok: true });
  });

  // Push timer deltas to all clients every second (skip if no one is listening)
  setInterval(async () => {
    if (!_io || _io.engine.clientsCount === 0) return;
    try {
      const sessions = await prisma.session.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, deviceId: true, endTime: true },
      });
      if (sessions.length === 0) return;
      const now = Date.now();
      const updates = sessions.map((s) => ({
        sessionId: s.id,
        deviceId: s.deviceId,
        remainingMs: Math.max(0, new Date(s.endTime).getTime() - now),
        endTime: s.endTime,
      }));
      _io.emit("timerUpdate", updates);
    } catch {
      // non-fatal
    }
  }, 1_000);

  return _io;
}
