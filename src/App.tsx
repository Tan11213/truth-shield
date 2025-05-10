import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VerifyPage from './pages/VerifyPage';

// Restored animated components
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
