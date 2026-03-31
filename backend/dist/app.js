"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
require("dotenv/config");
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = require("./routes");
const errorHandler_1 = require("./middlewares/errorHandler");
const env_1 = require("./config/env");
function createApp() {
    const app = (0, express_1.default)();
    app.disable("x-powered-by");
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN ? env_1.env.CORS_ORIGIN.split(",") : true,
        credentials: true,
    }));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.use((0, morgan_1.default)(env_1.env.NODE_ENV === "production" ? "combined" : "dev"));
    app.use("/api", routes_1.apiRouter);
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map