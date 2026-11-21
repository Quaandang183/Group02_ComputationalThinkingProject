/**
 * // Đường dẫn: frontend/src/js/native/safe-area.js
 * TripWise - Safe Area Inset Handler for Android
 */
export function initSafeAreaInsets() {
  if (typeof window === 'undefined') return;
  // Fallback defaults if env() is not supported
  const root = document.documentElement;
  if (!getComputedStyle(root).getPropertyValue('--safe-top')) {
    root.style.setProperty('--safe-top', 'env(safe-area-inset-top, 0px)');
    root.style.setProperty('--safe-bottom', 'env(safe-area-inset-bottom, 0px)');
  }
}
