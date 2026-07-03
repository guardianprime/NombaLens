import { Router } from "express";

import checkoutRoutes from "./checkout.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import splitRoutes from "./split.routes.js";
import webhooksRoutes from "./webhooks.routes.js";
import alertsRoutes from "./alerts.routes.js";

const routes = Router();

routes.use("/checkout", checkoutRoutes);
routes.use("/analytics", analyticsRoutes);
routes.use("/split", splitRoutes);
routes.use("/alerts", alertsRoutes);
routes.use("/webhooks", webhooksRoutes);

export default routes;
