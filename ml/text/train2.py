import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import BernoulliNB
from sklearn.metrics import accuracy_score, classification_report
import joblib

# ==========================================
# 1. ĐỌC DỮ LIỆU
# ==========================================
print("⏳ Đang tải bộ dữ liệu (246.000 dòng)...")
# Đảm bảo file CSV của bạn nằm cùng thư mục hoặc sửa lại đường dẫn cho đúng
df = pd.read_csv('Final_Augmented_dataset_Diseases_and_Symptoms.csv') 

# ==========================================
# 2. CHIA TÁCH ĐẶC TRƯNG VÀ NHÃN
# ==========================================
# Kiểm tra lại tên cột chứa bệnh trong file CSV của bạn (thường là 'diseases' hoặc 'Disease')
TARGET_COLUMN = 'diseases' 

X = df.drop(columns=[TARGET_COLUMN]) # Các cột triệu chứng (Input 0-1)
y = df[TARGET_COLUMN]                # Cột tên bệnh (Output)

# LƯU Ý QUAN TRỌNG: Lưu lại danh sách 377 cột triệu chứng
# Website sẽ cần file này để biết thứ tự cột khi tạo mảng 0-1 từ text người dùng nhập
symptom_columns = list(X.columns)
joblib.dump(symptom_columns, 'symptoms_list.pkl')

print(f"🎯 Đang chuẩn bị dự đoán {len(y.unique())} bệnh từ {len(symptom_columns)} triệu chứng...")

# ==========================================
# 3. CHIA TẬP TRAIN / TEST
# ==========================================
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# ==========================================
# 4. HUẤN LUYỆN BẰNG NAIVE BAYES
# ==========================================
print("🚀 Đang chạy thuật toán Bernoulli Naive Bayes...")
model = BernoulliNB()
model.fit(X_train, y_train)

# ==========================================
# 5. ĐÁNH GIÁ VÀ LƯU MODEL
# ==========================================
y_pred = model.predict(X_test)
print("\n✅ KẾT QUẢ ĐÁNH GIÁ:")
print(f"Accuracy: {accuracy_score(y_test, y_pred) * 100:.2f}%")

# Lưu model nhẹ nhàng
joblib.dump(model, 'symptom_disease_model_nb.pkl')
print("💾 Đã lưu model thành công (symptom_disease_model_nb.pkl)!")
print("🎉 Bạn có thể kiểm tra lại dung lượng file, chắc chắn sẽ cực kỳ nhẹ!")