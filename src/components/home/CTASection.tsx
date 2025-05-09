import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTASection: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-primary-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-800 to-primary-700 rounded-3xl overflow-hidden shadow-xl">
          <div className="relative px-6 py-10 md:p-16">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-cta" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-cta)" />
              </svg>
            </div>
            
            <div className="relative z-10 md:w-3/4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                  Join the movement for <span className="text-secondary-300">truth</span> in times of conflict
                </h2>
                <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl">
                  Help us create a more informed world. Our platform is free to use for citizens, but supported by partnerships with journalists and organizations.
                </p>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/verify" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 font-medium shadow-md text-center">
                    Start Fact-Checking
                  </Link>
                  <Link to="/partner" className="btn flex items-center justify-center text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 px-8 py-3 text-center">
                    Become a Partner
                  </Link>
                </div>
                
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white bg-opacity-10 rounded-xl px-6 py-5 backdrop-blur-sm border border-white border-opacity-10">
                    <h3 className="text-white text-lg font-bold mb-2">For Journalists</h3>
                    <p className="text-primary-200 text-sm">
                      Access our API and verification tools to enhance your reporting with verified information.
                    </p>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl px-6 py-5 backdrop-blur-sm border border-white border-opacity-10">
                    <h3 className="text-white text-lg font-bold mb-2">For Organizations</h3>
                    <p className="text-primary-200 text-sm">
                      Partner with us to support truth in your community and gain access to our platform.
                    </p>
                  </div>
                  
                  <div className="bg-white bg-opacity-10 rounded-xl px-6 py-5 backdrop-blur-sm border border-white border-opacity-10">
                    <h3 className="text-white text-lg font-bold mb-2">For Educators</h3>
                    <p className="text-primary-200 text-sm">
                      Use our resources to teach media literacy and critical thinking in conflict analysis.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute right-0 bottom-0 transform translate-y-1/4 translate-x-1/4 hidden lg:block">
              <div className="w-64 h-64 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-400 opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection; 