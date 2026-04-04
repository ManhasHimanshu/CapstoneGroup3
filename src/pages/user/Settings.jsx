// src/pages/user/Settings.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../../styles/Settings.module.css';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    defaultTab: 'usb',
    theme: 'dark',
    autoConnect: false,
    dataRetention: '30days',
    measurementSystem: 'imperial'
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    // Also update the default tab preference
    localStorage.setItem('dashTab', settings.defaultTab);
  }, [settings]);

  const handleSettingChange = (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    setSettings(newSettings);
    
    // Dispatch a custom event when settings change
    const event = new CustomEvent('settingsChanged', { 
      detail: newSettings
    });
    window.dispatchEvent(event);
  };

  const handleReset = () => {
    const defaultSettings = {
      defaultTab: 'usb',
      theme: 'dark',
      autoConnect: false,
      dataRetention: '30days',
      measurementSystem: 'imperial'
    };
    setSettings(defaultSettings);
    
    // Dispatch reset event
    const event = new CustomEvent('settingsChanged', { 
      detail: defaultSettings
    });
    window.dispatchEvent(event);
  };

  return (
    <div className={`${styles.settingsPage} ${styles[`theme${settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}`]}`}>
      <div className={styles.settingsContainer}>
        {/* Header */}
        <header className={styles.settingsHeader}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
          >
            ← Back
          </button>
          <h1>Dashboard Settings</h1>
          <div className={styles.headerActions}>
            <button 
              className={styles.resetButton}
              onClick={handleReset}
            >
              Reset to Defaults
            </button>
          </div>
        </header>

        {/* Settings Grid */}
        <div className={styles.settingsGrid}>
          {/* Default Tab Setting */}
          <div className={styles.settingCard}>
            <h3>Default Dashboard Tab</h3>
            <p>Choose which tab opens first when you visit the dashboard</p>
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name="defaultTab"
                  value="usb"
                  checked={settings.defaultTab === 'usb'}
                  onChange={(e) => handleSettingChange('defaultTab', e.target.value)}
                />
                <span className={styles.optionText}>USB (Web Serial)</span>
              </label>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name="defaultTab"
                  value="api"
                  checked={settings.defaultTab === 'api'}
                  onChange={(e) => handleSettingChange('defaultTab', e.target.value)}
                />
                <span className={styles.optionText}>Wi-Fi / API</span>
              </label>
            </div>
          </div>

          {/* Theme Setting */}
          <div className={styles.settingCard}>
            <h3>Theme</h3>
            <p>Choose your preferred color theme</p>
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={settings.theme === 'dark'}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                />
                <span className={styles.optionText}>Dark Theme</span>
              </label>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={settings.theme === 'light'}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                />
                <span className={styles.optionText}>Light Theme</span>
              </label>
            </div>
          </div>

          {/* Measurement System */}
          <div className={styles.settingCard}>
            <h3>Measurement System</h3>
            <p>Choose your preferred units for measurements</p>
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name="measurementSystem"
                  value="imperial"
                  checked={settings.measurementSystem === 'imperial'}
                  onChange={(e) => handleSettingChange('measurementSystem', e.target.value)}
                />
                <span className={styles.optionText}>Imperial (mph, feet)</span>
              </label>
              <label className={styles.optionLabel}>
                <input
                  type="radio"
                  name="measurementSystem"
                  value="metric"
                  checked={settings.measurementSystem === 'metric'}
                  onChange={(e) => handleSettingChange('measurementSystem', e.target.value)}
                />
                <span className={styles.optionText}>Metric (km/h, meters)</span>
              </label>
            </div>
          </div>

          {/* Toggle Settings */}
          <div className={styles.settingCard}>
            <h3>Connection</h3>
            <p>Automatically attempt connection when dashboard loads</p>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={settings.autoConnect}
                onChange={(e) => handleSettingChange('autoConnect', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
              Auto-connect
            </label>
          </div>

          {/* Data Retention */}
          <div className={styles.settingCard}>
            <h3>Data Retention</h3>
            <p>How long to keep your swing data</p>
            <select 
              className={styles.selectInput}
              value={settings.dataRetention}
              onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
            >
              <option value="7days">7 Days</option>
              <option value="30days">30 Days</option>
              <option value="90days">90 Days</option>
              <option value="1year">1 Year</option>
              <option value="forever">Keep Forever</option>
            </select>
          </div>
        </div>

        {/* Current Settings Summary */}
        <div className={styles.settingsSummary}>
          <h3>Current Settings</h3>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span>Default Tab:</span>
              <strong>{settings.defaultTab === 'usb' ? 'USB (Web Serial)' : 'Wi-Fi / API'}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Theme:</span>
              <strong>{settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1)}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Measurement:</span>
              <strong>{settings.measurementSystem === 'imperial' ? 'Imperial' : 'Metric'}</strong>
            </div>
            <div className={styles.summaryItem}>
              <span>Auto-connect:</span>
              <strong>{settings.autoConnect ? 'Enabled' : 'Disabled'}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}