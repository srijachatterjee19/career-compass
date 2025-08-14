// src/contexts/AuthContext.tsx
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { registerUser, loginUser, logoutUser, getCurrentUser } from '@/services/auth';
import { usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Only check auth status if we're not on login/signup pages
    // and if there's a stored user in localStorage
    const shouldCheckAuth = !pathname?.includes('/login') && 
                           !pathname?.includes('/signup') && 
                           localStorage.getItem('careerCompassUser');
    
    if (shouldCheckAuth) {
      checkAuthStatus();
    } else {
      // If on login/signup or no stored user, just set loading to false
      setLoading(false);
    }
  }, [pathname]);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      // User not authenticated, clear any stale data
      setUser(null);
      localStorage.removeItem('careerCompassUser');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('🔍 Attempting login for:', email);
      const response = await loginUser({ email, password });
      console.log('✅ Login response:', response);
      
      setUser(response.user);
      localStorage.setItem('careerCompassUser', JSON.stringify(response.user));
      
      console.log('✅ User state updated, user:', response.user);
      console.log('✅ LocalStorage updated');
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const response = await registerUser({ 
        email, 
        password, 
        display_name: displayName,
        role: 'user'
      });
      
      console.log('✅ Signup response:', response);
      
      // Set the user immediately after successful registration
      setUser(response.user);
      localStorage.setItem('careerCompassUser', JSON.stringify(response.user));
      
      // Check if we can get the current user to verify session
      try {
        const currentUser = await getCurrentUser();
        console.log('✅ Current user after signup:', currentUser);
      } catch (error) {
        console.warn('⚠️ Could not get current user after signup:', error);
      }
      
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem('careerCompassUser');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      localStorage.removeItem('careerCompassUser');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
