import * as XLSX from 'xlsx';

/**
 * Read and parse Excel file (.xlsx)
 * Expected columns: ID, Tên, Món quà của người đó, Hình ảnh của người đó
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Read first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to array of objects
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('File Excel rỗng, không tìm thấy dữ liệu!');
        }

        const parsedParticipants = rawJson.map((row, index) => {
          // Normalize column keys
          const keys = Object.keys(row);

          const findKey = (candidates) => {
            return keys.find(k => candidates.some(c => k.toLowerCase().trim().includes(c.toLowerCase())));
          };

          const idKey = findKey(['id', 'mã', 'stt', 'code']);
          const nameKey = findKey(['tên', 'họ và tên', 'name', 'người']);
          const giftKey = findKey(['món quà', 'quà', 'gift', 'phần quà']);
          const avatarKey = findKey(['hình ảnh', 'ảnh', 'avatar', 'image', 'photo', 'link ảnh']);

          const id = (idKey && row[idKey] ? String(row[idKey]).trim() : `NV${String(index + 1).padStart(2, '0')}`);
          const name = (nameKey && row[nameKey] ? String(row[nameKey]).trim() : `Người chơi ${index + 1}`);
          const gift = (giftKey && row[giftKey] ? String(row[giftKey]).trim() : 'Món quà bí mật');
          let avatar = (avatarKey && row[avatarKey] ? String(row[avatarKey]).trim() : '');

          if (!avatar) {
            // Default cute avatar
            avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || id)}`;
          }

          return {
            id,
            name,
            gift,
            avatar,
            hasGiven: false,
            hasReceived: false,
            receivedFrom: null,
            givenTo: null,
          };
        });

        resolve(parsedParticipants);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export sample template for users to fill in
 */
export function exportSampleTemplate() {
  const sampleData = [
    {
      'ID': 'NV01',
      'Tên': 'Nguyễn Văn A',
      'Món quà của người đó': 'Tai nghe chụp tai Bluetooth',
      'Hình ảnh của người đó': 'https://api.dicebear.com/7.x/bottts/svg?seed=A'
    },
    {
      'ID': 'NV02',
      'Tên': 'Trần Thị B',
      'Món quà của người đó': 'Bình giữ nhiệt phong cách Noel',
      'Hình ảnh của người đó': 'https://api.dicebear.com/7.x/bottts/svg?seed=B'
    },
    {
      'ID': 'NV03',
      'Tên': 'Lê Văn C',
      'Món quà của người đó': 'Nến thơm hương thông tuyết',
      'Hình ảnh của người đó': 'https://api.dicebear.com/7.x/bottts/svg?seed=C'
    },
    {
      'ID': 'NV04',
      'Tên': 'Phạm Thu D',
      'Món quà của người đó': 'Sạc dự phòng 10000mAh',
      'Hình ảnh của người đó': 'https://api.dicebear.com/7.x/bottts/svg?seed=D'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  // Auto column widths
  worksheet['!cols'] = [
    { wch: 10 },
    { wch: 22 },
    { wch: 35 },
    { wch: 45 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Doi_Qua');
  XLSX.writeFile(workbook, 'Mau_Danh_Sach_Doi_Qua_Noel.xlsx');
}

/**
 * Export complete list of participants & exchange results
 */
export function exportResultsToExcel(participants, history = []) {
  const rows = participants.map((p, idx) => {
    return {
      'STT': idx + 1,
      'ID': p.id,
      'Họ và Tên': p.name,
      'Món quà chuẩn bị': p.gift,
      'Trạng thái tặng': p.hasGiven ? 'Đã trao quà' : 'Chưa trao',
      'Người nhận quà': p.givenTo ? p.givenTo.name : 'Chưa có',
      'Trạng thái nhận': p.hasReceived ? 'Đã nhận quà' : 'Chưa nhận',
      'Người trao quà cho mình': p.receivedFrom ? p.receivedFrom.name : 'Chưa có',
      'Món quà nhận được': p.receivedFrom ? p.receivedFrom.gift : 'Chưa có',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 22 },
    { wch: 30 },
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 22 },
    { wch: 30 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ket_Qua_Trao_Qua');

  if (history && history.length > 0) {
    const historyRows = history.map((h, i) => ({
      'Lượt': i + 1,
      'Thời gian': h.timestamp ? new Date(h.timestamp).toLocaleTimeString('vi-VN') : '',
      'Người tặng': h.giverName,
      'Món quà trao đi': h.giftName,
      'Mã quả châu/hộp quà': h.itemCode || '',
      'Người nhận': h.receiverName,
      'Trạng thái': 'Đã trao quà trực tiếp',
    }));
    const historySheet = XLSX.utils.json_to_sheet(historyRows);
    XLSX.utils.book_append_sheet(workbook, historySheet, 'Lich_Su_Tung_Luot');
  }

  XLSX.writeFile(workbook, `Ket_Qua_Doi_Qua_Noel_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
