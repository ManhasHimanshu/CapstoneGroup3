import { useState } from 'react';
import styles from '../../styles/Dashboard.module.css';
import SwingPanel from '../../components/SwingPanel.jsx';
import SwingSerialPanel from '../../components/SwingSerialPanel.jsx';

export default function Dashboard() {
  // default to USB so we don't request /api when the server isn't running
  const [mode, setMode] = useState('usb'); // 'usb' or 'api'

  return (
    <main className={styles.root}>
      <section className={styles.header}>
        <div className={styles.headerInner}>
          <h1>Dashboard</h1>
          <p>Live swing analytics from your ESP32 sensor.</p>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'api' ? styles.tabActive : ''}`}
              onClick={() => setMode('api')}
              type="button"
            >
              API (Wi-Fi/SoftAP)
            </button>
            <button
              className={`${styles.tab} ${mode === 'usb' ? styles.tabActive : ''}`}
              onClick={() => setMode('usb')}
              type="button"
            >
              USB (Web Serial)
            </button>
          </div>
        </div>
      </section>

      <div className={styles.wrap}>{mode === 'api' ? <SwingPanel /> : <SwingSerialPanel />}</div>
    </main>
  );
}
