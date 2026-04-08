import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const login = (tok, user) => {
    setToken(tok);
    setUsername(user);
    localStorage.setItem('token', tok);
    localStorage.setItem('username', user);
  };

  const logout = () => {
    setToken('');
    setUsername('');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  };

  return (
    <AuthContext.Provider value={{ token, username, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
