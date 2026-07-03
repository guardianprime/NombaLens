import { Router } from "express";
import type { Request, Response } from "express";

const checkoutRoutes = Router();

checkoutRoutes.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is the checkout route",
  });
});

export default checkoutRoutes;
