import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import PipelinePage from './components/PipelinePage';
import SimulationPage from './components/SimulationPage';
import AboutPage from './components/AboutPage';
import LoadingScreen from './components/LoadingScreen';
import CascadeSimulator from './components/CascadeSimulator';
import CityComparison from './components/CityComparison';

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <div className="grid-overlay" />
      <Navigation />
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/dashboard"  element={<Dashboard />} />
        <Route path="/pipeline"   element={<PipelinePage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/cascade"    element={<CascadeSimulator />} />
        <Route path="/compare"    element={<CityComparison />} />
      </Routes>
    </Router>
  );
}
