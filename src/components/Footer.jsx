import React from 'react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid #ffffffff', padding: 12, fontSize: 14 }}>
      © {new Date().getFullYear()} Baseball Boys INC 
    </footer>
  );
}