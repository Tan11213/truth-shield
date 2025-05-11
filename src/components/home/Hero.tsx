import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const buttonVariants = {
  hover: { 
    scale: 1.05, 
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.95 }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  hover: { 
    y: -10,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.4 }
  }
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut"
    }
  }
};

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gradient-to-r from-primary-800 to-primary-600 overflow-hidden">
      {/* Background pattern */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
      >
        <svg className="h-full w-full" width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="800" height="800" fill="url(#grid)" />
        </svg>
      </motion.div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm font-medium text-white mb-4"
              whileHover={{ 
                backgroundColor: "rgba(255, 255, 255, 0.3)", 
                scale: 1.05 
              }}
            >
              Combating misinformation in conflict zones
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
            >
              Truth when it matters <motion.span 
                className="text-secondary-400"
                animate={{ 
                  color: ["#FCD34D", "#FBBF24", "#FCD34D"],
                  textShadow: [
                    "0 0 5px rgba(251, 191, 36, 0)",
                    "0 0 20px rgba(251, 191, 36, 0.5)",
                    "0 0 5px rgba(251, 191, 36, 0)"
                  ]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >most</motion.span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 text-xl text-white text-opacity-90 max-w-lg mx-auto md:mx-0"
            >
              Our AI-powered platform helps verify information, giving you reliable facts in real-time to combat misinformation.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start"
            >
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Verify Screenshots
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" />
                </svg>
                Social Media Posts
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                News Articles
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link to="/verify" className="btn-primary block bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 font-medium shadow-md rounded-md transition-colors duration-200">
                  Verify a Claim
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link to="/verify" className="block flex items-center justify-center text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 px-8 py-3 rounded-md transition-all duration-200">
                  How it Works
                  <motion.svg 
                    className="ml-2 w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </motion.svg>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 text-white text-opacity-80 text-sm"
            >
              <p>Trusted by journalists, humanitarian organizations, and citizens</p>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 0.7, 
              delay: 0.4,
              y: {
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
            className="relative hidden md:block"
          >
            <motion.div 
              className="absolute inset-0 bg-primary-500 rounded-full blur-3xl opacity-30 transform -translate-x-10 translate-y-10 scale-90"
              animate={{ 
                scale: [0.9, 1, 0.9],
                opacity: [0.3, 0.4, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            ></motion.div>
            <div className="relative">
              <motion.div 
                className="bg-white p-6 rounded-2xl shadow-xl"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="h-10 w-10 bg-true-500 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
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
                    <motion.div 
                      className="h-6 w-6 bg-partial-500 rounded-full flex items-center justify-center mr-2"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </motion.div>
                    <span className="font-medium text-partial-600">Partially True</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    There has been movement of troops, but not at the scale claimed in social media reports. Official sources confirm routine rotation of personnel.
                  </p>
                </div>
                
                <motion.div 
                  className="bg-gray-50 p-3 rounded-lg"
                  whileHover={{ backgroundColor: "#F9FAFB", scale: 1.02 }}
                >
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sources:</h4>
                  <div className="flex flex-wrap gap-2">
                    <motion.div 
                      className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700"
                      whileHover={{ scale: 1.05, backgroundColor: "#F3F4F6" }}
                    >
                      Official Military Statement
                    </motion.div>
                    <motion.div 
                      className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700"
                      whileHover={{ scale: 1.05, backgroundColor: "#F3F4F6" }}
                    >
                      Reuters
                    </motion.div>
                    <motion.div 
                      className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700"
                      whileHover={{ scale: 1.05, backgroundColor: "#F3F4F6" }}
                    >
                      Satellite Imagery
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="absolute -right-4 -bottom-4 transform rotate-6"
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                whileHover={{ scale: 1.05, rotate: 9 }}
              >
                <div className="bg-white p-6 rounded-2xl shadow-xl w-56">
                  <div className="flex items-center mb-3">
                    <motion.div 
                      className="h-8 w-8 bg-false-500 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.div>
                    <div className="ml-2">
                      <h3 className="text-sm font-bold text-gray-900">Misinfo Alert</h3>
                      <p className="text-xs text-gray-500">May 9, 2025</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700">This viral video of fighter jets is from a 2022 training exercise, not current border activity.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      ></motion.div>
    </div>
  );
};

export default Hero; 