/**
 * Detects ?demo=musk in the URL and persists the flag to sessionStorage
 * so that sidebar navigation (which drops query params) keeps demo mode active.
 */
export const isDemoMode = (): boolean => {
  try {
    if (new URLSearchParams(window.location.search).get('demo') === 'musk') {
      sessionStorage.setItem('sanctum_demo_mode', 'musk');
      return true;
    }
    return sessionStorage.getItem('sanctum_demo_mode') === 'musk';
  } catch {
    return false;
  }
};
