import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FactCheckDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<null | {
    verdict: 'true' | 'false' | 'partial';
    claim: string;
    explanation: string;
    sources: string[];
  }>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        verdict: 'partial',
        claim: "Indian Air Force deployed additional squadrons to the border region this week.",
        explanation: "While there has been an increase in air force activity in the region, official sources confirm it is part of scheduled military exercises planned months ago, not a direct response to recent tensions. Commercial satellite imagery shows increased activity at two air bases, but not at the scale claimed in some reports.",
        sources: ['Military Press Release', 'Reuters', 'Satellite Imagery Analysis']
      });
    }, 2500);
  };
  
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
  
  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Try Our Fact-Checking Tool
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-2xl mx-auto text-lg text-gray-600"
          >
            Experience how quickly and accurately our platform verifies information in real-time
          </motion.p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4 md:p-8"
        >
          {/* Tab navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button 
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === 'text' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Text Claim
            </button>
            <button 
              onClick={() => setActiveTab('image')}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === 'image' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Image Verification
            </button>
            <button 
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-3 text-center font-medium text-sm ${
                activeTab === 'url' 
                  ? 'text-primary-600 border-b-2 border-primary-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              URL Check
            </button>
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSubmit}>
            {activeTab === 'text' && (
              <div className="mb-4">
                <label htmlFor="claim-text" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter a claim to fact-check
                </label>
                <textarea 
                  id="claim-text"
                  rows={3}
                  className="input-field"
                  placeholder="E.g., Indian Air Force deployed additional squadrons to the border region this week."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                ></textarea>
              </div>
            )}
            
            {activeTab === 'image' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload an image to verify
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Drag and drop an image, or click to browse</p>
                  <p className="mt-1 text-xs text-gray-500">Supported formats: JPG, PNG, GIF</p>
                </div>
              </div>
            )}
            
            {activeTab === 'url' && (
              <div className="mb-4">
                <label htmlFor="url-check" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter a URL to a news article or social media post
                </label>
                <input 
                  type="url"
                  id="url-check"
                  className="input-field"
                  placeholder="https://example.com/news/article"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
            )}
            
            <button 
              type="submit"
              disabled={isProcessing || !inputValue.trim()}
              className={`w-full btn-primary flex justify-center items-center ${
                (!inputValue.trim() && !isProcessing) ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Verify Now'
              )}
            </button>
          </form>
          
          {/* Results section */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-8 pt-6 border-t border-gray-200"
            >
              <div className="mb-4">
                <div className="flex items-center mb-3">
                  <div className={`h-8 w-8 ${getVerdictColor(result.verdict)} rounded-full flex items-center justify-center mr-2`}>
                    {result.verdict === 'true' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {result.verdict === 'false' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {result.verdict === 'partial' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold ${getVerdictTextColor(result.verdict)}`}>
                    {getVerdictText(result.verdict)}
                  </h3>
                </div>
                
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Claim:</h4>
                  <p className="text-base text-gray-900">{result.claim}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Analysis:</h4>
                  <p className="text-base text-gray-800">{result.explanation}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Sources:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.sources.map((source, index) => (
                      <div key={index} className="bg-white px-2 py-1 rounded border border-gray-200 text-xs text-gray-700">
                        {source}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-4">
                <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                  See detailed report
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-800">
                  Share result
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FactCheckDemo; 