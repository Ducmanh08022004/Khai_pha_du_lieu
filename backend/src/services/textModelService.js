const TEXT_MODEL_API_URL = process.env.TEXT_MODEL_API_URL || "http://127.0.0.1:8001/predict";
const TEXT_MODEL_TIMEOUT_MS = Number(process.env.TEXT_MODEL_TIMEOUT_MS || 20000);

async function runTextPrediction(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TEXT_MODEL_TIMEOUT_MS);

  try {
    const response = await fetch(TEXT_MODEL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload || {}),
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
      const err = new Error(parsedBody.message || `Text model API failed with status ${response.status}`);
      err.statusCode = response.status === 404 ? 502 : response.status;
      err.detail = parsedBody.detail || parsedBody.error || null;
      throw err;
    }

    return parsedBody;
  } catch (err) {
    if (err.name === "AbortError") {
      const timeoutErr = new Error(`Text model API timeout after ${TEXT_MODEL_TIMEOUT_MS}ms`);
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }

    if (!err.statusCode) {
      const serviceErr = new Error(`Cannot reach text model API at ${TEXT_MODEL_API_URL}`);
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
  runTextPrediction
};
