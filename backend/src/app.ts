import express, { Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import { correlation } from "./middlewares/correlation.js";
import { auth } from "./middlewares/auth.js";
import tasksRouter from "./routes/tasks.routes.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();
app.disable("x-powered-by");

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Remplacez par votre domaine en production
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

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

app.get("/health", async (_req: Request, res: Response) => {
  try {
    // Vérifier la connexion à la base de données
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    await prisma.$disconnect();
    
    res.json({ 
      ok: true, 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    res.status(503).json({ 
      ok: false, 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.use(auth);
app.use("/tasks", tasksRouter);
app.use(errorHandler);
export default app;