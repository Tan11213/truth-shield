import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Stats from '../components/home/Stats';
import FactCheckDemo from '../components/home/FactCheckDemo';
import CTASection from '../components/home/CTASection';
import AlertBanner from '../components/layout/AlertBanner';
import Layout from '../components/layout/Layout';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { getTrendingMisinformation, getCommonMisinformationPatterns } from '../services/analyticsService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3,
    } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const cardHoverVariants = {
  hover: { 
    y: -5, 
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.3 }
  }
};

const HomePage: React.FC = () => {
  const [trendingData, setTrendingData] = useState<{category: string, count: number}[]>([]);
  const [patterns, setPatterns] = useState<{pattern: string, example: string}[]>([]);
  const [showInitialAnimation, setShowInitialAnimation] = useState(true);
  
  useEffect(() => {
    // Fetch trending misinformation data
    const fetchTrendingData = async () => {
      try {
        const data = await getTrendingMisinformation();
        setTrendingData(data);
        
        const patternData = await getCommonMisinformationPatterns();
        setPatterns(patternData);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      }
    };
    
    fetchTrendingData();
    
    // Disable initial animations after first load
    const timer = setTimeout(() => {
      setShowInitialAnimation(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AlertBanner 
          severity="medium" 
          message="Increased misinformation detected around cross-border tensions. Please verify before sharing." 
          timestamp="3 hours ago"
        />
      </motion.div>
      
      <Hero />
      <Features />
      <Stats />
      
      {/* Trending Misinformation Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-gray-50"
      >
        <motion.div 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <motion.h2 
              variants={itemVariants}
              className="text-3xl font-bold text-gray-900"
            >
              Trending Misinformation
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Stay informed about the most common types of misinformation being circulated.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6"
                whileHover={cardHoverVariants.hover}
                transition={{ duration: 0.3 }}
              >
                {trendingData.map((item, index) => (
                  <motion.div 
                    key={item.category}
                    initial={showInitialAnimation ? { opacity: 0, x: -20 } : { opacity: 1, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="mb-4 last:mb-0"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <motion.span 
                        className="text-sm text-gray-500"
                        whileHover={{ 
                          color: "#4F46E5",
                          scale: 1.05,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {item.count} instances
                      </motion.span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <motion.div 
                        className="bg-primary-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(item.count / trendingData[0].count) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 + (0.1 * index) }}
                      ></motion.div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div
              variants={itemVariants}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Patterns</h3>
              <motion.div 
                className="bg-white rounded-xl shadow-sm p-6"
                whileHover={cardHoverVariants.hover}
                transition={{ duration: 0.3 }}
              >
                {patterns.map((item, index) => (
                  <motion.div 
                    key={item.pattern}
                    initial={showInitialAnimation ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0 border-gray-100 hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors duration-200"
                    whileHover={{ 
                      x: 5,
                      backgroundColor: "#F9FAFB",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.h4 
                      className="text-sm font-semibold text-gray-800"
                      whileHover={{ color: "#4F46E5" }}
                    >
                      {item.pattern}
                    </motion.h4>
                    <p className="text-sm text-gray-600 mt-1">{item.example}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-10"
            variants={itemVariants}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <DisclaimerBanner 
              variant="warning" 
              className="mx-auto max-w-4xl" 
            />
          </motion.div>
        </motion.div>
      </motion.section>
      
      <FactCheckDemo />
      <CTASection />
    </Layout>
  );
};

export default HomePage; 