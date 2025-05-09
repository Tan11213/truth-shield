import React from 'react';
import { motion } from 'framer-motion';

export interface FactCheckResultData {
  id: string;
  verdict: 'true' | 'false' | 'partial';
  claim: string;
  explanation: string;
  sources: {
    name: string;
    url: string;
    credibilityScore: number;
  }[];
  timestamp: string;
  imageUrl?: string;
  relatedClaims?: {
    id: string;
    claim: string;
    verdict: 'true' | 'false' | 'partial';
  }[];
}

interface FactCheckResultProps {
  result: FactCheckResultData;
}

const FactCheckResult: React.FC<FactCheckResultProps> = ({ result }) => {
  const getVerdictColor = (verdict: 'true' | 'false' | 'partial') => {
    switch (verdict) {
      case 'true': return 'bg-true-500';
      case 'false': return 'bg-false-500';
      case 'partial': return 'bg-partial-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getVerdictText = (verdict: 'true' | 'false' | 'partial') => {
    switch (verdict) {
      case 'true': return 'True';
      case 'false': return 'False';
      case 'partial': return 'Partially True';
      default: return 'Unknown';
    }
  };
  
  const getVerdictTextColor = (verdict: 'true' | 'false' | 'partial') => {
    switch (verdict) {
      case 'true': return 'text-true-600';
      case 'false': return 'text-false-600';
      case 'partial': return 'text-partial-600';
      default: return 'text-gray-600';
    }
  };
  
  const getVerdictBgColor = (verdict: 'true' | 'false' | 'partial') => {
    switch (verdict) {
      case 'true': return 'bg-true-50';
      case 'false': return 'bg-false-50';
      case 'partial': return 'bg-partial-50';
      default: return 'bg-gray-50';
    }
  };

  const getVerdictIcon = (verdict: 'true' | 'false' | 'partial') => {
    switch (verdict) {
      case 'true': 
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'false':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'partial':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return null;
    }
  };
  
  const renderCredibilityScore = (score: number) => {
    let color = 'bg-gray-200';
    
    if (score >= 80) color = 'bg-true-500';
    else if (score >= 60) color = 'bg-true-400';
    else if (score >= 40) color = 'bg-partial-400';
    else if (score >= 20) color = 'bg-false-300';
    else color = 'bg-false-500';
    
    return (
      <div className="flex items-center">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
          <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }}></div>
        </div>
        <span className="text-xs font-medium text-gray-600">{score}%</span>
      </div>
    );
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl shadow-lg overflow-hidden ${getVerdictBgColor(result.verdict)}`}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-center mb-4">
          <div className={`h-10 w-10 ${getVerdictColor(result.verdict)} rounded-full flex items-center justify-center mr-3`}>
            {getVerdictIcon(result.verdict)}
          </div>
          <div>
            <h2 className={`text-xl font-bold ${getVerdictTextColor(result.verdict)}`}>
              {getVerdictText(result.verdict)}
            </h2>
            <p className="text-sm text-gray-500">Verified • {result.timestamp}</p>
          </div>
        </div>
        
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-base font-medium text-gray-700 mb-2">Claim:</h3>
          <p className="text-lg text-gray-900">{result.claim}</p>
        </div>
        
        {result.imageUrl && (
          <div className="mb-6">
            <div className="rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img src={result.imageUrl} alt="Fact-checked content" className="w-full h-auto" />
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-700 mb-2">Analysis:</h3>
          <p className="text-gray-800 whitespace-pre-line">{result.explanation}</p>
        </div>
        
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-700 mb-2">Sources:</h3>
          <div className="space-y-3">
            {result.sources.map((source, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-2">Credibility</span>
                    {renderCredibilityScore(source.credibilityScore)}
                  </div>
                </div>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800 truncate block">
                  {source.url}
                </a>
              </div>
            ))}
          </div>
        </div>
        
        {result.relatedClaims && result.relatedClaims.length > 0 && (
          <div>
            <h3 className="text-base font-medium text-gray-700 mb-3">Related Claims:</h3>
            <div className="space-y-2">
              {result.relatedClaims.map((claim, index) => (
                <div key={index} className="flex items-center bg-white rounded-lg border border-gray-200 p-3">
                  <div className={`h-6 w-6 ${getVerdictColor(claim.verdict)} rounded-full flex items-center justify-center mr-2 flex-shrink-0`}>
                    {getVerdictIcon(claim.verdict)}
                  </div>
                  <p className="text-sm text-gray-800">{claim.claim}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between">
        <div className="flex space-x-4">
          <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
          <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Issue
          </button>
        </div>
        <a href={`/fact-check/${result.id}`} className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
          View Full Report
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
};

export default FactCheckResult; 