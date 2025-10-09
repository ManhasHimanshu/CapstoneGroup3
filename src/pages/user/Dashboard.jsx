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
      {/* swap to styles.proThemeLight if you prefer */}
      <div className={styles.dashWrap}>
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

        {tab === 'usb' ? <SwingSerialPanel /> : <SwingPanel />}
      </div>
    </div>
  );
}
