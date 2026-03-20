import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UploadCloud, FileJson, BarChart3, Loader2 } from 'lucide-react';

const DashboardPage = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statsData, setStatsData] = useState(null);
    const [jsonResponse, setJsonResponse] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setLoading(true);

        try {
            // Giả lập thời gian gọi API POST /api/analyze
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock data giống cấu trúc backend trả về { stats: [{ name, value }] }
            const mockResponse = {
                message: "Phân tích thành công",
                total_records: 15420,
                stats: [
                    { name: 'Sốt xuất huyết', value: 4500 },
                    { name: 'Cảm cúm', value: 3200 },
                    { name: 'Viêm phổi', value: 2800 },
                    { name: 'Sốt rét', value: 1500 },
                    { name: 'Viêm họng', value: 3420 },
                ]
            };

            setStatsData(mockResponse.stats);
            setJsonResponse(mockResponse);
        } catch (error) {
            console.error("Lỗi phân tích:", error);
        } finally {
            setLoading(false);
        }
    };

    // Mảng màu gradient xanh cho các cột biểu đồ
    const colors = ['#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'];

    return (
        <div className="bg-slate-50 p-6 lg:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-blue-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900 mb-2">Dashboard Thống Kê Dữ Liệu</h1>
                        <p className="text-gray-500">Upload dataset để backend trích xuất đặc trưng và trực quan hóa số liệu.</p>
                    </div>
                    <div className="hidden md:flex p-4 bg-blue-50 rounded-2xl">
                        <BarChart3 className="w-10 h-10 text-blue-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Cột trái: Upload & JSON */}
                    <div className="lg:col-span-1 space-y-8">

                        {/* Card Upload */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <UploadCloud className="w-5 h-5 mr-2 text-blue-600" /> Tải lên Dataset
                            </h2>

                            <div className="relative border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center hover:bg-blue-50 transition-colors group">
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .json"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-2 pointer-events-none">
                                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-blue-900">
                                        {selectedFile ? selectedFile.name : "Kéo thả file hoặc Click để chọn"}
                                    </p>
                                    <p className="text-xs text-gray-400">Hỗ trợ .CSV, .XLSX</p>
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedFile || loading}
                                className={`mt-6 w-full py-3 rounded-xl font-bold text-white transition-all shadow-md flex items-center justify-center
                  ${!selectedFile ? 'bg-gray-300 shadow-none cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-lg hover:-translate-y-0.5'}`}
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang phân tích...</>
                                ) : 'Bắt đầu phân tích'}
                            </button>
                        </div>

                        {/* Card JSON Response */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                                <FileJson className="w-5 h-5 mr-2 text-blue-600" /> Phản hồi API (JSON)
                            </h2>
                            <div className="bg-slate-900 rounded-2xl p-4 overflow-auto max-h-64 shadow-inner">
                                {jsonResponse ? (
                                    <pre className="text-xs text-green-400 font-mono leading-relaxed">
                                        {JSON.stringify(jsonResponse, null, 2)}
                                    </pre>
                                ) : (
                                    <p className="text-sm text-slate-500 italic">Chưa có dữ liệu. Vui lòng upload dataset.</p>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Cột phải: Biểu đồ */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-blue-100 h-full min-h-[500px] flex flex-col">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">
                                Biểu đồ phân bố bệnh lý
                            </h2>

                            <div className="flex-grow flex items-center justify-center">
                                {statsData ? (
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip
                                                cursor={{ fill: '#f1f5f9' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                                                {statsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center space-y-4">
                                        <BarChart3 className="w-16 h-16 text-gray-200 mx-auto" />
                                        <p className="text-gray-400">Biểu đồ sẽ hiển thị tại đây sau khi phân tích dataset</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashboardPage;