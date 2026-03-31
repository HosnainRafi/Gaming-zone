import { createServer } from "http";

import { createApp } from "./app";
import { env } from "./config/env";
import { startAutoEndJob } from "./jobs/autoEndSessions";
import { initSocket } from "./socket";

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);
startAutoEndJob();

httpServer.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on :${env.PORT} (${env.NODE_ENV})`);
});
