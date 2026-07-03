import { Router } from "express";
import type { Request, Response } from "express";

const analyticsRoutes = Router();

analyticsRoutes.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is the analytics route",
  });
});

export default analyticsRoutes;
