/**
 * // Đường dẫn: frontend/src/js/features/budget.js
 * TripWise - Budget Formatting & Helpers
 */
export function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}
