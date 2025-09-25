import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Landing.module.css';
import heroAvif from '../assets/photo-1684848310804-4abaf019c672.avif';

const testimonials = [
  {
    quote:
      'The tracker showed my attack angle drift in minutes. Two drills later, contact quality jumped immediately.',
    name: 'Coach Ramirez',
    role: 'Varsity Hitting Coach',
  },
  {
    quote:
      'I finally understand why my hard-hit % dipped. Clear numbers, simple cues. PR’d bat speed last weekend.',
    name: 'J. Collins',
    role: 'Collegiate OF',
  },
  {
    quote: 'Clean UI, fast feedback, and we own our data. Perfect for player development sessions.',
    name: 'C. Nguyen',
    role: 'Club Director',
  },
];

export default function Landing() {
  return (
    <main>
      {/* Full-bleed photo hero */}
      <section className={styles.heroBanner} aria-labelledby="hero-title">
        <img
          src={heroAvif}
          alt="Batter loading the swing in the box"
          className={styles.heroImg}
          loading="eager"
          decoding="async"
        />
        <span className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <h1 id="hero-title">Track your swing. Improve faster.</h1>
          <p className={styles.sub}>
            A bat tracker that turns every swing into clear, actionable feedback—built for hitters,
            coaches, and teams.
          </p>
          <div className={styles.ctaRow}>
            <Link to="/signup" className="btn btn-secondary">
              Get started
            </Link>
            <Link to="/dashboard" className="btn">
              See demo
            </Link>
          </div>
        </div>
      </section>

      {/* Main content width */}
      <div className={styles.wrap}>
        {/* Three key points */}
        <section className={styles.features} aria-label="Highlights">
          <article className={styles.card}>
            <span className={styles.kicker}>Accurate</span>
            <h3>Metrics that matter</h3>
            <p>
              Bat speed, attack angle, path efficiency, contact quality—measured and visualized in
              real time.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.kicker}>Actionable</span>
            <h3>Doable adjustments</h3>
            <p>
              Simple cues and drills tailored to the patterns we detect—less guesswork, more
              progress.
            </p>
          </article>
          <article className={styles.card}>
            <span className={styles.kicker}>Private</span>
            <h3>Your data stays yours</h3>
            <p>
              Export anytime. Team spaces and permissions keep athletes in control of their
              information.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
