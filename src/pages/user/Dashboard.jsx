// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import styles from '../../styles/Dashboard.module.css';
import SwingSerialPanel from '../../components/SwingSerialPanel.jsx';
import SwingPanel from '../../components/SwingPanel.jsx';

export default function Dashboard() {
  const [tab, setTab] = useState(() => localStorage.getItem('dashTab') || 'usb');
  useEffect(() => {
    localStorage.setItem('dashTab', tab);
  }, [tab]);

  return (
    <div className={styles.proThemeDark}>
      <div className={styles.dashWrap}>
        {/* ===== HEADER / TABS ===== */}
        <header className={styles.panelHeader} style={{ marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 0.9rem + 1vw, 1.6rem)' }}>Dashboard</h1>
          <div className={styles.actionsRow}>
            <button
              className={styles.tabBtn}
              aria-pressed={tab === 'usb'}
              onClick={() => setTab('usb')}
              title="Connect over USB with Web Serial"
            >
              USB (Web Serial)
            </button>
            <button
              className={styles.tabBtn}
              aria-pressed={tab === 'api'}
              onClick={() => setTab('api')}
              title="Receive swings from your Node server"
            >
              Wi-Fi / API
            </button>
          </div>
        </header>

        {/* ===== LIVE PANELS ===== */}
        {tab === 'usb' ? <SwingSerialPanel /> : <SwingPanel />}

        {/* ===== HOW IT WORKS SECTION ===== */}
        <section className={styles.howItWorksSection}>
          <h2 className={styles.howTitle}>How it Works</h2>

          <div className={styles.howGrid}>
            <div className={styles.howCard}>
              <h3>1. Connect Your Device</h3>
              <p>
                Use USB (Web Serial) or Wi-Fi to link your sensor with the dashboard. Data starts
                streaming instantly once connected.
              </p>
            </div>

            <div className={styles.howCard}>
              <h3>2. Take Swings</h3>
              <p>
                The sensor captures bat speed, attack angle, and real-time motion every time you
                swing.
              </p>
            </div>

            <div className={styles.howCard}>
              <h3>3. Review Your Metrics</h3>
              <p>
                Analyze visuals, track improvements, and export swing data for deeper coaching
                insights.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
