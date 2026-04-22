import path from "path";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import routes from "./routes";
import { errorMiddleware } from "./core/middlewares/error.middleware";
import { notFoundMiddleware } from "./core/middlewares/notFound.middleware";
import { swaggerSpec } from "./config/swagger";

const app: Application = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(compression());
app.use(morgan("combined"));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: "Too many requests" });
app.use("/api/v1", limiter);

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1", routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
