# TripWise Frontend

Giao diện di động (Mobile-first `393px`) cho ứng dụng lập kế hoạch du lịch **TripWise**, xây dựng bằng **HTML5 / CSS3 (kiến trúc 3 tầng) / JavaScript thuần**, đóng gói bằng **Vite Multi-Page App (MPA)** và **Capacitor Android**.

---

## 1. Công nghệ & Cấu trúc thư mục

- **Frontend Core:** HTML5, CSS3 (3-Tier CSS Architecture), Vanilla JavaScript
- **Bundler:** Vite 8 (Multi-Page App, `base: './'`)
- **Mobile Native Wrapper:** Capacitor 8 Android (`appId: com.tripwise.app`, `webDir: dist`)

```text
frontend/
├── index.html                           # Entry point tự động chuyển hướng sang src/screens/auth/intro.html
├── vite.config.js                       # Cấu hình Vite Multi-Page (14 screens) & copy static runtime assets
├── capacitor.config.ts                  # Cấu hình Capacitor Android (TypeScript chuẩn Capacitor 8)
├── capacitor.config.json                # Cấu hình Capacitor tương thích ngược
├── package.json                         # Scripts chạy Web Dev, Build, Preview & Android Sync
├── .env.example                         # Mẫu biến môi trường (API URL, Mock Mode)
├── .gitignore                           # Quy tắc loại trừ node_modules, dist, .vite, .env & file build tạm
├── README.md                            # Tài liệu hướng dẫn chính (file này)
├── HowToRunFrontend.md                  # Tài liệu chạy nhanh local dự phòng
├── run.bat                              # Script 1-click khởi động server local dự phòng trên Windows
├── main.js                              # Client Web Components runtime & Node.js HTTP server dự phòng
├── main.py                              # Python 3 HTTP server dự phòng (khi không dùng Vite/Node)
├── docs/                                # Tài liệu kỹ thuật bàn giao
│   └── frontend-ui-inventory.md         # Kiểm kê chi tiết 14 màn hình, design tokens & ma trận responsive
├── src/
│   ├── css/                             # Kiến trúc CSS 3 tầng (Modular CSS)
│   │   ├── base.css                     # Tầng 1: Biến :root, Safe-Area, reset, font, khung mobile 393px
│   │   ├── components/                  # Tầng 2: bottom-bar.css, button.css, header.css, index.css, loved-modal.css, modal.css
│   │   └── pages/                       # Tầng 3: auth.css, budget.css, edit.css, home.css, itinerary.css, map.css, plan.css, profile.css
│   ├── js/                              # Kiến trúc JavaScript phân lớp (Layered JS)
│   │   ├── core/                        # Lõi ứng dụng: router.js, storage.js
│   │   ├── services/                    # Giao tiếp API & Mock Fallback: api.service.js, auth.service.js, trip.service.js
│   │   ├── features/                    # Logic nghiệp vụ theo miền: auth.js, budget.js, trip.js
│   │   ├── components/                  # Logic cho component dùng lại: Header.js, BottomBar.js, LovedModal.js
│   │   └── native/                      # Tích hợp Capacitor & thiết bị: capacitor-bridge.js, safe-area.js
│   ├── screens/                         # 14 màn hình HTML chia theo 4 cụm nghiệp vụ
│   │   ├── auth/                        # intro.html, login.html, register.html
│   │   ├── trip/                        # home.html, plan.html, proposal.html, itinerary.html, edit_plan.html, suggestion.html, map.html
│   │   ├── finance/                     # budget.html, spending.html
│   │   └── account/                     # profile.html, delete_account.html
│   └── images/                          # Kho tài nguyên hình ảnh tập trung duy nhất (avatars/, backgrounds/, destinations/, icons/)
├── node_modules/                        # Thư viện phụ thuộc (Vite, Capacitor, TypeScript) cài bởi npm (KHÔNG commit)
├── android/                             # Native Android project (Capacitor)
├── dist/                                # Thư mục build production của Vite (KHÔNG chỉnh tay, không commit)
└── tests/                               # Bộ script kiểm toán tự động & báo cáo Smoke Test (smoke-test-week1.md)
```

---

## 2. Yêu cầu môi trường

- **Chạy Web Dev & Build:**
  - [Node.js LTS](https://nodejs.org/) (v18+ khuyến nghị) đi kèm `npm`.
- **Build & chạy ứng dụng Android (APK):**
  - [Android Studio](https://developer.android.com/studio) (đi kèm Android SDK & Emulator).
  - **JDK 17+** và thiết lập biến môi trường `ANDROID_HOME` (trỏ về thư mục Android SDK, ví dụ `C:\Users\<USER>\AppData\Local\Android\Sdk`).

---

## 3. Cài đặt & Chạy Web Dev (Windows CMD / PowerShell)

```powershell
# 1. Di chuyển vào thư mục frontend
cd C:\Users\USER2\frontend

# 2. Cài đặt dependencies
npm install

# 3. Khởi chạy Vite Dev Server (hỗ trợ truy cập qua LAN với --host)
npm run dev
```

> **Lưu ý PowerShell:** Nếu Windows chặn chạy `npm.ps1` do Execution Policy, dùng `npm.cmd run dev` hoặc chạy trên **Command Prompt (CMD)**.

- Địa chỉ mặc định: `http://localhost:5173/` (tự động chuyển hướng sang `http://localhost:5173/src/screens/auth/intro.html`).
- Build production ra `dist/`:
  ```powershell
  npm run build
  ```
- Xem trước bản build production (`dist/`):
  ```powershell
  npm run preview
  ```
  *(Mặc định chạy tại `http://localhost:4173/`)*

### Đường dẫn truy cập nhanh các màn hình chính (Vite Dev `5173`)

| Nhóm | Màn hình | Đường dẫn |
| :--- | :--- | :--- |
| **Auth** | Giới thiệu (Mặc định) | `http://localhost:5173/src/screens/auth/intro.html` |
| **Auth** | Đăng nhập / Đăng ký | `http://localhost:5173/src/screens/auth/login.html` · `register.html` |
| **Trip** | Trang chủ | `http://localhost:5173/src/screens/trip/home.html` |
| **Trip** | Lập kế hoạch / Đề xuất | `http://localhost:5173/src/screens/trip/plan.html` · `proposal.html` |
| **Trip** | Lịch trình / Tinh chỉnh / Phương án | `http://localhost:5173/src/screens/trip/itinerary.html` · `edit_plan.html` · `suggestion.html` |
| **Trip** | Bản đồ lộ trình | `http://localhost:5173/src/screens/trip/map.html` |
| **Finance** | Ngân sách / Thống kê chi tiêu | `http://localhost:5173/src/screens/finance/budget.html` · `spending.html` |
| **Account** | Hồ sơ cá nhân / Xóa tài khoản | `http://localhost:5173/src/screens/account/profile.html` · `delete_account.html` |

---

## 4. Đồng bộ & Build Android (Capacitor)

Toàn bộ lệnh khớp trực tiếp với `scripts` trong `package.json`:

```powershell
# Build Vite (dist/) và đồng bộ toàn bộ web assets sang android/
npm run android:build
# (Tương đương: npm run build && npx cap sync android)

# Chỉ đồng bộ lại khi dist/ đã có sẵn
npm run cap:sync

# Mở dự án android/ bằng Android Studio để chạy trên Emulator hoặc thiết bị thật
npx cap open android
```

### Build file APK Debug bằng Gradle (khi máy đã cài JDK 17+ & Android SDK)

```powershell
cd android
.\gradlew.bat assembleDebug
```

File APK đầu ra sau khi build thành công:
`android\app\build\outputs\apk\debug\app-debug.apk`

> **Lưu ý khi gọi API nội bộ (HTTP) ở các tuần sau:** `AndroidManifest.xml` đã có quyền `android.permission.INTERNET`. Nếu cần gọi local dev API qua HTTP (không phải HTTPS), bổ sung `android:usesCleartextTraffic="true"` vào thẻ `<application>` (chỉ dùng cho môi trường dev) hoặc cấu hình `network_security_config.xml`.

---

## 5. Biến môi trường & Script chạy dự phòng

- **`.env.example` (chuẩn bị cho tích hợp Backend):** Khi kết nối API ở các tuần tiếp theo, sao chép `.env.example` thành `.env` (chứa biến tiền tố `VITE_`, ví dụ `VITE_API_BASE_URL`). **Tuyệt đối không commit file `.env` thật** lên Git.
- **File chạy nhanh dự phòng (Legacy Local Server):** Dự án giữ lại `run.bat`, `main.js` (Node.js server cổng `3000`), `main.py` (Python 3 server dự phòng) và `HowToRunFrontend.md` để thành viên có thể xem nhanh UI cục bộ mà không cần cài `node_modules`.

---

## 6. Xử lý nhanh 4 lỗi thường gặp

1. **Cổng `5173` / `4173` / `3000` đang bị chiếm (`EADDRINUSE`):**
   - Tắt terminal cũ đang chạy server (`Ctrl + C`), hoặc đổi cổng trực tiếp: `npx vite --port 5174`.
2. **Thêm màn hình HTML mới nhưng khi build `dist/` không thấy file (lỗi 404):**
   - Mọi màn hình mới trong `src/screens/**` bắt buộc phải được khai báo thêm trong `build.rollupOptions.input` của file `vite.config.js`, sau đó chạy lại `npm run build`.
3. **Lỗi 404 hình ảnh / CSS khi mở app trên Android:**
   - Do chưa đồng bộ `dist/` mới nhất sang `android/app/src/main/assets/public/`. Chạy lại `npm run android:build` (`npm run build && npx cap sync android`).
4. **Giao diện trên Android vẫn hiện bản cũ (lỗi cache WebView):**
   - Trong Android Studio chọn **Build → Clean Project**, gỡ app cũ trên Emulator/máy thật (hoặc xóa dữ liệu ứng dụng), chạy lại `npm run android:build` rồi nhấn **Run** lại.
