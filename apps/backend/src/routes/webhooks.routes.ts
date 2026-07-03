import { Router } from "express";

import { handleNombaWebhook } from "../webhooks/nomba.js";

const webhooksRoutes = Router();

webhooksRoutes.post("/nomba", handleNombaWebhook);

export default webhooksRoutes;
