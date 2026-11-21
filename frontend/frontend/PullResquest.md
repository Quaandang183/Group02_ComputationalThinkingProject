# Pull Request — Chốt mốc Tuần 1 (TripWise Frontend + Capacitor Android)

## Gợi ý thông điệp `git commit`

```bash
feat(frontend): finalize Week 1 Vite MPA, Capacitor Android sync, responsive UI & smoke test docs
```

---

## Tiêu đề Pull Request

`feat(frontend): Hoàn thiện cấu trúc 14 màn hình, tối ưu Responsive 3 viewport, đồng bộ Capacitor Android & Smoke Test Tuần 1`

## Mô tả ngắn (PR Description)

### Tổng quan thay đổi
- **Chuẩn hóa cấu trúc file & CSS 3 tầng:**
  - Đổi tên `trip/index.html` ➔ `trip/home.html`, `trip/edit-plan.html` ➔ `trip/edit_plan.html` và đồng bộ toàn bộ liên kết điều hướng (`BottomBar.js`, `main.js`, `main.py`, `vite.config.js`, `HowToRunFrontend.md`).
  - Phân tách gọn CSS Tầng 3 (`home.css`, `plan.css`, `itinerary.css`, `edit.css`, `map.css`, `auth.css`, `budget.css`, `profile.css`) khớp 100% tài liệu thiết kế.
- **Nền tảng Responsive & Android Safe-Area (Prompt 5A & 5B):**
  - Đồng bộ `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">` trên đủ 14 màn hình.
  - Bổ sung `--safe-top`, `--safe-bottom`, `100dvh`, khung mobile linh hoạt (`360px`–`430px` trên mobile, căn giữa `393px` trên desktop) tại `base.css` và `src/css/components/**`.
  - Kiểm chứng tự động bằng Chrome Headless CDP + đối chiếu ảnh chụp toàn bộ 14 màn hình & `LovedModal` ở 3 kích thước **`360x800`**, **`393x852`**, **`412x915`**: 0 tràn ngang, 0 lỗi Console/404, khắc phục triệt để lỗi cắt nút nổi `map.html`, tràn badge cảnh báo `proposal.html`, hở đáy `spending.html` và nâng vùng chạm input/CTA lên `>= 44px`.
- **Release Android & Tài liệu nhóm:**
  - Chạy `npm run build` & `npx cap sync android` PASS (`dist/` và `android/app/src/main/assets/public/` đồng bộ đủ 14 màn hình + 90 file ảnh/icon, cấu hình chuẩn `capacitor.config.ts`).
  - Hoàn thiện tài liệu UI Inventory: `docs/frontend-ui-inventory.md` (kiểm kê 14 màn hình, component, token, route map và ma trận responsive).
  - Hoàn thiện `README.md` (hướng dẫn chuẩn Windows CMD/PowerShell khớp `package.json`).
  - Cung cấp kiến trúc `src/js/{core,services,features,components,native}` và offline mock fallback trong `api.service.js`.
  - Triệt tiêu toàn bộ link chết `#` và link hỏng (0 dead hash links, 0 broken links).
  - Bổ sung báo cáo `tests/smoke-test-week1.md` (12 PASS, 0 FAIL, 4 PENDING chờ test trên Android Emulator/Thiết bị thật).

### Checklist trước khi Merge
- [x] `npm run build` PASS (`exit code = 0`)
- [x] `npx cap sync android` PASS (`exit code = 0` với `capacitor.config.ts`)
- [x] 14/14 màn hình + `LovedModal` PASS Responsive ở `360x800`, `393x852`, `412x915` (42/42 checks PASS)
- [x] 0 lỗi 404, 0 lỗi Console, 0 link chết `#`
- [x] Không commit file `.env` thật, `dist/`, `node_modules/`
- [ ] Build & cài đặt `app-debug.apk` kiểm tra bàn phím ảo / nút Back trên Android Emulator hoặc thiết bị thật (4 mục `PENDING` trong `tests/smoke-test-week1.md`)
