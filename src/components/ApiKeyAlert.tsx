import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const ApiKeyAlert: React.FC = () => {
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Make a test request to the API to check if the key is configured
    const checkApiConfig = async () => {
      try {
        const response = await fetch('/api/verify-fact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ claim: 'test' }),
        });
        
        const data = await response.json();
        
        // Check if the error is related to API key configuration
        if (response.status === 500 && 
            (data.error?.includes('API key') || 
             data.error?.includes('Authentication') || 
             data.error?.includes('Perplexity'))) {
          setShowAlert(true);
          console.error('API key configuration issue detected:', data.error);
        }
      } catch (error) {
        console.error('Error checking API configuration:', error);
      }
    };
    
    checkApiConfig();
  }, []);
  
  if (!showAlert) return null;
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">API Configuration Required</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              The API key for fact-checking service is missing or invalid. To use TruthShield's verification features, you need to:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Create an account at <a href="https://www.perplexity.ai" target="_blank" rel="noopener noreferrer" className="underline">Perplexity.ai</a></li>
              <li>Get your API key from <a href="https://www.perplexity.ai/settings/api" target="_blank" rel="noopener noreferrer" className="underline">your account settings</a></li>
              <li>Add the key to your <code className="bg-yellow-100 px-1">.env</code> file as <code className="bg-yellow-100 px-1">PERPLEXITY_API_KEY=pplx-...</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              onClick={() => setShowAlert(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyAlert; 