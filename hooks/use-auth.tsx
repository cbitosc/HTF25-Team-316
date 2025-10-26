'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import api from '@/lib/api';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';

// User type matching backend schema
export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  display_name: string;
  role: 'student' | 'teacher' | 'admin';
  profile_picture?: string;
  phone_number?: string;
  student_id?: string;
  grade?: string;
  enrolled_courses?: string[];
  teacher_id?: string;
  department?: string;
  teaching_courses?: string[];
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password?: string;
  display_name: string;
  role: 'student' | 'teacher';
  student_id?: string;
  grade?: string;
  teacher_id?: string;
  department?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();

    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase - only sync if we have tokens
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            await syncUserFromBackend();
          } catch (error) {
            console.error('Failed to sync user from backend:', error);
            setUser(null);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } else {
        // User is signed out
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      await syncUserFromBackend();
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const syncUserFromBackend = async () => {
    try {
      // Check if we have an access token
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No access token found');
      }

      const { data } = await api.get('/auth/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (error) {
      // Clear tokens if sync fails
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Login with backend using Firebase token
      const { data } = await api.post('/auth/login/firebase', {
        firebase_token: idToken
      });

      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      return data.user;
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    try {
      // Two paths:
      // - If a Firebase user is already signed in (e.g., Google popup), don't create again.
      // - Otherwise, create with email/password.
      let current = auth.currentUser;
      if (!current) {
        if (!userData.password || userData.password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        const cred = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        current = cred.user;
        await updateProfile(current, { displayName: userData.display_name });
      }

      const idToken = await current.getIdToken();

      // Register with backend (creates MongoDB user)
      const { data } = await api.post('/auth/register', {
        ...userData,
        firebase_token: idToken,
      });

      // Step 5: Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      return data.user;
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Bubble up clear messages
      if (error?.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login.');
      }
      if (error?.code === 'auth/weak-password') {
        throw new Error('Password too weak. Use at least 6 characters.');
      }
      throw new Error(error?.response?.data?.detail || error.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Logout from backend
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      
      setUser(null);
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();

      // Login with backend using Firebase token
      let data: any;
      try {
        const resp = await api.post('/auth/login/firebase', { firebase_token: idToken });
        data = resp.data;
      } catch (e: any) {
        console.error('Backend login/firebase error:', e);
        
        // If user not found in our DB, surface a specific error so UI can guide to signup
        const status = e?.response?.status;
        if (status === 404) {
          const err: any = new Error('GOOGLE_USER_NOT_REGISTERED');
          err.email = firebaseUser.email;
          err.name = firebaseUser.displayName || firebaseUser.email?.split('@')[0];
          throw err;
        }
        
        // Provide detailed error message
        const errorDetail = e?.response?.data?.detail || e.message || 'Unknown error';
        throw new Error(`Backend authentication failed: ${errorDetail}`);
      }

      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      return data.user;
    } catch (error: any) {
      console.error('Google login failed:', error);
      
      // Re-throw special errors as-is
      if (error.message === 'GOOGLE_USER_NOT_REGISTERED') {
        throw error;
      }
      
      // Handle Firebase auth errors
      if (error.code) {
        const firebaseErrorMessages: Record<string, string> = {
          'auth/popup-closed-by-user': 'Login cancelled - popup was closed',
          'auth/popup-blocked': 'Popup was blocked by browser - please allow popups',
          'auth/cancelled-popup-request': 'Login cancelled',
          'auth/network-request-failed': 'Network error - please check your connection',
          'auth/internal-error': 'An internal error occurred - please try again',
          'auth/unauthorized-domain': 'This domain is not authorized for Google Sign-In',
        };
        
        const friendlyMessage = firebaseErrorMessages[error.code] || error.message;
        throw new Error(friendlyMessage);
      }
      
      // Generic error
      throw new Error(error.message || 'Google login failed');
    }
  };

  const refreshUser = async () => {
    await syncUserFromBackend();
  };

  return (
  <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
