import { Router } from "express";
import type { Request, Response } from "express";

import { getAnalyticsSummary, getAnalyticsTimeseries } from "../services/analytics.js";

const analyticsRoutes = Router();

analyticsRoutes.get("/:merchantId/timeseries", async (req: Request, res: Response) => {
  try {
    const merchantId = Array.isArray(req.params.merchantId)
      ? req.params.merchantId[0]
      : req.params.merchantId;

    const range = Array.isArray(req.query.range) ? req.query.range[0] : req.query.range;
    const normalizedRange = range === "30d" ? "30d" : "7d";

    const timeseries = await getAnalyticsTimeseries(merchantId ?? "", normalizedRange);
    res.status(200).json({ success: true, data: timeseries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load analytics timeseries" });
  }
});

analyticsRoutes.get("/:merchantId", async (req: Request, res: Response) => {
  try {
    const merchantId = Array.isArray(req.params.merchantId)
      ? req.params.merchantId[0]
      : req.params.merchantId;
    const summary = await getAnalyticsSummary(merchantId ?? "");
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load analytics" });
  }
});

export default analyticsRoutes;
