import { Router } from "express";

import { authRouter } from "./auth.routes";
import { dashboardRouter } from "./dashboard.routes";
import { deviceRouter } from "./device.routes";
import { gameRouter } from "./game.routes";
import { membershipRouter } from "./membership.routes";
import { offerRouter } from "./offer.routes";
import { pricingRouter } from "./pricing.routes";
import { reportRouter } from "./report.routes";
import { sessionRouter } from "./session.routes";
import { settingsRouter } from "./settings.routes";
import { sliderRouter } from "./slider.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/devices", deviceRouter);
apiRouter.use("/games", gameRouter);
apiRouter.use("/pricing", pricingRouter);
apiRouter.use("/sessions", sessionRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/slider", sliderRouter);
apiRouter.use("/memberships", membershipRouter);
apiRouter.use("/offers", offerRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/reports", reportRouter);
