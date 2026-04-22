import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Footer.module.css';

const thoughts = [
  '"The air we breathe is a shared responsibility — protect it for the next generation."',
  '"Clean air is not a luxury, it is a right."',
  '"Every breath you take is a reminder of what we stand to lose."',
  '"Pollution is nothing but resources we\'re not harvesting." — R. Buckminster Fuller',
];

export default function Footer() {
  const { pathname } = useLocation();
  const authPages = ['/login', '/register', '/'];
  if (authPages.includes(pathname)) return null;

  const quote = thoughts[Math.floor(Date.now() / 86400000) % thoughts.length];
  return (
    <footer className={styles.footer}>
      <p className={styles.quote}>{quote}</p>
      <p className={styles.copy}>© {new Date().getFullYear()} AirAware — Breathe Smart, Live Better</p>
    </footer>
  );
}
