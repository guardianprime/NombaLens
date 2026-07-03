import { Router } from "express";
import type { Request, Response } from "express";

import { rankPaymentMethods } from "../services/suggestion.js";

const checkoutRoutes = Router();

checkoutRoutes.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is the checkout route",
  });
});

checkoutRoutes.post("/suggest", (req: Request, res: Response) => {
  const transactions = Array.isArray(req.body?.transactions)
    ? (req.body.transactions as Array<{ paymentMethod?: string | null }>)
    : [];

  res.status(200).json({
    success: true,
    paymentMethods: rankPaymentMethods(transactions),
  });
});

export default checkoutRoutes;
