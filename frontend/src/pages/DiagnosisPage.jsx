import React, { useState, useRef } from 'react';
import { UploadCloud, X, Zap, Target, Loader2, Image as ImageIcon } from 'lucide-react';
// import { diagnoseDisease, diagnoseImage } from '../services/api'; // Mở khi Backend sẵn sàng

const DiagnosisPage = () => {
    // --- States cho Chẩn đoán văn bản (V3) ---
    const [symptomInput, setSymptomInput] = useState('');
    const [symptoms, setSymptoms] = useState([]);

    // --- States cho Chẩn đoán Hình ảnh (Mới) ---
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --- States chung ---
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [diagnosisType, setDiagnosisType] = useState('text'); // 'text' hoặc 'image'

    // --- Xử lý Chẩn đoán văn bản ---
    const handleAddSymptom = (e) => {
        if (e.key === 'Enter' && symptomInput.trim() !== '') {
            if (!symptoms.includes(symptomInput.trim())) {
                setSymptoms([...symptoms, symptomInput.trim()]);
            }
            setSymptomInput('');
        }
    };

    const handleRemoveSymptom = (symptomToRemove) => {
        setSymptoms(symptoms.filter((s) => s !== symptomToRemove));
    };

    // --- Xử lý Chẩn đoán Hình ảnh ---
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            // Tạo đường dẫn tạm để xem trước ảnh
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset input file
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // --- Hàm Chẩn đoán chung ---
    const handleDiagnose = async () => {
        setLoading(true);
        setResult(null);

        try {
            // Mô phỏng thời gian chờ model (2 giây)
            await new Promise((resolve) => setTimeout(resolve, 2000));

            let mockData = {};

            if (diagnosisType === 'text') {
                if (symptoms.length === 0) return;
                // Mock data cho triệu chứng văn bản
                mockData = {
                    disease: "Sốt xuất huyết (Dengue Fever)",
                    confidence: 88.5,
                    advice: "Nghỉ ngơi, uống nhiều nước điện giải (Oresol) và theo dõi thân nhiệt. Cần đến ngay cơ sở y tế nếu có dấu hiệu xuất huyết dưới da hoặc chảy máu chân răng."
                };
                // GỌI API THỰC TẾ:
                // mockData = await diagnoseDisease(symptoms);
            } else {
                if (!selectedImage) return;
                // Mock data cho hình ảnh (mẫu bệnh về da)
                mockData = {
                    disease: "Viêm da cơ địa (Eczema)",
                    confidence: 94.2,
                    advice: "Cần giữ ẩm da thường xuyên, tránh xa các tác nhân gây dị ứng. Sử dụng kem bôi dịu nhẹ được bác sĩ da liễu khuyên dùng. Tránh gãi làm xước da.",
                    source: "image_2.png" // Mock hình ảnh tham khảo (VD nốt ban)
                };
                // GỌI API THỰC TẾ (sử dụng FormData):
                // mockData = await diagnoseImage(selectedImage);
            }

            setResult(mockData);
        } catch (error) {
            console.error("Lỗi khi gọi model chẩn đoán:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-10">
            <div className="bg-white w-full max-w-7xl rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 grid md:grid-cols-12">

                {/* === Left Panel: Hero & Kết quả === */}
                <div className="bg-gradient-to-br from-blue-700 to-blue-500 p-12 text-center shadow-inner md:col-span-5 flex flex-col justify-between">
                    <div>
                        <div className="bg-white p-3 rounded-2xl w-fit mx-auto shadow-xl mb-6 transform hover:scale-105 transition">
                            <Zap className="w-10 h-10 text-blue-600" strokeWidth={1.5} />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">MediAI System</h1>
                        <p className="text-blue-100 text-base font-medium leading-relaxed max-w-sm mx-auto">
                            Chẩn đoán sức khỏe thông minh bằng Triệu chứng văn bản hoặc Hình ảnh.
                        </p>
                    </div>

                    {/* Khu vực hiển thị Kết quả phân lớp (Mới) */}
                    {result && !loading && (
                        <div className="mt-10 p-7 bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 transition-all text-left">
                            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center">
                                <Target className="w-4 h-4 mr-1.5" /> Kết quả phân tích cao nhất
                            </h3>
                            <p className="text-2xl font-extrabold text-gray-800 mb-6">{result.disease}</p>

                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-semibold text-gray-600">Độ tin cậy của mô hình</span>
                                    <span className="font-bold text-blue-700 text-base">{result.confidence}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden shadow-inner border border-gray-100">
                                    <div
                                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3.5 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${result.confidence}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl text-sm text-gray-700 border border-gray-200 shadow-sm leading-relaxed mb-6">
                                <span className="font-bold text-blue-800">💡 Lời khuyên: </span>
                                {result.advice}
                            </div>

                            {result.source && (
                                <p className="text-[11px] text-gray-400 mt-5 italic text-center px-4">
                                    * Nguồn dữ liệu hình ảnh tham khảo: {result.source}.
                                </p>
                            )}

                            <p className="text-[11px] text-gray-400 mt-5 italic text-center px-4">
                                * Lưu ý: Kết quả phân tích từ mô hình khai phá dữ liệu chỉ mang tính chất tham khảo cho đồ án môn học, không có giá trị thay thế chẩn đoán y tế chuyên nghiệp.
                            </p>
                        </div>
                    )}
                </div>

                {/* === Right Panel: Form Nhập liệu (Mới) === */}
                <div className="p-12 md:col-span-7 flex flex-col space-y-10">

                    {/* Tabs chuyển đổi phương thức chẩn đoán */}
                    <div className="bg-slate-100 p-1.5 rounded-2xl flex border border-slate-200 w-fit">
                        <button
                            onClick={() => setDiagnosisType('text')}
                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${diagnosisType === 'text' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}>
                            Chẩn đoán qua triệu chứng
                        </button>
                        <button
                            onClick={() => setDiagnosisType('image')}
                            className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${diagnosisType === 'image' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}>
                            Chẩn đoán qua hình ảnh
                        </button>
                    </div>

                    {/* Form Chẩn đoán văn bản (V3) */}
                    {diagnosisType === 'text' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                    Nhập triệu chứng của bạn (Nhập và nhấn Enter)
                                </label>
                                <input
                                    type="text"
                                    className="w-full border-2 border-gray-100 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors shadow-sm text-gray-700"
                                    placeholder="VD: Sốt cao, phát ban, ho..."
                                    value={symptomInput}
                                    onChange={(e) => setSymptomInput(e.target.value)}
                                    onKeyDown={handleAddSymptom}
                                />
                            </div>

                            <div className="flex flex-wrap gap-2.5 min-h-[48px] bg-slate-50 p-3 rounded-2xl border border-gray-100">
                                {symptoms.map((symptom, index) => (
                                    <span key={index} className="flex items-center bg-blue-50 text-blue-800 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100 shadow-sm transition-all hover:bg-blue-100">
                                        {symptom}
                                        <button onClick={() => handleRemoveSymptom(symptom)} className="ml-2 text-blue-400 hover:text-red-500 focus:outline-none font-bold">✕</button>
                                    </span>
                                ))}
                                {symptoms.length === 0 && (
                                    <span className="text-sm text-gray-400 italic flex items-center">Chưa có triệu chứng nào...</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form Chẩn đoán Hình ảnh (Mới) */}
                    {diagnosisType === 'image' && (
                        <div className="space-y-6 flex-grow flex flex-col">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                                    Tải lên hình ảnh triệu chứng (Bệnh về da)
                                </label>

                                {/* Khu vực Drag & Drop */}
                                {!imagePreview && (
                                    <div
                                        onClick={triggerFileInput}
                                        className="border-2 border-dashed border-blue-200 rounded-3xl p-10 text-center hover:bg-blue-50 transition-colors cursor-pointer group flex flex-col items-center justify-center space-y-3"
                                    >
                                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <UploadCloud className="w-7 h-7 text-blue-600" />
                                        </div>
                                        <p className="text-sm font-medium text-blue-900">
                                            Kéo thả file hoặc Click để chọn
                                        </p>
                                        <p className="text-xs text-gray-400">Hỗ trợ file PNG, JPG (tối đa 10MB)</p>
                                    </div>
                                )}

                                {/* Khu vực Preview Ảnh */}
                                {imagePreview && (
                                    <div className="relative border-2 border-gray-100 p-2 rounded-3xl shadow-sm bg-slate-50">
                                        <img
                                            src={imagePreview}
                                            alt="Xem trước ảnh"
                                            className="w-full h-auto max-h-72 object-cover rounded-2xl"
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="absolute top-4 right-4 bg-white/80 p-1.5 rounded-full text-gray-500 hover:bg-red-500 hover:text-white transition shadow"
                                            title="Xóa hình ảnh này"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/png, image/jpeg, image/jpg"
                                    className="hidden"
                                />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl text-sm text-gray-700 border border-gray-200 shadow-sm flex items-start flex-grow">
                                <ImageIcon className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p>Mô hình AI sẽ phân tích các đặc trưng hình ảnh (màu sắc, hình dạng, cấu trúc) của tổn thương trên da để đưa ra chẩn đoán có khả năng nhất.</p>
                            </div>
                        </div>
                    )}

                    {/* Nút Chẩn đoán chung */}
                    <button
                        onClick={handleDiagnose}
                        disabled={
                            (diagnosisType === 'text' && symptoms.length === 0) ||
                            (diagnosisType === 'image' && !selectedImage) ||
                            loading
                        }
                        className={`w-full py-4.5 rounded-2xl text-white font-bold text-lg transition-all duration-300 shadow-md flex items-center justify-center
              ${((diagnosisType === 'text' && symptoms.length === 0) || (diagnosisType === 'image' && !selectedImage))
                                ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 hover:shadow-lg transform hover:-translate-y-0.5'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                Model đang phân tích...
                            </>
                        ) : 'Bắt đầu Chẩn Đoán'}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default DiagnosisPage;