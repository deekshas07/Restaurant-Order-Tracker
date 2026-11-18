function requestTimerAndLogger(req, res, next) {
  const startHrTime = process.hrtime.bigint();

  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const durationNs = Number(process.hrtime.bigint() - startHrTime);
    const durationMs = Math.max(1, Math.round((durationNs / 1e6) * 100) / 100);
    if (!res.headersSent) {
      res.setHeader("X-Response-Time", `${durationMs}ms`);
    }
    return originalJson(body);
  };

  res.on("finish", () => {
    if (process.env.SILENT_REQUEST_LOGS === "true") return;
    const durationNs = Number(process.hrtime.bigint() - startHrTime);
    const durationMs = Math.max(1, Math.round((durationNs / 1e6) * 100) / 100);
    const cacheHeader = res.getHeader("X-Cache") || "BYPASS";
    console.log(
      `[API] ${new Date().toISOString()} | ${req.method.padEnd(6)} ${
        req.originalUrl
      } -> ${res.statusCode} (${durationMs}ms) [X-Cache: ${cacheHeader}]`
    );
  });

  next();
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    error: "Not Found",
    statusCode: 404,
    message: `Route '${req.method} ${req.originalUrl}' was not found on this server.`,
    timestamp: new Date().toISOString(),
  });
}

function globalErrorHandler(err, req, res, next) {
  // Handle malformed JSON body from express.json()
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      error: "Bad Request",
      statusCode: 400,
      message: "Malformed JSON payload in request body.",
      details: [err.message],
      timestamp: new Date().toISOString(),
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const errorLabel =
    statusCode === 400
      ? "Bad Request"
      : statusCode === 404
      ? "Not Found"
      : "Internal Server Error";

  if (statusCode >= 500) {
    console.error("[Server Error]:", err.message);
  }

  return res.status(statusCode).json({
    error: errorLabel,
    statusCode,
    message: err.message || "An unexpected internal server error occurred.",
    details: err.details || undefined,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  requestTimer: requestTimerAndLogger,
  requestTimerAndLogger,
  notFoundHandler,
  globalErrorHandler,
};
