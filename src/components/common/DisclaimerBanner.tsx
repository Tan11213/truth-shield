import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface DisclaimerBannerProps {
  variant?: 'info' | 'warning';
  className?: string;
  dismissible?: boolean;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ 
  variant = 'info', 
  className = '',
  dismissible = true
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const bannerClasses = {
    container: `rounded-lg ${variant === 'info' ? 'bg-blue-50' : 'bg-amber-50'} p-4 ${className}`,
    icon: `w-5 h-5 ${variant === 'info' ? 'text-blue-400' : 'text-amber-400'}`,
    title: `font-semibold text-sm ${variant === 'info' ? 'text-blue-800' : 'text-amber-800'}`,
    text: `text-sm mt-2 ${variant === 'info' ? 'text-blue-700' : 'text-amber-700'}`
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3 }}
          className={bannerClasses.container}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <FiAlertTriangle className={bannerClasses.icon} />
            </div>
            <div className="ml-3">
              <h3 className={bannerClasses.title}>
                Disclaimer
              </h3>
              <div className={bannerClasses.text}>
                <p>
                  TruthShield provides evidence-based analysis from trusted sources. We recommend cross-verification with multiple credible sources for critical information.
                </p>
              </div>
            </div>
            {dismissible && (
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setIsVisible(false)}
                    className={`inline-flex rounded-md p-1.5 ${
                      variant === 'info' 
                      ? 'text-blue-500 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600' 
                      : 'text-amber-500 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600'
                    }`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerBanner; 