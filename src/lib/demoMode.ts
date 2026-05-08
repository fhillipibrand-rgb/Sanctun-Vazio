/**
 * Detects ?demo=musk in the URL and persists the flag to sessionStorage
 * so that sidebar navigation (which drops query params) keeps demo mode active.
 *
 * SECURITY: Demo mode is only available when VITE_DEMO_ENABLED=true is set
 * in the environment. In production this variable should be absent or false.
 */
const DEMO_ENABLED = import.meta.env.VITE_DEMO_ENABLED === 'true';

export const isDemoMode = (): boolean => {
  // Hard-block: if the feature flag is off, never activate demo mode
  if (!DEMO_ENABLED) return false;

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
