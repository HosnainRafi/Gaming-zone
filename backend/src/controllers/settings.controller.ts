import type { NextFunction, Request, Response } from "express";
import * as settingsService from "../services/settings.service";

export async function getPublicSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const settings = await settingsService.getPublicSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function getAllSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const settings = req.body;

    if (typeof settings !== "object" || settings === null) {
      res.status(400).json({ error: "Invalid settings object" });
      return;
    }

    await settingsService.updateSettings(settings);
    const updated = await settingsService.getAllSettings();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
