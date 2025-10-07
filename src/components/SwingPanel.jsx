import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Dashboard.module.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export default function SwingPanel() {
  const [latest, setLatest] = useState(null);
  const [recent, setRecent] = useState([]);
  const [liveStatus, setLiveStatus] = useState('connecting'); // connecting | live | polling | offline
  const esRef = useRef(null);
  const pollRef = useRef(null);
  const retryRef = useRef(0);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }
  async function fetchLast() {
    try {
      const r = await fetch(`${API_BASE}/last`, { cache: 'no-store' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const s = await r.json();
      if (s && s.peak_omega_rad_s) {
        setLatest(s);
        setRecent((prev) => (prev[0]?.id === s.id ? prev : [s, ...prev]).slice(0, 20));
      }
      retryRef.current = 0;
    } catch {
      const n = ++retryRef.current;
      if (n >= 6) {
        stopPolling();
        setLiveStatus('offline');
      }
    }
  }
  function startPolling() {
    stopPolling();
    setLiveStatus('polling');
    pollRef.current = setInterval(fetchLast, 1500);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const hist = await fetch(`${API_BASE}/swings?limit=20`, { cache: 'no-store' }).then((r) =>
          r.json()
        );
        if (!cancelled) {
          setRecent(hist);
          if (hist[0]) setLatest(hist[0]);
          else setLatest(await fetch(`${API_BASE}/last`).then((r) => r.json()));
        }
      } catch {}
    })();

    if ('EventSource' in window) {
      const es = new EventSource(`${API_BASE}/stream`);
      esRef.current = es;
      es.onopen = () => {
        stopPolling();
        setLiveStatus('live');
      };
      es.onmessage = (ev) => {
        try {
          const s = JSON.parse(ev.data);
          setLatest(s);
          setRecent((prev) => [s, ...prev].slice(0, 20));
        } catch {}
      };
      es.onerror = () => {
        es.close();
        startPolling();
      };
      return () => {
        es.close();
        stopPolling();
        cancelled = true;
      };
    } else {
      startPolling();
      return () => {
        stopPolling();
        cancelled = true;
      };
    }
  }, []);

  const pillClass =
    liveStatus === 'live'
      ? styles.pillLive
      : liveStatus === 'polling'
        ? styles.pillPoll
        : styles.pillOff;

  const stats = computeStats(recent);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2>Swing Summary</h2>
        <span className={`${styles.pill} ${pillClass}`}>
          {liveStatus === 'live' ? 'Live (SSE)' : liveStatus === 'polling' ? 'Polling' : 'Offline'}
        </span>
      </div>

      {/* Latest metrics */}
      <div className={styles.card}>
        <div className={styles.metricsGrid}>
          <Metric label="Duration" value={latest?.duration_ms} suffix="ms" />
          <Metric label="Peak ω" value={toFixed(latest?.peak_omega_rad_s, 3)} suffix="rad/s" />
          <Metric label="Time to Peak" value={latest?.t_to_peak_ms} suffix="ms" />
          <Metric
            label="Received"
            value={latest?.receivedAt ? new Date(latest.receivedAt).toLocaleString() : '—'}
          />
        </div>
      </div>

      {/* Insights + actions */}
      <div className={styles.card}>
        <div className={styles.cardHeaderRow}>
          <h3>Insights</h3>
          <div className={styles.actionsRow}>
            <button className={styles.smallBtn} onClick={() => exportCSV(recent)}>
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
            <span className={styles.kicker}>Best Peak ω</span>
            <strong>{toFixed(stats.bestPeak, 3)} rad/s</strong>
          </div>
          <div className={styles.insight}>
            <span className={styles.kicker}>Avg Peak ω</span>
            <strong>{toFixed(stats.avgPeak, 3)} rad/s</strong>
          </div>
          <div className={styles.insight}>
            <span className={styles.kicker}>Avg Duration</span>
            <strong>{toFixed(stats.avgDur, 0)} ms</strong>
          </div>
        </div>
        <MiniChart data={recent.map((s) => s.peak_omega_rad_s).slice(0, 20)} />
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
                <th>Peak ω (rad/s)</th>
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
                  <td>{toFixed(s.peak_omega_rad_s, 3)}</td>
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

/* ---------- helpers / subcomponents ---------- */
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

function computeStats(rows) {
  const count = rows.length;
  if (!count) return { count: 0, bestPeak: 0, avgPeak: 0, avgDur: 0 };
  let bestPeak = -Infinity,
    sumPeak = 0,
    sumDur = 0;
  for (const r of rows) {
    const p = Number(r.peak_omega_rad_s) || 0;
    const d = Number(r.duration_ms) || 0;
    if (p > bestPeak) bestPeak = p;
    sumPeak += p;
    sumDur += d;
  }
  return { count, bestPeak, avgPeak: sumPeak / count, avgDur: sumDur / count };
}

function exportCSV(rows) {
  if (!rows?.length) return;
  const header = [
    'id',
    'peak_omega_rad_s',
    'duration_ms',
    't_to_peak_ms',
    't_start_ms',
    't_end_ms',
    'receivedAt',
  ];
  const lines = [header.join(',')].concat(rows.map((r) => header.map((k) => r[k] ?? '').join(',')));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'swings.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function copyLatestJSON(obj) {
  if (!obj) return;
  navigator.clipboard?.writeText(JSON.stringify(obj, null, 2));
}

function MiniChart({ data }) {
  const w = 600,
    h = 120,
    pad = 8;
  if (!data?.length) return <div className={styles.chartEmpty}>No data yet.</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = Math.max(1e-6, max - min);
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
        <span>min {toFixed(min, 3)}</span>
        <span>max {toFixed(max, 3)}</span>
      </div>
    </div>
  );
}

const toFixed = (n, d = 2) =>
  typeof n === 'number' ? Number(n).toFixed(d).replace(/\.0+$/, '') : n;
