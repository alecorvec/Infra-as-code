export function errorHandler(err, _req, res, _next) {
    console.error({ err });
    return res.status(err?.status || 500).json({ error: err?.message || "Internal Server Error" });
}
