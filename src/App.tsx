import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimpleHome from './pages/SimpleHome';
import SimpleVerify from './pages/SimpleVerify';

// Using simplified components without animations
// This helps us run the app despite the framer-motion compatibility issues
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleHome />} />
        <Route path="/verify" element={<SimpleVerify />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
