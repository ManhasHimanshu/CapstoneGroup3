import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from '../styles/Navbar.module.css'; // module import

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`;

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link to="/" className={styles.brand}>
          Baseball Boys INC
        </Link>

        <button
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.menuIcon} aria-hidden="true" />
        </button>

        <nav
          id="primary-navigation"
          className={`${styles.links} ${open ? styles.open : ''}`}
          onClick={() => setOpen(false)}
        >
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/login" className={linkClass}>
            Login
          </NavLink>
          <NavLink to="/signup" className={linkClass}>
            Sign Up
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
