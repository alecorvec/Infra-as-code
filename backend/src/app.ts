import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import { correlation } from "./middlewares/correlation.js";
import { auth } from "./middlewares/auth.js";
import tasksRouter from "./routes/tasks.routes.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();
app.disable("x-powered-by");


app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(correlation);
app.use(morgan("tiny"));

app.use(rateLimit({
  windowMs: 30_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: "Too Many Requests" });
  }
}));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Tasks API Documentation"
}));

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.use(auth);
app.use("/tasks", tasksRouter);
app.use(errorHandler);
export default app;