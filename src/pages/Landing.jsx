import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Landing.module.css';

import heroAvif from '../assets/photo-1684848310804-4abaf019c672.avif';
import stadiumBg from '../assets/pexels-punttim-139762.jpg';

export default function Landing() {
  const [showSplash, setShowSplash] = useState(false);
  const stepRefs = useRef([]);

  // Splash screen logic
  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem('hasShownSplash');

    if (!hasShownSplash) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem('hasShownSplash', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Step reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.stepReveal);
          }
        });
      },
      { threshold: 0.25 }
    );

    stepRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main>
      {/* ========================= */}
      {/* SPLASH SCREEN             */}
      {/* ========================= */}
      {showSplash && (
        <div
          className={styles.splashScreen}
          style={{ animationDuration: '4s', animationTimingFunction: 'ease-in-out' }}
        >
          <div className={styles.splashContent}>
            <iframe
              src="/splash_screens/official_logo/index.html"
              title="Splash Screen"
              allow="autoplay"
              className={styles.splashIframe}
            />
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* HERO SECTION              */}
      {/* ========================= */}
      <section className={styles.heroBanner} aria-labelledby="hero-title">
        <img
          src={heroAvif}
          alt="Batter preparing to swing"
          className={styles.heroImg}
          loading="eager"
          decoding="async"
        />

        <span className={styles.heroOverlay}></span>

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

      {/* ========================= */}
      {/* FEATURES SECTION          */}
      {/* ========================= */}
      <div className={`${styles.wrap} ${styles.section}`}>
        <section className={styles.features}>
          <article className={styles.card}>
            <span className={styles.kicker}>Accurate</span>
            <h3>Metrics that matter</h3>
            <p>Bat speed, attack angle, path efficiency, contact quality—measured in real time.</p>
          </article>

          <article className={styles.card}>
            <span className={styles.kicker}>Actionable</span>
            <h3>Doable adjustments</h3>
            <p>Simple cues and drills tailored to your patterns—more progress, less guesswork.</p>
          </article>

          <article className={styles.card}>
            <span className={styles.kicker}>Private</span>
            <h3>Your data stays yours</h3>
            <p>Export anytime. Manage access with team spaces and permissions.</p>
          </article>
        </section>
      </div>

      {/* ========================= */}
      {/* TESTIMONIALS (OPTIONAL)   */}
      {/* ========================= */}
      {/* 
      <section className={`${styles.testimonials} ${styles.section}`}>
        <h2>Trusted by players & coaches</h2>

        <div className={styles.tWrap}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.quoteCard}>
              <p className={styles.quote}>{t.quote}</p>
              <div className={styles.cite}>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.role}>{t.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      */}

      {/* ========================= */}
      {/* CINEMATIC HOW IT WORKS    */}
      {/* ========================= */}
      <section className={styles.cineSection} aria-labelledby="cine-title">
        {/* Background image (grayscale + vignette) */}
        <div
          className={styles.cineBackdrop}
          style={{
            backgroundImage: `
              radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 85%),
              url(${stadiumBg})
            `,
          }}
        />

        <h2 id="cine-title" className={styles.cineHeading}>
          How it works
        </h2>

        <div className={styles.cineStepsWrapper}>
          <div ref={(el) => (stepRefs.current[0] = el)} className={styles.cineStep}>
            <h3>
              <span>01</span> Attach the sensor
            </h3>
            <p>Clip the tracker onto any bat. No calibration required.</p>
          </div>

          <div ref={(el) => (stepRefs.current[1] = el)} className={styles.cineStep}>
            <h3>
              <span>02</span> Take your swings
            </h3>
            <p>Every swing is captured live with speed, attack angle, and barrel metrics.</p>
          </div>

          <div ref={(el) => (stepRefs.current[2] = el)} className={styles.cineStep}>
            <h3>
              <span>03</span> Get insights instantly
            </h3>
            <p>Review visuals, compare sessions, and fix patterns quickly.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
