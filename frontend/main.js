/**
 * // Đường dẫn: frontend/main.js
 * TripWise - Unified Application Entry Point (Isomorphic Node.js Server & Browser Client Runtime)
 * - Server mode (Node.js): Phục vụ static web server và tự động mở màn hình khởi đầu: /src/screens/auth/intro.html
 * - Browser mode (Client): Đăng ký toàn bộ Custom Element Components (<app-header>, <app-bottom-bar>, <loved-modal>),
 *   quản lý logic tương tác dùng chung (thông báo, yêu thích, điều hướng).
 */

if (typeof window === 'undefined') {
  // =========================================================================
  // 1. NODE.JS LOCAL DEVELOPMENT HTTP SERVER RUNTIME
  // =========================================================================
  const http = require('http');
  const fs = require('fs');
  const path = require('path');
  const { exec } = require('child_process');

  const PORT = process.env.PORT || 3000;
  // ROOT_DIR trỏ về thư mục gốc frontend/
  const ROOT_DIR = __dirname;

  const MIME_TYPES = {
    '.html': 'text/html; charset=UTF-8',
    '.css': 'text/css; charset=UTF-8',
    '.js': 'application/javascript; charset=UTF-8',
    '.json': 'application/json; charset=UTF-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf'
  };

  const server = http.createServer((req, res) => {
    let requestPath = decodeURI(req.url.split('?')[0].split('#')[0]);

    // Điểm bắt đầu mặc định: chuyển thẳng tới auth/intro.html theo cấu trúc mới chuẩn
    if (requestPath === '/' || requestPath === '' || requestPath === '/index.html' || requestPath === '/intro.html') {
      requestPath = '/src/screens/auth/intro.html';
    }

    let filePath = path.join(ROOT_DIR, requestPath);

    // Nếu request gọi /src/main.js hoặc /main.js, phục vụ chính file main.js tại root
    if (requestPath === '/src/main.js' || requestPath === '/main.js') {
      filePath = path.join(ROOT_DIR, 'main.js');
    }

    // Tương thích ngược: Nếu request gọi /src/css/components.css -> phục vụ /src/css/components/index.css
    if (requestPath === '/src/css/components.css') {
      filePath = path.join(ROOT_DIR, 'src', 'css', 'components', 'index.css');
    }

    // Fallback thông minh: tìm trong các thư mục con của src/screens/ (auth, trip, finance, account)
    if (!fs.existsSync(filePath)) {
      const baseName = path.basename(requestPath);
      let cleanName = baseName;
      if (baseName === 'delete-account.html') cleanName = 'delete_account.html';
      else if (baseName === 'edit-plan.html') cleanName = 'edit_plan.html';
      const subdirs = ['auth', 'trip', 'finance', 'account'];

      for (const sub of subdirs) {
        const candidate = path.join(ROOT_DIR, 'src', 'screens', sub, cleanName);
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          filePath = candidate;
          break;
        }
      }
    }

    // Fallback tự động tìm trong src/
    if (!fs.existsSync(filePath)) {
      const srcPath = path.join(ROOT_DIR, 'src', requestPath);
      if (fs.existsSync(srcPath) && fs.statSync(srcPath).isFile()) {
        filePath = srcPath;
      }
    }

    // Ngăn chặn directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(`
          <!DOCTYPE html>
          <html lang="vi">
          <head>
            <meta charset="UTF-8">
            <title>404 Not Found - TripWise</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 60px 20px; background: #faf8f2; color: #1e3f20; }
              h2 { font-size: 24px; margin-bottom: 12px; }
              p { font-size: 14px; color: #66745f; margin-bottom: 24px; }
              a { display: inline-block; padding: 10px 24px; background: #0b8457; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 13px; }
              a:hover { background: #09724a; }
            </style>
          </head>
          <body>
            <h2>404 - Không tìm thấy trang</h2>
            <p>Đường dẫn <code>${requestPath}</code> không tồn tại trên hệ thống.</p>
            <a href="/src/screens/auth/intro.html">Quay về Trang giới thiệu (Intro)</a>
          </body>
          </html>
        `);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });
  });

  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}/src/screens/auth/intro.html`;
    console.log('====================================================');
    console.log('       TRIPWISE LOCAL WEB SERVER ĐANG CHẠY          ');
    console.log('====================================================');
    console.log(`- Địa chỉ máy chủ: ${url}`);
    console.log(`- Thư mục gốc:    ${ROOT_DIR}`);
    console.log(`- Màn hình khởi động mặc định (Entry point): auth/intro.html`);
    console.log('----------------------------------------------------');
    console.log('Nhấn Ctrl + C để dừng máy chủ.');
    console.log('====================================================\n');

    const startCmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
        ? `open "${url}"`
        : `xdg-open "${url}"`;

    exec(startCmd, (error) => {
      if (error) {
        console.log(`Hãy mở trình duyệt và truy cập: ${url}`);
      } else {
        console.log('>> Đã tự động mở trình duyệt tại màn hình intro.html!');
      }
    });
  });

} else {
  // =========================================================================
  // 2. BROWSER CLIENT-SIDE COMPONENTS & SHARED RUNTIME LOGIC
  // =========================================================================

  /**
   * Component: AppHeader (<app-header>)
   * Tự động thay thế wrapper custom element (Zero-Breakage DOM Tree Replacement)
   */
  class AppHeader extends HTMLElement {
    connectedCallback() {
      const variant = this.getAttribute('variant') || 'default';
      const avatarSrc = this.getAttribute('avatar-src') || '../../images/avatars/avatar.png';
      const travelerName = this.getAttribute('traveler-name') || 'Linh Nguyễn';
      const unreadCount = this.getAttribute('unread-count') || (variant === 'profile' ? '02' : '12');

      const path = window.location.pathname.toLowerCase();
      const inAccount = path.includes('/account/');
      const profileUrl = inAccount ? 'profile.html' : '../account/profile.html';

      const template = document.createElement('template');

      if (variant === 'profile') {
        template.innerHTML = `
          <div class="profile-top-bar">
            <button type="button" class="btn-header-round" id="btnOpenNotification" title="Xem thông báo" aria-label="Xem thông báo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3f20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span class="notif-badge-pill">${unreadCount}</span>
            </button>
          </div>
          ${this.getDropdownHTML()}
        `;
      } else {
        template.innerHTML = `
          <header class="traveler-header">
            <div class="traveler-left">
              <a href="${profileUrl}" class="avatar-ring" title="Xem hồ sơ cá nhân" aria-label="Xem hồ sơ cá nhân">
                <img src="${avatarSrc}" alt="${travelerName}">
              </a>
              <div class="greeting-block">
                <span class="welcome-msg">Xin chào,</span>
                <span class="traveler-name">${travelerName}</span>
              </div>
            </div>
            <div class="traveler-actions">
              <button type="button" class="btn-header-round" id="btnOpenNotification" title="Xem thông báo" aria-label="Xem thông báo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3f20" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span class="notif-badge-pill">${unreadCount}</span>
              </button>
              <button type="button" class="btn-header-round" id="btnOpenHeaderLoved" title="Địa điểm yêu thích" aria-label="Địa điểm yêu thích">
                <img src="../../images/icons/icon-heart.svg" alt="Yêu thích" width="18" height="18">
              </button>
            </div>
          </header>
          ${this.getDropdownHTML()}
        `;
      }

      const content = template.content;
      const headerNode = content.firstElementChild;
      const dropdownNode = content.querySelector('.notification-dropdown-panel');

      this.replaceWith(headerNode, dropdownNode);
      this.initLogic(headerNode, dropdownNode);
    }

    getDropdownHTML() {
      const path = window.location.pathname.toLowerCase();
      const inTrip = path.includes('/trip/');
      const itineraryUrl = inTrip ? 'itinerary.html' : '../trip/itinerary.html';
      const mapUrl = inTrip ? 'map.html' : '../trip/map.html';

      return `
        <div class="notification-dropdown-panel" id="notificationDropdownPanel" role="dialog" aria-label="Bảng thông báo">
          <div class="notif-panel-header">
            <div class="notif-panel-date">Hôm nay, 24/10</div>
            <div class="notif-divider-row">
              <span class="notif-divider-label">CHƯA ĐỌC</span>
              <span class="notif-divider-line"></span>
              <span class="notif-divider-count">02</span>
            </div>
          </div>

          <div class="notif-card-box">
            <div class="notif-card-heading">
              <div class="notif-sculptural-icon rain">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D4D32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                  <path d="M16 14v6"></path>
                  <path d="M8 14v6"></path>
                  <path d="M12 16v6"></path>
                </svg>
              </div>
              <div class="notif-card-info">
                <div class="notif-card-title">Thời tiết tại Đà Lạt</div>
                <div class="notif-card-meta">
                  <span class="notif-smart-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#0B8457"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    Gợi ý thông minh
                  </span>
                  <span class="notif-time-status">
                    09:41 <span class="notif-unread-dot"></span>
                  </span>
                </div>
              </div>
            </div>
            <div class="notif-card-desc">
              Dự báo mưa lớn quanh Hồ Xuân Hương lúc 15:00. Đã chuẩn bị phương án chuyển sang Ga Đà Lạt.
            </div>
            <div class="notif-card-actions">
              <button type="button" class="btn-notif-view" onclick="window.location.href='${itineraryUrl}'">Xem</button>
              <button type="button" class="btn-notif-cta" onclick="window.location.href='${mapUrl}'">
                <span>Đổi điểm đến</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
              </button>
            </div>
          </div>

          <div class="notif-card-box">
            <div class="notif-card-heading">
              <div class="notif-sculptural-icon car">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7A5614" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
                  <circle cx="7" cy="17" r="2"></circle>
                  <path d="M9 17h6"></path>
                  <circle cx="17" cy="17" r="2"></circle>
                </svg>
              </div>
              <div class="notif-card-info">
                <div class="notif-card-title">Tối ưu lộ trình</div>
                <div class="notif-card-meta">
                  <span class="notif-smart-pill">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="#0B8457"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    Gợi ý thông minh
                  </span>
                  <span class="notif-time-status">
                    08:55 <span class="notif-unread-dot"></span>
                  </span>
                </div>
              </div>
            </div>
            <div class="notif-card-desc">
              Khu vực đèo Prenn lưu lượng đông. Gợi ý đi hướng đèo Mimosa.
            </div>
            <div class="notif-card-actions">
              <button type="button" class="btn-notif-view" onclick="window.location.href='${itineraryUrl}'">Xem</button>
              <button type="button" class="btn-notif-cta" onclick="window.location.href='${mapUrl}'">
                <span>Đổi đường đi</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
              </button>
            </div>
          </div>

          <div class="notif-divider-row" style="margin-top: 4px;">
            <span class="notif-divider-label" style="color: #75816F;">Hôm qua, 23/10</span>
            <span class="notif-divider-line"></span>
          </div>

          <div class="notif-progress-banner">
            <div class="notif-progress-ring">100%</div>
            <div style="flex: 1;">
              <div style="font-size: 15px; font-weight: 700; color: #1E3F20;">Tuyệt vời!</div>
              <div style="font-size: 11px; color: #657064;">Đã cập nhật 3/3 lịch trình</div>
            </div>
            <button type="button" style="width: 40px; height: 40px; border-radius: 12px; background: rgba(30, 63, 32, 0.05); border: 1px solid rgba(30, 63, 32, 0.08); display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.location.href='${itineraryUrl}'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E3F20" stroke-width="2"><path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"/><path d="m9 16 2 2 4-4"/></svg>
            </button>
          </div>
        </div>
      `;
    }

    initLogic(headerNode, dropdownNode) {
      const btnOpenNotif = headerNode ? headerNode.querySelector('#btnOpenNotification') : document.getElementById('btnOpenNotification');
      const notifPanel = dropdownNode || document.getElementById('notificationDropdownPanel');
      const btnLoved = headerNode ? headerNode.querySelector('#btnOpenHeaderLoved') : document.getElementById('btnOpenHeaderLoved');

      if (btnOpenNotif && notifPanel) {
        btnOpenNotif.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = notifPanel.classList.toggle('open');
          btnOpenNotif.classList.toggle('active', isOpen);
        });

        document.addEventListener('click', (e) => {
          if (!notifPanel.contains(e.target) && !btnOpenNotif.contains(e.target)) {
            notifPanel.classList.remove('open');
            btnOpenNotif.classList.remove('active');
          }
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && notifPanel.classList.contains('open')) {
            notifPanel.classList.remove('open');
            btnOpenNotif.classList.remove('active');
          }
        });
      }

      if (btnLoved) {
        btnLoved.addEventListener('click', (e) => {
          e.preventDefault();
          const modalLoved = document.getElementById('modalLovedPlaces');
          if (modalLoved) {
            modalLoved.classList.add('active');
          }
          window.dispatchEvent(new CustomEvent('open-loved-modal'));
        });
      }
    }
  }

  if (!customElements.get('app-header')) {
    customElements.define('app-header', AppHeader);
  }

  /**
   * Component: AppBottomBar (<app-bottom-bar>)
   * Tự động thay thế wrapper custom element (Zero-Breakage DOM Tree Replacement)
   */
  class AppBottomBar extends HTMLElement {
    connectedCallback() {
      const path = window.location.pathname.toLowerCase();
      let activeTab = this.getAttribute('active');
      if (!activeTab) {
        if (path.includes('itinerary.html') || path.includes('budget.html') || path.includes('spending.html') || path.includes('suggestion.html')) {
          activeTab = 'itinerary';
        } else if (path.includes('map.html')) {
          activeTab = 'map';
        } else if (path.includes('profile.html') || path.includes('delete_account.html')) {
          activeTab = 'profile';
        } else {
          activeTab = 'home';
        }
      }

      const inTrip = path.includes('/trip/');
      const inAccount = path.includes('/account/');

      const homeHref = inTrip ? 'home.html' : '../trip/home.html';
      const itineraryHref = inTrip ? 'itinerary.html' : '../trip/itinerary.html';
      const mapHref = inTrip ? 'map.html' : '../trip/map.html';
      const profileHref = inAccount ? 'profile.html' : '../account/profile.html';

      const template = document.createElement('template');
      template.innerHTML = `
        <nav class="bottom-nav-static-container" aria-label="Điều hướng chính">
          <a href="${homeHref}" class="dock-btn-row ${activeTab === 'home' ? 'active' : ''}" data-tab="home" title="Trang chủ" aria-label="Đi tới Trang chủ">
            <img src="../../images/icons/icon-home.svg" alt="Home">
            <span>Trang chủ</span>
          </a>

          <a href="${itineraryHref}" class="dock-btn-row ${activeTab === 'itinerary' ? 'active' : ''}" data-tab="itinerary" title="Lịch trình" aria-label="Đi tới Lịch trình">
            <img src="../../images/icons/icon-calendar.svg" alt="Itinerary">
            <span>Lịch trình</span>
          </a>

          <a href="${mapHref}" class="dock-btn-row ${activeTab === 'map' ? 'active' : ''}" data-tab="map" title="Bản đồ" aria-label="Đi tới Bản đồ">
            <img src="../../images/icons/icon-map.svg" alt="Map">
            <span>Bản đồ</span>
          </a>

          <a href="${profileHref}" class="dock-btn-row ${activeTab === 'profile' ? 'active' : ''}" data-tab="profile" title="Cá nhân" aria-label="Đi tới Cá nhân">
            <img src="../../images/icons/icon-user.svg" alt="Profile">
            <span>Cá nhân</span>
          </a>
        </nav>
      `;

      const navNode = template.content.firstElementChild;
      this.replaceWith(navNode);
    }
  }

  if (!customElements.get('app-bottom-bar')) {
    customElements.define('app-bottom-bar', AppBottomBar);
  }

  /**
   * Component: LovedModal (<loved-modal>)
   * Tự động thay thế wrapper custom element (Zero-Breakage DOM Tree Replacement)
   */
  class LovedModal extends HTMLElement {
    connectedCallback() {
      const template = document.createElement('template');
      template.innerHTML = `
        <div class="modal-backdrop-layer" id="modalLovedPlaces" role="dialog" aria-modal="true" aria-label="Địa điểm yêu thích">
          <div class="loved-places-dialog">
            <div class="loved-dialog-header">
              <button type="button" class="btn-modal-close" id="btnCloseLovedPlaces" aria-label="Đóng popup">✕</button>
              <div class="loved-header-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#D6455D"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <span>Yêu thích</span>
                <span class="loved-header-count">12</span>
              </div>
            </div>

            <div class="loved-filters-row">
              <button type="button" class="btn-loved-filter active" data-filter="all">Tất cả</button>
              <button type="button" class="btn-loved-filter" data-filter="food">Ẩm thực</button>
              <button type="button" class="btn-loved-filter" data-filter="nature">Thiên nhiên</button>
            </div>

            <div class="loved-cards-grid" id="lovedCardsGrid">
              <div class="loved-card-item" data-category="food">
                <div class="loved-photo-wrap">
                  <img src="../../images/destinations/dest_dalat.png" alt="Lẩu gà lá é Tao Ngộ">
                  <button type="button" class="btn-loved-heart-badge" title="Bỏ yêu thích">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E63946"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                </div>
                <div class="loved-card-body">
                  <div class="loved-card-title">Lẩu gà lá é Tao Ngộ</div>
                  <div class="loved-card-sub">Ăn uống • ~150.000đ/người</div>
                </div>
              </div>

              <div class="loved-card-item" data-category="food">
                <div class="loved-photo-wrap">
                  <img src="../../images/destinations/place_cafe.png" alt="Tiệm Cà Phê Túi Mơ To">
                  <button type="button" class="btn-loved-heart-badge" title="Bỏ yêu thích">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E63946"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                </div>
                <div class="loved-card-body">
                  <div class="loved-card-title">Tiệm Cà Phê Túi Mơ To</div>
                  <div class="loved-card-sub">Cà phê • Chờ bàn ~25p</div>
                  <div class="loved-alert-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span>Sóng yếu (tiền mặt)</span>
                  </div>
                </div>
              </div>

              <div class="loved-card-item" data-category="nature">
                <div class="loved-photo-wrap">
                  <img src="../../images/destinations/dest_temple.png" alt="Dinh III Bảo Đại">
                  <button type="button" class="btn-loved-heart-badge" title="Bỏ yêu thích">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E63946"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                </div>
                <div class="loved-card-body">
                  <div class="loved-card-title">Dinh III Bảo Đại</div>
                  <div class="loved-card-sub">Tham quan • Di tích lịch sử</div>
                </div>
              </div>

              <div class="loved-card-item" data-category="nature">
                <div class="loved-photo-wrap">
                  <img src="../../images/destinations/dest_mountains.png" alt="Đồi Đa Phú">
                  <button type="button" class="btn-loved-heart-badge" title="Bỏ yêu thích">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#E63946"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </button>
                </div>
                <div class="loved-card-body">
                  <div class="loved-card-title">Đồi Đa Phú</div>
                  <div class="loved-card-sub">Săn mây • Đẹp nhất 05:00</div>
                  <div class="loved-alert-tag">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span>Đường dốc trơn khi mưa</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const modalNode = template.content.firstElementChild;
      this.replaceWith(modalNode);
      this.initLogic(modalNode);
    }

    initLogic(modalLoved) {
      const btnClose = modalLoved.querySelector('#btnCloseLovedPlaces');

      const openModal = () => {
        modalLoved.classList.add('active');
      };

      const closeModal = () => {
        modalLoved.classList.remove('active');
      };

      window.openLovedModal = openModal;
      window.closeLovedModal = closeModal;

      window.addEventListener('open-loved-modal', openModal);
      window.addEventListener('close-loved-modal', closeModal);

      if (btnClose) {
        btnClose.addEventListener('click', closeModal);
      }

      modalLoved.addEventListener('click', (e) => {
        if (e.target === modalLoved) {
          closeModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalLoved.classList.contains('active')) {
          closeModal();
        }
      });

      const filterBtns = modalLoved.querySelectorAll('.btn-loved-filter');
      const cards = modalLoved.querySelectorAll('#lovedCardsGrid .loved-card-item');

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          filterBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const filter = btn.getAttribute('data-filter');

          cards.forEach(card => {
            if (filter === 'all' || card.getAttribute('data-category') === filter) {
              card.style.display = 'flex';
            } else {
              card.style.display = 'none';
            }
          });
        });
      });

      modalLoved.querySelectorAll('.btn-loved-heart-badge').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const card = btn.closest('.loved-card-item');
          if (card) {
            card.style.transition = 'opacity 0.2s, transform 0.2s';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.9)';
            setTimeout(() => {
              card.remove();
              const countElem = modalLoved.querySelector('.loved-header-count');
              if (countElem) {
                const remaining = modalLoved.querySelectorAll('#lovedCardsGrid .loved-card-item').length;
                countElem.textContent = remaining.toString().padStart(2, '0');
              }
            }, 200);
          }
        });
      });
    }
  }

  if (!customElements.get('loved-modal')) {
    customElements.define('loved-modal', LovedModal);
  }

  // =========================================================================
  // 3. BUDGET PAGE EDIT POPUP & REAL-TIME RECALCULATION CONTROLLER
  // =========================================================================
  (function initBudgetEditFeature() {
    const setupBudgetEdit = () => {
      const btnEditBudget = document.getElementById('btnEditBudget');
      const modalEditBudget = document.getElementById('modalEditBudget');
      const formEditBudget = document.getElementById('formEditBudget');

      if (!btnEditBudget || !modalEditBudget || !formEditBudget) {
        return;
      }

      // Đảm bảo nút chỉnh sửa mở popup thay vì điều hướng
      btnEditBudget.removeAttribute('onclick');

      const btnClose = document.getElementById('btnCloseEditBudget');
      const btnCancel = document.getElementById('btnCancelEditBudget');
      const btnDec = document.getElementById('btnDecParticipants');
      const btnInc = document.getElementById('btnIncParticipants');
      const inputParticipants = document.getElementById('inputBudgetParticipants');
      const inputPerPerson = document.getElementById('inputBudgetPerPerson');
      const previewTotalBudget = document.getElementById('previewTotalBudget');
      const previewTotalEst = document.getElementById('previewTotalEst');
      const errorBox = document.getElementById('budgetEditError');

      const elParticipantsText = document.getElementById('budgetParticipantsText');
      const elTotalText = document.getElementById('budgetTotalText');
      const elPerPersonAmount = document.getElementById('budgetPerPersonAmount');
      const elDonutNum = document.getElementById('budgetDonutNum');
      const elDonutUnit = document.getElementById('budgetDonutUnit');
      const elEstPerPersonText = document.getElementById('budgetEstPerPersonText');
      const elRemainWrap = document.getElementById('budgetRemainWrap');
      const elSummaryTotalVal = document.getElementById('budgetSummaryTotalVal');

      const STORAGE_KEY = 'tripwise_budget_state';
      const ESTIMATED_PER_PERSON = 2850000;
      const MIN_PARTICIPANTS = 1;
      const MAX_PARTICIPANTS = 99;

      const state = {
        participants: 2,
        budgetPerPerson: 3000000
      };

      const formatNumberDot = (num) => {
        const safeNum = Math.round(Number(num) || 0);
        return safeNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      };

      const formatVND = (num) => `${formatNumberDot(num)}đ`;

      const parseDigits = (val) => {
        const cleaned = String(val || '').replace(/\D/g, '').slice(0, 12);
        return cleaned ? parseInt(cleaned, 10) : 0;
      };

      const formatDonutAmount = (amount) => {
        if (amount >= 1000000) {
          const millions = amount / 1000000;
          const formatted = Number.isInteger(millions)
            ? millions.toString()
            : millions.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
          return { num: formatted, unit: 'triệu' };
        }
        const thousands = Math.round(amount / 1000);
        return { num: formatNumberDot(thousands), unit: 'nghìn' };
      };

      const loadSavedState = () => {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (!raw) return;
          const parsed = JSON.parse(raw);
          const p = parseInt(parsed.participants, 10);
          const b = parseInt(parsed.budgetPerPerson, 10);
          if (Number.isInteger(p) && p >= MIN_PARTICIPANTS && p <= MAX_PARTICIPANTS) {
            state.participants = p;
          }
          if (Number.isFinite(b) && b > 0) {
            state.budgetPerPerson = b;
          }
        } catch (err) {
          // Bỏ qua nếu trình duyệt chặn localStorage
        }
      };

      const saveState = () => {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            participants: state.participants,
            budgetPerPerson: state.budgetPerPerson
          }));
        } catch (err) {
          // Bỏ qua nếu trình duyệt chặn localStorage
        }
      };

      const renderBudgetPage = () => {
        const totalBudget = state.participants * state.budgetPerPerson;
        const estimatedPerPerson = ESTIMATED_PER_PERSON;
        const remainingPerPerson = state.budgetPerPerson - estimatedPerPerson;
        const totalEstimated = state.participants * estimatedPerPerson;
        const donut = formatDonutAmount(estimatedPerPerson);

        if (elParticipantsText) {
          elParticipantsText.textContent = `Số người tham gia: ${state.participants}`;
        }
        if (elTotalText) {
          elTotalText.textContent = `Tổng ngân sách: ${formatVND(totalBudget)}`;
        }
        if (elPerPersonAmount) {
          elPerPersonAmount.textContent = formatVND(state.budgetPerPerson);
        }
        if (elDonutNum) {
          elDonutNum.textContent = donut.num;
        }
        if (elDonutUnit) {
          elDonutUnit.textContent = donut.unit;
        }
        if (elEstPerPersonText) {
          elEstPerPersonText.textContent = `${formatVND(estimatedPerPerson)}/người`;
        }
        if (elRemainWrap) {
          if (remainingPerPerson >= 0) {
            elRemainWrap.classList.remove('budget-remain-over');
            elRemainWrap.innerHTML = `Còn lại: <strong id="budgetRemainPerPersonText">${formatVND(remainingPerPerson)}/người</strong>`;
          } else {
            elRemainWrap.classList.add('budget-remain-over');
            elRemainWrap.innerHTML = `Vượt ngân sách: <strong id="budgetRemainPerPersonText">${formatVND(Math.abs(remainingPerPerson))}/người</strong>`;
          }
        }
        if (elSummaryTotalVal) {
          elSummaryTotalVal.textContent = formatVND(totalEstimated);
        }
      };

      const showError = (msg) => {
        if (!errorBox) return;
        errorBox.textContent = msg;
        errorBox.classList.add('active');
      };

      const clearError = () => {
        if (!errorBox) return;
        errorBox.textContent = '';
        errorBox.classList.remove('active');
      };

      const syncStepperButtons = (val) => {
        if (btnDec) {
          btnDec.classList.toggle('disabled', val <= MIN_PARTICIPANTS);
        }
        if (btnInc) {
          btnInc.classList.toggle('disabled', val >= MAX_PARTICIPANTS);
        }
      };

      const updateLivePreview = () => {
        const p = parseInt(inputParticipants ? inputParticipants.value : state.participants, 10);
        const b = parseDigits(inputPerPerson ? inputPerPerson.value : state.budgetPerPerson);
        const safeP = Number.isInteger(p) && p >= MIN_PARTICIPANTS ? Math.min(p, MAX_PARTICIPANTS) : 0;
        const safeB = b > 0 ? b : 0;

        syncStepperButtons(safeP || MIN_PARTICIPANTS);

        if (previewTotalBudget) {
          previewTotalBudget.textContent = formatVND(safeP * safeB);
        }
        if (previewTotalEst) {
          previewTotalEst.textContent = formatVND(safeP * ESTIMATED_PER_PERSON);
        }
      };

      const openModal = () => {
        if (inputParticipants) {
          inputParticipants.value = String(state.participants);
        }
        if (inputPerPerson) {
          inputPerPerson.value = formatNumberDot(state.budgetPerPerson);
        }
        clearError();
        updateLivePreview();
        modalEditBudget.classList.add('active');
        if (inputParticipants) {
          inputParticipants.focus();
        }
      };

      const closeModal = () => {
        modalEditBudget.classList.remove('active');
        clearError();
      };

      btnEditBudget.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });

      if (btnClose) {
        btnClose.addEventListener('click', closeModal);
      }
      if (btnCancel) {
        btnCancel.addEventListener('click', closeModal);
      }

      modalEditBudget.addEventListener('click', (e) => {
        if (e.target === modalEditBudget) {
          closeModal();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEditBudget.classList.contains('active')) {
          closeModal();
        }
      });

      if (btnDec && inputParticipants) {
        btnDec.addEventListener('click', () => {
          const current = parseInt(inputParticipants.value, 10) || MIN_PARTICIPANTS;
          const next = Math.max(MIN_PARTICIPANTS, current - 1);
          inputParticipants.value = String(next);
          clearError();
          updateLivePreview();
        });
      }

      if (btnInc && inputParticipants) {
        btnInc.addEventListener('click', () => {
          const current = parseInt(inputParticipants.value, 10) || MIN_PARTICIPANTS;
          const next = Math.min(MAX_PARTICIPANTS, current + 1);
          inputParticipants.value = String(next);
          clearError();
          updateLivePreview();
        });
      }

      if (inputParticipants) {
        inputParticipants.addEventListener('input', () => {
          clearError();
          updateLivePreview();
        });
      }

      if (inputPerPerson) {
        inputPerPerson.addEventListener('input', (e) => {
          const amount = parseDigits(e.target.value);
          e.target.value = amount > 0 ? formatNumberDot(amount) : '';
          clearError();
          updateLivePreview();
        });
      }

      formEditBudget.addEventListener('submit', (e) => {
        e.preventDefault();
        const parsedParticipants = parseInt(inputParticipants ? inputParticipants.value : '', 10);
        const parsedPerPerson = parseDigits(inputPerPerson ? inputPerPerson.value : '');

        if (!Number.isInteger(parsedParticipants) || parsedParticipants < MIN_PARTICIPANTS || parsedParticipants > MAX_PARTICIPANTS) {
          showError(`Số người tham gia phải là số nguyên từ ${MIN_PARTICIPANTS} đến ${MAX_PARTICIPANTS}.`);
          if (inputParticipants) inputParticipants.focus();
          return;
        }

        if (!Number.isFinite(parsedPerPerson) || parsedPerPerson <= 0) {
          showError('Vui lòng nhập số tiền chi tiêu mỗi người lớn hơn 0 VND.');
          if (inputPerPerson) inputPerPerson.focus();
          return;
        }

        state.participants = parsedParticipants;
        state.budgetPerPerson = parsedPerPerson;
        saveState();
        renderBudgetPage();
        closeModal();
      });

      loadSavedState();
      renderBudgetPage();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupBudgetEdit);
    } else {
      setupBudgetEdit();
    }
  })();
}
