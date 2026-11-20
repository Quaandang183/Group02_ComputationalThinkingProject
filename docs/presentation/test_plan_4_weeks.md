# KẾ HOẠCH KIỂM THỬ TỔNG THỂ (TEST PLAN) — DỰ ÁN TRIPWISE
**Phiên bản:** 1.0  
**Lộ trình áp dụng:** 4 Tuần (Từ Tuần 1 — 19/11/2026 đến Tuần 4)  
**Phụ trách:** QA/QC & Backend Team  

---

## 1. Mục tiêu & Phạm vi Kiểm thử
Đảm bảo hệ thống **TripWise** vận hành chính xác, ổn định và an toàn trên toàn bộ 4 mô-đun kiến trúc (`Memory`, `Tool Usage`, `Recommendation`, `Planning`) cùng các cổng giao tiếp API (`auth_routes`, `trip_routes`, `culture_routes`) và 10 bảng cơ sở dữ liệu ORM.

### Phạm vi kiểm thử (In-Scope)
- **Toàn vẹn dữ liệu:** Dữ liệu seed `raw_data/` và 10 bảng ORM trong `models.py`.
- **Logic lõi (Unit Test):** `feasibility_checker.py`, `budget_planner.py`, `route_optimizer.py`, `maps_service.py` (Haversine $\le 300\text{m}$), `replanning_engine.py`.
- **Luồng API (Integration Test):** Đăng ký/Đăng nhập (JWT), Lập lịch trình (Preview $\rightarrow$ Apply), Tái lập kế hoạch theo phản hồi, Chỉnh sửa thủ công, Gom nhóm (Link/QR), Check-in GPS, Thông báo thông minh (Notice), Chia tiền nhóm (Bill Splitting).
- **Bảo mật & Hiệu năng cơ bản:** Phân quyền thành viên nhóm (`trip_members`), Rate Limiting chống spam gọi AI.

### Ngoài phạm vi (Out-of-Scope)
- Không gọi trực tiếp API trả phí bên thứ ba (OpenAI/Gemini, Google Maps, OpenWeather) trong các bài test tự động; toàn bộ được thay thế bằng Mock Fixtures trong `backend/tests/conftest.py`.

---

## 2. Chiến lược & Môi trường Kiểm thử
- **Framework:** `pytest` kết hợp `fastapi.testclient.TestClient`.
- **Database kiểm thử:** `SQLite in-memory` (`sqlite:///:memory:` với `StaticPool`) — khởi tạo sạch 10 bảng trước mỗi test case và hủy ngay sau khi hoàn tất.
- **Mocking:** Sử dụng `unittest.mock` / `monkeypatch` giả lập kết quả từ `maps_service.py`, `weather_service.py`, `places_service.py` và phản hồi JSON của LLM.
- **Cấu trúc thư mục kiểm thử:**
  - `backend/tests/__init__.py`
  - `backend/tests/conftest.py`
  - `backend/tests/test_raw_data_integrity.py`
  - `backend/tests/test_feasibility.py`
  - `backend/tests/test_api_endpoints.py`

---

## 3. Lộ trình Kiểm thử 4 Tuần (4-Week Test Schedule)

| Tuần | Mục tiêu trọng tâm | Nội dung công việc chính | File / Đầu ra | Tiêu chí hoàn thành (Exit Criteria) |
| :-: | :--- | :--- | :--- | :--- |
| **Tuần 1** | Nền tảng Test, Mock & Dữ liệu gốc | Dựng `pytest` + `SQLite in-memory` + Mock AI/Maps/Weather; kiểm tra toàn vẹn `raw_data/`; lập Test Plan & Biên bản nghiệm thu dữ liệu. | `conftest.py`, `test_raw_data_integrity.py`, `seed_data_acceptance_report.md`, `test_plan_4_weeks.md` | `pytest` chạy thành công trên DB ảo, không tốn quota API; 100% dữ liệu seed sạch. |
| **Tuần 2** | Unit Test Lõi Planning & Edge Cases | Viết và chạy kiểm thử đơn vị cho kiểm tra tính khả thi (giờ mở cửa, mưa bão, ngân sách thấp, trùng giờ), tính khoảng cách GPS Haversine và chia tiền lẻ. | `test_feasibility.py` | Pass 100% nhóm TC-02 đến TC-08; phủ đầy đủ các trường hợp biên. |
| **Tuần 3** | Integration Test API & Luồng nghiệp vụ | Kiểm thử toàn bộ endpoints: Auth/JWT, Generate $\rightarrow$ Apply, Replan Feedback, Manual Edit, Invite/Join nhóm, Check-in, Notice (Read/Unread), Resolve Conflict. | `test_api_endpoints.py` | Pass 100% nhóm TC-09 đến TC-15; trạng thái DB (`DRAFT`/`ACTIVE`, `is_read`) cập nhật đúng. |
| **Tuần 4** | E2E, Bảo mật & Nghiệm thu tổng thể | Kiểm thử hồi quy toàn hệ thống (Regression), test Rate Limiting, phân quyền `OWNER`/`MEMBER`, xuất PDF/QR (`exporter.py`) và tổng hợp báo cáo chất lượng. | Báo cáo kết quả kiểm thử cuối kỳ trong `docs/presentation/` | 0 lỗi Critical/High; độ phủ kiểm thử đạt yêu cầu bảo vệ đồ án. |

---

## 4. Danh sách Test Cases Tổng Thể (Master Test Cases)

### 4.1. Nhóm Dữ liệu & Kiểm tra tính khả thi (`test_raw_data_integrity.py`, `test_feasibility.py`)

| Mã TC | Phân nhóm | Tên kịch bản kiểm thử | Dữ liệu đầu vào / Điều kiện | Kết quả mong đợi (Expected Result) | Mức độ |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Data Integrity | Kiểm tra toàn vẹn dữ liệu địa điểm gốc | Toàn bộ file JSON/CSV trong `raw_data/` | 100% bản ghi đủ trường bắt buộc, tọa độ VN hợp lệ, giờ `HH:MM`, `ticket_price >= 0`, `tags` không rỗng. | High |
| **TC-02** | Feasibility (Giờ) | Xung đột giờ đóng cửa địa điểm | Lịch trình đến địa điểm lúc `18:00`, trong khi `close_time = "17:00"` | `feasibility_checker` trả về lỗi xung đột loại `CLOSED`. | Critical |
| **TC-03** | Feasibility (Thời tiết) | Cảnh báo thời tiết xấu cho điểm ngoài trời | Địa điểm có `is_indoor = False`, Mock `weather_service` báo `HEAVY_RAIN` lúc `15:00` | Trả về cảnh báo loại `WEATHER` và kích hoạt gợi ý điểm thay thế có `is_indoor = True`. | Critical |
| **TC-04** | Feasibility (Ngân sách) | Ngân sách quá thấp so với yêu cầu | `total_budget = 200.000đ` cho chuyến đi 3N2Đ (2 người) | Hệ thống phát hiện vượt trần ngân sách, cảnh báo hoặc điều chỉnh danh sách điểm phù hợp. | High |
| **TC-05** | Feasibility (Trùng giờ) | Chỉnh sửa thủ công gây chồng lấn thời gian | Điểm A (`09:00–11:00`), Điểm B (`10:30–12:00`) trong cùng `day_number` | Phát hiện chồng lấn thời gian (`overlap`) và tự động tối ưu/sắp xếp lại khung giờ hợp lệ. | High |
| **TC-06** | GPS Check-in | Check-in hợp lệ trong bán kính $\le 300\text{m}$ | Tọa độ người dùng cách tọa độ điểm đến `120m` (Haversine) | Xác thực thành công (`200 OK`), ghi nhận bản ghi mới vào bảng `activity_checkins`. | Critical |
| **TC-07** | GPS Check-in | Từ chối Check-in ngoài bán kính $> 300\text{m}$ | Tọa độ người dùng cách tọa độ điểm đến `850m` (Haversine) | Từ chối check-in (`400 Bad Request`) kèm thông báo chưa đến gần địa điểm. | High |
| **TC-08** | Group Expense | Chia tiền nhóm khi tổng hóa đơn bị số lẻ | Hóa đơn `100.000đ`, `split_type = "EQUAL"` cho 3 thành viên | Tổng `owed_amount` của 3 bản ghi `expense_splits` bằng chính xác `100.000đ`, không sai lệch làm tròn. | Medium |

### 4.2. Nhóm Luồng API, Đồng bộ Nhóm & Bảo mật (`test_api_endpoints.py`)

| Mã TC | Phân nhóm | Tên kịch bản kiểm thử | Endpoint & Đầu vào | Kết quả mong đợi (Expected Result) | Mức độ |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-09** | Auth & Security | Đăng ký, đăng nhập và xác thực JWT | `POST /api/auth/register` $\rightarrow$ `POST /api/auth/login` | Mật khẩu lưu dạng hash (Bcrypt); trả về JWT hợp lệ; request thiếu token trả về `401 Unauthorized`. | Critical |
| **TC-10** | Trip Core Flow | Tạo lịch trình nháp (Preview) & Áp dụng (Apply) | `POST /api/trips/generate` $\rightarrow$ `POST /api/trips/{id}/apply` | Khởi tạo `trips.status = "DRAFT"` kèm `itineraries`; sau khi Apply chuyển thành `"ACTIVE"`. | Critical |
| **TC-11** | AI Re-planning | Phản hồi chưa hài lòng & tạo lại kế hoạch | `POST /api/trips/{id}/replan-feedback` (lý do: "Quá đông đúc") | Lưu ràng buộc loại trừ tạm thời (`short_term.py`), cập nhật `disliked_tags`, trả về bản `DRAFT` mới đã thay điểm bị chê. | Critical |
| **TC-12** | Manual Edit | Chỉnh sửa thủ công thứ tự/giờ điểm đến | `PUT /api/trips/{id}/manual-edit` | Cập nhật `order_index`, `start_time`, `end_time` trong `itineraries` và tính lại `travel_time_mins`. | High |
| **TC-13** | Group Travel | Sinh mã mời & thành viên tham gia nhóm | `POST /api/trips/{id}/invite` $\rightarrow$ `POST /api/trips/join/{code}` | Sinh `invite_code` duy nhất; thêm user vào `trip_members` với `role = "MEMBER"` và đồng bộ lịch trình chung. | High |
| **TC-14** | Smart Notice | Xem thông báo, đánh dấu đã đọc & đổi điểm 1 chạm | `GET /api/notifications` $\rightarrow$ `PATCH /{id}/read` $\rightarrow$ `POST /resolve-conflict` | Cờ `is_read` chuyển `False` $\rightarrow$ `True`; lịch trình cập nhật sang `suggested_place_id` mới. | High |
| **TC-15** | Culture Explore | Truy vấn địa điểm & hướng dẫn văn hóa | `GET /api/culture/explore?city=DaLat` | Trả về danh sách các điểm có `category = "culture"` kèm `cultural_note` đầy đủ. | Medium |
| **TC-16** | Rate Limiting | Chốt chặn chống spam gọi AI quá mức | Gửi liên tiếp vượt ngưỡng cho phép tới `POST /api/trips/generate` | Các request vượt hạn mức bị chặn và trả về mã lỗi `429 Too Many Requests`. | High |

---

## 5. Quản lý Lỗi & Tiêu chí Nghiệm thu
- **Phân loại mức độ lỗi (Severity):**
  - **Critical:** Lỗi sập server (`500`), sai lệch nghiêm trọng dữ liệu DB, hỏng luồng lập lịch trình/xác thực.
  - **High:** Sai logic kiểm tra khả thi, lỗi check-in GPS, không chặn được Rate Limiting.
  - **Medium:** Lỗi hiển thị thông báo, sai lệch nhỏ ở chia tiền lẻ hoặc thứ tự sắp xếp.
- **Tiêu chí đạt chuẩn phát hành (Release Criteria):** 100% Test Cases mức `Critical` và `High` đạt trạng thái `PASS` khi chạy `pytest` trên nhánh `main`.