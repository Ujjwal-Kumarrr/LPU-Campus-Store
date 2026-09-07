import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lpu_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [demoUsers, setDemoUsers] = useState([]);

  useEffect(() => {
    // Fetch demo users from backend for quick switcher
    fetch('/api/auth/demo-users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDemoUsers(data);
          // If no user is logged in, auto-login as first demo user for smooth testing
          if (!user && data.length > 0) {
            setUser(data[0]);
            localStorage.setItem('lpu_user', JSON.stringify(data[0]));
          }
        }
      })
      .catch(err => console.error('Error loading demo users', err));
  }, []);

  const login = async (identifier, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to login');
    }
    setUser(data.user);
    localStorage.setItem('lpu_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to register');
    }
    setUser(data.user);
    localStorage.setItem('lpu_user', JSON.stringify(data.user));
    return data.user;
  };

  const switchUser = (selectedUser) => {
    setUser(selectedUser);
    localStorage.setItem('lpu_user', JSON.stringify(selectedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lpu_user');
  };

  return (
    <AuthContext.Provider value={{ user, demoUsers, login, register, logout, switchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
