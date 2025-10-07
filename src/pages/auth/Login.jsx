import React, { useState } from 'react';
import styles from '../../styles/Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    // Add your authentication logic here
  };

  return (
    <div className={styles.container}>
      <div className={styles.baseballField}>
        <div className={styles.diamond}>
          <div className={styles.homePlate}></div>
          <div className={styles.firstBase}></div>
          <div className={styles.secondBase}></div>
          <div className={styles.thirdBase}></div>
        </div>
      </div>
      
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>⚾ Grand Slam Login</h1>
          <p className={styles.subtitle}>Step up to the plate and access your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          
          <button type="submit" className={styles.loginButton}>
            Swing Away! ⚾
          </button>
        </form>
        
        <div className={styles.footer}>
          <p className={styles.signupLink}>
            Don't have an account? <a href="/signup" className={styles.link}>Join the Team</a>
          </p>
          <a href="/forgot-password" className={styles.forgotPassword}>
            Forgot your password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;