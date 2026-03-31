"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
function createPrismaClient() {
    const connectionString = process.env["DATABASE_URL"];
    if (!connectionString)
        throw new Error("DATABASE_URL is not set");
    const adapter = new adapter_pg_1.PrismaPg({ connectionString });
    return new client_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development"
            ? ["query", "info", "warn", "error"]
            : ["warn", "error"],
    });
}
exports.prisma = createPrismaClient();
//# sourceMappingURL=client.js.map