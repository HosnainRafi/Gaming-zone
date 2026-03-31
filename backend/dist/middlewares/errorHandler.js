"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const status = typeof err?.status === "number" ? err.status : 500;
    const message = status >= 500
        ? "Internal Server Error"
        : typeof err?.message === "string"
            ? err.message
            : "Request failed";
    res.status(status).json({
        error: {
            message,
        },
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map