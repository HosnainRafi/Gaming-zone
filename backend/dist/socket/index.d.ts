import type { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
export type SocketServer = SocketIOServer;
export declare function initSocket(httpServer: HttpServer): SocketServer;
//# sourceMappingURL=index.d.ts.map