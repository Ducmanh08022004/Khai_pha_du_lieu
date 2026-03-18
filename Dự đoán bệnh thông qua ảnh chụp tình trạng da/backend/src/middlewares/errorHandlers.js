function notFoundHandler(req, res) {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || "Internal server error",
    detail: err.detail || null
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
