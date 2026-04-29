import { Router } from "express";
import * as gameController from "../controllers/game.controller";
import { requireAdmin, requireAuth } from "../middlewares/auth";

export const gameRouter = Router();

// Public routes
gameRouter.get("/", gameController.listGames);
gameRouter.get("/platforms", gameController.getPlatforms);

// Protected routes (admin only)
gameRouter.get(
  "/admin",
  requireAuth,
  requireAdmin,
  gameController.listGamesAdmin,
);
gameRouter.post("/", requireAuth, requireAdmin, gameController.createGame);
gameRouter.get("/admin/:id", requireAuth, requireAdmin, gameController.getGame);
gameRouter.patch("/:id", requireAuth, requireAdmin, gameController.updateGame);
gameRouter.delete("/:id", requireAuth, requireAdmin, gameController.deleteGame);
