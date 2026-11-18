# Hướng dẫn khởi chạy Frontend – TripWise

Tài liệu này hướng dẫn cách khởi chạy giao diện **TripWise Frontend** trên máy cục bộ (local).

Dự án được xây dựng bằng **HTML5, CSS3 và JavaScript thuần**, đi kèm sẵn local web server tích hợp trong `main.js` (Node.js) và `main.py` (Python 3), **không cần cài đặt thêm thư viện ngoài** (`npm install` hay `pip install`).

---

## 1. Yêu cầu môi trường

Cài đặt **một trong hai** công cụ sau (khuyên dùng **Node.js** để hỗ trợ đầy đủ định tuyến nội bộ):

- **Node.js** (khuyên dùng, phiên bản 14 trở lên): [https://nodejs.org/](https://nodejs.org/)
- **Python 3** (tùy chọn dự phòng): [https://www.python.org/](https://www.python.org/)
- Trình duyệt hiện đại: Google Chrome, Microsoft Edge, Firefox hoặc Safari.

Kiểm tra nhanh trên Terminal / PowerShell:

```bash
node -v
# hoặc
python --version
```

---

## 2. Cấu trúc thư mục `frontend/`

```text
frontend/
├── run.bat                 # Script khởi chạy nhanh trên Windows
├── main.js                 # Local Web Server (Node.js) & Client Runtime
├── main.py                 # Local Web Server dự phòng (Python 3)
├── HowToRunFrontend.md     # Tài liệu hướng dẫn khởi chạy này
└── src/
    ├── css/
    │   └── style.css       # Toàn bộ stylesheet của ứng dụng
    ├── images/             # Hình ảnh, logo và icon SVG
    └── screens/            # Các màn hình giao diện HTML
        ├── intro.html          # Màn hình giới thiệu (Điểm bắt đầu mặc định)
        ├── login.html          # Đăng nhập
        ├── register.html       # Đăng ký tài khoản
        ├── index.html          # Trang chủ
        ├── plan.html           # Lập kế hoạch chuyến đi
        ├── proposal.html       # Đề xuất lịch trình
        ├── itinerary.html      # Chi tiết lịch trình
        ├── budget.html         # Quản lý chi phí / ngân sách
        ├── spending.html       # Thống kê chi tiêu & chia tiền
        ├── edit-plan.html      # Tinh chỉnh kế hoạch (AI / Thủ công)
        ├── suggestion.html     # Đề xuất phương án thay thế
        ├── map.html            # Bản đồ lộ trình
        ├── profile.html        # Hồ sơ cá nhân
        └── delete-account.html # Xóa tài khoản
```

---

## 3. Các cách khởi chạy chương trình

### Cách 1: Khởi chạy nhanh trên Windows bằng `run.bat` (Khuyên dùng)

1. Mở thư mục `frontend/` trong File Explorer.
2. **Nhấp đúp (double-click)** vào file `run.bat`.
3. Chương trình sẽ tự động thực hiện theo thứ tự ưu tiên:
   - Nếu máy đã cài **Node.js** → khởi chạy `node main.js`.
   - Nếu chưa có Node.js nhưng có **Python** → khởi chạy `python main.py`.
   - Nếu chưa có cả hai → mở trực tiếp `src/screens/intro.html` bằng trình duyệt mặc định.
4. Trình duyệt sẽ tự động mở tại địa chỉ:
   ```text
   http://localhost:3000/src/screens/intro.html
   ```

> Hoặc chạy từ PowerShell / Command Prompt:
> ```powershell
> cd "D:\Quân\hcmus\kỳ 4\tu duy tinh toan\frontend"
> .\run.bat
> ```

---

### Cách 2: Khởi chạy bằng Node.js (Windows / macOS / Linux – Tối ưu nhất)

Mở Terminal / PowerShell tại thư mục `frontend` và chạy:

```bash
cd "D:\Quân\hcmus\kỳ 4\tu duy tinh toan\frontend"
node main.js
```

- Máy chủ chạy mặc định tại cổng **3000** và tự động mở trình duyệt ở màn hình khởi đầu (`intro.html`).
- Truy cập `http://localhost:3000/` cũng sẽ tự động điều hướng về `/src/screens/intro.html`.
- `main.js` đồng thời tự động ánh xạ đường dẫn script `/src/main.js` về `frontend/main.js` để mọi màn hình hoạt động đầy đủ.

#### Đổi cổng chạy (nếu cổng `3000` đang bị chiếm)

- **Windows PowerShell:**
  ```powershell
  $env:PORT=8080; node main.js
  ```
- **Windows Command Prompt (CMD):**
  ```cmd
  set PORT=8080 && node main.js
  ```
- **macOS / Linux:**
  ```bash
  PORT=8080 node main.js
  ```

---

### Cách 3: Khởi chạy bằng Python 3 (Dự phòng)

Nếu máy không cài Node.js, bạn có thể dùng Python 3:

```bash
cd "D:\Quân\hcmus\kỳ 4\tu duy tinh toan\frontend"
python main.py
```

*(Trên macOS hoặc Linux, thay `python` bằng `python3`.)*

Trình duyệt sẽ tự động mở tại:

```text
http://localhost:3000/src/screens/intro.html
```

---

## 4. Dừng chương trình

Tại cửa sổ Terminal / Command Prompt đang chạy server, nhấn tổ hợp phím:

```text
Ctrl + C
```

---

## 5. Đường dẫn truy cập nhanh các màn hình chính

Sau khi server khởi chạy ở cổng `3000`, bạn có thể điều hướng trực tiếp trong giao diện ứng dụng hoặc mở nhanh các URL sau:

| Màn hình | Đường dẫn |
| :--- | :--- |
| Giới thiệu (Mặc định) | `http://localhost:3000/src/screens/intro.html` |
| Đăng nhập | `http://localhost:3000/src/screens/login.html` |
| Trang chủ | `http://localhost:3000/src/screens/index.html` |
| Lập kế hoạch | `http://localhost:3000/src/screens/plan.html` |
| Đề xuất kế hoạch | `http://localhost:3000/src/screens/proposal.html` |
| Lịch trình | `http://localhost:3000/src/screens/itinerary.html` |
| Chi phí / Ngân sách | `http://localhost:3000/src/screens/budget.html` |
| Bản đồ lộ trình | `http://localhost:3000/src/screens/map.html` |
| Hồ sơ cá nhân | `http://localhost:3000/src/screens/profile.html` |

---

## 6. Lưu ý & Xử lý sự cố thường gặp

1. **Nên chạy qua local server thay vì mở trực tiếp file `.html` (`file://`):**
   - Khuyến nghị luôn khởi chạy bằng `run.bat` hoặc `node main.js` để cơ chế điều hướng mặc định, tải tài nguyên tương đối và các tính năng lưu trạng thái (`localStorage` / `sessionStorage`) hoạt động chính xác nhất.
2. **Lỗi cổng `3000` đang được sử dụng (`EADDRINUSE` / `Address already in use`):**
   - Kiểm tra xem có cửa sổ `run.bat` hoặc terminal khác đang chạy server trước đó không rồi tắt đi (`Ctrl + C`).
   - Hoặc đổi sang cổng khác bằng biến môi trường `PORT` (xem mục **Cách 2**).
3. **Trình duyệt không tự động mở:**
   - Mở trình duyệt bất kỳ và dán thủ công địa chỉ: `http://localhost:3000/src/screens/intro.html`.
4. **Hiển thị font chữ:**
   - Ứng dụng có sử dụng Google Fonts (`Inter`, `Playfair Display`, `Cormorant Garamond`, `Luxurious Roman`). Cần kết nối Internet để hiển thị đúng phông chữ thiết kế; khi ngoại tuyến, trình duyệt sẽ tự dùng font hệ thống thay thế mà không ảnh hưởng chức năng.
5. **Khung hiển thị Mobile:**
   - Giao diện được thiết kế tối ưu theo khung điện thoại (Mobile-first `393px`), hiển thị đẹp trực tiếp trên trình duyệt máy tính hoặc chế độ xem thiết bị di động (`F12` → `Toggle Device Toolbar`).
