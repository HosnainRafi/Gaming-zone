import { Prisma } from "@prisma/client";
import { prisma } from "../prisma/client";

export async function getAllSliderImages(includeInactive = false) {
  return prisma.sliderImage.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getSliderImageById(id: string) {
  return prisma.sliderImage.findUnique({ where: { id } });
}

export async function createSliderImage(data: Prisma.SliderImageCreateInput) {
  return prisma.sliderImage.create({ data });
}

export async function updateSliderImage(
  id: string,
  data: Prisma.SliderImageUpdateInput,
) {
  return prisma.sliderImage.update({ where: { id }, data });
}

export async function deleteSliderImage(id: string) {
  return prisma.sliderImage.delete({ where: { id } });
}
