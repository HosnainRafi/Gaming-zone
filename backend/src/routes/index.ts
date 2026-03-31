import { Router } from "express";

import { authRouter } from "./auth.routes";
import { dashboardRouter } from "./dashboard.routes";
import { deviceRouter } from "./device.routes";
import { offerRouter } from "./offer.routes";
import { reportRouter } from "./report.routes";
import { sessionRouter } from "./session.routes";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/devices", deviceRouter);
apiRouter.use("/sessions", sessionRouter);
apiRouter.use("/offers", offerRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/reports", reportRouter);
