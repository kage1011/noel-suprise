import React, { useState, useEffect } from 'react';
import { Clock, Shuffle, CheckCircle, AlertTriangle, Gift, ArrowRight } from 'lucide-react';
import { playCountdownTick, playSwapSound } from '../utils/audio';

export default function CountdownModal({
  giver,
  receiver,
  item,
  availableReceivers = [],
  alreadyExchangedPairs = [],
  onConfirmMatch,
  onSwapMatch,
}) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedSwapTarget, setSelectedSwapTarget] = useState(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto confirm when time runs out!
      onConfirmMatch(receiver);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        playCountdownTick(nextTime <= 5);
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onConfirmMatch, receiver]);

  const handleExecuteSwap = (target) => {
    playSwapSound();
    onSwapMatch(target);
    setIsSwapping(false);
  };

  // Progress percentage
  const progressPercent = (timeLeft / 30) * 100;
  const isUrgent = timeLeft <= 10;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl border-2 border-amber-400 p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.4)] text-center animate-pulse-glow">
        
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/90 text-amber-200 border border-amber-300 text-sm font-bold uppercase tracking-wider mb-4 shadow-lg">
          <Clock className={`w-4 h-4 ${isUrgent ? 'animate-spin text-yellow-300' : ''}`} />
          <span>Cửa Sổ Kịch Tính - 30 Giây Đổi Quà</span>
        </div>

        {/* Circular / Large Timer Display */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 border-4 border-amber-400/40 shadow-inner">
            <span
              className={`text-4xl font-black font-mono transition-colors ${
                isUrgent ? 'text-red-500 scale-110 animate-ping' : 'text-amber-400'
              }`}
            >
              {timeLeft}
            </span>
            <span className="absolute bottom-2 text-[10px] uppercase font-bold text-slate-400">giây</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-3 mt-4 overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-1000 ${
                isUrgent ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-emerald-500 to-amber-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Match Display */}
        <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-xs text-amber-300/80 mb-2 font-medium">Cặp trao quà hiện tại:</div>
          <div className="flex items-center justify-around gap-2">
            {/* Giver */}
            <div className="flex flex-col items-center">
              <img
                src={giver?.avatar}
                alt={giver?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shadow-md"
              />
              <span className="text-xs font-bold text-white mt-1 max-w-[100px] truncate">{giver?.name}</span>
              <span className="text-[10px] text-red-300">Người Tặng</span>
            </div>

            <div className="flex flex-col items-center">
              <ArrowRight className="w-6 h-6 text-amber-400 animate-pulse" />
              <div className="text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded mt-1 max-w-[130px] truncate">
                🎁 {giver?.gift}
              </div>
            </div>

            {/* Receiver */}
            <div className="flex flex-col items-center">
              <img
                src={receiver?.avatar}
                alt={receiver?.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-md ring-4 ring-emerald-500/20"
              />
              <span className="text-xs font-bold text-emerald-300 mt-1 max-w-[100px] truncate">{receiver?.name}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Người Nhận May Mắn</span>
            </div>
          </div>
        </div>

        {/* Action Buttons or Swap Selector */}
        {!isSwapping ? (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onConfirmMatch(receiver)}
              className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold shadow-lg shadow-emerald-700/40 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <CheckCircle className="w-5 h-5 text-emerald-200" />
              <span>Chốt Giữ Nguyên!</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSwapping(true)}
              className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold shadow-lg shadow-red-700/40 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Shuffle className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
              <span>Đổi Quà Khác Ngay!</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
                <Shuffle className="w-4 h-4" />
                Chọn người nhận khác để đổi quà:
              </span>
              <button
                type="button"
                onClick={() => setIsSwapping(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/10"
              >
                Hủy
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {/* Other available recipients */}
              {availableReceivers
                .filter((p) => p.id !== receiver?.id && p.id !== giver?.id)
                .map((cand) => (
                  <div
                    key={cand.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={cand.avatar} alt={cand.name} className="w-9 h-9 rounded-full object-cover" />
                      <div>
                        <div className="text-xs font-bold text-white">{cand.name}</div>
                        <div className="text-[10px] text-slate-400">Chưa được ai trao quà</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleExecuteSwap(cand)}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow"
                    >
                      Đổi sang người này!
                    </button>
                  </div>
                ))}

              {/* Already paired recipients (Steal option) */}
              {alreadyExchangedPairs.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <div className="text-[11px] font-semibold text-amber-400/90 mb-1.5">
                    Hoặc cướp lượt/đổi với người đã nhận quà:
                  </div>
                  {alreadyExchangedPairs.map((pair) => (
                    <div
                      key={pair.receiver.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-amber-950/20 hover:bg-amber-900/30 border border-amber-500/20 mb-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <img src={pair.receiver.avatar} alt={pair.receiver.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <div className="text-xs font-bold text-amber-200">{pair.receiver.name}</div>
                          <div className="text-[10px] text-slate-400">Đã nhận: {pair.giftName}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExecuteSwap(pair.receiver)}
                        className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-[11px] font-bold text-white"
                      >
                        Đổi với {pair.receiver.name}!
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Nếu hết 30 giây mà bạn chưa đổi, hệ thống sẽ tự động chốt kết quả!</span>
        </div>
      </div>
    </div>
  );
}
