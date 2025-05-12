import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VerifyPage from './pages/VerifyPage';
import { PageNotFoundDemo } from './components/ui/demo';
import { NotFoundPage } from './components/ui/404-page-not-found';

// Restored animated components
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/demo/404" element={<PageNotFoundDemo />} />
        <Route path="*" element={<NotFoundPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
};

export default App;
