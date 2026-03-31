import type { DeviceStatus } from "@prisma/client";

import { prisma } from "../prisma/client";
import { AppError } from "../utils/AppError";

export async function getAllDevices() {
  const devices = await prisma.device.findMany({ orderBy: { name: "asc" } });
  return devices.map((d) => ({ ...d, hourlyRate: Number(d.hourlyRate) }));
}

export async function getDeviceById(id: string) {
  const device = await prisma.device.findUnique({ where: { id } });
  if (!device) throw new AppError("Device not found", 404);
  return { ...device, hourlyRate: Number(device.hourlyRate) };
}

export async function createDevice(
  name: string,
  type: string,
  hourlyRate: number,
) {
  const existing = await prisma.device.findUnique({ where: { name } });
  if (existing) throw new AppError("Device name already exists", 409);
  const device = await prisma.device.create({
    data: { name, type, hourlyRate },
  });
  return { ...device, hourlyRate: Number(device.hourlyRate) };
}

export async function updateDevice(
  id: string,
  data: Partial<{
    name: string;
    type: string;
    hourlyRate: number;
    status: DeviceStatus;
  }>,
) {
  await getDeviceById(id);
  const device = await prisma.device.update({ where: { id }, data });
  return { ...device, hourlyRate: Number(device.hourlyRate) };
}

export async function deleteDevice(id: string) {
  const device = await getDeviceById(id);
  if (device.status === "RUNNING") {
    throw new AppError("Cannot delete a device that is currently running", 400);
  }
  return prisma.device.delete({ where: { id } });
}
