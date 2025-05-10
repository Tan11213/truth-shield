import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import FactCheckInput from '../components/factcheck/FactCheckInput';
import FactCheckResult from '../components/factcheck/FactCheckResult';
import { checkFact, FactCheckResponse } from '../utils/factCheck';
import logger from '../utils/logger';

interface StoredVerifyData {
  type: string;
  content: string;
  timestamp: string;
}

const VerifyPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<FactCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Check for data from session storage on component mount
  useEffect(() => {
    const storedData = sessionStorage.getItem('verifyData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as StoredVerifyData;
        
        // Only process if the data is recent (within last 5 minutes)
        const timestamp = new Date(parsedData.timestamp);
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        if (timestamp > fiveMinutesAgo) {
          handleSubmit({
            type: parsedData.type,
            content: parsedData.content
          });
          
          // Clear the stored data after processing
          sessionStorage.removeItem('verifyData');
        }
      } catch (err) {
        console.error('Error parsing stored verify data', err);
      }
    }
  }, []);
  
  const handleSubmit = async (data: { type: string; content: string; file?: File }) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Use our fact-checking utility to verify the claim
      const result = await checkFact(data.content);
      
      // If it's an image verification, add the image URL for display
      if (data.type === 'image' && data.file) {
        result.imageUrl = URL.createObjectURL(data.file);
      }
      
      setVerificationResult(result);
      
      // Log for analytics
      logger.info('Verification completed', { 
        type: data.type, 
        verdict: result.verdict,
        resultId: result.id
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unexpected error occurred');
      logger.reportError(error, 'VerifyPage.handleSubmit', { contentType: data.type });
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCheckAnother = () => {
    setVerificationResult(null);
    setError(null);
    
    // For analytics
    logger.info('User requested another verification');
  };
  
  return (
    <Layout>
      <div className="bg-gray-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Verify Information</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge fact-checking system verifies content in real-time using multiple reliable sources.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <FactCheckInput onSubmit={handleSubmit} isProcessing={isProcessing} />
              
              <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works:</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-primary-100 text-primary-600 items-center justify-center mr-3">
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <p className="text-gray-700">Enter a claim, upload an image, or provide a URL to a news article or social media post.</p>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-primary-100 text-primary-600 items-center justify-center mr-3">
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <p className="text-gray-700">Our system analyzes the content using advanced AI and verification algorithms.</p>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-primary-100 text-primary-600 items-center justify-center mr-3">
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <p className="text-gray-700">We cross-reference with multiple credible sources for accuracy.</p>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-primary-100 text-primary-600 items-center justify-center mr-3">
                      <span className="text-sm font-medium">4</span>
                    </div>
                    <p className="text-gray-700">Receive a detailed verification report with evidence and context.</p>
                  </li>
                </ol>
              </div>
            </div>
            
            <div>
              {isProcessing ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Content</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    We're checking multiple sources and analyzing the content for accuracy. This typically takes 10-15 seconds.
                  </p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200 flex flex-col items-center justify-center h-full">
                  <div className="rounded-full bg-red-100 p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Error</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    {error}
                  </p>
                  <button 
                    className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    onClick={() => setError(null)}
                  >
                    Try Again
                  </button>
                </div>
              ) : verificationResult ? (
                <FactCheckResult 
                  result={verificationResult} 
                  onCheckAnother={handleCheckAnother} 
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center h-full">
                  <div className="rounded-full bg-primary-100 p-4 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Results Will Appear Here</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    Submit information on the left to see a detailed fact-check report with sources and evidence.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyPage; 