import numpy as np
import os
import sys

try:
    import tensorflow as tf
    from tensorflow.keras.preprocessing import image
except Exception:
    print("SKIPPED: TensorFlow is not installed or incompatible with current Python version.")
    print("Use Python 3.11/3.12 with TensorFlow to run image model tests.")
    sys.exit(0)

base_dir = os.path.dirname(__file__)
project_root = os.path.abspath(os.path.join(base_dir, "..", ".."))

model_path = os.path.join(base_dir, "skin_cancer_model.h5")
model = tf.keras.models.load_model(model_path)

default_img_path = os.path.join(project_root, "test_image", "custom", "naevus.jpg")
img_path = sys.argv[1] if len(sys.argv) > 1 else default_img_path

if not os.path.exists(img_path):
    raise FileNotFoundError(f"Image not found: {img_path}")

img = image.load_img(img_path, target_size=(224,224))

img_array = image.img_to_array(img) / 255.0

img_array = np.expand_dims(img_array, axis=0)

prediction = model.predict(img_array)

classes = ["akiec","bcc","bkl","df","mel","nv","vasc"]

predicted_class = classes[np.argmax(prediction)]

print("Prediction:", predicted_class)


# ===============================
# Mapping tên bệnh
# ===============================

classes_vi = {
    "akiec": "Actinic Keratoses (Dày sừng ánh sáng)",
    "bcc": "Basal Cell Carcinoma (Ung thư tế bào đáy)",
    "bkl": "Benign Keratosis (Dày sừng lành tính)",
    "df": "Dermatofibroma (U xơ da)",
    "mel": "Melanoma (U hắc tố ác tính)",
    "nv": "Melanocytic Nevus (Nốt ruồi sắc tố)",
    "vasc": "Vascular Lesion (Tổn thương mạch máu)"
}

result = classes_vi[predicted_class]

print("Bệnh dự đoán:", result)


# ===============================
# In xác suất chi tiết
# ===============================

print("\nChi tiết xác suất dự đoán:")

for i, cls in enumerate(classes):

    percent = prediction[0][i] * 100

    print(f"{classes_vi[cls]} : {percent:.2f}%")
