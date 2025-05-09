import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface FactCheckInputProps {
  onSubmit: (data: { type: string; content: string; file?: File }) => void;
  isProcessing: boolean;
}

const FactCheckInput: React.FC<FactCheckInputProps> = ({ onSubmit, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'text' && inputValue.trim()) {
      onSubmit({ type: 'text', content: inputValue });
    } else if (activeTab === 'url' && inputValue.trim()) {
      onSubmit({ type: 'url', content: inputValue });
    } else if (activeTab === 'image' && file) {
      onSubmit({ type: 'image', content: file.name, file });
    }
  };
  
  const isSubmitDisabled = () => {
    if (isProcessing) return true;
    if (activeTab === 'text' || activeTab === 'url') return !inputValue.trim();
    if (activeTab === 'image') return !file;
    return true;
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-8">
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
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <label htmlFor="claim-text" className="block text-sm font-medium text-gray-700 mb-2">
              Enter a claim to fact-check
            </label>
            <textarea 
              id="claim-text"
              rows={4}
              className="input-field"
              placeholder="E.g., Pakistan has deployed additional troops along the Line of Control."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            ></textarea>
            <p className="mt-2 text-xs text-gray-500">
              For best results, enter a specific claim rather than a general question.
            </p>
          </motion.div>
        )}
        
        {activeTab === 'image' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload an image to verify
            </label>
            <div 
              className={`border-2 border-dashed ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'} ${file ? 'bg-gray-50' : ''} rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button"
                    className="mt-3 text-xs text-primary-600 hover:text-primary-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">Drag and drop an image, or click to browse</p>
                  <p className="mt-1 text-xs text-gray-500">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                </>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              We analyze images for manipulations and verify their context using visual matching.
            </p>
          </motion.div>
        )}
        
        {activeTab === 'url' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
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
            <p className="mt-2 text-xs text-gray-500">
              We'll analyze the content, check its sources, and verify key claims made in the linked content.
            </p>
          </motion.div>
        )}
        
        <button 
          type="submit"
          disabled={isSubmitDisabled()}
          className={`w-full btn-primary flex justify-center items-center ${
            isSubmitDisabled() ? 'opacity-60 cursor-not-allowed' : ''
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
      
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 uppercase mb-3">Why Verify with TruthShield?</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700">We cross-reference with multiple credible sources</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700">Our algorithm can detect manipulated media</span>
          </li>
          <li className="flex items-start">
            <svg className="h-5 w-5 text-primary-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700">We provide cultural context relevant to the India-Pakistan conflict</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FactCheckInput; 