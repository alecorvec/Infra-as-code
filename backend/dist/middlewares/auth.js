import { createRemoteJWKSet, jwtVerify } from "jose";
const JWKS_URL = process.env.JWKS_URL;
const AUDIENCE = process.env.JWT_AUD;
const ISSUER = process.env.JWT_ISS;
const jwks = JWKS_URL ? createRemoteJWKSet(new URL(JWKS_URL)) : null;
// For development: allow bypassing auth if no JWT config is provided
const isDevelopment = process.env.NODE_ENV === 'development' && !JWKS_URL;
export async function auth(req, res, next) {
    try {
        // For development: bypass auth if no JWT config is provided
        if (isDevelopment) {
            req.user = { sub: 'dev-user', scope: 'read write' };
            return next();
        }
        const authz = req.header("authorization") || "";
        const token = authz.startsWith("Bearer ") ? authz.slice(7) : "";
        if (!token || !jwks)
            return res.status(401).json({ error: "Unauthorized" });
        const { payload } = await jwtVerify(token, jwks, {
            issuer: ISSUER, audience: AUDIENCE
        });
        req.user = { sub: payload.sub, scope: payload.scope };
        next();
    }
    catch {
        res.status(401).json({ error: "Unauthorized" });
    }
}
