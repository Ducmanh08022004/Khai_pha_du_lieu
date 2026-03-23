import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UploadCloud, X, Zap, Target, Loader2, Image as ImageIcon } from 'lucide-react';
import { predictFromImage, predictFromText } from '../services/api';

const DiagnosisPage = () => {
    const [symptomOptions, setSymptomOptions] = useState([]);
    const [symptomQuery, setSymptomQuery] = useState('');

    useEffect(() => {
        let mounted = true;

        import('../data/symptoms_dictionary_vi.json')
            .then((mod) => {
                const list = mod?.default?.symptoms;
                const normalized = Array.isArray(list) ? list : [];
                if (mounted) setSymptomOptions(normalized);
            })
            .catch((err) => {
                console.error('Không thể tải danh sách triệu chứng:', err);
                if (mounted) setSymptomOptions([]);
            });

        return () => {
            mounted = false;
        };
    }, []);

    // --- States cho Chẩn đoán văn bản (Chọn triệu chứng) ---
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);

    // --- States cho Chẩn đoán Hình ảnh (Mới) ---
    const fileInputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // --- States chung ---
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [diagnosisType, setDiagnosisType] = useState('text'); // 'text' hoặc 'image'

    const toggleSymptom = (viLabel) => {
        setSelectedSymptoms((prev) => {
            if (prev.includes(viLabel)) {
                return prev.filter((item) => item !== viLabel);
            }
            return [...prev, viLabel];
        });
    };

    const normalizeForSearch = (value) => {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    const filteredSymptomOptions = useMemo(() => {
        const q = normalizeForSearch(symptomQuery);
        if (!q) return symptomOptions;

        return symptomOptions.filter((item) => {
            const viLabel = item?.vi_label || '';
            const id = item?.id || '';
            const haystack = `${normalizeForSearch(viLabel)} ${normalizeForSearch(id)}`;
            return haystack.includes(q);
        });
    }, [symptomOptions, symptomQuery]);

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
        setErrorMessage(null);

        try {
            if (diagnosisType === 'text') {
                if (selectedSymptoms.length === 0) return;
                const data = await predictFromText(selectedSymptoms);
                setResult(data);
            } else {
                if (!selectedImage) return;
                const data = await predictFromImage(selectedImage);
                setResult(data);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API chẩn đoán:", error);
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Không thể gọi API chẩn đoán. Vui lòng kiểm tra backend/model đã chạy.';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    const topPredictions = useMemo(() => {
        const list = result?.prediction?.predictions;
        if (!Array.isArray(list)) return [];
        return list.slice(0, 5);
    }, [result]);

    const getPredictionLabel = (item) => {
        return item?.disease_vi || item?.disease || item?.benh || item?.code || '—';
    };

    const getPredictionPercent = (item) => {
        if (typeof item?.confidence_percent === 'number') return item.confidence_percent;
        if (typeof item?.phan_tram_tin_cay === 'number') return item.phan_tram_tin_cay;
        if (typeof item?.confidence === 'number') return Math.round(item.confidence * 10000) / 100;
        if (typeof item?.do_tin_cay === 'number') return Math.round(item.do_tin_cay * 10000) / 100;
        return null;
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
                    {errorMessage && !loading && (
                        <div className="mt-10 p-7 bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 transition-all text-left">
                            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center">
                                <Target className="w-4 h-4 mr-1.5" /> Lỗi
                            </h3>
                            <p className="text-sm text-gray-700 leading-relaxed">{errorMessage}</p>
                        </div>
                    )}

                    {result && !loading && topPredictions.length > 0 && (
                        <div className="mt-10 p-7 bg-white/95 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 transition-all text-left">
                            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center">
                                <Target className="w-4 h-4 mr-1.5" /> Top 5 dự đoán
                            </h3>

                            <div className="space-y-4">
                                {topPredictions.map((item, index) => {
                                    const label = getPredictionLabel(item);
                                    const percent = getPredictionPercent(item);
                                    const width = Math.max(0, Math.min(100, percent ?? 0));

                                    return (
                                        <div key={`${label}-${index}`} className="bg-white/80 rounded-2xl p-4 border border-gray-100 shadow-sm">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                        {index + 1}. {label}
                                                    </p>
                                                    {item?.code && (
                                                        <p className="text-[11px] text-gray-400">Mã: {item.code}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-blue-700">
                                                        {percent !== null ? `${percent}%` : '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden shadow-inner border border-gray-100">
                                                <div
                                                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-3.5 rounded-full transition-all duration-700 ease-out"
                                                    style={{ width: `${width}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

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
                                    Chọn triệu chứng của bạn (tích chọn trong danh sách)
                                </label>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-gray-700">Triệu chứng đã chọn</span>
                                    <span className="text-xs text-gray-500">{selectedSymptoms.length} đã chọn</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5 min-h-[44px]">
                                    {selectedSymptoms.map((symptom) => (
                                        <button
                                            key={symptom}
                                            type="button"
                                            onClick={() => toggleSymptom(symptom)}
                                            className="flex items-center bg-white text-slate-900 px-4 py-1.5 rounded-full text-sm font-medium border border-slate-200 shadow-sm transition-all hover:border-slate-300"
                                            title="Click để bỏ chọn"
                                        >
                                            {symptom}
                                            <span className="ml-2 text-slate-400 font-bold">✕</span>
                                        </button>
                                    ))}
                                    {selectedSymptoms.length === 0 && (
                                        <span className="text-sm text-gray-400 italic flex items-center">Chưa chọn triệu chứng nào...</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-gray-700">Danh sách triệu chứng</span>
                                    <span className="text-xs text-gray-500">{filteredSymptomOptions.length}/{symptomOptions.length} mục</span>
                                </div>

                                <div className="mb-3">
                                    <input
                                        type="text"
                                        value={symptomQuery}
                                        onChange={(e) => setSymptomQuery(e.target.value)}
                                        placeholder="Tìm triệu chứng... (VD: sốt, ho, đau họng)"
                                        className="w-full border-2 border-gray-100 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-colors shadow-sm text-gray-700"
                                    />
                                    <p className="mt-2 text-xs text-gray-400">
                                        Có thể tìm theo tiếng Việt (bỏ dấu) hoặc ID tiếng Anh.
                                    </p>
                                </div>

                                <div className="max-h-72 overflow-auto pr-1">
                                    <div className="flex flex-wrap gap-2">
                                        {filteredSymptomOptions.map((item) => {
                                            const viLabel = item?.vi_label || item?.id;
                                            const selected = viLabel && selectedSymptoms.includes(viLabel);

                                            return (
                                                <button
                                                    key={item?.id || viLabel}
                                                    type="button"
                                                    onClick={() => viLabel && toggleSymptom(viLabel)}
                                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all bg-white ${selected
                                                            ? 'border-slate-400 text-slate-900'
                                                            : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                                                        }`}
                                                    title={item?.id ? `ID: ${item.id}` : undefined}
                                                >
                                                    {viLabel}
                                                </button>
                                            );
                                        })}

                                        {filteredSymptomOptions.length === 0 && (
                                            <div className="text-sm text-gray-400 italic py-2">Không tìm thấy triệu chứng phù hợp.</div>
                                        )}
                                    </div>
                                </div>
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
                            (diagnosisType === 'text' && selectedSymptoms.length === 0) ||
                            (diagnosisType === 'image' && !selectedImage) ||
                            loading
                        }
                        className={`w-full py-4.5 rounded-2xl text-white font-bold text-lg transition-all duration-300 shadow-md flex items-center justify-center
              ${((diagnosisType === 'text' && selectedSymptoms.length === 0) || (diagnosisType === 'image' && !selectedImage))
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