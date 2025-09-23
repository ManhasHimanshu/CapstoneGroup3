import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '');

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">Baseball Boys INC</Link>

        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="menu-icon" aria-hidden="true"></span>
        </button>
        
        <nav
          id="primary-navigation"
          className={'nav-links' + (open ? ' open' : '')}
          onClick={() => setOpen(false)}


        >  
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/login" className={linkClass}>Login</NavLink>
          <NavLink to="/signup" className={linkClass}>Sign Up</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        </nav>
      </div>
    </header>
  );
}
