/**
 * // Đường dẫn: frontend/src/services/api.service.js
 * TripWise - API Service Layer
 * Cấu trúc chuẩn mực phục vụ kết nối Backend RESTful API / GraphQL sau này
 */

const API_CONFIG = {
  BASE_URL: window.__ENV__?.API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT_MS: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

class ApiService {
  constructor(config = API_CONFIG) {
    this.baseUrl = config.BASE_URL;
    this.timeout = config.TIMEOUT_MS;
    this.defaultHeaders = config.HEADERS;
  }

  getAuthToken() {
    return localStorage.getItem('tripwise_token') || null;
  }

  getHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers),
        signal: controller.signal
      });
      clearTimeout(id);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Lỗi HTTP: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(id);
      if (error.name === 'AbortError') {
        throw new Error('Yêu cầu quá thời gian chờ (Timeout). Vui lòng thử lại sau.');
      }
      console.error(`[ApiService] Lỗi khi gọi ${endpoint}:`, error);
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
window.apiService = apiService;

// Hỗ trợ cả ES Module và Vanilla Browser Global
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiService, apiService };
}
