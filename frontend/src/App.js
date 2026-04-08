import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import LocationGate from './pages/LocationGate';
import Dashboard from './pages/Dashboard';
import DeniedPage from './pages/DeniedPage';
import CityDetail from './pages/CityDetail';
import Favorites from './pages/Favorites';

const AUTH_PAGES = ['/login', '/register'];

function BackgroundSwitcher() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (AUTH_PAGES.includes(pathname)) {
      document.body.classList.remove('bg-app');
    } else {
      document.body.classList.add('bg-app');
    }
  }, [pathname]);
  return null;
}

function PrivateRoute({ children }) {
  const { isAuth } = useAuth();
  return isAuth ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <BackgroundSwitcher />
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/location" element={<PrivateRoute><LocationGate /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/denied" element={<PrivateRoute><DeniedPage /></PrivateRoute>} />
          <Route path="/city/:cityName" element={<PrivateRoute><CityDetail /></PrivateRoute>} />
          <Route path="/favorites" element={<PrivateRoute><Favorites /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}
