import React from 'react';
import { Sparkles, Gift, ArrowRight, FileSpreadsheet, Users, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function HomePage({ onStartGame, onGoManage, participants = [] }) {
  const givenCount = participants.filter((p) => p.hasGiven).length;
  const receivedCount = participants.filter((p) => p.hasReceived).length;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* HERO SECTION */}
      <div className="text-center max-w-3xl mx-auto">
        
        {/* Festive Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/60 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span>Đổi quà giáng sinh • Chrismast Party</span>
          <span className="text-xl">🎅</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white glow-gold leading-tight">
          ĐỔI QUÀ NOEL <br />
          <span className="text-gold-gradient">CÂY THÔNG 3D</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          Cùng mở những quả châu lung linh, hộp quà bất ngờ trên cây thông tuyết 3D. 
          Gửi gắm tình cảm ấm áp cho đồng đội với cơ chế mở quà ngẫu nhiên đầy bất ngờ, ấm áp và trọn vẹn niềm vui!
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onStartGame}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-base tracking-wide shadow-[0_0_35px_rgba(239,68,68,0.6)] flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 group"
          >
            <span className="text-xl">🎄</span>
            <span>BẮT ĐẦU ĐỔI QUÀ NGAY</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            type="button"
            onClick={onGoManage}
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-white/20 hover:border-amber-400/60 shadow-lg flex items-center justify-center gap-2.5 transition-all hover:scale-105"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <span>Danh Sách Người Tham Gia</span>
          </button>
        </div>

        {/* Stats Pill Bar */}
        <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
          <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{participants.length}</div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">Thành viên</div>
          </div>
          <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-black text-red-400">{givenCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">Đã trao quà</div>
          </div>
          <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-white/10 text-center">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{participants.length - givenCount}</div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase mt-0.5">Lượt còn lại</div>
          </div>
        </div>
      </div>

      {/* HOW TO PLAY SECTION */}
      <div className="mt-16 sm:mt-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-gold-gradient font-display">
            CÁCH CHƠI ĐỔI QUÀ 4 BƯỚC SIÊU VUI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Đơn giản, bất ngờ và tràn ngập tiếng cười cho bữa tiệc Giáng Sinh của team!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="glass-card-festive rounded-3xl p-6 relative group hover:border-amber-400 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500/40 text-red-400 flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Bước Lên Sân Khấu</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Người đến lượt (ví dụ bạn A) sẽ chọn vào avatar của mình trong danh sách để bước vào vị trí người tặng quà.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card-festive rounded-3xl p-6 relative group hover:border-amber-400 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Cây Thông 3D Tương Tác</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Xoay 360° cây thông Noel lung linh. Mỗi quả châu, hộp quà, kẹo gậy đều chứa một mã số quà tặng bí mật.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card-festive rounded-3xl p-6 relative group hover:border-amber-400 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-400" />
              <span>Mở Quà & Random Người Nhận</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Click món đồ mình thích! Hiệu ứng nổ pháo hoa + chuông leng keng sẽ lộ diện người nhận quà may mắn trong team.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-card-festive rounded-3xl p-6 relative group hover:border-amber-400 transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 text-purple-400 flex items-center justify-center font-black text-lg mb-4">
              4
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Heart className="w-4 h-4 text-purple-400" />
              <span>Trao Quà & Gửi Lời Chúc</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Món quà lập tức thuộc về người may mắn được gọi tên. Cả hai cùng trao quà trực tiếp và gửi trao những lời chúc Noel an lành!
            </p>
          </div>
        </div>
      </div>

      {/* TEAM PREVIEW GRID */}
      <div className="mt-16 sm:mt-24 p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎁 Danh Sách Thành Viên Đổi Quà</span>
              <span className="text-xs bg-red-600/80 text-white px-2 py-0.5 rounded-full">
                {participants.length} người
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quản lý danh sách thành viên, món quà và hình ảnh dễ dàng qua file Excel (.xlsx)
            </p>
          </div>

          <button
            type="button"
            onClick={onGoManage}
            className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 rounded-xl border border-amber-400/30 transition-all"
          >
            <span>Tải / Cập nhật file Excel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-white/10 text-center hover:border-amber-400/40 transition-all"
            >
              <div className="relative">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow"
                />
                {p.hasGiven && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                    ✓
                  </span>
                )}
              </div>
              <div className="text-xs font-bold text-white mt-2 truncate w-full">{p.name}</div>
              <div className="text-[10px] text-amber-300 truncate w-full mt-0.5">🎁 {p.gift}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
