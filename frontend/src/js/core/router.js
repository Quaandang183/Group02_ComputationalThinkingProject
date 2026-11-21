/**
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
