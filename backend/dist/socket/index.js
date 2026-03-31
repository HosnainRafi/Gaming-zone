"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = initSocket;
const socket_io_1 = require("socket.io");
const env_1 = require("../config/env");
function initSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: env_1.env.CORS_ORIGIN ?? true,
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        socket.emit("connected", { ok: true });
    });
    return io;
}
//# sourceMappingURL=index.js.map