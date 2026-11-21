/**
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
