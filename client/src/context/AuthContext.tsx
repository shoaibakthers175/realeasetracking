import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('releasetrack_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    // Default demo user matching screenshot
    return {
      _id: 'default_shoaib_user',
      name: 'Shoaib Ahmed',
      email: 'shoaib@releasetrack.com',
      role: 'QA_ENGINEER',
      department: 'QA Automation & Releases',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('releasetrack_token') || 'demo_active_token';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('releasetrack_token', token);
    } else {
      localStorage.removeItem('releasetrack_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('releasetrack_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('releasetrack_user');
    }
  }, [user]);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.data) {
        setToken(res.data.token);
        setUser(res.data.user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('releasetrack_token');
      localStorage.removeItem('releasetrack_user');
    }
  };

  const switchRoleDemo = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getCurrentUser();
      if (res.success && res.data) {
        setUser(res.data);
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        switchRoleDemo,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
