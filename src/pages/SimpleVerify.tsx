import React, { useState } from 'react';
import Layout from '../components/layout/Layout';

const SimpleVerify: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      setVerificationResult({
        verdict: 'partial',
        claim: inputValue || 'Pakistan has deployed additional troops along the Line of Control.',
        explanation: `While there has been increased military activity in the region, official sources confirm it is not at the scale reported in some media. Satellite imagery from May 8, 2025 shows movement of approximately 3-4 battalions, which is consistent with routine rotation rather than a significant military buildup.`,
        sources: [
          { name: 'Pakistan Armed Forces Press Release', credibilityScore: 75 },
          { name: 'Reuters', credibilityScore: 92 },
          { name: 'Satellite Imagery Analysis', credibilityScore: 88 }
        ],
        timestamp: 'May 10, 2025'
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900">Verify Information</h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge fact-checking system verifies content in real-time using multiple reliable sources.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Verify Information</h2>
                
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
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="E.g., Pakistan has deployed additional troops along the Line of Control."
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://example.com/news/article"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={isProcessing || !inputValue.trim()}
                    className={`w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex justify-center items-center ${
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
              </div>
            </div>
            
            <div>
              {isProcessing ? (
                <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Analyzing Content</h3>
                  <p className="text-gray-600 text-center max-w-md">
                    We're checking multiple sources and analyzing the content for accuracy. This typically takes 10-15 seconds.
                  </p>
                </div>
              ) : verificationResult ? (
                <div className="bg-amber-50 border rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-amber-600">Partially True</h2>
                        <p className="text-sm text-gray-500">Verified • {verificationResult.timestamp}</p>
                      </div>
                    </div>
                    
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h3 className="text-base font-medium text-gray-700 mb-2">Claim:</h3>
                      <p className="text-lg text-gray-900">{verificationResult.claim}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-base font-medium text-gray-700 mb-2">Analysis:</h3>
                      <p className="text-gray-800">{verificationResult.explanation}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-base font-medium text-gray-700 mb-2">Sources:</h3>
                      <div className="space-y-3">
                        {verificationResult.sources.map((source: any, index: number) => (
                          <div key={index} className="bg-white rounded-lg border border-gray-200 p-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-gray-900">{source.name}</h4>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-2">Credibility</span>
                                <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${source.credibilityScore}%` }}></div>
                                </div>
                                <span className="text-xs font-medium text-gray-600">{source.credibilityScore}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between">
                    <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                    <a href="#" className="text-sm text-primary-600 hover:text-primary-800 flex items-center">
                      View Full Report
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center h-full">
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

export default SimpleVerify; 