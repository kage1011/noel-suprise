import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import SnowEffect from './components/SnowEffect';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ManagePage from './pages/ManagePage';
import HistoryPage from './pages/HistoryPage';
import NoelCat from './components/NoelCat';
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

      {/* Noel Cat running around the edges */}
      <NoelCat />

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
          <div className="flex items-center justify-end gap-4">
            <a
              href="https://github.com/kage1011"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition-colors hover:text-amber-300"
            >
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
                </svg>
              </i>
            </a>
            <a
              href="https://www.facebook.com/devan1n"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="transition-colors hover:text-amber-300"
            >
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M13.5 8H16V5h-2.5C10.7 5 9 6.7 9 9.5V12H6v3h3v7h3v-7h3l.5-3H12V9.5c0-1 .4-1.5 1.5-1.5Z" />
                </svg>
              </i>
            </a>
            <a
              href="https://www.instagram.com/zan.khaiii"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="transition-colors hover:text-amber-300"
            >
              <i aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" className="fill-current stroke-none" />
                </svg>
              </i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
