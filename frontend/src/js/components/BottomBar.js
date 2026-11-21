/**
 * // Đường dẫn: frontend/src/js/components/BottomBar.js
 * TripWise - Component Bottom Navigation Bar dùng chung
 * Tự động hòa nhập trực tiếp vào DOM Tree gốc (Zero-Breakage DOM Tree Replacement)
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
    // Tự giải phóng wrapper custom element, đưa <nav> trực tiếp thành con của .app-container
    this.replaceWith(navNode);
  }
}

if (!customElements.get('app-bottom-bar')) {
  customElements.define('app-bottom-bar', AppBottomBar);
}
