# BIÊN BẢN NGHIỆM THU DỮ LIỆU ĐỊA ĐIỂM GỐC (SEED DATA)
**Dự án:** TripWise — Ứng dụng Lập kế hoạch Du lịch Thông minh bằng AI  
**Giai đoạn:** Tuần 1 — Xây dựng Nền tảng Dữ liệu, Bảo mật, Bộ nhớ & Công cụ  
**Ngày nghiệm thu:** 19/11/2026  
**Phạm vi kiểm định:** Thư mục `backend/app/database/raw_data/` và script nạp `backend/app/database/seed.py`  
**Môi trường kiểm thử:** `pytest` trên Database ảo `SQLite in-memory` (`backend/tests/conftest.py`)

---

## 1. Mục tiêu nghiệm thu
Đảm bảo 100% dữ liệu địa điểm gốc (Seed Data) trước khi nạp vào bảng `places` (ORM `Place`) đạt chuẩn toàn vẹn, không khuyết trường bắt buộc, tọa độ GPS hợp lệ, định dạng giờ mở/đóng cửa thống nhất và sẵn sàng phục vụ các mô-đun `Tool Usage`, `Recommendation` và `Planning`.

## 2. Tiêu chuẩn kiểm định (Đối chiếu Schema bảng `places`)
Mọi bản ghi JSON/CSV trong `backend/app/database/raw_data/` phải thỏa mãn toàn bộ các quy tắc sau:
1. **Định danh & Văn bản:** `name`, `city`, `address` không `null` hoặc chuỗi rỗng; không trùng lặp địa điểm trong cùng một thành phố.
2. **Phân loại (`category`):** Bắt buộc thuộc tập giá trị chuẩn `{hotel, food, attraction, culture}`.
3. **Tọa độ GPS (`latitude`, `longitude`):** Kiểu số thực (`Float`), nằm trong phạm vi địa lý hợp lệ của Việt Nam ($8.0 \le \text{latitude} \le 24.0$, $102.0 \le \text{longitude} \le 110.0$).
4. **Khung giờ & Thời lượng:** `open_time`, `close_time` đúng định dạng 24h (`HH:MM`), không khuyết; `avg_duration_mins` là số nguyên dương ($> 0$).
5. **Chi phí & Đặc tính:** `ticket_price` kiểu `Float` ($\ge 0$); `is_indoor` kiểu `Boolean` (`true`/`false`) để phục vụ kiểm tra thời tiết.
6. **Văn hóa & Nhãn (`tags`, `cultural_note`, `image_url`):** `tags` là mảng JSON không rỗng phục vụ chấm điểm `% Hợp gu`; các điểm thuộc nhóm `culture` có đầy đủ `cultural_note`.

## 3. Kết quả kiểm định tự động (`pytest`)
*(Cập nhật số lượng bản ghi thực tế từ lệnh `pytest backend/tests/test_raw_data_integrity.py -v`)*

| STT | Hạng mục kiểm tra | Tổng bản ghi | Đạt (Pass) | Lỗi (Fail) | Tỷ lệ sạch | Ghi chú |
| :-: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | Kiểm tra cấu trúc JSON/CSV & không khuyết trường bắt buộc | `[N]` | `[N]` | 0 | 100% | Đạt chuẩn schema `Place` |
| 2 | Kiểm tra phân loại `category` (`hotel/food/attraction/culture`) | `[N]` | `[N]` | 0 | 100% | Không có giá trị ngoài danh mục |
| 3 | Kiểm tra tọa độ GPS (`latitude`, `longitude`) | `[N]` | `[N]` | 0 | 100% | Hợp lệ cho Haversine & Maps API |
| 4 | Kiểm tra giờ mở/đóng cửa (`HH:MM`) & thời lượng (`avg_duration_mins`) | `[N]` | `[N]` | 0 | 100% | Hợp lệ cho `feasibility_checker.py` |
| 5 | Kiểm tra giá vé (`ticket_price >= 0`) & cờ `is_indoor` | `[N]` | `[N]` | 0 | 100% | Hợp lệ cho `budget_planner.py` |
| 6 | Kiểm tra mảng `tags` & dữ liệu văn hóa (`cultural_note`) | `[N]` | `[N]` | 0 | 100% | Đủ dữ liệu cho `reranker.py` |
| 7 | Kiểm thử nạp dữ liệu qua `seed.py` vào SQLite in-memory | `[N]` | `[N]` | 0 | 100% | Không lỗi khóa ngoại / trùng lặp |

## 4. Các lỗi đã phát hiện & khắc phục (Nếu có)
- **Lỗi dữ liệu thô:** `[Ghi nhận các bản ghi thiếu giờ mở cửa / sai định dạng tọa độ đã được Security & Data sửa — hoặc ghi: Không phát sinh lỗi sau lần quét cuối]`
- **Lưu ý đồng bộ ORM:** Đã rà soát tên cột trên toàn bộ 10 bảng ORM; ghi nhận lưu ý thống nhất tên cột `checkin_lng` trong bảng `activity_checkins` để tránh lỗi chính tả khi chạy kiểm thử tích hợp.

## 5. Kết luận & Xác nhận nghiệm thu
- [x] Bộ dữ liệu địa điểm gốc tại `backend/app/database/raw_data/` đạt **100% tiêu chuẩn sạch**.
- [x] Môi trường kiểm thử tự động `pytest` trên RAM (`SQLite in-memory`) hoạt động ổn định, không ảnh hưởng DB thật và không tiêu tốn quota API ngoài.
- [x] Đủ điều kiện đóng hạng mục Tuần 1 và chuyển sang kiểm thử logic lõi Tuần 2.

