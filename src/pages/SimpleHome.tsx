import React from 'react';
import Layout from '../components/layout/Layout';

const SimpleHome: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">TruthShield</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              A fact-checking platform focused on verifying information and combating misinformation.
            </p>
            <button className="bg-white text-primary-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Verify a Claim
            </button>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How TruthShield Safeguards the Truth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines advanced technology with regional expertise to verify information during critical times.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-source Verification</h3>
              <p className="text-gray-600">Our platform cross-references information with multiple trusted sources including official statements, reputable media outlets, and verified eyewitness accounts.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Analysis</h3>
              <p className="text-gray-600">Get instant verification results for text claims, images, and videos, with clear indications of accuracy.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Contextual Understanding</h3>
              <p className="text-gray-600">Our platform accounts for cultural and historical context, providing nuanced fact-checks that consider complex regional factors.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to verify information?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Our cutting-edge fact-checking system verifies content in real-time using multiple reliable sources.
            </p>
            <button className="bg-white text-primary-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SimpleHome; 