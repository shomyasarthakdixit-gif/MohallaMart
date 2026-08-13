import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import v1Router from "./routes/v1";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

const corsOptions = {
  origin: env.NODE_ENV === "production" ? process.env.CORS_ORIGIN || false : "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api/", limiter);

app.use(express.json({ limit: "10kb" })); // Request size limits

app.use("/api/v1", v1Router);

app.use(errorHandler);

export default app;
