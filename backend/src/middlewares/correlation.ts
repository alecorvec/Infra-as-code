import crypto from "node:crypto";
import { NextFunction, Request, Response } from "express";

export function correlation(req: Request, _res: Response, next: NextFunction) {
  const cid = req.header("correlation_id") || crypto.randomUUID();
  (req as any).correlation_id = cid;
  next();
}