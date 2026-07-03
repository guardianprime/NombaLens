import { Router } from "express";
import type { Request, Response } from "express";

import { getMerchantAlerts } from "../services/alerts.js";

const alertsRoutes = Router();

alertsRoutes.get("/:merchantId", async (req: Request, res: Response) => {
  try {
    const merchantId = Array.isArray(req.params.merchantId)
      ? req.params.merchantId[0]
      : req.params.merchantId;
    const alerts = await getMerchantAlerts(merchantId ?? "");
    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load alerts" });
  }
});

export default alertsRoutes;
