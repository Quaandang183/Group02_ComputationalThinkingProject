/**
 * // Đường dẫn: frontend/src/js/features/auth.js
 * TripWise - Auth UI Logic
 */
export function initAuthTogglePassword() {
  document.querySelectorAll('.btn-eye-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        input.type = input.type === 'password' ? 'text' : 'password';
      }
    });
  });
}
