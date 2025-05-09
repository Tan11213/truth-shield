import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import FactCheckInput from '../components/factcheck/FactCheckInput';
import FactCheckResult, { FactCheckResultData } from '../components/factcheck/FactCheckResult';

const VerifyPage: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationResult, setVerificationResult] = useState<FactCheckResultData | null>(null);
  
  const handleSubmit = (data: { type: string; content: string; file?: File }) => {
    setIsProcessing(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsProcessing(false);
      setVerificationResult({
        id: 'fc123456',
        verdict: 'partial',
        claim: data.content || 'Pakistan has deployed additional troops along the Line of Control.',
        explanation: `While there has been increased military activity in the region, official sources confirm it is not at the scale reported in some media. Satellite imagery from May 8, 2025 shows movement of approximately 3-4 battalions, which is consistent with routine rotation rather than a significant military buildup.

The Pakistan Armed Forces issued a statement on May 9th describing these as "scheduled military exercises planned months ago," though some independent analysts have questioned the timing given recent diplomatic tensions.

Verified eyewitness accounts from border villages mention seeing increased military presence, but not at the level claimed in viral social media posts.`,
        sources: [
          {
            name: 'Pakistan Armed Forces Press Release',
            url: 'https://example.com/pakistan-military-statement',
            credibilityScore: 75
          },
          {
            name: 'Reuters',
            url: 'https://example.com/reuters-border-report',
            credibilityScore: 92
          },
          {
            name: 'Satellite Imagery Analysis',
            url: 'https://example.com/satellite-analysis',
            credibilityScore: 88
          },
          {
            name: 'Local News Report',
            url: 'https://example.com/local-news',
            credibilityScore: 62
          }
        ],
        timestamp: 'May 10, 2025',
        imageUrl: data.type === 'image' ? 'https://via.placeholder.com/800x400' : undefined,
        relatedClaims: [
          {
            id: 'rel1',
            claim: 'Pakistan has moved missile systems to the border.',
            verdict: 'false'
          },
          {
            id: 'rel2',
            claim: 'India has placed its border forces on high alert.',
            verdict: 'true'
          },
          {
            id: 'rel3',
            claim: 'Civilians are being evacuated from border villages.',
            verdict: 'partial'
          }
        ]
      });
    }, 3000);
  };
  
  return (
    <Layout>
      <div className="bg-gray-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
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
                    <p className="text-gray-700">Enter a claim, upload an image, or provide a URL to a news article.</p>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 flex h-6 w-6 rounded-full bg-primary-100 text-primary-600 items-center justify-center mr-3">
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <p className="text-gray-700">Our system analyzes the content using AI and human verification.</p>
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
              ) : verificationResult ? (
                <FactCheckResult result={verificationResult} />
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