import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Shop from './pages/public/Shop';
import ProductDetail from './pages/public/ProductDetail';
import Podcast from './pages/public/Podcast';
import Community from './pages/public/Community';
import Resources from './pages/public/Resources';
import WorkWithUs from './pages/public/WorkWithUs';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Portal from './pages/portal/Portal';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Portal - All authenticated users */}
        <Route path="/portal/*" element={
          <ProtectedRoute>
            <Portal />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
