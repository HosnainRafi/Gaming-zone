/**
 * Seed script — creates default admin user + sample devices.
 * Run: npx tsx prisma/seed.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env["DATABASE_URL"];
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Admin user
  const hash = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@gamingzone.com" },
    update: {},
    create: {
      email: "admin@gamingzone.com",
      name: "Admin",
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  console.log("✓ Admin:", admin.email);

  // Sample staff
  const staffHash = await bcrypt.hash("staff123", 12);
  const staff = await prisma.user.upsert({
    where: { email: "staff@gamingzone.com" },
    update: {},
    create: {
      email: "staff@gamingzone.com",
      name: "Rakib Hossain",
      passwordHash: staffHash,
      role: "STAFF",
    },
  });
  console.log("✓ Staff:", staff.email);

  // Devices (based on Gamers Den pricing)
  const devices = [
    { name: "PC Station 01", type: "PC", hourlyRate: 70 },
    { name: "PC Station 02", type: "PC", hourlyRate: 70 },
    { name: "PC Station 03", type: "PC", hourlyRate: 70 },
    { name: "PS5 Console 01", type: "PS5", hourlyRate: 120 },
    { name: "PS4 Pro 01", type: "PS4", hourlyRate: 100 },
    { name: "PS4 Pro 02", type: "PS4", hourlyRate: 100 },
    { name: "Racing Sim 01", type: "Racing Sim", hourlyRate: 160 },
    { name: "Arcade 01", type: "Arcade", hourlyRate: 100 },
  ];

  for (const d of devices) {
    await prisma.device.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
    console.log(`✓ Device: ${d.name} (৳${d.hourlyRate}/hr)`);
  }

  // Sample offer
  await prisma.offer.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENT",
      value: 10,
      expiry: new Date("2027-12-31T23:59:59Z"),
      isActive: true,
    },
  });
  console.log("✓ Offer: WELCOME10 (10% off)");

  console.log("\n✅ Seed complete!");
  console.log("   Admin login: admin@gamingzone.com / admin123");
  console.log("   Staff login: staff@gamingzone.com / staff123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
