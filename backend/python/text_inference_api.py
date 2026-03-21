import json
import os
import re

import joblib
import numpy as np
from flask import Flask, jsonify, request

MODEL_PATH = os.path.abspath(
    os.getenv("TEXT_MODEL_PATH", os.path.join(os.path.dirname(__file__), "../../ml/text/symptom_disease_model.pkl"))
)
SYMPTOMS_LIST_PATH = os.path.abspath(
    os.getenv("SYMPTOMS_LIST_PATH", os.path.join(os.path.dirname(__file__), "../../ml/text/symptoms_list.pkl"))
)
SYMPTOMS_DICT_PATH = os.path.abspath(
    os.getenv("SYMPTOMS_DICT_PATH", os.path.join(os.path.dirname(__file__), "../../ml/text/symptoms_dictionary_vi.json"))
)
DISEASES_DICT_PATH = os.path.abspath(
    os.getenv("DISEASES_DICT_PATH", os.path.join(os.path.dirname(__file__), "../../ml/text/diseases_dictionary_vi.json"))
)


def normalize_symptom(value):
    cleaned = str(value).strip().lower().replace("_", " ")
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


def load_dictionary(dict_path):
    if not os.path.exists(dict_path):
        raise FileNotFoundError(f"Symptoms dictionary not found: {dict_path}")

    with open(dict_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    symptoms = raw.get("symptoms", [])
    if not isinstance(symptoms, list):
        raise ValueError("Invalid dictionary format: 'symptoms' must be a list")

    vi_to_en = {}
    en_to_en = {}
    en_to_vi = {}
    for item in symptoms:
        en_id = item.get("id")
        vi_label = item.get("vi_label")

        if not en_id:
            continue

        en_norm = normalize_symptom(en_id)
        en_to_en[en_norm] = en_id

        if vi_label:
            vi_norm = normalize_symptom(vi_label)
            vi_to_en[vi_norm] = en_id
            en_to_vi[en_norm] = vi_label

    return vi_to_en, en_to_en, en_to_vi


def load_disease_dictionary(dict_path):
    if not os.path.exists(dict_path):
        return {}

    with open(dict_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    if isinstance(raw, dict):
        data = raw.get("diseases", raw)
    else:
        data = {}

    if not isinstance(data, dict):
        return {}

    normalized = {}
    for key, value in data.items():
        if key and value:
            normalized[normalize_symptom(key)] = str(value)

    return normalized


if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Text model not found: {MODEL_PATH}")

MODEL = joblib.load(MODEL_PATH)
VI_TO_EN_MAP, EN_TO_EN_MAP, EN_TO_VI_MAP = load_dictionary(SYMPTOMS_DICT_PATH)
DISEASE_EN_TO_VI_MAP = load_disease_dictionary(DISEASES_DICT_PATH)

if os.path.exists(SYMPTOMS_LIST_PATH):
    SYMPTOMS_LIST = joblib.load(SYMPTOMS_LIST_PATH)
elif hasattr(MODEL, "feature_names_in_"):
    SYMPTOMS_LIST = list(MODEL.feature_names_in_)
else:
    raise FileNotFoundError(
        "Symptoms list not found and model has no feature_names_in_. "
        "Provide SYMPTOMS_LIST_PATH or retrain/export symptoms_list.pkl"
    )

FEATURE_INDEX = {
    normalize_symptom(feature_name): idx for idx, feature_name in enumerate(SYMPTOMS_LIST)
}

app = Flask(__name__)


def to_vi_symptom(value):
    return EN_TO_VI_MAP.get(normalize_symptom(value), value)


def to_vi_disease(value):
    return DISEASE_EN_TO_VI_MAP.get(normalize_symptom(value), value)


def translate_symptoms(symptoms):
    translated = []
    unknown = []

    for symptom in symptoms:
        norm = normalize_symptom(symptom)

        if norm in VI_TO_EN_MAP:
            translated.append(VI_TO_EN_MAP[norm])
            continue

        if norm in EN_TO_EN_MAP:
            translated.append(EN_TO_EN_MAP[norm])
            continue

        if norm in FEATURE_INDEX:
            translated.append(norm)
            continue

        unknown.append(str(symptom))

    return translated, unknown


def predict_from_symptoms(symptoms):
    translated, unknown = translate_symptoms(symptoms)

    if len(translated) == 0:
        raise ValueError("No valid symptoms after translation")

    input_vector = np.zeros(len(SYMPTOMS_LIST), dtype=np.float32)

    for symptom in translated:
        idx = FEATURE_INDEX.get(normalize_symptom(symptom))
        if idx is not None:
            input_vector[idx] = 1.0

    probabilities = MODEL.predict_proba([input_vector])[0]
    classes = list(MODEL.classes_)

    predictions = []
    predictions_vi = []
    for idx, disease in enumerate(classes):
        confidence = float(probabilities[idx])
        disease_vi = to_vi_disease(str(disease))
        predictions.append(
            {
                "disease": str(disease),
                "disease_vi": disease_vi,
                "confidence": confidence,
                "confidence_percent": round(confidence * 100, 4),
            }
        )
        predictions_vi.append(
            {
                "benh": disease_vi,
                "benh_goc": str(disease),
                "do_tin_cay": confidence,
                "phan_tram_tin_cay": round(confidence * 100, 4),
            }
        )

    predictions.sort(key=lambda item: item["confidence"], reverse=True)
    predictions_vi.sort(key=lambda item: item["do_tin_cay"], reverse=True)

    translated_symptoms_vi = [to_vi_symptom(item) for item in translated]

    return {
        "predictions": predictions[:5],
        "translated_symptoms": translated,
        "unknown_symptoms": unknown,
        "response_vi": {
            "du_doan": predictions_vi[:5],
            "trieu_chung_da_dich": translated_symptoms_vi,
            "trieu_chung_khong_xac_dinh": unknown,
        },
    }


@app.get("/health")
def health_check():
    return jsonify(
        {
            "status": "ok",
            "service": "symptom-text-inference",
            "model_path": MODEL_PATH,
            "model_exists": os.path.exists(MODEL_PATH),
            "symptoms_dict_path": SYMPTOMS_DICT_PATH,
            "symptoms_dict_exists": os.path.exists(SYMPTOMS_DICT_PATH),
            "diseases_dict_path": DISEASES_DICT_PATH,
            "diseases_dict_exists": os.path.exists(DISEASES_DICT_PATH),
            "symptoms_count": len(SYMPTOMS_LIST),
        }
    )


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True) or {}
    symptoms = payload.get("symptoms")

    if isinstance(symptoms, str):
        symptoms = [item.strip() for item in symptoms.split(",") if item.strip()]

    if not isinstance(symptoms, list) or len(symptoms) == 0:
        return jsonify({"message": "Missing symptoms. Send string or array in body.symptoms"}), 400

    try:
        return jsonify(predict_from_symptoms(symptoms))
    except ValueError as exc:
        return jsonify({"message": str(exc)}), 400
    except Exception as exc:
        return jsonify({"message": "Text inference failed", "detail": str(exc)}), 500


if __name__ == "__main__":
    host = os.getenv("TEXT_MODEL_API_HOST", "127.0.0.1")
    port = int(os.getenv("TEXT_MODEL_API_PORT", "8001"))
    debug = os.getenv("TEXT_MODEL_API_DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)