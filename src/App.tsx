import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import ONE component at a time
import Home from './pages/public/Home';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
                <a href="/" className="text-primary hover:underline">Go Home</a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
