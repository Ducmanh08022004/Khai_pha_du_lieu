import joblib
import numpy as np
import pandas as pd
import os

# 1. TẢI MODEL
base_dir = os.path.dirname(__file__)
model = joblib.load(os.path.join(base_dir, 'symptom_disease_model.pkl'))
symptoms_list_path = os.path.join(base_dir, 'symptoms_list.pkl')

if os.path.exists(symptoms_list_path):
    symptoms_list = joblib.load(symptoms_list_path)
elif hasattr(model, 'feature_names_in_'):
    symptoms_list = list(model.feature_names_in_)
else:
    raise FileNotFoundError(
        f"Missing symptoms list: {symptoms_list_path}. "
        "Model also has no feature_names_in_, cannot build input vector."
    )

# ==========================================
# 2. TỪ ĐIỂN ÁNH XẠ (VIỆT -> ANH)
# ==========================================
# Bạn có thể bổ sung thêm hàng trăm từ vào đây theo đúng danh sách 377 triệu chứng
VN_TO_EN_MAP = {
    # Nhóm Tiêu hóa
    "đau ngực": "sharp chest pain",
    "ợ chua": "heartburn",
    "đau thượng vị": "upper abdominal pain",
    "ho": "cough",
    
    # Nhóm Nhiễm trùng / Cúm
    "sốt": "fever",
    "sốt cao": "high fever",
    "đau khớp": "joint pain",
    "đau cơ": "muscle pain",
    "nôn mửa": "vomiting",
    "đau đầu": "headache",
    "ngạt mũi": "nasal congestion",
    "hắt hơi": "sneezing",
    "đau họng": "sore throat",
    "ớn lạnh": "chills",
    
    # Nhóm Da liễu
    "ngứa da": "itching of skin",
    "phát ban": "skin rash",
    "da bong tróc": "abnormal appearing skin",
    "tổn thương da": "skin lesion"
}

# ==========================================
# 3. HÀM XỬ LÝ VÀ DỰ ĐOÁN TỪ TIẾNG VIỆT
# ==========================================
def predict_from_vn_list(vn_symptoms):
    print("\n" + "="*60)
    print(f"🇻🇳 Người dùng chọn (Tiếng Việt): {vn_symptoms}")
    print("="*60)
    
    # Bước 3.1: Dịch mảng Tiếng Việt sang Tiếng Anh
    en_symptoms = []
    for vn_sym in vn_symptoms:
        # Chuyển về chữ thường và xóa khoảng trắng thừa để tra từ điển cho chuẩn
        clean_vn_sym = str(vn_sym).lower().strip()
        
        # Lấy từ tiếng Anh tương ứng (nếu không có thì bỏ qua)
        en_sym = VN_TO_EN_MAP.get(clean_vn_sym)
        if en_sym:
            en_symptoms.append(en_sym)
        else:
            print(f"⚠️ Chưa có bản dịch cho triệu chứng: '{vn_sym}'")

    print(f"🇬🇧 Hệ thống tự dịch sang (Tiếng Anh): {en_symptoms}")
    
    if len(en_symptoms) == 0:
        print("❌ Không có triệu chứng hợp lệ để dự đoán.")
        return

    # Bước 3.2: Khởi tạo vector và Map vào từ điển của Model như cũ
    input_vector = np.zeros(len(symptoms_list))
    for i, dataset_symptom in enumerate(symptoms_list):
        clean_dataset_symptom = dataset_symptom.replace('_', ' ').lower().strip()
        if clean_dataset_symptom in en_symptoms:
            input_vector[i] = 1

    # Bước 3.3: Dự đoán
    input_df = pd.DataFrame([input_vector], columns=symptoms_list)
    probabilities = model.predict_proba(input_df)[0]
    top_5_indices = np.argsort(probabilities)[-5:][::-1]

    print("\n🚨 TOP 5 BỆNH CÓ KHẢ NĂNG NHẤT:")
    for rank, idx in enumerate(top_5_indices, start=1):
        disease_name = model.classes_[idx]
        prob = probabilities[idx] * 100
        print(f"   {rank}. {disease_name.upper():<35} (Độ tin cậy: {prob:>5.2f}%)")
    print("="*60)

# ==========================================
# 4. KỊCH BẢN TEST BẰNG TIẾNG VIỆT
# ==========================================

# Bệnh nhân A: Chọn các checkbox liên quan đến Sốt xuất huyết
benh_nhan_a = ['Sốt', 'Đau khớp', 'Nôn mửa', 'Phát ban', 'Đau đầu']
predict_from_vn_list(benh_nhan_a)

# Bệnh nhân B: Chọn các checkbox liên quan đến Dạ dày
benh_nhan_b = ['Đau ngực', 'Ợ chua', 'Đau thượng vị', 'Ho']
predict_from_vn_list(benh_nhan_b)