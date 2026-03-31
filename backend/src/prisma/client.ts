import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    const connectionString = process.env["DATABASE_URL"];
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    const adapter = new PrismaPg({ connectionString });
    _prisma = new PrismaClient({
      adapter,
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "info", "warn", "error"]
          : ["warn", "error"],
    });
  }
  return _prisma;
}

// Keep backward compat — eagerly created only when accessed at runtime, not at import time
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma: PrismaClient = new Proxy({} as any, {
  get(_target, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getPrisma() as any)[prop];
  },
});
