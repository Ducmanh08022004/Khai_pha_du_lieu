async function runTextPrediction(_payload) {
  const err = new Error("Text model is not integrated yet");
  err.statusCode = 501;
  err.detail = "Create your Python text inference script, then wire it in src/services/textModelService.js";
  throw err;
}

module.exports = {
  runTextPrediction
};
