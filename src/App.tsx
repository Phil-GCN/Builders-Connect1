import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">BuildersConnect - Debug Mode</h1>
        <p className="text-xl text-gray-600 mb-8">If you can see this, React Router is working.</p>
        
        <Routes>
          <Route path="/" element={
            <div>
              <h2 className="text-2xl font-bold mb-4">Home Page</h2>
              <p>This is the home page.</p>
            </div>
          } />
          
          <Route path="/test" element={
            <div>
              <h2 className="text-2xl font-bold mb-4">Test Page</h2>
              <p>This is a test page.</p>
            </div>
          } />
          
          <Route path="*" element={
            <div>
              <h2 className="text-2xl font-bold mb-4">404 - Not Found</h2>
              <p>Page not found.</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
