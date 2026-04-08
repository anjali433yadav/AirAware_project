import React from 'react';
import styles from './Spinner.module.css';

export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.ring}>
        <div /><div /><div /><div />
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
