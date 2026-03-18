const express = require("express");
const cors = require("cors");

const predictionRoutes = require("./routes/predictionRoutes");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandlers");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "skin-disease-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/v1/predict", predictionRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
