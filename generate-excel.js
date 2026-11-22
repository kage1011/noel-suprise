import * as XLSX from 'xlsx';
import fs from 'fs';

const sampleData = [
  {
    'ID': 'NV01',
    'Tên': 'Nguyễn Hải Đăng',
    'Món quà của người đó': 'Tai nghe Bluetooth chống ồn',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV02',
    'Tên': 'Trần Mai Phương',
    'Món quà của người đó': 'Bình giữ nhiệt Lock&Lock 500ml',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV03',
    'Tên': 'Lê Hoàng Nam',
    'Món quà của người đó': 'Chuột không dây Logitech Silent',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV04',
    'Tên': 'Phạm Thùy Linh',
    'Món quà của người đó': 'Set nến thơm giáng sinh hương quế táo',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV05',
    'Tên': 'Vũ Tuấn Kiệt',
    'Món quà của người đó': 'Khăn len ấm áp dệt thủ công',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV06',
    'Tên': 'Đặng Khánh Huyền',
    'Món quà của người đó': 'Sạc dự phòng Anker 10,000mAh',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV07',
    'Tên': 'Bùi Quốc Anh',
    'Món quà của người đó': 'Cốc gốm sứ Noel & Trà thảo mộc',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV08',
    'Tên': 'Đỗ Bảo Ngọc',
    'Món quà của người đó': 'Đèn ngủ phi hành gia chiếu sao ngân hà',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80'
  }
];

const worksheet = XLSX.utils.json_to_sheet(sampleData);
worksheet['!cols'] = [
  { wch: 10 },
  { wch: 22 },
  { wch: 40 },
  { wch: 45 }
];

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh_Sach_Thanh_Vien');

const filePath = './Danh_Sach_Doi_Qua_Noel.xlsx';
XLSX.writeFile(workbook, filePath);
console.log('Successfully generated:', filePath);
