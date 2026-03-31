"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = getIO;
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
const client_1 = require("../prisma/client");
let _io = null;
function getIO() {
    if (!_io)
        throw new Error("Socket.io not initialized");
    return _io;
}
function initSocket(httpServer) {
    _io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CORS_ORIGIN ? env_1.env.CORS_ORIGIN.split(",") : true,
            credentials: true,
        },
    });
    _io.on("connection", (socket) => {
        socket.emit("connected", { ok: true });
    });
    // Push timer deltas to all clients every second
    setInterval(async () => {
        if (!_io)
            return;
        try {
            const sessions = await client_1.prisma.session.findMany({
                where: { status: "ACTIVE" },
                select: { id: true, deviceId: true, endTime: true },
            });
            if (sessions.length === 0)
                return;
            const now = Date.now();
            const updates = sessions.map((s) => ({
                sessionId: s.id,
                deviceId: s.deviceId,
                remainingMs: Math.max(0, new Date(s.endTime).getTime() - now),
                endTime: s.endTime,
            }));
            _io.emit("timerUpdate", updates);
        }
        catch {
            // non-fatal
        }
    }, 1_000);
    return _io;
}
//# sourceMappingURL=index.js.map