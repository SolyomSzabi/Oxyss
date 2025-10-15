import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [barberData, setBarberData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('barber_token');
    const barberId = localStorage.getItem('barber_id');
    const barberName = localStorage.getItem('barber_name');

    if (token && barberId && barberName) {
      setIsAuthenticated(true);
      setBarberData({
        id: barberId,
        name: barberName,
        token: token
      });
    } else {
      setIsAuthenticated(false);
      setBarberData(null);
    }
    setLoading(false);
  }, []);

  const login = (token, barberId, barberName) => {
    localStorage.setItem('barber_token', token);
    localStorage.setItem('barber_id', barberId);
    localStorage.setItem('barber_name', barberName);
    
    setIsAuthenticated(true);
    setBarberData({
      id: barberId,
      name: barberName,
      token: token
    });
  };

  const logout = () => {
    localStorage.removeItem('barber_token');
    localStorage.removeItem('barber_id');
    localStorage.removeItem('barber_name');
    
    setIsAuthenticated(false);
    setBarberData(null);
  };

  const value = {
    isAuthenticated,
    barberData,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};