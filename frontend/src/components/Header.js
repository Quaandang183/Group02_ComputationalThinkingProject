/**
 * // Đường dẫn: frontend/src/components/Header.js
 * TripWise - Component Header & Dropdown Thông báo dùng chung
 * Tự động hòa nhập trực tiếp vào DOM Tree gốc (Zero-Breakage DOM Tree Replacement)
 */

class AppHeader extends HTMLElement {
  connectedCallback() {
    const variant = this.getAttribute('variant') || 'default';
    const avatarSrc = this.getAttribute('avatar-src') || '../images/avatar.png';
    const travelerName = this.getAttribute('traveler-name') || 'Linh Nguyễn';
    const unreadCount = this.getAttribute('unread-count') || (variant === 'profile' ? '02' : '12');

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
            <a href="profile.html" class="avatar-ring" title="Xem hồ sơ cá nhân" aria-label="Xem hồ sơ cá nhân">
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
              <img src="../images/icon-heart.svg" alt="Yêu thích" width="18" height="18">
            </button>
          </div>
        </header>
        ${this.getDropdownHTML()}
      `;
    }

    const content = template.content;
    const headerNode = content.firstElementChild;
    const dropdownNode = content.querySelector('.notification-dropdown-panel');

    // Tự giải phóng wrapper custom element, đưa các node trực tiếp thành con của .app-container
    this.replaceWith(headerNode, dropdownNode);

    // Kích hoạt logic chức năng chuông thông báo & dropdown
    this.initLogic(headerNode, dropdownNode);
  }

  getDropdownHTML() {
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
            <button type="button" class="btn-notif-view" onclick="window.location.href='itinerary.html'">Xem</button>
            <button type="button" class="btn-notif-cta" onclick="window.location.href='map.html'">
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
            <button type="button" class="btn-notif-view" onclick="window.location.href='itinerary.html'">Xem</button>
            <button type="button" class="btn-notif-cta" onclick="window.location.href='map.html'">
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
          <button type="button" style="width: 40px; height: 40px; border-radius: 12px; background: rgba(30, 63, 32, 0.05); border: 1px solid rgba(30, 63, 32, 0.08); display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="window.location.href='itinerary.html'">
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
