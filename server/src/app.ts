import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import v1Router from "./routes/v1";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", v1Router);

export default app;
