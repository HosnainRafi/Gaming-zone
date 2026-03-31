"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const app_1 = require("./app");
const env_1 = require("./config/env");
const autoEndSessions_1 = require("./jobs/autoEndSessions");
const socket_1 = require("./socket");
const app = (0, app_1.createApp)();
const httpServer = (0, http_1.createServer)(app);
(0, socket_1.initSocket)(httpServer);
(0, autoEndSessions_1.startAutoEndJob)();
httpServer.listen(env_1.env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] listening on :${env_1.env.PORT} (${env_1.env.NODE_ENV})`);
});
//# sourceMappingURL=server.js.map