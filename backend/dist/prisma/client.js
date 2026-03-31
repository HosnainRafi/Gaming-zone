"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
exports.getPrisma = getPrisma;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
let _prisma = null;
function getPrisma() {
    if (!_prisma) {
        const connectionString = process.env["DATABASE_URL"];
        if (!connectionString)
            throw new Error("DATABASE_URL is not set");
        const adapter = new adapter_pg_1.PrismaPg({ connectionString });
        _prisma = new client_1.PrismaClient({
            adapter,
            log: ["warn", "error"],
        });
    }
    return _prisma;
}
// Keep backward compat — eagerly created only when accessed at runtime, not at import time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
exports.prisma = new Proxy({}, {
    get(_target, prop) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return getPrisma()[prop];
    },
});
//# sourceMappingURL=client.js.map