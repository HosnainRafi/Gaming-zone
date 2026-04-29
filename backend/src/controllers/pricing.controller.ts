import type { NextFunction, Request, Response } from "express";
import * as pricingService from "../services/pricing.service";
import { AppError } from "../utils/AppError";

function requireIdParam(req: Request) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw new AppError("Pricing tier id is required", 400);
  }
  return id;
}

export async function listPricingTiers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tiers = await pricingService.getAllPricingTiers(false);
    res.json(tiers);
  } catch (err) {
    next(err);
  }
}

export async function listPricingTiersAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tiers = await pricingService.getAllPricingTiers(true);
    res.json(tiers);
  } catch (err) {
    next(err);
  }
}

export async function getPricingTier(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    const tier = await pricingService.getPricingTierById(id);
    if (!tier) {
      throw new AppError("Pricing tier not found", 404);
    }
    res.json(tier);
  } catch (err) {
    next(err);
  }
}

export async function createPricingTier(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    const {
      name,
      price,
      perUnit,
      description,
      isPopular,
      isActive,
      sortOrder,
    } = req.body;

    if (!name || price === undefined) {
      throw new AppError("Name and price are required", 400);
    }

    const tier = await pricingService.createPricingTier({
      name,
      price,
      perUnit: perUnit || "per hour",
      description: description || [],
      isPopular: isPopular ?? false,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    });

    res.status(201).json(tier);
  } catch (err) {
    next(err);
  }
}

export async function updatePricingTier(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    const {
      name,
      price,
      perUnit,
      description,
      isPopular,
      isActive,
      sortOrder,
    } = req.body;

    const tier = await pricingService.updatePricingTier(id, {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price }),
      ...(perUnit !== undefined && { perUnit }),
      ...(description !== undefined && { description }),
      ...(isPopular !== undefined && { isPopular }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    res.json(tier);
  } catch (err) {
    next(err);
  }
}

export async function deletePricingTier(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    await pricingService.deletePricingTier(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
