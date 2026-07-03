import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";

class Server {
  private app: Express;
  private readonly port: number;

  constructor(port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(express.json());
    this.app.use(cors());
    this.app.use(cookieParser());
  }

  private initializeRoutes(): void {
    this.app.get("/", this.home);
    this.app.use("/api/v1", routes);
  }

  private home(req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      message: "This is the backend for NombaLens",
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(this.errorHandler);
  }

  private errorHandler(
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

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server running on http://localhost:${this.port}`);
    });
  }
}

const server = new Server(8000);

server.start();
