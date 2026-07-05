import "dotenv/config";
import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pathToFileURL } from "node:url";

import routes from "./routes/index.js";
import { healthHandler } from "./routes/health.js";
import widgetRoutes from "./routes/widget.routes.js";
import { startRecoveryWorker } from "./jobs/recoveryJob.js";

function initializeMiddleware(app: Express): void {
  app.use(express.json());
  app.use(cors());
  app.use(cookieParser());
}

function initializeRoutes(app: Express): void {
  app.get("/", homeHandler);
  app.get("/health", healthHandler);
  app.use("/widget", widgetRoutes);
  app.use("/api/v1", routes);
}

function homeHandler(req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    message: "This is the backend for NombaLens",
  });
}

function initializeErrorHandling(app: Express): void {
  app.use(errorHandler);
}

function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Something went wrong!",
  });
}

export function createApp(): Express {
  const app = express();
  initializeMiddleware(app);
  initializeRoutes(app);
  initializeErrorHandling(app);

  return app;
}

export const app = createApp();

export function startServer(port = Number(process.env.PORT ?? 4000)): void {
  startRecoveryWorker();
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

const isMainModule = process.argv[1]
  ? pathToFileURL(process.argv[1]).href === import.meta.url
  : false;

if (isMainModule) {
  startServer();
}
