import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Gift, ArrowRight, Heart, Star, Clock } from 'lucide-react';
import { playGiftRevealSound, playJingleBells } from '../utils/audio';

export default function GiftRevealModal({
  giver,
  receiver,
  item,
  onProceedToCountdown,
}) {
  useEffect(() => {
    // Play celebratory sound
    playGiftRevealSound();

    // Trigger dual confetti cannons
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border-2 border-amber-400 p-6 sm:p-10 shadow-[0_0_60px_rgba(245,158,11,0.5)] text-center animate-pulse-glow overflow-hidden">
        
        {/* Festive Garland Background Decor */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-600 via-amber-400 to-green-600" />
        
        {/* Sparkle Icons */}
        <div className="absolute top-6 left-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute top-6 right-6 text-amber-400 animate-spin" style={{ animationDuration: '6s' }}>
          <Star className="w-6 h-6 fill-amber-400" />
        </div>

        {/* Secret Code Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
          <span>🎁 Đã Mở: {item?.name} ({item?.code})</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-gold-gradient font-display tracking-wide mb-2 glow-gold">
          MÓN QUÀ GIÁNG SINH ĐÃ ĐƯỢC MỞ!
        </h2>
        <p className="text-sm text-slate-300 mb-6">
          Vũ trụ Noel đã lựa chọn người nhận quà may mắn cho lượt này!
        </p>

        {/* Visual Gift Exchange Stage */}
        <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-4 my-6 p-6 rounded-3xl bg-slate-900/80 border border-white/10 shadow-2xl">
          
          {/* Giver Card */}
          <div className="md:col-span-3 flex flex-col items-center p-4 rounded-2xl bg-red-950/40 border border-red-500/30">
            <div className="relative">
              <img
                src={giver?.avatar}
                alt={giver?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-red-500 shadow-xl"
              />
              <span className="absolute -bottom-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                Người Trao
              </span>
            </div>

            <div className="text-lg font-bold text-white mt-3">{giver?.name}</div>
            <div className="text-xs text-red-300 font-semibold mt-1">Món quà trao tặng:</div>
            <div className="text-sm font-extrabold text-amber-300 mt-0.5 text-center bg-red-900/40 px-3 py-1 rounded-lg border border-red-500/20">
              🎁 {giver?.gift}
            </div>
          </div>

          {/* Connection Middle */}
          <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-600 to-amber-500 flex items-center justify-center shadow-lg animate-bounce">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="text-[10px] text-amber-300 uppercase font-black mt-1">Trao cho</span>
          </div>

          {/* Receiver Card */}
          <div className="md:col-span-3 flex flex-col items-center p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="relative">
              <img
                src={receiver?.avatar}
                alt={receiver?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-400 shadow-2xl ring-4 ring-emerald-500/30 animate-pulse"
              />
              <span className="absolute -bottom-2 bg-emerald-500 text-slate-950 text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow">
                Người Nhận 🎉
              </span>
            </div>

            <div className="text-lg font-bold text-emerald-300 mt-3">{receiver?.name}</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">Mã nhân viên: {receiver?.id}</div>
            <div className="text-xs text-slate-300 mt-1 italic">
              "Chúc bạn một mùa Giáng Sinh an lành & rực rỡ!"
            </div>
          </div>
        </div>

        {/* CTA to Countdown Window */}
        <div className="mt-8 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={onProceedToCountdown}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-red-600 to-amber-500 hover:from-amber-400 hover:to-red-500 text-white text-base font-black uppercase tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.6)] flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <Clock className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Kích Hoạt 30 Giây Kịch Tính Đổi Quà!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <span className="text-xs text-slate-400 mt-2">
            ⏱️ Người chơi sẽ có 30 giây để quyết định giữ nguyên quà hoặc đổi với người khác!
          </span>
        </div>

      </div>
    </div>
  );
}
