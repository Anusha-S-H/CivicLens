import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, UserRole } from '@/lib/mockData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  preferredRole: UserRole | null;
  setPreferredRole: (role: UserRole) => void;
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('civiclens_user');
    if (stored) {
      try {
        return JSON.parse(stored) as User;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [preferredRole, setPreferredRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem('civiclens_role');
    return stored ? (stored as UserRole) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('civiclens_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('civiclens_user');
    }
  }, [user]);

  useEffect(() => {
    if (preferredRole) {
      localStorage.setItem('civiclens_role', preferredRole);
    }
  }, [preferredRole]);

  const setPreferredRole = (role: UserRole) => {
    setPreferredRoleState(role);
  };

  const login = async (email: string, password: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Check if role matches
        if (data.user.role !== role) {
          return { success: false, message: `This account is registered as ${data.user.role}, not ${role}.` };
        }

        const userObj: User = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        setUser(userObj);
        return { success: true };
      } else {
        return { success: false, message: data.error || 'Invalid email or password.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please check if the backend is running.' };
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userObj: User = {
          id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role
        };
        
        setUser(userObj);
        return { success: true };
      } else {
        return { success: false, message: data.error || 'Signup failed.' };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please check if the backend is running.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('civiclens_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, preferredRole, setPreferredRole }}>
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
