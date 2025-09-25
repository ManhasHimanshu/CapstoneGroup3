import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Footer.module.css';

/* minimal inline icons (no deps) */
const GitHub = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.61-4.04-1.61-.55-1.41-1.35-1.79-1.35-1.79-1.1-.75.08-.73.08-.73 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.84 1.32 3.53 1 .11-.8.42-1.32.77-1.63-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.16 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.29-1.23 3.29-1.23.67 1.64.26 2.86.13 3.16.78.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.38.82 1.12.82 2.26v3.35c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
  </svg>
);
const LinkOut = () => (
  <svg
    className={styles.icon}
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17l10-10M14 7h6v6" />
    <path d="M21 14v6a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V4a1 1 0 0 1 1-1h6" />
  </svg>
);

/* floating back-to-top */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`${styles.backTop} ${show ? styles.backTopShow : ''}`}
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      title="Back to top"
    >
      ↑
    </button>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <footer className={styles.footer} aria-labelledby="footer-heading">
        <div className={styles.inner}>
          <div className={styles.group}>
            <Link to="/" className={styles.brand}>
              Baseball Boys INC
            </Link>
          </div>

          <nav className={`${styles.group} ${styles.links}`} aria-label="Site links">
            <h4 id="footer-heading">Explore</h4>
            <Link to="/" className={styles.link}>
              Home
            </Link>
            <Link to="/login" className={styles.link}>
              Login
            </Link>
            <Link to="/signup" className={styles.link}>
              Sign Up
            </Link>
            <Link to="/dashboard" className={styles.link}>
              Dashboard
            </Link>
          </nav>

          <div className={styles.group} aria-label="Social links">
            <h4>Repo</h4>
            <div className={styles.social}>
              <a
                className={styles.iconBtn}
                href="https://github.com/ManhasHimanshu/CapstoneGroup3"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub repository"
              >
                <GitHub />
              </a>
              <a
                className={styles.iconBtn}
                href="https://github.com/ManhasHimanshu/CapstoneGroup3/tree/Website"
                target="_blank"
                rel="noreferrer"
                aria-label="Open Website branch"
              >
                <LinkOut />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {year} Baseball Boys INC</span>
          <span className={styles.dot} />
          <span>All rights reserved</span>
        </div>
      </footer>

      <BackToTop />
    </>
  );
}
