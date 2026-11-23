import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SnowEffect from './components/SnowEffect';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ManagePage from './pages/ManagePage';
import HistoryPage from './pages/HistoryPage';
import { INITIAL_PARTICIPANTS, INITIAL_TREE_ITEMS } from './data/mockData';

const LOCAL_STORAGE_KEY_PARTICIPANTS = 'noel_exchange_participants_v1';
const LOCAL_STORAGE_KEY_HISTORY = 'noel_exchange_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [storageErrors, setStorageErrors] = useState({ participants: false, history: false });

  // Load participants from localStorage or default
  const [participants, setParticipants] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_PARTICIPANTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading participants:', e);
    }
    return INITIAL_PARTICIPANTS;
  });

  // Load history
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading history:', e);
    }
    return [];
  });

  // Tree items
  const [treeItems] = useState(INITIAL_TREE_ITEMS);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PARTICIPANTS, JSON.stringify(participants));
      setStorageErrors((errors) => ({ ...errors, participants: false }));
    } catch (e) {
      console.error('Error saving participants:', e);
      setStorageErrors((errors) => ({ ...errors, participants: true }));
    }
  }, [participants]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(history));
      setStorageErrors((errors) => ({ ...errors, history: false }));
    } catch (e) {
      console.error('Error saving history:', e);
      setStorageErrors((errors) => ({ ...errors, history: true }));
    }
  }, [history]);

  // Handlers
  const handleUpdateParticipants = (newParticipants) => {
    setParticipants(newParticipants);
  };

  const handleAddHistory = (record) => {
    setHistory((prev) => [record, ...prev]);
  };

  const handleResetGame = () => {
    if (window.confirm('Bạn có muốn reset lại toàn bộ lượt chơi để bắt đầu vòng mới? (Dữ liệu danh sách người vẫn được giữ nguyên)')) {
      const reset = participants.map((p) => ({
        ...p,
        hasGiven: false,
        hasReceived: false,
        receivedFrom: null,
        givenTo: null,
      }));
      setParticipants(reset);
      setHistory([]);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      {(storageErrors.participants || storageErrors.history) && (
        <div
          role="alert"
          className="relative z-50 bg-red-950 px-4 py-3 text-center text-sm text-red-100"
        >
          Không thể lưu {storageErrors.participants ? 'danh sách thành viên' : 'lịch sử'} vào bộ nhớ trình duyệt (có thể đã đầy hoặc bị chặn).
          Dữ liệu mới có thể mất khi tải lại trang. Hãy xuất kết quả Excel để sao lưu và giảm dung lượng ảnh đại diện.
        </div>
      )}

      {/* Falling Snow Effect */}
      <SnowEffect count={85} />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        participants={participants}
        history={history}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomePage
            onStartGame={() => setActiveTab('game')}
            onGoManage={() => setActiveTab('manage')}
            participants={participants}
          />
        )}

        {activeTab === 'game' && (
          <GamePage
            participants={participants}
            treeItems={treeItems}
            onUpdateParticipants={handleUpdateParticipants}
            history={history}
            onAddHistory={handleAddHistory}
            onResetGame={handleResetGame}
          />
        )}

        {activeTab === 'manage' && (
          <ManagePage
            participants={participants}
            onUpdateParticipants={handleUpdateParticipants}
            history={history}
            onResetGame={handleResetGame}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            history={history}
            participants={participants}
            onStartGame={() => setActiveTab('game')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 glass-panel py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎅</span>
            <span>Merry Christmas & Happy New Year • <strong>Secret Santa Exchange</strong></span>
          </div>
          <div>
            {/* Hỗ trợ quản lý file Excel (.xlsx) • Cây Thông Noel 3D • Đổi quà kịch tính 30s */}
          </div>
        </div>
      </footer>
    </div>
  );
}
