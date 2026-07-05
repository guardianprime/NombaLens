import { Router } from "express";
import type { Request, Response } from "express";

const widgetRoutes = Router();

widgetRoutes.post("/suggestions", (req: Request, res: Response) => {
  const merchantId = typeof req.body?.merchantId === "string" ? req.body.merchantId : "default";
  const customerId = typeof req.body?.customerId === "string" ? req.body.customerId : undefined;

  const suggestions = [
    { id: "bankTransfer", priority: 100, label: "Bank Transfer" },
    { id: "card", priority: 90, label: "Card" },
    { id: "ussd", priority: 80, label: "USSD" },
    { id: "qr", priority: 70, label: "QR Code" },
  ];

  res.status(200).json({
    success: true,
    merchantId,
    customerId,
    suggestions,
  });
});

export default widgetRoutes;
