import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/authApi';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      // Optionally verify token by fetching user
      getCurrentUser(storedToken)
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('auth_token');
          setToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const setAuthToken = (newToken) => {
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    }
  };

  const setAuthUser = (userData) => {
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    setAuthToken,
    setAuthUser,
    clearAuth,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
