import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('userToken');
    const userDataStr = localStorage.getItem('userData');
    
    if (token && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUser({ token, ...userData });
      } catch (err) {
        // Clear corrupt storage
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser({ token, ...userData });
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
  };

  const updateProfile = (updatedData) => {
    const currentToken = localStorage.getItem('userToken');
    const existingDataStr = localStorage.getItem('userData');
    if (existingDataStr) {
      const existingData = JSON.parse(existingDataStr);
      const newData = { ...existingData, ...updatedData };
      localStorage.setItem('userData', JSON.stringify(newData));
      setUser({ token: currentToken, ...newData });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
