import React, { useState } from 'react';
import DiagnosisPage from './pages/DiagnosisPage';
import DashboardPage from './pages/DashboardPage';
import { Activity, BarChart2, ShieldPlus } from 'lucide-react';

function App() {
  // State quản lý tab đang được chọn (mặc định là trang chẩn đoán)
  const [activeTab, setActiveTab] = useState('diagnosis');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Thanh Header & Điều hướng Tabs */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo / Tên dự án */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-2 rounded-xl shadow-md transform transition hover:scale-105">
              <ShieldPlus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-500 tracking-wide">
              MediAI System
            </span>
          </div>

          {/* Khu vực Tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'diagnosis'
                  ? 'bg-white text-blue-700 shadow-sm transform scale-100'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 scale-95'
                }`}
            >
              <Activity className="w-4 h-4 mr-2" />
              Chẩn Đoán Bệnh
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-sm transform scale-100'
                  : 'text-slate-500 hover:text-blue-600 hover:bg-slate-200/50 scale-95'
                }`}
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              Dashboard Thống Kê
            </button>
          </div>

        </div>
      </header>

      {/* Khu vực Nội dung chính (Thay đổi dựa theo Tab) */}
      <main className="flex-grow">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'diagnosis' ? <DiagnosisPage /> : <DashboardPage />}
        </div>
      </main>
    </div>
  );
}

export default App;