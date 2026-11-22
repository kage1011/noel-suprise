import * as XLSX from 'xlsx';
import fs from 'fs';

const sampleData = [
  {
    'ID': 'NV01',
    'Tên': 'Nguyễn Văn A',
    'Món quà của người đó': 'Secret',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV02',
    'Tên': 'Trần Thị B',
    'Món quà của người đó': 'Secret',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV03',
    'Tên': 'Trần Văn C',
    'Món quà của người đó': 'Secret',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV04',
    'Tên': 'Lê thị Lệ D',
    'Món quà của người đó': 'Secret',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV05',
    'Tên': 'Hà Thị F',
    'Món quà của người đó': 'Secret',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV06',
    'Tên': 'Lê Huyền G',
    'Món quà của người đó': 'Secret',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV07',
    'Tên': 'Tạ Thị P',
    'Món quà của người đó': 'Secret',
    'Hình ảnh của người đó': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80'
  },
  {
    'ID': 'NV08',
    'Tên': 'Hồ Đức Mai V',
    'Món quà của người đó': 'Secret',
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
