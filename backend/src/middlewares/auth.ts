import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextFunction, Request, Response } from "express";

const JWKS_URL = process.env.JWKS_URL!;
const AUDIENCE = process.env.JWT_AUD!;
const ISSUER = process.env.JWT_ISS!;
const jwks = JWKS_URL ? createRemoteJWKSet(new URL(JWKS_URL)) : null;

export async function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const authz = req.header("authorization") || "";
    const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
    if (!token || !jwks) return res.status(401).json({ error: "Unauthorized" });

    const { payload } = await jwtVerify(token, jwks, {
      issuer: ISSUER, audience: AUDIENCE
    });
    (req as any).user = { sub: payload.sub, scope: payload.scope };
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized" });
  }
}