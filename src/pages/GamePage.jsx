import React, { useState } from 'react';
import { Sparkles, Users, Gift, RotateCcw, Check, ArrowRight, UserCheck, Shuffle } from 'lucide-react';
import ChristmasTree3D from '../components/ChristmasTree3D';
import GiftRevealModal from '../components/GiftRevealModal';
import CountdownModal from '../components/CountdownModal';
import { playClickSound, playJingleBells, playSwapSound } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function GamePage({
  participants = [],
  treeItems = [],
  onUpdateParticipants,
  history = [],
  onAddHistory,
  onResetGame,
}) {
  const [selectedGiver, setSelectedGiver] = useState(null);
  const [selectedTreeItem, setSelectedTreeItem] = useState(null);
  const [candidateReceiver, setCandidateReceiver] = useState(null);
  const [openedItemIds, setOpenedItemIds] = useState([]);
  
  // Modal states: 'none' | 'reveal' | 'countdown'
  const [modalState, setModalState] = useState('none');

  // Filter participants
  const ungivenParticipants = participants.filter((p) => !p.hasGiven);
  const unreceivedParticipants = participants.filter((p) => !p.hasReceived);
  const alreadyExchangedPairs = participants
    .filter((p) => p.hasGiven && p.givenTo)
    .map((p) => ({
      giver: p,
      receiver: p.givenTo,
      giftName: p.gift,
    }));

  // Handle player selecting their avatar
  const handleSelectGiver = (participant) => {
    if (participant.hasGiven) return;
    playClickSound();
    setSelectedGiver(participant);
  };

  // Handle clicking an ornament/gift on the 3D Christmas Tree
  const handleSelectTreeItem = (item) => {
    if (!selectedGiver) {
      alert('Vui lòng chọn người lên tặng quà (nhấn vào avatar của mình) trước khi mở quà trên cây thông nhé!');
      return;
    }

    if (openedItemIds.includes(item.id)) {
      alert('Món đồ trang trí này đã được mở rồi, hãy chọn một món khác nhé!');
      return;
    }

    // Determine eligible receivers (not yet received, and preferably not self)
    let eligible = unreceivedParticipants.filter((p) => p.id !== selectedGiver.id);

    // If only self remains in unreceived list, allow any participant except self who can swap
    if (eligible.length === 0) {
      eligible = participants.filter((p) => p.id !== selectedGiver.id);
    }

    if (eligible.length === 0) {
      alert('Tất cả mọi người đều đã nhận quà rồi!');
      return;
    }

    // Pick random receiver
    const randomIndex = Math.floor(Math.random() * eligible.length);
    const chosenReceiver = eligible[randomIndex];

    setSelectedTreeItem(item);
    setCandidateReceiver(chosenReceiver);
    setOpenedItemIds((prev) => [...prev, item.id]);
    setModalState('reveal');
  };

  // Proceed from Reveal to 30s Countdown
  const handleProceedToCountdown = () => {
    setModalState('countdown');
  };

  // Confirm match (either keep original receiver or swapped receiver)
  const handleFinalizeMatch = (finalReceiver, wasSwapped = false) => {
    if (!selectedGiver || !finalReceiver) return;

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Update participants
    const updated = participants.map((p) => {
      if (p.id === selectedGiver.id) {
        return {
          ...p,
          hasGiven: true,
          givenTo: { id: finalReceiver.id, name: finalReceiver.name, avatar: finalReceiver.avatar },
        };
      }
      if (p.id === finalReceiver.id) {
        return {
          ...p,
          hasReceived: true,
          receivedFrom: { id: selectedGiver.id, name: selectedGiver.name, gift: selectedGiver.gift, avatar: selectedGiver.avatar },
        };
      }
      return p;
    });

    onUpdateParticipants(updated);

    // Record history
    onAddHistory({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      giverId: selectedGiver.id,
      giverName: selectedGiver.name,
      giverAvatar: selectedGiver.avatar,
      giftName: selectedGiver.gift,
      receiverId: finalReceiver.id,
      receiverName: finalReceiver.name,
      receiverAvatar: finalReceiver.avatar,
      itemId: selectedTreeItem?.id,
      itemCode: selectedTreeItem?.code,
      itemName: selectedTreeItem?.name,
      wasSwapped,
    });

    // Reset selection for next turn
    setModalState('none');
    setSelectedGiver(null);
    setSelectedTreeItem(null);
    setCandidateReceiver(null);
  };

  // Handle swap action from 30s countdown
  const handleSwapMatch = (newTargetReceiver) => {
    handleFinalizeMatch(newTargetReceiver, true);
  };

  // Game is finished when everyone has given
  const isGameComplete = participants.length > 0 && ungivenParticipants.length === 0;

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner / Status */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2">
            <span>🎄 CÂY THÔNG NOEL ĐỔI QUÀ 3D</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Mỗi quả châu, hộp quà đều chứa 1 mã quà bí mật. Người chơi chọn avatar của mình rồi mở quà trên cây!
          </p>
        </div>

        {/* Quick Progress */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-400/30 text-xs text-amber-300 font-bold flex items-center gap-2">
            <Gift className="w-4 h-4 text-red-500" />
            <span>Đã trao: {participants.filter((p) => p.hasGiven).length}/{participants.length}</span>
          </div>

          <button
            type="button"
            onClick={onResetGame}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs flex items-center gap-1 transition-all"
            title="Reset lượt chơi"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chơi lại</span>
          </button>
        </div>
      </div>

      {/* GAME COMPLETE CELEBRATION */}
      {isGameComplete && (
        <div className="my-6 p-8 rounded-3xl glass-panel border-2 border-amber-400 text-center animate-pulse-glow">
          <span className="text-6xl">🎉🎅🎁</span>
          <h2 className="text-3xl font-black text-gold-gradient font-display mt-4">
            TẤT CẢ MỌI NGƯỜI ĐÃ ĐỔI QUÀ THÀNH CÔNG!
          </h2>
          <p className="text-sm text-slate-200 mt-2 max-w-xl mx-auto">
            Một mùa Giáng Sinh thật nhiều niềm vui, ấm áp và bất ngờ đã đến với đại gia đình chúng ta!
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={onResetGame}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-bold text-sm shadow-lg hover:scale-105 transition-all"
            >
              🔄 Chơi Lại Vòng Mới
            </button>
          </div>
        </div>
      )}

      {/* STAGE 1: CHỌN NGƯỜI LÊN TẶNG QUÀ */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl glass-panel border border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center text-xs font-black">
              1
            </span>
            <span className="text-sm font-bold text-white">
              Ai đang lên sân khấu? Nhấn vào avatar của mình:
            </span>
          </div>

          {selectedGiver && (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-400 px-3 py-1 rounded-full text-xs text-emerald-300 animate-pulse">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Đang chọn: <strong>{selectedGiver.name}</strong></span>
              <button
                type="button"
                onClick={() => setSelectedGiver(null)}
                className="ml-2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Avatar Selection Row */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1">
          {participants.map((p) => {
            const isSelected = selectedGiver?.id === p.id;
            const isGiven = p.hasGiven;

            return (
              <button
                key={p.id}
                type="button"
                disabled={isGiven}
                onClick={() => handleSelectGiver(p)}
                className={`flex-shrink-0 flex flex-col items-center p-2.5 rounded-2xl transition-all ${
                  isGiven
                    ? 'opacity-40 cursor-not-allowed bg-slate-900/40 border border-transparent'
                    : isSelected
                    ? 'bg-red-600/30 border-2 border-amber-400 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)] ring-2 ring-red-500/50'
                    : 'bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-400/50 hover:scale-105 active:scale-95'
                }`}
                style={{ width: '100px' }}
              >
                <div className="relative">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20 shadow-md"
                  />
                  {isGiven ? (
                    <span className="absolute -bottom-1 -right-1 bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                      ✓ Đã trao
                    </span>
                  ) : isSelected ? (
                    <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-bounce">
                      ★ Lên sân khấu
                    </span>
                  ) : null}
                </div>

                <div className="text-xs font-bold text-white mt-2 truncate w-full text-center">
                  {p.name}
                </div>
                <div className="text-[10px] text-amber-300/80 truncate w-full text-center mt-0.5">
                  {isGiven ? 'Đã tặng quà' : `🎁 ${p.gift}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE 2: CÂY THÔNG 3D & MỞ QUÀ */}
      <div className="relative">
        {/* Banner guide for current giver */}
        {selectedGiver ? (
          <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-red-900/80 via-red-800/80 to-amber-900/80 border border-amber-400/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <img
                src={selectedGiver.avatar}
                alt={selectedGiver.name}
                className="w-10 h-10 rounded-full border-2 border-amber-400"
              />
              <div>
                <div className="text-xs text-amber-300 font-semibold uppercase">Lượt chọn quà của:</div>
                <div className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{selectedGiver.name}</span>
                  <span className="text-xs text-amber-200 bg-black/40 px-2 py-0.5 rounded">
                    Món quà đem đến: {selectedGiver.gift}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-amber-400/30">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span>Hãy click 1 món đồ trên Cây Thông để mở quà!</span>
            </div>
          </div>
        ) : (
          <div className="mb-3 p-3 rounded-2xl bg-slate-900/70 border border-amber-400/20 text-center text-xs text-amber-200">
            👆 Bước 1: Hãy nhấn vào avatar của bạn ở danh sách phía trên để bắt đầu lượt chơi!
          </div>
        )}

        {/* 3D Christmas Tree Canvas */}
        <ChristmasTree3D
          items={treeItems}
          openedItemIds={openedItemIds}
          disabled={!selectedGiver}
          onSelectItem={handleSelectTreeItem}
        />
      </div>

      {/* POPUP MODAL: STEP 3 (GIFT REVEAL) */}
      {modalState === 'reveal' && (
        <GiftRevealModal
          giver={selectedGiver}
          receiver={candidateReceiver}
          item={selectedTreeItem}
          onProceedToCountdown={handleProceedToCountdown}
        />
      )}

      {/* POPUP MODAL: STEP 4 (30-SECOND COUNTDOWN & SWAP) */}
      {modalState === 'countdown' && (
        <CountdownModal
          giver={selectedGiver}
          receiver={candidateReceiver}
          item={selectedTreeItem}
          availableReceivers={unreceivedParticipants}
          alreadyExchangedPairs={alreadyExchangedPairs}
          onConfirmMatch={(rec) => handleFinalizeMatch(rec, false)}
          onSwapMatch={handleSwapMatch}
        />
      )}

    </div>
  );
}
