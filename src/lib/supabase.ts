import { createClient } from '@supabase/supabase-js';
import { DEMO_MOCK_DATA } from './demoMock';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

const baseClient = createClient(supabaseUrl || '', supabaseKey || '');

/**
 * isDemo() persists the demo flag to sessionStorage so that
 * navigating via the sidebar (which drops the ?demo=musk query param)
 * does NOT break the mock data injection.
 */
const isDemo = (): boolean => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('demo') === 'musk';
    if (fromUrl) {
      sessionStorage.setItem('sanctum_demo_mode', 'musk');
      return true;
    }
    return sessionStorage.getItem('sanctum_demo_mode') === 'musk';
  } catch {
    return false;
  }
};

// No-op real-time channel stub for demo mode
const demoChannel = () => {
  const chan: any = { on: () => chan, subscribe: () => ({}) };
  return chan;
};

/**
 * Build a chainable query handler for demo mode.
 * Filters (eq, neq, gte, lte, lt, gt, in, limit) narrow the in-memory array.
 * Resolves via thenable (.then) or .single() / .maybeSingle().
 */
const buildHandler = (rows: any[]) => {
  let filtered = [...rows];

  const handler: any = {
    select: (_cols?: string) => handler,

    eq: (col: string, val: any) => {
      filtered = filtered.filter(r => String(r[col]) === String(val));
      return handler;
    },
    neq: (col: string, val: any) => {
      filtered = filtered.filter(r => String(r[col]) !== String(val));
      return handler;
    },
    gte: (col: string, val: any) => {
      filtered = filtered.filter(r => r[col] >= val);
      return handler;
    },
    lte: (col: string, val: any) => {
      filtered = filtered.filter(r => r[col] <= val);
      return handler;
    },
    gt: (col: string, val: any) => {
      filtered = filtered.filter(r => r[col] > val);
      return handler;
    },
    lt: (col: string, val: any) => {
      filtered = filtered.filter(r => r[col] < val);
      return handler;
    },
    in: (col: string, vals: any[]) => {
      filtered = filtered.filter(r => vals.includes(r[col]));
      return handler;
    },

    order: (_col?: string, _opts?: any) => handler,
    limit: (n: number) => {
      filtered = filtered.slice(0, n);
      return handler;
    },

    // Mutations — no-op in demo
    insert: (_data: any) => handler,
    update: (_data: any) => handler,
    delete: () => handler,
    upsert: (_data: any, _opts?: any) => handler,

    // Single row resolvers
    single: () => Promise.resolve({ data: filtered[0] ?? null, error: null }),
    maybeSingle: () => Promise.resolve({ data: filtered[0] ?? null, error: null }),

    // Thenable — resolves full filtered array when awaited
    then: (resolve: any, reject: any) => {
      return Promise.resolve({ data: [...filtered], error: null }).then(resolve, reject);
    },
  };

  return handler;
};

// Demo auth proxy — fully stubs getSession, onAuthStateChange, signOut
const buildDemoAuth = (realAuth: any) => {
  const demoUser = { id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', email: 'elon.musk@sanctum.app' };
  const demoSession = { access_token: 'demo-token', user: demoUser };

  return new Proxy(realAuth, {
    get(aTarget, aProp) {
      if (aProp === 'getSession') {
        return () => Promise.resolve({ data: { session: demoSession }, error: null });
      }
      if (aProp === 'onAuthStateChange') {
        // No-op: prevent real Supabase auth events from overwriting the demo user
        return (_event: any, _callback: any) => ({
          data: { subscription: { unsubscribe: () => {} } }
        });
      }
      if (aProp === 'signOut') {
        // Clear demo flag on sign-out so regular users aren't affected
        return () => {
          sessionStorage.removeItem('sanctum_demo_mode');
          return Promise.resolve({ error: null });
        };
      }
      return (aTarget as any)[aProp];
    }
  });
};

// Wizardry: Proxy para interceptar chamadas e injetar dados do Dr. Strange em modo Demo
export const supabase = new Proxy(baseClient, {
  get(target, prop) {
    // Top-level channel() — no-op stub in demo mode
    if (prop === 'channel' && isDemo()) {
      return demoChannel;
    }

    // Top-level removeChannel() — no-op stub in demo mode
    if (prop === 'removeChannel' && isDemo()) {
      return () => Promise.resolve('ok');
    }

    if (prop === 'from') {
      return (table: string) => {
        if (isDemo() && DEMO_MOCK_DATA[table]) {
          return buildHandler(DEMO_MOCK_DATA[table]);
        }
        return target.from(table);
      };
    }

    // Full auth interception for demo mode
    if (prop === 'auth') {
      return isDemo() ? buildDemoAuth(target.auth) : target.auth;
    }

    return (target as any)[prop];
  }
}) as any;
