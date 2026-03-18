'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken, getToken, removeToken } from '@/lib/auth';
import type { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((res) => setUser(res.data.user))
      .catch(() => removeToken())
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, userData: User) {
    setToken(token);
    setUser(userData);
  }

  function logout() {
    removeToken();
    setUser(null);
    router.replace('/login');
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, loading, login, logout } },
    children
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
