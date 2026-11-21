/**
 * // Đường dẫn: frontend/src/js/components/LovedModal.js
 * TripWise - Component Modal Danh sách Địa điểm yêu thích dùng chung
 * Tự động hòa nhập trực tiếp vào DOM Tree gốc (Zero-Breakage DOM Tree Replacement)
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
    // Tự giải phóng wrapper custom element, đưa modal trực tiếp thành con của .app-container
    this.replaceWith(modalNode);

    // Kích hoạt logic chức năng modal
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
      if (e.target === modalLoved) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalLoved.classList.contains('active')) {
        closeModal();
      }
    });

    const filterButtons = modalLoved.querySelectorAll('.btn-loved-filter');
    const cards = modalLoved.querySelectorAll('#lovedCardsGrid .loved-card-item');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
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

    const heartBadges = modalLoved.querySelectorAll('.btn-loved-heart-badge');
    heartBadges.forEach(badge => {
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = badge.closest('.loved-card-item');
        if (card) {
          card.style.opacity = '0.5';
          setTimeout(() => {
            card.style.display = 'none';
          }, 200);
        }
      });
    });
  }
}

if (!customElements.get('loved-modal')) {
  customElements.define('loved-modal', LovedModal);
}
