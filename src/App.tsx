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

function App() {
  return (
    <Router>
      <Routes>
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
        
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-2xl font-bold">404</h2>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
