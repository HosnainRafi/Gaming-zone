import type { Request, Response } from "express";

import {
  getDeviceUsageReport,
  getSalesReport,
  getSessionsReport,
  getStaffReport,
} from "../services/report.service";
import { AppError } from "../utils/AppError";

function parseDate(val: unknown, name: string): Date {
  if (typeof val !== "string" || !val)
    throw new AppError(`Missing required query param: ${name}`, 400);
  const d = new Date(val);
  if (isNaN(d.getTime()))
    throw new AppError(`Invalid date for param: ${name}`, 400);
  return d;
}

export async function salesReport(req: Request, res: Response): Promise<void> {
  const from = parseDate(req.query["from"], "from");
  const to = parseDate(req.query["to"], "to");
  const result = await getSalesReport(from, to);
  res.json(result);
}

export async function sessionsReport(
  req: Request,
  res: Response,
): Promise<void> {
  const { from, to, status } = req.query;
  const filters = {
    ...(from && { from: parseDate(from, "from") }),
    ...(to && { to: parseDate(to, "to") }),
    ...(typeof status === "string" && { status }),
  };
  const result = await getSessionsReport(filters);
  res.json(result);
}

export async function staffReport(req: Request, res: Response): Promise<void> {
  const from = parseDate(req.query["from"], "from");
  const to = parseDate(req.query["to"], "to");
  const result = await getStaffReport(from, to);
  res.json(result);
}

export async function deviceReport(req: Request, res: Response): Promise<void> {
  const from = parseDate(req.query["from"], "from");
  const to = parseDate(req.query["to"], "to");
  const result = await getDeviceUsageReport(from, to);
  res.json(result);
}
