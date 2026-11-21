/**
 * // Đường dẫn: frontend/src/js/services/api.service.js
 * TripWise - API Service Layer with Offline Mock Fallback
 * Hỗ trợ kết nối RESTful API / GraphQL và tự động fallback sang Mock Data khi Backend chưa khởi động.
 */

const API_CONFIG = {
  BASE_URL: (typeof window !== 'undefined' && window.__ENV__?.API_BASE_URL) || 'http://localhost:3000/api',
  TIMEOUT_MS: 5000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  ENABLE_MOCK_FALLBACK: true
};

const MOCK_DATA = {
  user: {
    id: 'user_01',
    name: 'Linh Nguyễn',
    email: 'linh.nguyen@example.com',
    avatar: '../../images/avatars/avatar.png',
    tripCount: 12,
    unreadNotifications: 2
  },
  trips: [
    {
      id: 'trip_01',
      title: 'Khám phá Đà Lạt Mộng Mơ',
      destination: 'Đà Lạt, Lâm Đồng',
      startDate: '2026-12-01',
      endDate: '2026-12-04',
      budget: 5000000,
      spent: 2450000,
      status: 'active'
    },
    {
      id: 'trip_02',
      title: 'Hè rực rỡ tại Phú Quốc',
      destination: 'Phú Quốc, Kiên Giang',
      startDate: '2027-04-15',
      endDate: '2027-04-18',
      budget: 8000000,
      spent: 0,
      status: 'planning'
    }
  ],
  budget: {
    totalBudget: 15000000,
    totalSpent: 6250000,
    remaining: 8750000,
    categories: [
      { name: 'Di chuyển', allocated: 4000000, spent: 2100000 },
      { name: 'Lưu trú', allocated: 5000000, spent: 2500000 },
      { name: 'Ẩm thực', allocated: 3500000, spent: 1250000 },
      { name: 'Hoạt động & Vé', allocated: 2500000, spent: 400000 }
    ]
  }
};

class ApiService {
  constructor(config = API_CONFIG) {
    this.baseUrl = config.BASE_URL;
    this.timeout = config.TIMEOUT_MS;
    this.defaultHeaders = config.HEADERS;
    this.mockFallback = config.ENABLE_MOCK_FALLBACK;
  }

  getAuthToken() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('tripwise_token') || null;
    }
    return null;
  }

  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  getMockFallback(endpoint, method = 'GET', body = null) {
    console.info(`[ApiService] Backend chưa kết nối (${endpoint}). Sử dụng dữ liệu dự phòng an toàn (Mock Fallback).`);
    const cleanEp = endpoint.toLowerCase().replace(/^\//, '');

    if (cleanEp.startsWith('user') || cleanEp.startsWith('profile')) {
      return { success: true, isMock: true, data: MOCK_DATA.user };
    }
    if (cleanEp.startsWith('trip') || cleanEp.startsWith('plan')) {
      return { success: true, isMock: true, data: MOCK_DATA.trips };
    }
    if (cleanEp.startsWith('budget') || cleanEp.startsWith('spending')) {
      return { success: true, isMock: true, data: MOCK_DATA.budget };
    }
    if (cleanEp.startsWith('auth/login') || cleanEp.startsWith('auth/register')) {
      return {
        success: true,
        isMock: true,
        token: 'mock_token_' + Date.now(),
        user: MOCK_DATA.user
      };
    }
    return { success: true, isMock: true, data: null, message: 'Dữ liệu dự phòng hoạt động bình thường.' };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const signal = controller ? controller.signal : undefined;
    const id = controller ? setTimeout(() => controller.abort(), this.timeout) : null;

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers),
        signal
      });
      if (id) clearTimeout(id);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi HTTP: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (id) clearTimeout(id);
      if (this.mockFallback) {
        return this.getMockFallback(endpoint, options.method, options.body);
      }
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu quá thời gian chờ (Timeout). Vui lòng thử lại sau.');
      }
      console.warn(`[ApiService] Không thể kết nối tới ${endpoint}.`, error);
      throw error;
    }
  }

  get(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'GET', headers });
  }

  post(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body = {}, headers = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
  }

  delete(endpoint, headers = {}) {
    return this.request(endpoint, { method: 'DELETE', headers });
  }
}

// Khởi tạo instance duy nhất (Singleton)
const apiService = new ApiService();
if (typeof window !== 'undefined') {
  window.apiService = apiService;
}

// Hỗ trợ cả ES Module và CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiService, apiService };
}
