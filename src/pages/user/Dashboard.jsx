// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import styles from '../../styles/Dashboard.module.css';
import SwingSerialPanel from '../../components/SwingSerialPanel.jsx';
import SwingPanel from '../../components/SwingPanel.jsx';

export default function Dashboard() {
  const [tab, setTab] = useState(() => localStorage.getItem('dashTab') || 'usb');
  const [measurementSystem, setMeasurementSystem] = useState('imperial');
  const [latestVideo, setLatestVideo] = useState(null);

  // Load settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setMeasurementSystem(settings.measurementSystem || 'imperial');
    }
  }, []);

  // Listen for real-time settings changes
  useEffect(() => {
    const handleSettingsChange = (event) => {
      const newSettings = event.detail;
      setMeasurementSystem(newSettings.measurementSystem || 'imperial');
    };

    window.addEventListener('settingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('settingsChanged', handleSettingsChange);
    };
  }, []);

  // Save tab to localStorage
  useEffect(() => {
    localStorage.setItem('dashTab', tab);
  }, [tab]);

  // Fetch latest video from backend
  useEffect(() => {
    const fetchLatestVideo = async () => {
      try {
        const res = await fetch('http://localhost:5000/latest-video');
        const data = await res.json();
        setLatestVideo(data.videoUrl);
      } catch (err) {
        console.error('Error fetching latest video:', err);
      }
    };

    fetchLatestVideo();

    // Refresh every 5 seconds
    const interval = setInterval(fetchLatestVideo, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.proThemeDark}>
      <div className={styles.dashWrap}>
        {/* ===== HEADER / TABS ===== */}
        <header className={styles.panelHeader} style={{ marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 0.9rem + 1vw, 1.6rem)' }}>
            Dashboard
          </h1>
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
        {tab === 'usb' 
          ? <SwingSerialPanel measurementSystem={measurementSystem} /> 
          : <SwingPanel measurementSystem={measurementSystem} />
        }

        {/* ===== LATEST VIDEO SECTION ===== */}
        <section className={styles.videoSection}>
          <h2 className={styles.howTitle}>Latest Swing Recording</h2>

          <div className={styles.videoCard}>
            {latestVideo ? (
              <video
                key={latestVideo}
                controls
                autoPlay
                muted
                className={styles.videoPlayer}
              >
                <source src={latestVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <p style={{ color: 'white' }}>No video available yet. Take a swing to record one!</p>
            )}
          </div>
        </section>

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