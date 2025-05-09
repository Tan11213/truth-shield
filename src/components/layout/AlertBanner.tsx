import React, { useState } from 'react';

interface AlertBannerProps {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ 
  severity = 'medium', 
  message = 'Current misinformation threat level is elevated. Exercise increased caution with unverified news.', 
  timestamp = '2 hours ago' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  const getSeverityColor = () => {
    switch (severity) {
      case 'low':
        return {
          bg: 'bg-green-500',
          bgOpacity: 'bg-opacity-20',
          border: 'border-green-500',
          text: 'text-green-700',
          label: 'LOW'
        };
      case 'medium':
        return {
          bg: 'bg-amber-500',
          bgOpacity: 'bg-opacity-20',
          border: 'border-amber-500',
          text: 'text-amber-700',
          label: 'MEDIUM'
        };
      case 'high':
        return {
          bg: 'bg-orange-500',
          bgOpacity: 'bg-opacity-20',
          border: 'border-orange-500',
          text: 'text-orange-700',
          label: 'HIGH'
        };
      case 'critical':
        return {
          bg: 'bg-false-500',
          bgOpacity: 'bg-opacity-20',
          border: 'border-false-500',
          text: 'text-false-700',
          label: 'CRITICAL'
        };
      default:
        return {
          bg: 'bg-amber-500',
          bgOpacity: 'bg-opacity-20',
          border: 'border-amber-500',
          text: 'text-amber-700',
          label: 'MEDIUM'
        };
    }
  };
  
  const severityStyles = getSeverityColor();
  
  if (!isVisible) return null;
  
  return (
    <div className={`${severityStyles.bg} ${severityStyles.bgOpacity} border-b ${severityStyles.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1 flex-grow">
            <div className={`flex-shrink-0 flex items-center mr-3`}>
              <div className={`h-6 w-6 ${severityStyles.bg} rounded-full flex items-center justify-center border-2 ${severityStyles.border}`}>
                <div className={`h-2 w-2 ${severityStyles.bg} rounded-full animate-pulse`}></div>
              </div>
              <div className="ml-2">
                <span className={`text-sm font-bold ${severityStyles.text}`}>
                  {severityStyles.label}
                </span>
                <span className="ml-1 text-xs text-gray-500">
                  • Updated {timestamp}
                </span>
              </div>
            </div>
            <div className="font-medium text-sm sm:text-base text-gray-800">
              {message}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => setIsVisible(false)}
              className="rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertBanner;