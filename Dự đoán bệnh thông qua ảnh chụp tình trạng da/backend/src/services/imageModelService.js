const fs = require("fs/promises");

const IMAGE_MODEL_API_URL = process.env.IMAGE_MODEL_API_URL || "http://127.0.0.1:8000/predict";
const IMAGE_MODEL_TIMEOUT_MS = Number(process.env.IMAGE_MODEL_TIMEOUT_MS || 20000);

async function runImagePrediction(imageFilePath) {
  const imageBuffer = await fs.readFile(imageFilePath);
  const imageBase64 = imageBuffer.toString("base64");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), IMAGE_MODEL_TIMEOUT_MS);

  try {
    const response = await fetch(IMAGE_MODEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ image_base64: imageBase64 }),
      signal: controller.signal
    });

    const bodyText = await response.text();
    let parsedBody;

    try {
      parsedBody = bodyText ? JSON.parse(bodyText) : {};
    } catch (_err) {
      parsedBody = { message: bodyText };
    }

    if (!response.ok) {
      const err = new Error(parsedBody.message || `Image model API failed with status ${response.status}`);
      err.statusCode = response.status === 404 ? 502 : response.status;
      err.detail = parsedBody.detail || parsedBody.error || null;
      throw err;
    }

    return parsedBody;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutErr = new Error(`Image model API timeout after ${IMAGE_MODEL_TIMEOUT_MS}ms`);
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }

    if (!err.statusCode) {
      const serviceErr = new Error(`Cannot reach image model API at ${IMAGE_MODEL_API_URL}`);
      serviceErr.statusCode = 502;
      serviceErr.detail = err.message;
      throw serviceErr;
    }

    throw err;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = {
  runImagePrediction
};
