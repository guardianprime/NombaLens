import { Router } from "express";

import checkoutRoutes from "./checkout.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import splitRoutes from "./split.routes.js";

const routes = Router();

routes.use("/checkout", checkoutRoutes);
routes.use("/analytics", analyticsRoutes);
routes.use("/split", splitRoutes);

export default routes;
