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
  await getDeviceById(id);

  return prisma.$transaction(async (tx) => {
    const sessions = await tx.session.findMany({
      where: { deviceId: id },
      select: { id: true },
    });

    if (sessions.length > 0) {
      await tx.transaction.deleteMany({
        where: {
          sessionId: { in: sessions.map((session) => session.id) },
        },
      });

      await tx.session.deleteMany({ where: { deviceId: id } });
    }

    return tx.device.delete({ where: { id } });
  });
}
