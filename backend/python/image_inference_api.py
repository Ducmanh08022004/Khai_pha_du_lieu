import base64
import importlib
import io
import os

import numpy as np
from flask import Flask, jsonify, request
from PIL import Image

CLASSES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

CLASSES_VI = {
    "akiec": "Actinic Keratoses (Day sung anh sang)",
    "bcc": "Basal Cell Carcinoma (Ung thu te bao day)",
    "bkl": "Benign Keratosis (Day sung lanh tinh)",
    "df": "Dermatofibroma (U xo da)",
    "mel": "Melanoma (U hac to ac tinh)",
    "nv": "Melanocytic Nevus (Not ruoi sac to)",
    "vasc": "Vascular Lesion (Ton thuong mach mau)",
}

MODEL_PATH = os.path.abspath(
    # Default points to model file in ml/image.
    os.getenv("MODEL_PATH", os.path.join(os.path.dirname(__file__), "../../ml/image/skin_cancer_model.h5"))
)
MODEL = None
MODEL_LOAD_ERROR = None

app = Flask(__name__)


def get_model():
    global MODEL, MODEL_LOAD_ERROR

    if MODEL is not None:
        return MODEL

    if MODEL_LOAD_ERROR is not None:
        raise RuntimeError(MODEL_LOAD_ERROR)

    if not os.path.exists(MODEL_PATH):
        MODEL_LOAD_ERROR = f"Model not found: {MODEL_PATH}"
        raise RuntimeError(MODEL_LOAD_ERROR)

    try:
        tf = importlib.import_module("tensorflow")
    except Exception:
        MODEL_LOAD_ERROR = (
            "TensorFlow is not installed or is incompatible with this Python version. "
            "Install a supported TensorFlow build or use Python 3.11/3.12."
        )
        raise RuntimeError(MODEL_LOAD_ERROR)

    try:
        MODEL = tf.keras.models.load_model(MODEL_PATH)
        return MODEL
    except Exception as exc:
        MODEL_LOAD_ERROR = f"Failed to load model: {exc}"
        raise RuntimeError(MODEL_LOAD_ERROR)


def build_result(probabilities):
    predictions = []
    for idx, cls in enumerate(CLASSES):
        confidence = float(probabilities[idx])
        confidence_percent = round(confidence * 100, 4)

        predictions.append(
            {
                "code": cls,
                "disease": CLASSES_VI[cls],
                "confidence": confidence,
                "confidence_percent": confidence_percent,
            }
        )

    predictions.sort(key=lambda item: item["confidence"], reverse=True)

    return {
        "predictions": predictions[:5],
    }


def preprocess_image_from_base64(image_b64):
    image_bytes = base64.b64decode(image_b64)
    image_obj = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_obj = image_obj.resize((224, 224))

    image_array = np.array(image_obj, dtype=np.float32) / 255.0
    return np.expand_dims(image_array, axis=0)


@app.get("/health")
def health_check():
    model_loaded = MODEL is not None
    return jsonify(
        {
            "status": "ok",
            "service": "skin-image-inference",
            "model_path": MODEL_PATH,
            "model_exists": os.path.exists(MODEL_PATH),
            "model_loaded": model_loaded,
            "model_error": None if model_loaded else MODEL_LOAD_ERROR,
        }
    )


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    image_b64 = payload.get("image_base64")

    if not image_b64:
        return jsonify({"message": "Missing image_base64 in request body"}), 400

    try:
        model = get_model()
        image_batch = preprocess_image_from_base64(image_b64)
        prediction = model.predict(image_batch, verbose=0)
        return jsonify(build_result(prediction[0]))
    except RuntimeError as exc:
        return jsonify({"message": str(exc)}), 503
    except Exception as exc:
        return jsonify({"message": "Image inference failed", "detail": str(exc)}), 500


if __name__ == "__main__":
    host = os.getenv("MODEL_API_HOST", "127.0.0.1")
    port = int(os.getenv("MODEL_API_PORT", "8000"))
    debug = os.getenv("MODEL_API_DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)