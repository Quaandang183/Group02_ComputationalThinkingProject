/**
 * // Đường dẫn: frontend/src/js/features/trip.js
 * TripWise - Trip Features Helpers
 */
export function filterTrips(trips, category) {
  if (!category || category === 'all') return trips;
  return trips.filter(t => t.category === category);
}
