import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiExternalLink, 
  FiRefreshCw, 
  FiAlertTriangle, 
  FiBarChart2, 
  FiMessageCircle 
} from 'react-icons/fi';

interface AdditionalOptionsProps {
  onGetMoreSources: () => void;
  onDoubleCheck: () => void;
  onCheckRelatedClaims: () => void;
  onViewAnalytics: () => void;
  onReportIssue: () => void;
}

const AdditionalOptions: React.FC<AdditionalOptionsProps> = ({
  onGetMoreSources,
  onDoubleCheck,
  onCheckRelatedClaims,
  onViewAnalytics,
  onReportIssue
}) => {
  const options = [
    {
      icon: <FiSearch />,
      title: 'Get More Sources',
      description: 'Find additional trusted sources for this claim',
      action: onGetMoreSources,
      animationDelay: 0
    },
    {
      icon: <FiRefreshCw />,
      title: 'Double-Check',
      description: 'Verify this claim with an alternative method',
      action: onDoubleCheck,
      animationDelay: 0.1
    },
    {
      icon: <FiExternalLink />,
      title: 'Related Claims',
      description: 'See similar claims that have been verified',
      action: onCheckRelatedClaims,
      animationDelay: 0.2
    },
    {
      icon: <FiBarChart2 />,
      title: 'View Analytics',
      description: 'See trends in misinformation patterns',
      action: onViewAnalytics,
      animationDelay: 0.3
    },
    {
      icon: <FiAlertTriangle />,
      title: 'Report Issue',
      description: 'Report problems with this fact-check',
      action: onReportIssue,
      animationDelay: 0.4
    }
  ];

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: option.animationDelay }}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer shadow-sm hover:shadow-md transition-all"
            onClick={option.action}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700">
                {option.icon}
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">{option.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdditionalOptions; 