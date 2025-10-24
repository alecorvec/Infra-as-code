import crypto from "node:crypto";
export function correlation(req, _res, next) {
    const cid = req.header("correlation_id") || crypto.randomUUID();
    req.correlation_id = cid;
    next();
}
