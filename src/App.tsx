import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Shop from './pages/public/Shop';
import Podcast from './pages/public/Podcast';
import Community from './pages/public/Community';
import Resources from './pages/public/Resources';
import WorkWithUs from './pages/public/WorkWithUs';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Portal from './pages/portal/Portal';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductDetail from './pages/public/ProductDetail';

const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:slug" element={<ProductDetail />} />
      <Route path="/podcast" element={<Podcast />} />
      <Route path="/community" element={<Community />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/work-with-us" element={<WorkWithUs />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Member Portal */}
      <Route path="/portal/*" element={<Portal />} />
      
      {/* Admin */}
      <Route path="/admin/*" element={<AdminDashboard />} />
      
      {/* 404 */}
      <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-4xl">404 - Page Not Found</h1></div>} />
    </Routes>
  );
};

export default App;
