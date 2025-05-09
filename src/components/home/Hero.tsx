import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-800 to-primary-600 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="800" fill="url(#grid)" />
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <span className="inline-block bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm font-medium text-white mb-4">
              Combating misinformation in conflict zones
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Truth when it matters <span className="text-secondary-400">most</span>
            </h1>
            <p className="mt-4 text-xl text-white text-opacity-90 max-w-lg mx-auto md:mx-0">
              Our AI-powered platform helps verify information during the India-Pakistan conflict, giving you reliable facts in real-time.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/verify" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 font-medium shadow-md">
                Verify a Claim
              </Link>
              <Link to="/how-it-works" className="btn flex items-center justify-center text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 px-8 py-3">
                How it Works
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            <div className="mt-8 text-white text-opacity-80 text-sm">
              <p>Trusted by journalists, humanitarian organizations, and citizens</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative hidden md:block"
          >
            <div className="absolute inset-0 bg-primary-500 rounded-full blur-3xl opacity-30 transform -translate-x-10 translate-y-10 scale-90"></div>
            <div className="relative">
              <div className="bg-white p-6 rounded-2xl shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 bg-true-500 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-bold text-gray-900">Fact Check Result</h3>
                    <p className="text-sm text-gray-500">Verified • May 10, 2025</p>
                  </div>
                </div>
                
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h4 className="text-base font-medium text-gray-900">Claim:</h4>
                  <p className="text-gray-700">Pakistan has deployed additional troops along the Line of Control.</p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <div className="h-6 w-6 bg-partial-500 rounded-full flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <span className="font-medium text-partial-600">Partially True</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    There has been movement of troops, but not at the scale claimed in social media reports. Official sources confirm routine rotation of personnel.
                  </p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sources:</h4>
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700">Official Military Statement</div>
                    <div className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700">Reuters</div>
                    <div className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700">Satellite Imagery</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 -bottom-4 transform rotate-6">
                <div className="bg-white p-6 rounded-2xl shadow-xl w-56">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 bg-false-500 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <h3 className="text-sm font-bold text-gray-900">Misinfo Alert</h3>
                      <p className="text-xs text-gray-500">May 9, 2025</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700">This viral video of fighter jets is from a 2022 training exercise, not current border activity.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero; 