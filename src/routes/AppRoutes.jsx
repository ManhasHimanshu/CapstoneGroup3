import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/auth/Login.jsx';
import Signup from '../pages/auth/Signup.jsx';
import Dashboard from '../pages/user/Dashboard.jsx';
import Settings from '../pages/user/Settings.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<div style={{ padding: 16 }}>404 Not Found</div>} />
    </Routes>
  );
}