const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const games = await prisma.game.findMany({
    where: { title: { contains: 'GTA' } },
    select: { id: true, title: true, platform: true, imageUrl: true, sortOrder: true },
  });
  console.log(JSON.stringify(games, null, 2));
}

main()
  .catch((e) => { console.error('ERROR:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());