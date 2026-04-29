import type { NextFunction, Request, Response } from "express";
import * as gameService from "../services/game.service";
import { AppError } from "../utils/AppError";

function requireIdParam(req: Request) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  if (!id) {
    throw new AppError("Game id is required", 400);
  }
  return id;
}

export async function listGames(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const platform = req.query.platform as string | undefined;

    let games;
    if (platform && platform !== "ALL") {
      games = await gameService.getGamesByPlatform(platform);
    } else {
      games = await gameService.getAllGames(false);
    }

    res.json(games);
  } catch (err) {
    next(err);
  }
}

export async function listGamesAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const games = await gameService.getAllGames(true);
    res.json(games);
  } catch (err) {
    next(err);
  }
}

export async function getPlatforms(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const platforms = await gameService.getGamePlatforms();
    res.json(platforms);
  } catch (err) {
    next(err);
  }
}

export async function getGame(req: Request, res: Response, next: NextFunction) {
  try {
    const id = requireIdParam(req);
    const game = await gameService.getGameById(id);
    if (!game) {
      throw new AppError("Game not found", 404);
    }
    res.json(game);
  } catch (err) {
    next(err);
  }
}

export async function createGame(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, platform, genre, imageUrl, isActive, sortOrder } = req.body;

    if (!title || !platform || !genre) {
      throw new AppError("Title, platform, and genre are required", 400);
    }

    const game = await gameService.createGame({
      title,
      platform,
      genre,
      imageUrl: imageUrl || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? 0,
    });

    res.status(201).json(game);
  } catch (err) {
    next(err);
  }
}

export async function updateGame(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    const { title, platform, genre, imageUrl, isActive, sortOrder } = req.body;

    const game = await gameService.updateGame(id, {
      ...(title !== undefined && { title }),
      ...(platform !== undefined && { platform }),
      ...(genre !== undefined && { genre }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    res.json(game);
  } catch (err) {
    next(err);
  }
}

export async function deleteGame(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = requireIdParam(req);
    await gameService.deleteGame(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
