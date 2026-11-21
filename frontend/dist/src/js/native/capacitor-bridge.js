/**
 * // Đường dẫn: frontend/src/js/native/capacitor-bridge.js
 * TripWise - Capacitor Bridge & Hardware Integration
 */
export const CapacitorBridge = {
  isNative: () => typeof window !== 'undefined' && window.Capacitor?.isNativePlatform(),
  getPlatform: () => (typeof window !== 'undefined' && window.Capacitor?.getPlatform()) || 'web',
  setupBackButton: (callback) => {
    if (typeof window !== 'undefined' && window.Capacitor?.Plugins?.App) {
      window.Capacitor.Plugins.App.addListener('backButton', callback);
    }
  }
};
