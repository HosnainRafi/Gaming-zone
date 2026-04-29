import type { NextFunction, Request, Response } from "express";
import * as sliderService from "../services/slider.service";
import { AppError } from "../utils/AppError";

function requireIdParam(req: Request) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw new AppError("Slider image id is required", 400);
  }
  return id;
}

export async function listSliderImages(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const images = await sliderService.getAllSliderImages(false);
    res.json(images);
  } catch (err) {
    next(err);
  }
}

export async function listSliderImagesAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const images = await sliderService.getAllSliderImages(true);
    res.json(images);
  } catch (err) {
    next(err);
  }
}

export async function getSliderImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    const image = await sliderService.getSliderImageById(id);
    if (!image) {
      throw new AppError("Slider image not found", 404);
    }
    res.json(image);
  } catch (err) {
    next(err);
  }
}

export async function createSliderImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, subtitle, imageUrl, linkUrl, isActive, sortOrder } =
      req.body;

    if (!imageUrl) {
      throw new AppError("Image URL is required", 400);
    }

    const image = await sliderService.createSliderImage({
      title: title || null,
      subtitle: subtitle || null,
      imageUrl,
      linkUrl: linkUrl || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    });

    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

export async function updateSliderImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    const { title, subtitle, imageUrl, linkUrl, isActive, sortOrder } =
      req.body;

    const image = await sliderService.updateSliderImage(id, {
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(linkUrl !== undefined && { linkUrl }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    res.json(image);
  } catch (err) {
    next(err);
  }
}

export async function deleteSliderImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    await sliderService.deleteSliderImage(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
