import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.4
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.5
    }
  },
  hover: {
    y: -15,
    scale: 1.02,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    y: -5,
    scale: 0.98,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  },
  hover: {
    scale: 1.15,
    rotate: 5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const features = [
  {
    title: 'Multi-source Verification',
    description: 'Our platform cross-references information with multiple trusted sources including official statements, reputable media outlets, and verified eyewitness accounts.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    delay: 0.1,
  },
  {
    title: 'Real-time Analysis',
    description: 'Get instant verification results for text claims, images, and videos circulating during the conflict, with clear indications of accuracy.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    delay: 0.2,
  },
  {
    title: 'Social Media Verification',
    description: 'Upload screenshots of social media posts from Twitter/X, Facebook, Instagram, and other platforms to quickly verify viral content and claims.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    delay: 0.25,
  },
  {
    title: 'Cultural Context',
    description: 'Our platform accounts for the nuanced cultural and historical context of the India-Pakistan region, providing culturally sensitive fact-checks.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    delay: 0.3,
  },
  {
    title: 'Crisis-aware Interface',
    description: 'Our interface is designed to be accessible during connectivity challenges and optimized for users in high-stress situations.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    delay: 0.4,
  },
  {
    title: 'Source Credibility Analysis',
    description: 'We evaluate and display the reliability of each source used in verification, allowing users to understand the strength of evidence.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    delay: 0.5,
  },
  {
    title: 'Multi-language Support',
    description: 'Access fact-checking services in multiple languages spoken across the India-Pakistan region, including English, Hindi, Urdu, and Punjabi.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    delay: 0.6,
  },
];

const Features: React.FC = () => {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="py-12 md:py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            viewport={{ once: true }}
            className="inline-block bg-primary-50 rounded-full px-3 py-1 text-sm font-medium text-primary-600 mb-4"
          >
            Advanced Features
          </motion.div>
          <motion.h2 
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            How TruthShield <motion.span 
              className="text-primary-600"
              animate={{ 
                color: ["#4F46E5", "#6366F1", "#4F46E5"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >Safeguards</motion.span> the Truth
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="max-w-2xl mx-auto text-xl text-gray-600"
          >
            Our platform combines advanced technology with regional expertise to verify information during critical times.
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              whileHover="hover"
              whileTap="tap"
              className="card hover:border-primary-100 flex flex-col h-full bg-white rounded-xl p-6 shadow-sm border border-gray-100 transition-all duration-200"
            >
              <motion.div 
                className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 mb-5"
                variants={iconVariants}
                whileHover="hover"
              >
                {feature.icon}
              </motion.div>
              <motion.h3 
                className="text-xl font-bold text-gray-900 mb-3"
                whileHover={{ color: "#4F46E5", x: 3 }}
                transition={{ duration: 0.2 }}
              >
                {feature.title}
              </motion.h3>
              <motion.p 
                className="text-gray-600 flex-grow"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
              >
                {feature.description}
              </motion.p>
              <motion.div 
                className="mt-4 pt-4 border-t border-gray-100"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <motion.span 
                  className="text-sm text-primary-600 font-medium flex items-center"
                  whileHover={{ x: 3 }}
                >
                  Learn more
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.span>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ 
            duration: 0.6, 
            type: "spring",
            stiffness: 100,
            damping: 12
          }}
        >
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <motion.span 
              className="inline-flex rounded-full bg-primary-100 px-4 py-1 text-sm font-semibold text-primary-600 mb-4"
              whileHover={{ scale: 1.05, backgroundColor: "#e0e7ff" }}
            >
              Trusted Methodology
            </motion.span>
            <motion.h3 
              className="text-2xl font-bold text-gray-900 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Transparency is our foundation
            </motion.h3>
            <motion.p 
              className="max-w-2xl mx-auto text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              Our fact-checking process is completely transparent, allowing you to see exactly how we verify information and the sources we use.
            </motion.p>
            <motion.button 
              className="btn-primary"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" 
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Learn about our methodology
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Features; 