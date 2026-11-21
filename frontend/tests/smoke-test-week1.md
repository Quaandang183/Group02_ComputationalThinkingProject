# Báo cáo Smoke Test — Tuần 1 (TripWise Frontend & Capacitor Android)

- **Ngày thực hiện:** 20/11/2026
- **Phạm vi:** 14 màn hình HTML (`src/screens/**`), kiến trúc CSS 3 tầng (`src/css/**`), Vite Multi-Page Build (`dist/`), Capacitor Android Sync (`android/`), Responsive 3 viewport (`360x800`, `393x852`, `412x915`).
- **Công cụ kiểm chứng tự động:** Vite `v8.3.8`, Capacitor CLI `v8.6.2`, Chrome Headless CDP (Device Emulation `mobile: true`, `deviceScaleFactor: 2`).
- **Tình trạng môi trường máy build hiện tại:**
  - Node.js / npm: Đã cài đặt (`npm run build` & `npx cap sync android` PASS).
  - JDK: `java version "18.0.2.1"` (đã cài đặt).
  - Android SDK: **Chưa cài đặt** (`ANDROID_HOME` trống, không có `C:\Users\USER2\AppData\Local\Android\Sdk` và `android/local.properties`). Do đó các mục build APK Gradle & test thiết bị thật được đánh dấu `PENDING`.

---

## Bảng tổng hợp kết quả Smoke Test

| ID | Nhóm kiểm tra | Màn hình / Luồng | Các bước thao tác | Kết quả mong đợi | Trạng thái (PASS/FAIL/PENDING) | Ghi chú |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SMK-01** | Nhóm 1: Build & Assets | Vite Production Build (`dist/`) | Chạy `npm run build` tại gốc `frontend/`. | Build hoàn tất không lỗi, `exit code = 0`, xuất đủ `dist/index.html`, 14 màn hình `dist/src/screens/**`, CSS/JS và assets. | **PASS** | Hoàn tất trong `834ms`, 32 modules transformed, 0 lỗi. Copy đầy đủ `src/images/` (sang cả `dist/src/images/` & `dist/images/`), `src/js/` và `main.js` sang `dist/`. |
| **SMK-02** | Nhóm 1: Build & Assets | Capacitor Android Sync (`android/`) | Chạy `npx cap sync android` với `capacitor.config.ts`. | Sync thành công (`exit code = 0`); có đủ `index.html`, 14 file màn hình, 90 file ảnh/icon trong `dist/src/images/` và `dist/images/`; manifest có quyền `INTERNET`. | **PASS** | Sync hoàn tất trong `0.368s`. Hỗ trợ chuẩn `capacitor.config.ts` với TypeScript (`tsc --noEmit` 0 lỗi). |
| **SMK-03** | Nhóm 1: Build & Assets | Entry Point Redirect (`/`) | Mở đường dẫn gốc `/` (`index.html`). | Tự động chuyển hướng mượt về `./src/screens/auth/intro.html`, không trắng trang. | **PASS** | Đã xác nhận `<meta http-equiv="refresh">` và `window.location.replace('./src/screens/auth/intro.html')`. Kiểm chứng trên Preview server 4173 thành công. |
| **SMK-04** | Nhóm 1: Build & Assets | Kiểm tra 404 & Console trên 14 màn hình | Mở lần lượt đủ 14 màn hình qua Vite preview server bằng Chrome Headless CDP, lắng nghe Network & Console. | `0` lỗi 404 ảnh/CSS/JS và `0` lỗi Console/Exception trên toàn bộ 14 màn hình. | **PASS** | Kiểm chứng tự động trên 14/14 màn hình × 3 viewport (42/42 checks PASS): `0` lỗi Console, `0` lỗi 404. |
| **SMK-05** | Nhóm 2: Auth & Form Tuần 1 | Luồng `intro.html` ➔ `login.html` ➔ `register.html` | Từ `intro.html` bấm **Đăng nhập**, kiểm tra form; chuyển sang `register.html` và kiểm tra đủ 6 ô nhập + checkbox điều khoản. | Các liên kết điều hướng chính xác, toàn bộ ô input và nút mắt ẩn/hiện mật khẩu có vùng chạm `>= 44px`, không cắt chữ. | **PASS** | Đã đo DOM trực tiếp ở `360x800`, `393x852`, `412x915`. |
| **SMK-06** | Nhóm 2: Auth & Form Tuần 1 | Luồng `login.html` ➔ `home.html` | Tại `login.html`, bấm nút CTA **Đăng nhập**. | Điều hướng đúng sang `../trip/home.html` (đã đồng bộ sau khi đổi tên từ `index.html`). | **PASS** | Đã xác nhận đích chuyển hướng `../trip/home.html` và trang chủ render đầy đủ. |
| **SMK-07** | Nhóm 2: Auth & Form Tuần 1 | Nhập form tại `trip/plan.html` | Mở `plan.html`, kiểm tra các ô nhập Tên chuyến đi, Điểm đến, Thời gian, Số người, Chi phí/người, Tag sở thích và nút **Lập kế hoạch chuyến đi**. | Tất cả 6 `.plan-input-field` có chiều cao chạm `>= 44px`, tag tự xuống dòng gọn ở `360px`, không tràn ngang. | **PASS** | Đã xác nhận bằng CDP Audit (`small=[]`, `scrollW === vw`). |
| **SMK-08** | Nhóm 3: Điều hướng & Modal | Thanh điều hướng `BottomBar` | Kiểm tra 4 tab (`Trang chủ`, `Lịch trình`, `Bản đồ`, `Cá nhân`) trên các trang có `BottomBar`. | 4 tab hiển thị 1 hàng ngang không bị cắt chữ (`navClip=false`), highlight đúng tab active, bám khít khung mobile + `--safe-bottom`. | **PASS** | Đã xác nhận trên `home`, `itinerary`, `suggestion`, `map`, `budget`, `spending`, `profile` ở cả 3 viewport. |
| **SMK-09** | Nhóm 3: Điều hướng & Modal | `LovedModal` & Dropdown thông báo | Mở `LovedModal` từ nút `#btnOpenHeaderLoved` trên `home.html` ở `360x800`, `393x852`, `412x915`. | Chiều rộng gọn trong màn hình (`<= calc(100vw - 24px)`), chiều cao `<= 85dvh`, cuộn dọc được bên trong, nút đóng `X` hiển thị rõ và bấm được. | **PASS** | Kiểm chứng tự động CDP: `open: true, modal: true, visible: true, closedAfterClick: true`. |
| **SMK-10** | Nhóm 3: Điều hướng & Modal | Toàn luồng 11 màn hình Trip / Finance / Account | Kiểm tra liên kết xuyên suốt: `home` ➔ `plan` ➔ `proposal` ➔ `itinerary` ➔ `edit_plan` ➔ `suggestion` ➔ `map` ➔ `budget` ➔ `spending` ➔ `profile` ➔ `delete_account`. | Mọi nút/link điều hướng trỏ đúng tên file mới, 0 link chết `#`, 0 broken links. | **PASS** | Quét toàn bộ link DOM: `0 broken local links`, `0 dead hash links (#)`. Toàn bộ liên kết thông suốt. |
| **SMK-11** | Nhóm 4: Responsive & Android UX | Responsive Cụm 1 (7 màn hình Auth, Finance, Account) | Kiểm tra ở `360x800`, `393x852`, `412x915` trên Chrome Headless CDP + đối chiếu ảnh chụp. | `document.documentElement.scrollWidth <= window.innerWidth` = `true`, không che nút CTA, `BottomBar` bám sát đáy trên `412x915`. | **PASS** | 7/7 màn hình PASS trên cả 3 viewport (bao gồm fix bám đáy `spending.html` ở `412x915`). |
| **SMK-12** | Nhóm 4: Responsive & Android UX | Responsive Cụm 2 (7 màn hình Trip) | Kiểm tra ở `360x800`, `393x852`, `412x915` trên Chrome Headless CDP + đối chiếu ảnh chụp. | Không tràn ngang, badge cảnh báo thời tiết trên `proposal.html` xuống dòng gọn, 3 nút nổi trên `map.html` không bị cắt mép phải ở `360px`, bản đồ phủ đủ `100dvh`. | **PASS** | 7/7 màn hình PASS trên cả 3 viewport sau khi sửa `map.css`, `plan.css`, `home.css`, `edit.css`. |
| **SMK-13** | Nhóm 4: Responsive & Android UX | Build APK Debug bằng Gradle | Chạy `cd android && .\gradlew.bat assembleDebug`. | Sinh file `android\app\build\outputs\apk\debug\app-debug.apk` thành công. | **PENDING (Cần test trên Android Emulator/Thiết bị thật)** | Máy hiện tại chưa cài Android SDK (`ANDROID_HOME` trống). Cần chạy trên máy đã cài Android Studio + Android SDK. |
| **SMK-14** | Nhóm 4: Responsive & Android UX | Cài đặt & khởi chạy APK Debug | Cài `app-debug.apk` lên Android Emulator hoặc thiết bị Android thật và mở ứng dụng. | App mở lên màn hình `intro.html` mượt, hiển thị đúng icon/tên **TripWise**, không crash WebView. | **PENDING (Cần test trên Android Emulator/Thiết bị thật)** | Cần kiểm tra trực tiếp trên Emulator / thiết bị Android thật. |
| **SMK-15** | Nhóm 4: Responsive & Android UX | Bàn phím ảo Android thật trên các form | Chạm vào các ô input tại `login.html`, `register.html`, `plan.html`, `spending.html`, `delete_account.html` trên máy Android thật. | Viewport `100dvh` co giãn mượt, người dùng cuộn xuống bấm được nút Submit mà không bị bàn phím ảo che khuất. | **PENDING (Cần test trên Android Emulator/Thiết bị thật)** | CSS đã dùng `100dvh` + `viewport-fit=cover`, cần bấm nghiệm thu trên thiết bị Android thật. |
| **SMK-16** | Nhóm 4: Responsive & Android UX | Nút Back vật lý / cử chỉ vuốt Back Android | Thao tác bấm nút Back hệ thống Android khi đang ở các màn hình con và khi đang mở Modal. | Quay lại màn hình trước đó đúng kỳ vọng, không thoát app đột ngột ngoài ý muốn. | **PENDING (Cần test trên Android Emulator/Thiết bị thật)** | Cần kiểm tra trực tiếp trên Emulator / thiết bị Android thật. |

---

## Tổng kết số liệu Smoke Test Tuần 1

- **Tổng số Test Case:** `16`
- **PASS (đã kiểm chứng tự động & trực quan):** `12`
- **FAIL:** `0`
- **PENDING (cần Android Emulator / Thiết bị thật):** `4` (`SMK-13`, `SMK-14`, `SMK-15`, `SMK-16`)
