import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  {
    value: '98%',
    label: 'Accuracy Rate',
    description: 'Our fact-checks have been verified by independent auditors',
    delay: 0.1,
  },
  {
    value: '8,500+',
    label: 'Claims Verified',
    description: 'Since the beginning of the current conflict',
    delay: 0.2,
  },
  {
    value: '4',
    label: 'Languages',
    description: 'Full support for English, Hindi, Urdu, and Punjabi',
    delay: 0.3,
  },
  {
    value: '< 5 min',
    label: 'Average Response Time',
    description: 'For urgent verification requests',
    delay: 0.4,
  },
];

const Stats: React.FC = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-primary-900 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Truth by the Numbers
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto text-lg text-primary-100"
          >
            Our commitment to accuracy and transparency in the India-Pakistan conflict
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: stat.delay }}
              className="bg-white bg-opacity-10 rounded-xl px-6 py-8 backdrop-blur-sm border border-white border-opacity-10"
            >
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-xl font-medium text-primary-200 mb-2">{stat.label}</div>
              <div className="text-sm text-primary-300">{stat.description}</div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-16 bg-white bg-opacity-5 rounded-xl p-6 md:p-8 border border-white border-opacity-10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-2">Crisis Alert Status</h3>
              <p className="text-primary-200 max-w-lg">
                Current misinformation threat level is elevated. Exercise increased caution with unverified news.
              </p>
            </div>
            <div className="flex items-center">
              <div className="h-16 w-16 bg-amber-500 bg-opacity-20 rounded-full flex items-center justify-center border-4 border-amber-500">
                <div className="h-6 w-6 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-4">
                <div className="text-amber-400 text-lg font-bold">ELEVATED</div>
                <div className="text-primary-300 text-sm">Updated 2 hours ago</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats; 