import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

export async function getAllGames(includeInactive = false) {
  return prisma.game.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getGamesByPlatform(platform: string) {
  return prisma.game.findMany({
    where: { platform, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
  });
}

export async function getGameById(id: string) {
  return prisma.game.findUnique({ where: { id } });
}

export async function createGame(data: Prisma.GameCreateInput) {
  return prisma.game.create({ data });
}

export async function updateGame(id: string, data: Prisma.GameUpdateInput) {
  return prisma.game.update({ where: { id }, data });
}

export async function deleteGame(id: string) {
  return prisma.game.delete({ where: { id } });
}

export async function getGamePlatforms() {
  const games = await prisma.game.findMany({
    where: { isActive: true },
    select: { platform: true },
    distinct: ["platform"],
  });
  return games.map((g) => g.platform);
}
