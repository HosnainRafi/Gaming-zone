import type { Request, Response } from "express";
import { z } from "zod";

import {
  createDevice,
  deleteDevice,
  getAllDevices,
  getDeviceById,
  updateDevice,
} from "../services/device.service";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  hourlyRate: z.number().positive(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.string().min(1).optional(),
  hourlyRate: z.number().positive().optional(),
  status: z
    .enum(["AVAILABLE", "RUNNING", "MAINTENANCE", "DISABLED"])
    .optional(),
});

export async function listDevices(_req: Request, res: Response): Promise<void> {
  const devices = await getAllDevices();
  res.json(devices);
}

export async function getDevice(req: Request, res: Response): Promise<void> {
  const device = await getDeviceById(String(req.params["id"]));
  res.json(device);
}

export async function addDevice(req: Request, res: Response): Promise<void> {
  const data = createSchema.parse(req.body);
  const device = await createDevice(data.name, data.type, data.hourlyRate);
  res.status(201).json(device);
}

export async function editDevice(req: Request, res: Response): Promise<void> {
  const data = updateSchema.parse(req.body);
  const patch: Parameters<typeof updateDevice>[1] = {};
  if (data.name !== undefined) patch.name = data.name;
  if (data.type !== undefined) patch.type = data.type;
  if (data.hourlyRate !== undefined) patch.hourlyRate = data.hourlyRate;
  if (data.status !== undefined) patch.status = data.status;
  const device = await updateDevice(String(req.params["id"]), patch);
  res.json(device);
}

export async function removeDevice(req: Request, res: Response): Promise<void> {
  await deleteDevice(String(req.params["id"]));
  res.status(204).send();
}
