import React, { useState } from 'react';
import styles from '../../styles/Signup.module.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    favoriteTeam: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Signup attempt:', formData);
    // Add your registration logic here
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
      
      <div className={styles.signupCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>⚾ Join The Big Leagues</h1>
          <p className={styles.subtitle}>Create your account and step up to the plate</p>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Babe"
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Ruth"
                required
              />
            </div>
          </div>
          
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
            <label className={styles.label}>Favorite Team</label>
            <input
              type="text"
              name="favoriteTeam"
              value={formData.favoriteTeam}
              onChange={handleChange}
              className={styles.input}
              placeholder="New York Yankees"
            />
          </div>
          
          <div className={styles.nameRow}>
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
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          
          <button type="submit" className={styles.signupButton}>
            Join The Team! ⚾
          </button>
        </form>
        
        <div className={styles.footer}>
          <p className={styles.loginLink}>
            Already have an account? <a href="/login" className={styles.link}>Step Up to Bat</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;