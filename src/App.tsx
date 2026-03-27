import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Try importing components one by one
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Debug Mode</h1>
          <p className="text-gray-600 mb-4">If you can see this, React is working.</p>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <a href="/" className="text-primary hover:underline">Go Home</a>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
