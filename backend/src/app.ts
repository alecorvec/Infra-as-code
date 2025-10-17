import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

const app = express();
app.disable("x-powered-by");

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("tiny"));

app.use(rateLimit({
  windowMs: 30_000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

app.get("/health", (_req, res) => res.json({ ok: true }));

export default app;