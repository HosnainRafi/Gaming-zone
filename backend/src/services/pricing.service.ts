import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

export async function getAllPricingTiers(includeInactive = false) {
  return prisma.pricingTier.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getPricingTierById(id: string) {
  return prisma.pricingTier.findUnique({ where: { id } });
}

export async function createPricingTier(data: Prisma.PricingTierCreateInput) {
  return prisma.pricingTier.create({ data });
}

export async function updatePricingTier(
  id: string,
  data: Prisma.PricingTierUpdateInput,
) {
  return prisma.pricingTier.update({ where: { id }, data });
}

export async function deletePricingTier(id: string) {
  return prisma.pricingTier.delete({ where: { id } });
}
