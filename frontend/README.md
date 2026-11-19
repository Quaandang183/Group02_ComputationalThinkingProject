# TripWise — Quy chuẩn cấu trúc Frontend (v1.0)

**Phạm vi:** Dự án `Group02_ComputationalThinkingProject`, phần `frontend/`.
**Stack thống nhất:** HTML + CSS + JavaScript (ES Modules) + Vite + Capacitor (Android).
**Mục tiêu:** Tái sử dụng giao diện từ nhánh `ui`/thư mục `UI/`, dễ tích hợp API FastAPI, hạn chế thay đổi thư mục giữa các thành viên và đóng gói APK ổn định.


## 1. Cây thư mục chuẩn

```text
Group02_ComputationalThinkingProject/
├── frontend/
│   ├── index.html                    # Entry point duy nhất khi mở ứng dụng
│   ├── pages/                        # Multi-page HTML (chỉ UI/markup)
│   │   ├── auth/
│   │   │   ├── login.html
│   │   │   ├── register.html
│   │   │   └── delete-account.html
│   │   ├── onboarding/
│   │   │   └── intro.html
│   │   ├── trips/
│   │   │   ├── plan.html
│   │   │   ├── proposal.html
│   │   │   ├── suggestion.html
│   │   │   ├── edit-plan.html
│   │   │   └── itinerary.html
│   │   ├── explore/
│   │   │   └── map.html
│   │   ├── finance/
│   │   │   ├── budget.html
│   │   │   └── spending.html
│   │   └── account/
│   │       └── profile.html
│   ├── src/
│   │   ├── styles/
│   │   │   ├── tokens.css           # Màu, font, spacing của Figma
│   │   │   ├── global.css           # Reset, layout toàn ứng dụng
│   │   │   ├── components/          # button.css, navbar.css, card.css...
│   │   │   └── pages/               # CSS chỉ dùng cho một nhóm màn hình
│   │   └── js/
│   │       ├── core/                # api-client.js, config.js, auth-storage.js...
│   │       ├── services/            # auth.service.js, trips.service.js...
│   │       ├── features/            # Logic theo nghiệp vụ: auth/, trips/, map/...
│   │       ├── components/          # Logic cho component dùng lại
│   │       └── native/              # geolocation.js, share.js, platform.js...
│   ├── public/
│   │   └── assets/
│   │       └── images/              # Ảnh giữ nguyên tên, không cần import JS
│   ├── android/                     # Native Android project, commit vào Git
│   ├── dist/                        # Vite build tự động — KHÔNG chỉnh tay
│   ├── tests/                       # Kiểm thử UI và các luồng chức năng
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── capacitor.config.ts
│   ├── .env.example
│   ├── .gitignore
│   └── README.md
├── backend/                         # FastAPI + TravelAgent, không sửa cấu trúc
├── docs/
└── README.md
```

**Thư mục mở rộng theo chức năng nhưng không đổi gốc:**
- `pages/notice/notice.html` khi xây màn hình Notice.
- `pages/explore/culture.html` khi xây Culture.
- `pages/trips/history.html` khi xây lịch sử chuyến đi.
- `src/js/services/notifications.service.js`, `src/js/features/notice/notice.js` khi tích hợp Notice.

## 2. Di chuyển từ UI/ hiện tại

| Nguồn trong `UI/` | Đích trong `frontend/` |
|---|---|
| `index.html` | `index.html` |
| `intro.html` | `pages/onboarding/intro.html` |
| `login.html`, `register.html`, `delete-account.html` | `pages/auth/` |
| `plan.html`, `proposal.html`, `suggestion.html`, `edit-plan.html`, `itinerary.html` | `pages/trips/` |
| `map.html` | `pages/explore/map.html` |
| `budget.html`, `spending.html` | `pages/finance/` |
| `profile.html` | `pages/account/profile.html` |
| `css/` | Chia `src/styles/` thành `global.css`, `tokens.css`, `components/`, `pages/` |
| `main.js` | Tách dần thành `src/js/core/`, `src/js/features/`, `src/js/services/` |
| `assets/images/` | `public/assets/images/` |
| `README.md` | Gộp hướng dẫn còn đúng vào `frontend/README.md` |
| `main.py`, `run.bat` | Chỉ giữ trong nhánh cũ/backup khi cần, KHÔNG đặt vào source runtime của ứng dụng Capacitor |

**Chú ý:** Chỉ di chuyển sau khi lưu bản gốc và tạo branch mới. Khi đổi vị trí HTML/CSS/JS phải sửa tất cả `href`, `src`, `fetch`, đường dẫn ảnh và điều hướng. Không được coi việc copy thư mục là hoàn tất migration. **Đặc biệt**, nếu HTML đang dùng `onclick="functionName()"` và `main.js` khai báo hàm global, không chuyển thẳng script sang `type="module"` khi chưa đổi event handlers sang `addEventListener`, vì các hàm module không tự động trở thành biến global. Chuyển từng màn hình, kiểm thử rồi mới tách `main.js` theo nghiệp vụ.

## 3. Phân tách trách nhiệm

| Vùng code | Quy định |
|---|---|
| `pages/` | HTML hiển thị và khai báo tham chiếu CSS/JS; không viết nghiệp vụ hoặc gọi API trực tiếp trong HTML |
| `src/styles/` | Token, bố cục và style; không copy lại màu Figma vào nhiều file |
| `src/js/core/` | API client HTTP chung, cấu hình không bí mật, lưu phiên, xử lý lỗi dùng chung |
| `src/js/services/` | Mỗi nhóm API của FastAPI nằm trong `*.service.js`; không dùng `fetch` rải rác trong màn hình |
| `src/js/features/` | Xử lý event/hiển thị dữ liệu của từng màn hình; gọi services, không chứa URL API hardcode |
| `src/js/native/` | Tập trung gọi plugin Capacitor (GPS, chia sẻ...), xử lý quyền truy cập và fallback khi mở trên browser |
| `public/assets/images/` | Ảnh/logo/icon dùng chung, đặt tên `kebab-case` rõ nghĩa |
| `android/` | Cấu hình native Android, permissions, Gradle; chỉ thay đổi khi task cần native |
| `dist/` | Build output — không sửa, không commit |

Quy tắc đặt tên: file và folder `kebab-case` (trừ file do tool sinh ra); JS `camelCase` cho hàm/biến; CSS dùng class có phạm vi rõ (`.trip-card`, `.notice-item`); URL API tập trung trong services; luôn dùng ES Modules (`type="module"`).

## 4. Quy ước đường dẫn HTML và tài sản

Trong `frontend/pages/auth/login.html`:

```html
<link rel="stylesheet" href="/src/styles/global.css" />
<script type="module" src="/src/js/features/auth/login.js"></script>
<a href="/pages/trips/plan.html">Tạo chuyến đi</a>
<img src="/assets/images/logo-tripwise.png" alt="TripWise" />
```

- Thư mục `public/assets/images/` ánh xạ thành URL `/assets/images/...` trong Vite.
- Các trang thuộc `pages/` phải được Vite nhận diện là **nhiều HTML entry**, không chỉ `index.html`.
- Không nối chuỗi đường dẫn tương đối từ những thư mục HTML có độ sâu khác nhau.

### Ví dụ cấu hình `vite.config.js`

```js
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';

function collectHtml(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((item) => {
    const file = join(dir, item.name);
    if (item.isDirectory()) return collectHtml(file);
    return item.isFile() && file.endsWith('.html') ? [resolve(file)] : [];
  });
}

export default defineConfig({
  input: [resolve('index.html'), ...collectHtml('pages')],
  build: { outDir: 'dist' },
});
```

### Cấu hình Capacitor

```ts
// capacitor.config.ts
import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.example.tripwise', // Đổi sang ID duy nhất đã chốt
  appName: 'TripWise',
  webDir: 'dist',
};
export default config;
```

**Quan trọng:** Nếu dùng Vite thì `webDir` phải là `dist`, KHÔNG phải `www`; `dist/` sinh tự động từ `npm run build`.

## 5. Cài đặt và chạy (tại thư mục `frontend/`)

Yêu cầu Node.js phiên bản tương thích với Vite đã chọn, Android Studio và Android SDK để chạy APK.

```bash
npm init -y
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli vite
```

Tạo `scripts` trong `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "android:sync": "npm run build && cap sync android",
  "android:open": "cap open android"
}
```

Sau khi đã cấu hình `index.html`, `vite.config.js` và `capacitor.config.ts`:

```bash
npm run dev
npm run build
npx cap add android      # Chỉ thực hiện lần đầu
npx cap sync android
npx cap open android
```

Các lần cập nhật Web sau đó: `npm run build && npx cap sync android` trước khi kiểm thử bản Android mới. Không chỉnh file HTML đã copy trong `android/app/src/main/assets/public/`.

## 6. Git & thay đổi cấu trúc

1. Chọn một người chịu trách nhiệm `frontend/` và review PR chạm vào cấu trúc.
2. Tạo branch từ `main` đã cập nhật; di chuyển `UI/` từ nhánh `ui` sang `frontend/` trong một PR riêng, không trộn feature mới.
3. PR migration phải có kiểm tra: `npm run build` PASS, mọi trang còn tồn tại trong `dist/`, chạy được trong Android, link/ảnh/CSS không lỗi.
4. Không tự ý thêm folder cấp cao mới dưới `frontend/`, không đổi tên các folder cố định hoặc chuyển stack công nghệ. Ngoại lệ phải qua PR và cập nhật tài liệu này.
5. `frontend/` sở hữu giao diện và gọi API; `backend/` sở hữu API và AI TravelAgent; phải chốt API contract ở `docs/`.
6. Khi merge xong, `UI/` không còn là nguồn code hoạt động; có thể giữ nhánh cũ làm backup, tránh duy trì hai phiên bản song song.
7. Mỗi PR cần ghi rõ ảnh chụp màn hình trước/sau trên Android, task liên quan, API/mock, cách kiểm thử.

`.gitignore` của frontend ít nhất cần:

```gitignore
node_modules/
dist/
.env
.env.*.local
android/.gradle/
android/app/build/
android/build/
android/local.properties
*.keystore
*.jks
.DS_Store
```

Commit `package-lock.json`, `vite.config.js`, `capacitor.config.ts`, source và project `android/` (trừ file sinh ra hoặc bí mật). Không đưa khóa LLM, khóa API server hoặc mật khẩu DB vào Frontend: giá trị `VITE_*` trong bundle đều có thể bị xem bởi người dùng ứng dụng.

## 7. Tiêu chí đóng băng kiến trúc (Definition of Done)

- [ ] Có một thư mục `frontend/` duy nhất được dùng để build Mobile App.
- [ ] Tất cả các HTML đang dùng đã được chuyển khỏi `UI/` vào `frontend/index.html` hoặc `frontend/pages/...`.
- [ ] Asset, CSS, JS đều dùng đường dẫn chuẩn; không còn link hỏng.
- [ ] `npm run dev` chạy được trên máy phát triển.
- [ ] `npm run build` tạo đủ các HTML trong `dist/`.
- [ ] `npx cap sync android` hoàn tất.
- [ ] APK cài được lên một máy Android; các trang chính hiển thị đúng Figma.
- [ ] API URL, dịch vụ API và native plugins được đặt ở đúng thư mục.
- [ ] `README.md` có lệnh chạy, phiên bản Node, cấu hình `.env.example`, cách build Android.
- [ ] PR migration được review và merge; cả nhóm thống nhất không chỉnh cấu trúc tùy ý.

## 8. Nguồn kỹ thuật

- https://capacitorjs.com/docs/getting-started
- https://capacitorjs.com/docs/android
- https://vite.dev/guide/build
- https://vite.dev/guide/assets
