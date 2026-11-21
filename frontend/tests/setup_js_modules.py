import os

# src/js/services/api.service.js
api_service_content = open('src/services/api.service.js', 'r', encoding='utf-8').read()
with open('src/js/services/api.service.js', 'w', encoding='utf-8') as f:
    f.write(api_service_content)

# src/js/services/auth.service.js
with open('src/js/services/auth.service.js', 'w', encoding='utf-8') as f:
    f.write('''/**
 * // Đường dẫn: frontend/src/js/services/auth.service.js
 * TripWise - Authentication Service
 */
export class AuthService {
  static login(email, password) {
    if (typeof window !== 'undefined' && window.apiService) {
      return window.apiService.post('/auth/login', { email, password });
    }
    return Promise.resolve({ success: true, isMock: true, token: 'mock_token' });
  }

  static register(userData) {
    if (typeof window !== 'undefined' && window.apiService) {
      return window.apiService.post('/auth/register', userData);
    }
    return Promise.resolve({ success: true, isMock: true, user: userData });
  }

  static logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('tripwise_token');
    }
    return Promise.resolve({ success: true });
  }
}
''')

# src/js/services/trip.service.js
with open('src/js/services/trip.service.js', 'w', encoding='utf-8') as f:
    f.write('''/**
 * // Đường dẫn: frontend/src/js/services/trip.service.js
 * TripWise - Trip Planning Service
 */
export class TripService {
  static getTrips() {
    if (typeof window !== 'undefined' && window.apiService) {
      return window.apiService.get('/trips');
    }
    return Promise.resolve({ success: true, isMock: true, data: [] });
  }

  static createTrip(tripData) {
    if (typeof window !== 'undefined' && window.apiService) {
      return window.apiService.post('/trips', tripData);
    }
    return Promise.resolve({ success: true, isMock: true, data: tripData });
  }
}
''')

# src/js/core/router.js
with open('src/js/core/router.js', 'w', encoding='utf-8') as f:
    f.write('''/**
 * // Đường dẫn: frontend/src/js/core/router.js
 * TripWise - Client Navigation Helper
 */
export const ROUTES = {
  INTRO: '/src/screens/auth/intro.html',
  LOGIN: '/src/screens/auth/login.html',
  REGISTER: '/src/screens/auth/register.html',
  HOME: '/src/screens/trip/home.html',
  PLAN: '/src/screens/trip/plan.html',
  PROPOSAL: '/src/screens/trip/proposal.html',
  ITINERARY: '/src/screens/trip/itinerary.html',
  EDIT_PLAN: '/src/screens/trip/edit_plan.html',
  SUGGESTION: '/src/screens/trip/suggestion.html',
  MAP: '/src/screens/trip/map.html',
  BUDGET: '/src/screens/finance/budget.html',
  SPENDING: '/src/screens/finance/spending.html',
  PROFILE: '/src/screens/account/profile.html',
  DELETE_ACCOUNT: '/src/screens/account/delete_account.html'
};

export function navigateTo(route) {
  if (typeof window !== 'undefined') {
    window.location.href = route;
  }
}
''')

# src/js/core/storage.js
with open('src/js/core/storage.js', 'w', encoding='utf-8') as f:
    f.write('''/**
 * // Đường dẫn: frontend/src/js/core/storage.js
 * TripWise - LocalStorage / Preferences Wrapper
 */
export const Storage = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage remove error:', e);
    }
  }
};
''')

# src/js/features/auth.js
with open('src/js/features/auth.js', 'w', encoding='utf-8') as f:
    f.write('''/**
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
''')

# src/js/features/trip.js
with open('src/js/features/trip.js', 'w', encoding='utf-8') as f:
    f.write('''/**
 * // Đường dẫn: frontend/src/js/features/trip.js
 * TripWise - Trip Features Helpers
 */
export function filterTrips(trips, category) {
  if (!category || category === 'all') return trips;
  return trips.filter(t => t.category === category);
}
''')

# src/js/features/budget.js
with open('src/js/features/budget.js', 'w', encoding='utf-8') as f:
    f.write('''/**
 * // Đường dẫn: frontend/src/js/features/budget.js
 * TripWise - Budget Formatting & Helpers
 */
export function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}
''')

# src/js/components/ re-export or mirror
for comp in ['Header.js', 'BottomBar.js', 'LovedModal.js']:
    src_comp = os.path.join('src/components', comp)
    if os.path.exists(src_comp):
        with open(src_comp, 'r', encoding='utf-8') as f_in:
            with open(os.path.join('src/js/components', comp), 'w', encoding='utf-8') as f_out:
                f_out.write(f_in.read())

# src/js/native/capacitor-bridge.js
with open('src/js/native/capacitor-bridge.js', 'w', encoding='utf-8') as f:
    f.write('''/**
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
''')

# src/js/native/safe-area.js
with open('src/js/native/safe-area.js', 'w', encoding='utf-8') as f:
    f.write('''/**
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
''')

print("All src/js submodules created successfully!")
