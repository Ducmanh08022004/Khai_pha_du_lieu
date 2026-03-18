const fs = require("fs/promises");

const { runImagePrediction } = require("../services/imageModelService");
const { runTextPrediction } = require("../services/textModelService");

async function predictFromImage(req, res, next) {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "Missing image file. Use form-data key: image" });
  }

  const tempImagePath = req.file.path;

  try {
    const prediction = await runImagePrediction(tempImagePath);

    return res.json({
      type: "image",
      prediction
    });
  } catch (err) {
    return next(err);
  } finally {
    await fs.unlink(tempImagePath).catch(() => null);
  }
}

async function predictFromText(req, res, next) {
  const { symptoms, metadata } = req.body || {};

  if (!symptoms || (Array.isArray(symptoms) && symptoms.length === 0)) {
    return res.status(400).json({
      message: "Missing symptoms. Send string or array in body.symptoms"
    });
  }

  try {
    const prediction = await runTextPrediction({ symptoms, metadata });

    return res.json({
      type: "text",
      prediction
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  predictFromImage,
  predictFromText
};
