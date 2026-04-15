import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../config';
import styles from './Auth.module.css';

function validate({ username, email, password, confirmPassword }) {
  if (username.length < 4)
    return 'Username must be at least 4 characters.';
  if (!email.endsWith('@gmail.com'))
    return 'Email must be a @gmail.com address.';
  if (password.length < 6)
    return 'Password must be at least 6 characters.';
  const capitals = (password.match(/[A-Z]/g) || []).length;
  const numbers  = (password.match(/[0-9]/g) || []).length;
  if (capitals < 2)
    return 'Password must contain at least 2 uppercase letters.';
  if (numbers < 1)
    return 'Password must contain at least 1 number.';
  if (password !== confirmPassword)
    return 'Passwords do not match.';
  return null;
}

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate(form);
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      setError(msg === 'User already exists' ? 'User already registered.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>🌬️</div>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join AirAware today</p>

        {error   && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input className={styles.input} type="text" placeholder="Username (min 4 characters)"
            value={form.username} onChange={set('username')} required />
          <input className={styles.input} type="email" placeholder="Email (@gmail.com only)"
            value={form.email} onChange={set('email')} required />
          <input className={styles.input} type="password" placeholder="Password (min 6 chars, 2 uppercase, 1 number)"
            value={form.password} onChange={set('password')} required />
          <input className={styles.input} type="password" placeholder="Confirm Password"
            value={form.confirmPassword} onChange={set('confirmPassword')} required />
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? <span className={styles.spinner}>⏳ Creating account...</span> : 'Register'}
          </button>
        </form>

        <p className={styles.link}>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
