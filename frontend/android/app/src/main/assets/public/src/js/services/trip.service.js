/**
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
