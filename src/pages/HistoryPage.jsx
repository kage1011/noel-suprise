import React from 'react';
import { History, Download, ArrowRight, Gift, Sparkles, CheckCircle, Shuffle } from 'lucide-react';
import { exportResultsToExcel } from '../utils/excel';

export default function HistoryPage({ history = [], participants = [], onStartGame }) {
  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2">
            <span>📜 LỊCH SỬ TRAO QUÀ NOEL</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Ghi nhận toàn bộ các lượt mở quà và cặp trao quà trong bữa tiệc Giáng sinh
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => exportResultsToExcel(participants, history)}
            className="px-4 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-xs font-bold text-white border border-amber-400/40 flex items-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>Xuất Báo Cáo Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel border border-white/10 text-center max-w-xl mx-auto my-8">
          <div className="text-5xl mb-4">🎁</div>
          <h3 className="text-xl font-bold text-white mb-2">Chưa Có Lượt Trao Quà Nào!</h3>
          <p className="text-xs text-slate-400 mb-6">
            Hãy bắt đầu trò chơi đổi quà trên Cây Thông Noel 3D để ghi dấu những kỷ niệm đẹp đầu tiên!
          </p>
          <button
            onClick={onStartGame}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-all"
          >
            🎄 Đến Cây Thông Đổi Quà Ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record, index) => (
            <div
              key={record.id}
              className="glass-panel p-5 rounded-3xl border border-white/10 hover:border-amber-400/40 transition-all flex flex-col md:flex-row items-center justify-between gap-4"
            >
              {/* Turn Number & Ornament Code */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black flex items-center justify-center text-sm shadow">
                  #{index + 1}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-300">
                    {record.itemCode || 'NOEL-GIFT'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(record.timestamp).toLocaleTimeString('vi-VN')}
                  </div>
                </div>
              </div>

              {/* Giver ➔ Gift ➔ Receiver */}
              <div className="flex items-center justify-center gap-3 sm:gap-6 flex-1 w-full md:w-auto">
                {/* Giver */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={record.giverAvatar}
                    alt={record.giverName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-red-500 shadow"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{record.giverName}</div>
                    <div className="text-[10px] text-red-300">Người tặng</div>
                  </div>
                </div>

                {/* Arrow & Gift */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/70 border border-amber-500/30 px-3 py-1 rounded-xl shadow-inner">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    <span>{record.giftName}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 mt-1" />
                </div>

                {/* Receiver */}
                <div className="flex items-center gap-2.5">
                  <img
                    src={record.receiverAvatar}
                    alt={record.receiverName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow"
                  />
                  <div>
                    <div className="text-xs font-bold text-emerald-300">{record.receiverName}</div>
                    <div className="text-[10px] text-emerald-400">Người nhận</div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="w-full md:w-auto flex justify-end">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã Trao Thành Công</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
