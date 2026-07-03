import { Router } from "express";
import type { Request, Response } from "express";

const splitRoutes = Router();

splitRoutes.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "This is the split route",
  });
});

export default splitRoutes;
