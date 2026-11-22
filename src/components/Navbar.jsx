import React, { useState } from 'react';
import { Gift, Users, Sparkles, Volume2, VolumeX, Home, History } from 'lucide-react';
import { toggleMusic, isAudioPlaying } from '../utils/audio';

export default function Navbar({ activeTab, onSelectTab, participants = [], history = [] }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleToggleAudio = () => {
    const nextState = toggleMusic();
    setIsPlaying(nextState);
  };

  const givenCount = participants.filter((p) => p.hasGiven).length;
  const totalCount = participants.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 glass-panel">
      {/* Decorative top strip */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-amber-400 to-green-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-xl">🎄</span>
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-gold-gradient font-display tracking-wider">
              NOEL EXCHANGE
            </div>
            <div className="text-[10px] text-amber-200/80 font-semibold tracking-widest uppercase">
              Secret Santa Party
            </div>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'home'
                ? 'bg-red-600 text-white shadow-md shadow-red-700/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang Chủ</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('game')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'game'
                ? 'bg-red-600 text-white shadow-md shadow-red-700/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cây Thông Đổi Quà</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('manage')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manage'
                ? 'bg-red-600 text-white shadow-md shadow-red-700/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Quản Lý & Excel</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-red-600 text-white shadow-md shadow-red-700/50'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Lịch Sử ({history.length})</span>
          </button>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Progress pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold">
              Tiến độ: <strong className="text-white">{givenCount}/{totalCount}</strong>
            </span>
          </div>

          {/* Sound / Music Toggle */}
          <button
            type="button"
            onClick={handleToggleAudio}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
            title="Bật/Tắt nhạc Giáng sinh"
          >
            {isPlaying ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlaying ? 'Nhạc Noel: Bật' : 'Nhạc Noel: Tắt'}</span>
          </button>
        </div>
      </div>

      {/* Mobile nav bottom bar */}
      <div className="md:hidden flex items-center justify-around py-2 border-t border-white/5 bg-slate-950/90 text-[11px] font-bold">
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'home' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onSelectTab('game')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'game' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Cây Thông</span>
        </button>
        <button
          onClick={() => onSelectTab('manage')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'manage' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý</span>
        </button>
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center gap-0.5 ${activeTab === 'history' ? 'text-amber-400' : 'text-slate-400'}`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử</span>
        </button>
      </div>
    </header>
  );
}
