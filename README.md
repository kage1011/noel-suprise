# 🎄 Website Đổi Quà Noel - Secret Santa Party 🎅

Ứng dụng web đổi quà Giáng Sinh dành cho team/nhóm, được trang trí đậm phong cách Noel rực rỡ với hiệu ứng tuyết rơi, âm thanh chuông leng keng, cây thông 3D tương tác và cơ chế 30 giây đổi quà kịch tính.

---

## ✨ Điểm Nổi Bật & Tính Năng

### 1. ❄️ Trang Chủ Noel Rực Rỡ & Tuyết Rơi
- Giao diện bầu không khí Giáng Sinh ấm cúng, sang trọng (gam màu đỏ Noel, xanh thông tuyết và ánh vàng lấp lánh).
- Hiệu ứng tuyết rơi 60FPS đa tầng mượt mà trên toàn trang.
- Nhạc nền Giáng sinh du dương (giai điệu chuông We Wish You a Merry Christmas) và các hiệu ứng âm thanh chuông leng keng bằng Web Audio API không phụ thuộc file ngoài.
- Nút "Bắt đầu đổi quà" và giới thiệu 4 bước chơi trực quan.

### 2. 🌲 Cây Thông Noel 3D Tương Tác (Three.js)
- Cây thông 3D nhiều tầng lá kim phủ tuyết, đỉnh gắn Ngôi sao vàng phát sáng xoay tròn.
- Dải đèn LED fairy lights quấn xoắn ốc quanh thân cây nhấp nháy chuyển màu.
- Treo đầy đủ các món đồ trang trí: **Quả châu bóng loáng phản chiếu, Hộp quà đính nơ ruy băng vàng, Kẹo gậy sọc trắng đỏ, Chuông vàng**.
- Hỗ trợ xoay 360 độ (chuột/cảm ứng) và khay chọn nhanh món quà bên dưới.
- Mỗi món đồ chứa một mã quà bí mật (ví dụ: `#NOEL-MAGIC-01`, `#NOEL-MAGIC-02`...).

### 3. 🎯 Cơ Chế Đổi Quà Công Bằng & Hồi Hộp
1. **Bước 1:** Đến lượt ai, người đó bước lên sân khấu và bấm vào **Avatar của mình** trong danh sách thành viên.
2. **Bước 2:** Người chơi ngắm nhìn cây thông Noel 3D và click vào quả châu hoặc hộp quà mình yêu thích để mở.
3. **Bước 3:** Hiệu ứng nổ pháo hoa (Confetti) + tiếng chuông leng keng rộn rã! Hệ thống tự động **random ngẫu nhiên 1 người nhận** trong danh sách những người chưa được nhận quà (đảm bảo không tự nhận quà của mình).
4. **Bước 4 (Kịch tính 30 giây):** Mở ra cửa sổ đếm ngược **30 giây**:
   - **Lựa chọn 1:** Bấm *"Chốt giữ nguyên!"* để hoàn tất trao quà.
   - **Lựa chọn 2:** Bấm *"Đổi quà với người khác"* để đổi người nhận sang một người khác hoặc đổi với người đã nhận quà trước đó.
   - Hết 30 giây hệ thống sẽ tự động chốt kết quả nếu người chơi chưa chọn đổi.

### 4. 📑 Quản Lý Thành Viên Bằng File Excel (.xlsx)
- Định dạng 4 cột chuẩn theo yêu cầu:
  - **`ID`**: Mã định danh (Ví dụ: `NV01`, `NV02`...)
  - **`Tên`**: Họ và tên người tham gia (Ví dụ: `Nguyễn Hải Đăng`)
  - **`Món quà của người đó`**: Tên món quà chuẩn bị (Ví dụ: `Tai nghe Bluetooth chống ồn`)
  - **`Hình ảnh của người đó`**: Link ảnh đại diện (hoặc upload ảnh/chọn avatar có sẵn)
- Hỗ trợ:
  - **Tải file mẫu Excel (.xlsx)** chuẩn chỉnh có sẵn dữ liệu mẫu.
  - **Nhập file Excel (.xlsx)** bằng cách kéo thả hoặc chọn file.
  - **Xuất toàn bộ kết quả trao quà ra Excel (.xlsx)** kèm lịch sử chi tiết từng lượt.
  - Thêm, sửa, xóa thành viên trực tiếp trên giao diện.
  - Reset lượt chơi để chơi lại vòng mới khi cần.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu cầu hệ thống:
- Đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18+ trở lên).

### Khởi chạy:
```bash
# 1. Di chuyển vào thư mục dự án
cd d:\Code\noel-suprise

# 2. Chạy môi trường phát triển (Dev server)
npm run dev
```

Sau khi chạy lệnh trên, mở trình duyệt truy cập:
👉 `http://localhost:3000`

### Tạo bản build xuất bản:
```bash
npm run build
```
Thư mục `dist/` có thể được triển khai lên bất kỳ hosting nào (Vercel, Netlify, GitHub Pages, Firebase Hosting,...).

---

## 📂 Cấu Trúc Dự Án

```
noel-suprise/
├── public/
│   └── Mau_Danh_Sach_Doi_Qua_Noel.xlsx   # File Excel mẫu sẵn sàng tải về
├── src/
│   ├── components/
│   │   ├── ChristmasTree3D.jsx           # Cây thông 3D Three.js đầy quả châu & hộp quà
│   │   ├── CountdownModal.jsx            # Cửa sổ đếm ngược 30s đổi quà kịch tính
│   │   ├── GiftRevealModal.jsx           # Mở quà nổ pháo hoa & chuông leng keng
│   │   ├── Navbar.jsx                    # Thanh điều hướng Noel & bật/tắt nhạc
│   │   └── SnowEffect.jsx                # Hiệu ứng tuyết rơi Canvas 60FPS
│   ├── data/
│   │   └── mockData.js                   # Dữ liệu mẫu ban đầu & avatar Noel
│   ├── pages/
│   │   ├── HomePage.jsx                  # Trang chủ phong cách Noel ấm cúng
│   │   ├── GamePage.jsx                  # Sân khấu đổi quà chính
│   │   ├── ManagePage.jsx                # Trang quản lý thành viên & Excel
│   │   └── HistoryPage.jsx               # Lịch sử các cặp đổi quà
│   ├── utils/
│   │   ├── audio.js                      # Bộ tổng hợp âm thanh Web Audio API
│   │   └── excel.js                      # Đọc / Ghi file Excel (.xlsx) với SheetJS
│   ├── App.jsx                           # Quản lý state & LocalStorage
│   ├── index.css                         # Phong cách Noel & Tailwind
│   └── main.jsx
├── Danh_Sach_Doi_Qua_Noel.xlsx           # File Excel mẫu chuẩn ngoài thư mục gốc
├── tailwind.config.js
├── vite.config.js
└── package.json
```
