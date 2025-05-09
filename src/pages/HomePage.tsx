import React from 'react';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Stats from '../components/home/Stats';
import FactCheckDemo from '../components/home/FactCheckDemo';
import CTASection from '../components/home/CTASection';
import AlertBanner from '../components/layout/AlertBanner';
import Layout from '../components/layout/Layout';

const HomePage: React.FC = () => {
  return (
    <Layout>
      <AlertBanner 
        severity="medium" 
        message="Increased misinformation detected around cross-border tensions. Please verify before sharing." 
        timestamp="3 hours ago"
      />
      <Hero />
      <Features />
      <Stats />
      <FactCheckDemo />
      <CTASection />
    </Layout>
  );
};

export default HomePage; 