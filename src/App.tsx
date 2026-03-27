import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/public/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-2xl font-bold">404 - Not Found</h2>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
