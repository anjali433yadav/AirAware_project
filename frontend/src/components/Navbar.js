import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { isAuth, username, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Hide navbar on auth pages and home (home has its own nav)
  const authPages = ['/login', '/register', '/'];
  if (authPages.includes(pathname)) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <Link to="/dashboard" className={styles.brand}>
        🌬️ AirAware
      </Link>
      {isAuth && (
        <div className={styles.links}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/favorites">Favorites</Link>
          <span className={styles.user}>👤 {username}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      )}
    </nav>
  );
}
