import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BASE_URL from '../config';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, form);
      login(res.data.token, res.data.username);
      navigate('/location');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>🌬️</div>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to AirAware</p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.input} type="email" placeholder="Email address"
            value={form.email} onChange={set('email')} required />
          <input className={styles.input} type="password" placeholder="Password"
            value={form.password} onChange={set('password')} required />
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner}>⏳ Signing in...</span> : 'Sign In'}
          </button>
        </form>

        <p className={styles.link}>Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
}
