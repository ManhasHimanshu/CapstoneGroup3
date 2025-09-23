import React from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main style={{ padding: 16, minHeight: '70vh' }}>{children}</main>
      <Footer />
    </div>
  );
}