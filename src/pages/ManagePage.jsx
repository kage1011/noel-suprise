import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { parseExcelFile, exportSampleTemplate, exportResultsToExcel } from '../utils/excel';
import { AVATAR_PRESETS } from '../data/mockData';
import { playClickSound } from '../utils/audio';

export default function ManagePage({
  participants = [],
  onUpdateParticipants,
  history = [],
  onResetGame,
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  // Form states
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formGift, setFormGift] = useState('');
  const [formAvatar, setFormAvatar] = useState(AVATAR_PRESETS[0].url);

  // Open add form
  const handleOpenAdd = () => {
    const nextNum = participants.length + 1;
    setFormId(`NV${String(nextNum).padStart(2, '0')}`);
    setFormName('');
    setFormGift('');
    setFormAvatar(AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)].url);
    setEditingParticipant(null);
    setIsAdding(true);
  };

  // Open edit form
  const handleOpenEdit = (p) => {
    setFormId(p.id);
    setFormName(p.name);
    setFormGift(p.gift);
    setFormAvatar(p.avatar);
    setEditingParticipant(p);
    setIsAdding(true);
  };

  // Save participant
  const handleSaveParticipant = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formGift.trim()) {
      alert('Vui lòng nhập đầy đủ Tên và Món quà!');
      return;
    }

    if (editingParticipant) {
      // Edit
      const updated = participants.map((p) =>
        p.id === editingParticipant.id
          ? { ...p, id: formId, name: formName, gift: formGift, avatar: formAvatar }
          : p
      );
      onUpdateParticipants(updated);
    } else {
      // Add
      const newParticipant = {
        id: formId || `NV${String(participants.length + 1).padStart(2, '0')}`,
        name: formName,
        gift: formGift,
        avatar: formAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formName)}`,
        hasGiven: false,
        hasReceived: false,
        receivedFrom: null,
        givenTo: null,
      };
      onUpdateParticipants([...participants, newParticipant]);
    }

    setIsAdding(false);
    playClickSound();
  };

  // Delete participant
  const handleDeleteParticipant = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này khỏi danh sách?')) {
      const updated = participants.filter((p) => p.id !== id);
      onUpdateParticipants(updated);
    }
  };

  // Handle Excel Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadStatus({ type: 'loading', message: 'Đang đọc và xử lý file Excel...' });
      const parsed = await parseExcelFile(file);

      onUpdateParticipants(parsed);
      setUploadStatus({
        type: 'success',
        message: `Đã nhập thành công ${parsed.length} thành viên từ file Excel!`,
      });
      playClickSound();
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: `Lỗi khi đọc file Excel: ${err.message || 'Định dạng không hợp lệ'}`,
      });
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle local avatar file upload (convert to Base64)
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormAvatar(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2">
            <span>📋 QUẢN LÝ NGƯỜI ĐỔI QUÀ (EXCEL)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Quản lý các cột: <strong>ID, Tên, Món quà của người đó, Hình ảnh của người đó</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={exportSampleTemplate}
            className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Tải Excel Mẫu</span>
          </button>

          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-xs font-bold text-white border border-emerald-500/40 flex items-center gap-1.5 transition-all shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Nhập File Excel (.xlsx)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          <button
            type="button"
            onClick={() => exportResultsToExcel(participants, history)}
            className="px-3.5 py-2 rounded-xl bg-amber-600/80 hover:bg-amber-500 text-xs font-bold text-white border border-amber-400/40 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Kết Quả (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-md shadow-red-700/30 flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Người Đổi Quà</span>
          </button>
        </div>
      </div>

      {/* Upload Notification */}
      {uploadStatus && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center justify-between border ${
            uploadStatus.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : uploadStatus.type === 'error'
              ? 'bg-red-950/80 border-red-500/50 text-red-200'
              : 'bg-slate-900/80 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : uploadStatus.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-400" />
            ) : (
              <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
            )}
            <span>{uploadStatus.message}</span>
          </div>
          <button
            onClick={() => setUploadStatus(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            ✕ Đóng
          </button>
        </div>
      )}

      {/* PARTICIPANTS TABLE */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">Danh Sách Thành Viên</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold">
              {participants.length} người tham gia
            </span>
          </div>

          <div className="text-xs text-slate-400">
            Cột Excel tương thích: <code className="text-amber-300">ID, Tên, Món quà của người đó, Hình ảnh của người đó</code>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/70 text-xs uppercase font-extrabold text-amber-400/90 border-b border-white/10 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">ID</th>
                <th className="py-3.5 px-4">Hình Ảnh</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4">Món Quà Đem Đến</th>
                <th className="py-3.5 px-4">Trạng Thái Trao Quà</th>
                <th className="py-3.5 px-4">Trạng Thái Nhận Quà</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {participants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-slate-400">
                    Chưa có thành viên nào. Hãy nhấn "Thêm Người Đổi Quà" hoặc "Nhập File Excel (.xlsx)" để bắt đầu!
                  </td>
                </tr>
              ) : (
                participants.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300 text-xs">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shadow"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {p.name}
                    </td>
                    <td className="py-3.5 px-4 text-amber-200">
                      🎁 {p.gift}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.hasGiven ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đã trao cho {p.givenTo?.name || 'Đồng đội'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-400">
                          Chưa đến lượt
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {p.hasReceived ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-950/80 border border-purple-500/40 text-purple-300">
                          <span>Nhận từ {p.receivedFrom?.name || 'Đồng đội'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-400">
                          Chưa nhận
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-amber-300 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteParticipant(p.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-300 hover:text-red-400 transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PARTICIPANT */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-amber-400/40 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>{editingParticipant ? 'Chỉnh Sửa Người Đổi Quà' : 'Thêm Người Đổi Quà Mới'}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Nhập thông tin thành viên tham gia tiệc Giáng sinh
            </p>

            <form onSubmit={handleSaveParticipant} className="space-y-4">
              {/* ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Mã ID (Cột 1)
                </label>
                <input
                  type="text"
                  required
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  placeholder="Ví dụ: NV01"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Họ và Tên (Cột 2)
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Gift */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Món Quà Của Người Đó (Cột 3)
                </label>
                <input
                  type="text"
                  required
                  value={formGift}
                  onChange={(e) => setFormGift(e.target.value)}
                  placeholder="Ví dụ: Cốc giữ nhiệt gốm sứ Noel"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/20 text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Avatar Selection & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
                  Hình Ảnh Của Người Đó (Cột 4)
                </label>
                
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={formAvatar}
                    alt="Preview"
                    className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-md"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={formAvatar}
                      onChange={(e) => setFormAvatar(e.target.value)}
                      placeholder="URL hình ảnh"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-white/20 text-white text-xs mb-1 focus:outline-none focus:border-amber-400"
                    />
                    <label className="text-[11px] text-amber-300 hover:underline cursor-pointer flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      <span>Hoặc tải ảnh từ máy tính (JPG/PNG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarFileUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Hoặc chọn avatar Noel vui nhộn:</div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((av, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormAvatar(av.url)}
                      className={`p-1 rounded-xl border transition-all flex-shrink-0 ${
                        formAvatar === av.url ? 'border-amber-400 bg-amber-500/20 scale-105' : 'border-white/10 hover:border-white/30'
                      }`}
                      title={av.label}
                    >
                      <img src={av.url} alt={av.label} className="w-8 h-8 rounded-full" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg transition-all"
                >
                  {editingParticipant ? 'Lưu Thay Đổi' : 'Thêm Thành Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
