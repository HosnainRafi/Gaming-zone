"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_routes_1 = require("./auth.routes");
const dashboard_routes_1 = require("./dashboard.routes");
const device_routes_1 = require("./device.routes");
const offer_routes_1 = require("./offer.routes");
const report_routes_1 = require("./report.routes");
const session_routes_1 = require("./session.routes");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.get("/health", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});
exports.apiRouter.use("/auth", auth_routes_1.authRouter);
exports.apiRouter.use("/devices", device_routes_1.deviceRouter);
exports.apiRouter.use("/sessions", session_routes_1.sessionRouter);
exports.apiRouter.use("/offers", offer_routes_1.offerRouter);
exports.apiRouter.use("/dashboard", dashboard_routes_1.dashboardRouter);
exports.apiRouter.use("/reports", report_routes_1.reportRouter);
//# sourceMappingURL=index.js.map