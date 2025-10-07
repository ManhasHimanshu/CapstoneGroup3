import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Dashboard.module.css';
import Orientation3D from './Orientation3D.jsx';

const MPH_PER_MS = 2.23694; // m/s -> mph
const toMph = (omegaRad, radiusCm) =>
  typeof omegaRad === 'number' ? omegaRad * (radiusCm / 100) * MPH_PER_MS : null;

export default function SwingSerialPanel() {
  const [supported, setSupported] = useState(false);
  const [connected, setConnected] = useState(false);
  const [latest, setLatest] = useState(null);
  const [recent, setRecent] = useState([]);
  const [quat, setQuat] = useState(null);
  const [radiusCm, setRadiusCm] = useState(() => {
    const v = Number(localStorage.getItem('barrelRadiusCm'));
    return Number.isFinite(v) && v > 0 ? v : 60; // default ~60 cm
  });

  // Demo mode
  const [demoOn, setDemoOn] = useState(false);
  const demoRef = useRef(null);

  // Serial refs
  const readerRef = useRef(null);
  const portRef = useRef(null);
  const cancelReadRef = useRef(false);

  useEffect(() => {
    setSupported('serial' in navigator);
  }, []);
  useEffect(() => {
    localStorage.setItem('barrelRadiusCm', String(radiusCm));
  }, [radiusCm]);
  useEffect(() => () => stopDemo(), []); // cleanup demo on unmount

  async function connect() {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;

      const decoder = new TextDecoderStream();
      const inputDone = port.readable.pipeTo(decoder.writable).catch(() => {});
      const reader = decoder.readable.getReader();
      readerRef.current = reader;

      cancelReadRef.current = false;
      setConnected(true);

      let buffer = '';
      while (!cancelReadRef.current) {
        const { value, done } = await reader.read();
        if (done || cancelReadRef.current) break;
        if (!value) continue;
        buffer += value;

        let nl;
        while ((nl = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          handleLine(line);
        }
      }

      try {
        await reader.cancel();
      } catch {}
      try {
        await inputDone;
      } catch {}
    } catch (e) {
      console.error(e);
      disconnect();
    }
  }

  async function disconnect() {
    try {
      cancelReadRef.current = true;
    } catch {}
    try {
      await readerRef.current?.releaseLock();
    } catch {}
    try {
      await portRef.current?.close();
    } catch {}
    readerRef.current = null;
    portRef.current = null;
    setConnected(false);
  }

  function handleLine(line) {
    const msg = extractJSON(line) || (line.startsWith('{') ? tryParse(line) : null);

    if (!msg) return;

    if (msg.type === 'att' && Array.isArray(msg.q) && msg.q.length === 4) {
      setQuat(msg.q);
      return;
    }

    if (msg.type === 'swing_summary') {
      setLatest(msg);
      setRecent((prev) => [msg, ...prev].slice(0, 20));
      return;
    }
  }

  // ---- Demo mode ----
  function startDemo() {
    stopDemo();
    setDemoOn(true);
    if (connected) disconnect();

    let angle = 0;
    demoRef.current = setInterval(() => {
      const now = Date.now();

      // Fake orientation
      angle += 0.08;
      const q = quatFromEuler(0.15 * Math.sin(angle * 0.6), 0, angle % (Math.PI * 2));
      setQuat(q);

      // Fake swing
      const peak_omega_rad_s = 12 + Math.random() * 18; // 12..30 rad/s
      const duration_ms = 220 + Math.round(Math.random() * 140);
      const t_to_peak_ms = 80 + Math.round(Math.random() * 100);

      const s = {
        type: 'swing_summary',
        id: `${now}-${Math.random().toString(36).slice(2, 6)}`,
        t_start_ms: now - duration_ms,
        t_end_ms: now,
        duration_ms,
        peak_omega_rad_s,
        t_to_peak_ms,
        receivedAt: now,
      };
      setLatest(s);
      setRecent((prev) => [s, ...prev].slice(0, 20));
    }, 1200);
  }

  function stopDemo() {
    if (demoRef.current) {
      clearInterval(demoRef.current);
      demoRef.current = null;
    }
    setDemoOn(false);
  }

  // ---- Stats ----
  const stats = computeStats(recent, radiusCm);
  const mphLatest = toMph(latest?.peak_omega_rad_s, radiusCm);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Serial Live (USB)</h2>
        <div className={styles.actionsRow}>
          {!supported && <span className={styles.pill}>Web Serial not supported</span>}
          {supported && !connected && !demoOn && (
            <button className={styles.tabBtn} onClick={connect}>
              Connect
            </button>
          )}
          {supported && connected && (
            <button className={styles.tabBtn} onClick={disconnect}>
              Disconnect
            </button>
          )}
          {!demoOn ? (
            <button className={styles.tabBtn} onClick={startDemo}>
              Start demo
            </button>
          ) : (
            <button className={styles.tabBtn} onClick={stopDemo}>
              Stop demo
            </button>
          )}
        </div>
      </div>

      {/* >>> New split layout: Orientation (left) + Settings & Metrics (right) */}
      <div className={styles.rowSplit}>
        {/* Left: 3D orientation */}
        <div className={styles.card}>
          <div className={styles.cardHeaderRow}>
            <h3>Orientation</h3>
          </div>
          <Orientation3D quat={quat} height={300} />
        </div>

        {/* Right: stack settings + latest metrics */}
        <div className={styles.stack}>
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h3>Speed Settings</h3>
            </div>
            <div className={styles.settingsRow}>
              <label>
                Barrel radius (cm)
                <input
                  type="number"
                  min="20"
                  max="90"
                  step="1"
                  className={styles.numberInput}
                  value={radiusCm}
                  onChange={(e) => setRadiusCm(Number(e.target.value))}
                  title="Distance from swing axis to the barrel point you care about"
                />
              </label>
              <div className={styles.helpText}>
                We convert ω→mph using v = ω · r. Default is 60 cm near the barrel.
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <h3>Latest Metrics</h3>
            </div>
            <div className={styles.bigMetricLabel}>Est. Barrel Speed</div>
            <div className={styles.bigMetric}>
              {mphLatest != null ? `${toFixed(mphLatest, 1)} mph` : '—'}
            </div>
            <div className={styles.metricsGrid} style={{ marginTop: 10 }}>
              <Metric label="Duration" value={latest?.duration_ms} suffix="ms" />
              <Metric label="Time to Peak" value={latest?.t_to_peak_ms} suffix="ms" />
              <Metric
                label="(Raw) Peak ω"
                value={toFixed(latest?.peak_omega_rad_s, 3)}
                suffix="rad/s"
              />
              <Metric
                label="Received"
                value={latest?.receivedAt ? new Date(latest.receivedAt).toLocaleString() : '—'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Insights + chart */}
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h3>Insights</h3>
          <div className={styles.actionsRow}>
            <button className={styles.smallBtn} onClick={() => exportCSV(recent, radiusCm)}>
              Export CSV
            </button>
            <button className={styles.smallBtn} onClick={() => copyLatestJSON(latest)}>
              Copy latest JSON
            </button>
          </div>
        </div>
        <div className={styles.insightsGrid}>
          <div className={styles.insight}>
            <span className={styles.kicker}>Swings</span>
            <strong>{stats.count}</strong>
          </div>
          <div className={styles.insight}>
            <span className={styles.kicker}>Best Speed</span>
            <strong>{toFixed(stats.bestMph, 1)} mph</strong>
          </div>
          <div className={styles.insight}>
            <span className={styles.kicker}>Avg Speed</span>
            <strong>{toFixed(stats.avgMph, 1)} mph</strong>
          </div>
          <div className={styles.insight}>
            <span className={styles.kicker}>Avg Duration</span>
            <strong>{toFixed(stats.avgDur, 0)} ms</strong>
          </div>
        </div>
        <MiniChart
          data={recent.map((s) => toMph(s.peak_omega_rad_s, radiusCm)).slice(0, 20)}
          unit="mph"
        />
      </div>

      {/* Recent table */}
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h3>Recent Swings</h3>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Speed (mph)</th>
                <th>Duration (ms)</th>
                <th>t→Peak (ms)</th>
                <th>Start (ms)</th>
                <th>End (ms)</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>
                    No swings yet.
                  </td>
                </tr>
              )}
              {recent.map((s, i) => (
                <tr key={s.id || i}>
                  <td>{recent.length - i}</td>
                  <td>{toFixed(toMph(s.peak_omega_rad_s, radiusCm), 1)}</td>
                  <td>{s.duration_ms}</td>
                  <td>{s.t_to_peak_ms}</td>
                  <td>{s.t_start_ms}</td>
                  <td>{s.t_end_ms}</td>
                  <td>{s.receivedAt ? new Date(s.receivedAt).toLocaleTimeString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/* ---------------- helpers / small components ---------------- */

function Metric({ label, value, suffix }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>
        {value ?? '—'}
        {value != null && suffix ? ` ${suffix}` : ''}
      </div>
    </div>
  );
}

function computeStats(rows, radiusCm) {
  const count = rows.length;
  if (!count) return { count: 0, bestMph: 0, avgMph: 0, avgDur: 0 };
  let bestMph = -Infinity,
    sumMph = 0,
    sumDur = 0;
  for (const r of rows) {
    const mph = toMph(Number(r.peak_omega_rad_s) || 0, radiusCm);
    const d = Number(r.duration_ms) || 0;
    if (mph > bestMph) bestMph = mph;
    sumMph += mph;
    sumDur += d;
  }
  return { count, bestMph, avgMph: sumMph / count, avgDur: sumDur / count };
}

function exportCSV(rows, radiusCm) {
  if (!rows?.length) return;
  const header = [
    'id',
    'speed_mph',
    'peak_omega_rad_s',
    'duration_ms',
    't_to_peak_ms',
    't_start_ms',
    't_end_ms',
    'receivedAt',
  ];
  const lines = [header.join(',')].concat(
    rows.map((r) =>
      [
        r.id || '',
        toMph(r.peak_omega_rad_s, radiusCm)?.toFixed(3) ?? '',
        r.peak_omega_rad_s ?? '',
        r.duration_ms ?? '',
        r.t_to_peak_ms ?? '',
        r.t_start_ms ?? '',
        r.t_end_ms ?? '',
        r.receivedAt ?? '',
      ].join(',')
    )
  );
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'swings.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function copyLatestJSON(obj) {
  if (obj) navigator.clipboard?.writeText(JSON.stringify(obj, null, 2));
}

function MiniChart({ data, unit }) {
  const w = 600,
    h = 120,
    pad = 8;
  if (!data?.length) return <div className={styles.chartEmpty}>No data yet.</div>;
  const max = Math.max(...data),
    min = Math.min(...data),
    span = Math.max(1e-6, max - min);
  const stepX = (w - pad * 2) / Math.max(1, data.length - 1);
  const y = (v) => h - pad - ((v - min) / span) * (h - pad * 2);
  const pts = data.map((v, i) => `${pad + i * stepX},${y(v)}`).join(' ');
  const d = 'M ' + pts.replaceAll(' ', ' L ');
  return (
    <div className={styles.chartWrap}>
      <svg viewBox={`0 0 ${w} ${h}`} className={styles.chart}>
        <path d={d} className={styles.chartPath} />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className={styles.chartAxis} />
      </svg>
      <div className={styles.chartLegend}>
        <span>
          min {toFixed(min, 1)} {unit}
        </span>
        <span>
          max {toFixed(max, 1)} {unit}
        </span>
      </div>
    </div>
  );
}

const toFixed = (n, d = 2) =>
  typeof n === 'number' ? Number(n).toFixed(d).replace(/\.0+$/, '') : n;
const tryParse = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};
function extractJSON(line) {
  const a = line.indexOf('{'),
    b = line.lastIndexOf('}');
  return a >= 0 && b > a ? tryParse(line.slice(a, b + 1)) : null;
}

// Euler XYZ -> quaternion [w,x,y,z] for demo orientation
function quatFromEuler(roll, pitch, yaw) {
  const cr = Math.cos(roll / 2),
    sr = Math.sin(roll / 2);
  const cp = Math.cos(pitch / 2),
    sp = Math.sin(pitch / 2);
  const cy = Math.cos(yaw / 2),
    sy = Math.sin(yaw / 2);
  const w = cr * cp * cy + sr * sp * sy;
  const x = sr * cp * cy - cr * sp * sy;
  const y = cr * sp * cy + sr * cp * sy;
  const z = cr * cp * sy - sr * sp * cy;
  return [w, x, y, z];
}
