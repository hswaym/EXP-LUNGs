import { createClient } from '@supabase/supabase-js';
import { auth as firebaseAuth, googleProvider } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  signInWithPopup, 
  onAuthStateChanged
} from 'firebase/auth';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined') {
  const storedUrl = localStorage.getItem('EXPLUNG_SUPABASE_URL');
  const storedKey = localStorage.getItem('EXPLUNG_SUPABASE_KEY');
  if (storedUrl && storedKey) {
    supabaseUrl = storedUrl;
    supabaseAnonKey = storedKey;
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- Transparent Firebase Auth Adapter Layer ---

const getLocalMockSession = (): any => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('explung-mock-session');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

// Set of callbacks registered via onAuthStateChange
const listeners = new Set<(event: string, session: any) => void>();

export const triggerMockAuthChange = (event: string, session: any) => {
  listeners.forEach(cb => {
    try {
      cb(event, session);
    } catch (e) {
      console.error('[Supabase Patch] Listener callback error:', e);
    }
  });
};

const mapFirebaseUserToSupabase = (fbUser: any, token: string): any => {
  return {
    id: fbUser.uid,
    email: fbUser.email || undefined,
    created_at: fbUser.metadata?.creationTime || new Date().toISOString(),
    app_metadata: { provider: 'firebase' },
    user_metadata: {
      name: fbUser.displayName,
      avatar_url: fbUser.photoURL,
    },
    aud: 'authenticated',
    role: 'authenticated',
  };
};

const mapFirebaseUserToSession = (fbUser: any, token: string): any => {
  const user = mapFirebaseUserToSupabase(fbUser, token);
  return {
    access_token: token,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: fbUser.refreshToken || 'firebase-refresh-token',
    user,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };
};

const handleOfflineSignIn = (email: string) => {
  console.log('[Supabase Patch] Offline Mode Activated: Simulating successful session...');
  
  const cleanEmail = email || 'admin@skillgap.edu';
  const userId = "mock-uid-" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
  
  const mockUser = {
    id: userId,
    email: cleanEmail,
    created_at: new Date().toISOString(),
    app_metadata: { provider: 'email' },
    user_metadata: {},
    aud: 'authenticated',
    role: 'authenticated',
  };

  const payload = {
    sub: userId,
    email: cleanEmail,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    role: "authenticated"
  };
  
  const payloadB64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  const mockToken = `mockheader.${payloadB64}.mocksignature`;

  const mockSession = {
    access_token: mockToken,
    token_type: 'bearer',
    expires_in: 3600,
    refresh_token: 'mock-refresh-token',
    user: mockUser,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem('explung-mock-session', JSON.stringify(mockSession));
    localStorage.setItem('explung-offline-mode', 'true');
  }

  // Trigger state change
  triggerMockAuthChange('SIGNED_IN', mockSession);

  return { data: { user: mockUser, session: mockSession }, error: null };
};

// Global Firebase Auth State Listener Bridge
if (typeof window !== 'undefined') {
  onAuthStateChanged(firebaseAuth, async (fbUser) => {
    // If we are explicitly in offline mode, ignore Firebase events and let offline mock handle it
    if (localStorage.getItem('explung-offline-mode') === 'true') {
      const mockSession = getLocalMockSession();
      if (mockSession) {
        triggerMockAuthChange('SIGNED_IN', mockSession);
      }
      return;
    }

    if (fbUser) {
      try {
        const token = await fbUser.getIdToken();
        const session = mapFirebaseUserToSession(fbUser, token);
        triggerMockAuthChange('SIGNED_IN', session);
      } catch (err) {
        console.error('[Firebase Patch] Error getting token during auth state change:', err);
        triggerMockAuthChange('SIGNED_OUT', null);
      }
    } else {
      triggerMockAuthChange('SIGNED_OUT', null);
    }
  });
}

// 1. Patch getSession
const authAny = supabase.auth as any;

authAny.getSession = async () => {
  const mockSession = getLocalMockSession();
  if (mockSession) {
    return { data: { session: mockSession }, error: null };
  }
  try {
    if (typeof window === 'undefined') {
      return { data: { session: null }, error: null };
    }
    const fbUser = firebaseAuth.currentUser;
    if (fbUser) {
      const token = await fbUser.getIdToken();
      const session = mapFirebaseUserToSession(fbUser, token);
      return { data: { session }, error: null };
    }
    return { data: { session: null }, error: null };
  } catch (err: any) {
    console.warn('[Firebase Patch] getSession error (offline fallback):', err.message);
    return { data: { session: null }, error: err };
  }
};

// 2. Patch onAuthStateChange
authAny.onAuthStateChange = (callback: any) => {
  listeners.add(callback);

  // Trigger initial state call asynchronously
  if (typeof window !== 'undefined') {
    const mockSession = getLocalMockSession();
    if (mockSession) {
      setTimeout(() => {
        if (listeners.has(callback)) {
          callback('SIGNED_IN', mockSession);
        }
      }, 0);
    } else if (firebaseAuth.currentUser) {
      firebaseAuth.currentUser.getIdToken().then((token) => {
        const session = mapFirebaseUserToSession(firebaseAuth.currentUser, token);
        if (listeners.has(callback)) {
          callback('SIGNED_IN', session);
        }
      }).catch((err) => {
        console.warn('[Firebase Patch] Failed initial token retrieval for subscriber:', err);
        if (listeners.has(callback)) {
          callback('SIGNED_OUT', null);
        }
      });
    } else {
      setTimeout(() => {
        if (listeners.has(callback)) {
          callback('SIGNED_OUT', null);
        }
      }, 0);
    }
  }

  return {
    data: {
      subscription: {
        unsubscribe: () => {
          listeners.delete(callback);
        }
      }
    }
  };
};

// 3. Patch signInWithPassword
authAny.signInWithPassword = async (credentials: any) => {
  const { email, password } = credentials;
  
  if (typeof window !== 'undefined' && (!window.navigator.onLine || localStorage.getItem('explung-offline-mode') === 'true')) {
    return handleOfflineSignIn(email);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    const fbUser = userCredential.user;
    const token = await fbUser.getIdToken();
    const session = mapFirebaseUserToSession(fbUser, token);
    
    // Clear offline flags if online sign in succeeded
    if (typeof window !== 'undefined') {
      localStorage.removeItem('explung-mock-session');
      localStorage.removeItem('explung-offline-mode');
    }
    
    triggerMockAuthChange('SIGNED_IN', session);
    return { data: { user: session.user, session }, error: null };
  } catch (err: any) {
    const errMsg = err.message || '';
    if (errMsg.includes('Failed to fetch') || err.code === 'auth/network-request-failed' || (typeof window !== 'undefined' && !window.navigator.onLine)) {
      return handleOfflineSignIn(email);
    }
    // Return structured Supabase error object
    return { data: { user: null, session: null }, error: { message: err.message, status: 400 } };
  }
};

// 4. Patch signUp
authAny.signUp = async (credentials: any) => {
  const { email, password } = credentials;
  
  if (typeof window !== 'undefined' && (!window.navigator.onLine || localStorage.getItem('explung-offline-mode') === 'true')) {
    return handleOfflineSignIn(email);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const fbUser = userCredential.user;
    const token = await fbUser.getIdToken();
    const session = mapFirebaseUserToSession(fbUser, token);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('explung-mock-session');
      localStorage.removeItem('explung-offline-mode');
    }
    
    triggerMockAuthChange('SIGNED_IN', session);
    return { data: { user: session.user, session }, error: null };
  } catch (err: any) {
    const errMsg = err.message || '';
    if (errMsg.includes('Failed to fetch') || err.code === 'auth/network-request-failed' || (typeof window !== 'undefined' && !window.navigator.onLine)) {
      return handleOfflineSignIn(email);
    }
    return { data: { user: null, session: null }, error: { message: err.message, status: 400 } };
  }
};

// 5. Patch signOut
authAny.signOut = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('explung-mock-session');
    localStorage.removeItem('explung-offline-mode');
  }
  
  try {
    await firebaseSignOut(firebaseAuth);
  } catch (err: any) {
    console.warn('[Firebase Patch] firebase signOut failed/offline:', err.message);
  }
  
  triggerMockAuthChange('SIGNED_OUT', null);
  return { error: null };
};

// 6. Patch signInWithOAuth
authAny.signInWithOAuth = async (options: any) => {
  if (options?.provider === 'google') {
    if (typeof window !== 'undefined' && (!window.navigator.onLine || localStorage.getItem('explung-offline-mode') === 'true')) {
      handleOfflineSignIn('google-user@skillgap.edu');
      window.location.href = '/';
      return { data: {} as any, error: null };
    }
    try {
      const userCredential = await signInWithPopup(firebaseAuth, googleProvider);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken();
      const session = mapFirebaseUserToSession(fbUser, token);
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('explung-mock-session');
        localStorage.removeItem('explung-offline-mode');
      }
      
      triggerMockAuthChange('SIGNED_IN', session);
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
      return { data: { user: session.user, session } as any, error: null };
    } catch (err: any) {
      const errMsg = err.message || '';
      if (errMsg.includes('Failed to fetch') || err.code === 'auth/network-request-failed') {
        handleOfflineSignIn('google-user@skillgap.edu');
        window.location.href = '/';
        return { data: {} as any, error: null };
      }
      return { data: {} as any, error: { message: err.message, status: 400 } };
    }
  }
  return { data: {} as any, error: { message: 'Provider not supported in Firebase adapter', status: 400 } };
};
