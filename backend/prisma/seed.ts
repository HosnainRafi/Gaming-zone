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
    update: { passwordHash: hash },
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
    update: { passwordHash: staffHash },
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

  // ============ PUBLIC SITE DATA ============

  // Site Settings
  const siteSettings = [
    { key: "siteName", value: "Gamers Den" },
    { key: "tagline", value: "The Ultimate Gaming Destination" },
    {
      key: "description",
      value:
        "The ultimate gaming destination. Experience high-end gaming PCs with RTX GPUs, PS5 & PS4 Pro consoles, thrilling sim racing, and a premium snacks corner for the complete gaming lifestyle.",
    },
    {
      key: "footerDescription",
      value:
        "The Ultimate Gaming Experience in Bangladesh. Your premier gaming destination featuring cutting-edge technology, esports tournaments, and an unmatched gaming atmosphere.",
    },
    {
      key: "copyright",
      value: "Crafted for gamers, by gamers. Powered by passion.",
    },
    { key: "ownerName", value: "M A Tanzeel" },
    { key: "phone", value: "01754659997" },
    { key: "whatsapp", value: "+880 1754659997" },
    { key: "email", value: "rhosnain@gmail.com" },
    {
      key: "address",
      value:
        "Allama Iqbal Road Jame Mosque Market, Chashara, Narayanganj, Bangladesh",
    },
    {
      key: "googleMapsUrl",
      value: "https://www.google.com/maps/place/JFCX%2BG6+Narayanganj",
    },
    { key: "facebookUrl", value: "https://www.facebook.com/Gamersdenbd/" },
    { key: "messengerUrl", value: "https://m.me/Gamersdenbd" },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✓ Site Settings seeded");

  // Pricing Tiers
  const pricingTiers = [
    {
      name: "Gaming PC",
      price: 70,
      perUnit: "per hour",
      description: [
        "Valorant, CS2, GTA 5",
        "RDR2, Cyberpunk 2077",
        "COD MW2, Apex Legends",
        "Minecraft, Roblox & More",
      ],
      isPopular: false,
      sortOrder: 1,
    },
    {
      name: "PS4 Pro",
      price: 100,
      perUnit: "per hour",
      description: [
        "FC 26, Mortal Kombat 11",
        "Marvel Spider-Man",
        "God of War Ragnarök",
        "Street Fighter 6 & More",
      ],
      isPopular: true,
      sortOrder: 2,
    },
    {
      name: "PS5",
      price: 120,
      perUnit: "per hour",
      description: [
        "Next-Gen Performance",
        "4K Ultra HD Graphics",
        "DualSense Haptics",
        "Latest Releases",
      ],
      isPopular: true,
      sortOrder: 3,
    },
    {
      name: "Arcade Console",
      price: 100,
      perUnit: "per hour",
      description: [
        "Classic Retro Games",
        "Multiplayer Action",
        "Nostalgic Experience",
        "Fast-Paced Fun",
      ],
      isPopular: false,
      sortOrder: 4,
    },
    {
      name: "Extra Controller",
      price: 40,
      perUnit: "each",
      description: [
        "For PS4 Pro",
        "Multiplayer Gaming",
        "Perfect for Co-op",
        "Additional Player",
      ],
      isPopular: false,
      sortOrder: 5,
    },
    {
      name: "Racing Sim",
      price: 160,
      perUnit: "per hour",
      description: [
        "Forza Horizon 5, Assetto Corsa",
        "NFS Payback, Euro Truck 2",
        "Steering Wheel Setup",
        "Realistic Racing Experience",
      ],
      isPopular: false,
      sortOrder: 6,
    },
  ];

  for (const tier of pricingTiers) {
    await prisma.pricingTier.upsert({
      where: { name: tier.name },
      update: tier,
      create: tier,
    });
  }
  console.log("✓ Pricing Tiers seeded");

  // Games
  const games = [
    { title: "GTA 5", platform: "PC", genre: "Open World", sortOrder: 1 },
    {
      title: "Call of Duty Modern Warfare 2",
      platform: "PC",
      genre: "FPS",
      sortOrder: 2,
    },
    {
      title: "Resident Evil Village",
      platform: "PC",
      genre: "Horror",
      sortOrder: 3,
    },
    { title: "Cyberpunk 2077", platform: "PC", genre: "RPG", sortOrder: 4 },
    { title: "Valorant", platform: "PC", genre: "FPS", sortOrder: 5 },
    { title: "Counter-Strike 2", platform: "PC", genre: "FPS", sortOrder: 6 },
    {
      title: "Red Dead Redemption 2",
      platform: "PC",
      genre: "Open World",
      sortOrder: 7,
    },
    { title: "Apex Legends", platform: "PC", genre: "FPS", sortOrder: 8 },
    { title: "Minecraft", platform: "PC", genre: "Sandbox", sortOrder: 9 },
    {
      title: "Fortnite",
      platform: "PC",
      genre: "Battle Royale",
      sortOrder: 10,
    },
    {
      title: "Forza Horizon 5",
      platform: "Racing Sim",
      genre: "Racing",
      sortOrder: 11,
    },
    {
      title: "Assetto Corsa",
      platform: "Racing Sim",
      genre: "Racing",
      sortOrder: 12,
    },
    {
      title: "Euro Truck Simulator 2",
      platform: "Racing Sim",
      genre: "Racing",
      sortOrder: 13,
    },
    {
      title: "Need for Speed Payback",
      platform: "Racing Sim",
      genre: "Racing",
      sortOrder: 14,
    },
    { title: "FC 26", platform: "PS4", genre: "Sports", sortOrder: 15 },
    { title: "FC 25", platform: "PS4", genre: "Sports", sortOrder: 16 },
    {
      title: "Mortal Kombat 11",
      platform: "PS4",
      genre: "Fighting",
      sortOrder: 17,
    },
    {
      title: "Street Fighter 6",
      platform: "PS4",
      genre: "Fighting",
      sortOrder: 18,
    },
    {
      title: "God of War Ragnarök",
      platform: "PS4",
      genre: "Action",
      sortOrder: 19,
    },
    {
      title: "Marvel Spider-Man",
      platform: "PS4",
      genre: "Action",
      sortOrder: 20,
    },
    {
      title: "Gran Turismo 7",
      platform: "PS4",
      genre: "Racing",
      sortOrder: 21,
    },
    { title: "WWE 2K23", platform: "PS4", genre: "Sports", sortOrder: 22 },
    { title: "Elden Ring", platform: "PS4", genre: "RPG", sortOrder: 23 },
    { title: "God of War", platform: "PS4", genre: "Action", sortOrder: 24 },
  ];

  for (const game of games) {
    const existing = await prisma.game.findFirst({
      where: { title: game.title, platform: game.platform },
    });
    if (!existing) {
      await prisma.game.create({ data: game });
    }
  }
  console.log("✓ Games seeded");

  // Slider Images
  const sliderImages = [
    {
      title: "FC 26",
      subtitle: "Experience next-gen football",
      imageUrl:
        "https://images.unsplash.com/photo-1493711662062-fa541f7f3d24?w=1920&q=80",
      sortOrder: 1,
    },
    {
      title: "Call of Duty",
      subtitle: "Intense multiplayer action",
      imageUrl:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920&q=80",
      sortOrder: 2,
    },
    {
      title: "Racing Simulator",
      subtitle: "Feel the adrenaline",
      imageUrl:
        "https://images.unsplash.com/photo-1511882150382-421056c89033?w=1920&q=80",
      sortOrder: 3,
    },
  ];

  for (const image of sliderImages) {
    const existing = await prisma.sliderImage.findFirst({
      where: { imageUrl: image.imageUrl },
    });
    if (!existing) {
      await prisma.sliderImage.create({ data: image });
    }
  }
  console.log("✓ Slider Images seeded");

  console.log("\n✅ Seed complete!");
  console.log("   Admin login: admin@gamingzone.com / admin123");
  console.log("   Staff login: staff@gamingzone.com / staff123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
