import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromImage } from '../../utils/ocr';
import { FiUploadCloud, FiLink, FiMessageSquare, FiX, FiEdit2, FiLoader } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaInstagram, FaReddit, FaYoutube } from 'react-icons/fa';

interface FactCheckInputProps {
  onSubmit: (data: { type: string; content: string; file?: File }) => void;
  isProcessing: boolean;
}

const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionInput = motion.input;
const MotionTextArea = motion.textarea;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const buttonVariants = {
  hover: { scale: 1.03, boxShadow: "0 5px 10px rgba(0,0,0,0.1)" },
  tap: { scale: 0.97 }
};

const FactCheckInput: React.FC<FactCheckInputProps> = ({ onSubmit, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [socialMediaPlatform, setSocialMediaPlatform] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // When a file is added, process it with OCR
  useEffect(() => {
    if (file && activeTab === 'image') {
      processImageWithOcr();
    }
  }, [file, activeTab]);
  
  // Detect social media platform from URL
  useEffect(() => {
    if (urlInput) {
      if (urlInput.includes('twitter.com') || urlInput.includes('x.com')) {
        setSocialMediaPlatform('twitter');
      } else if (urlInput.includes('facebook.com')) {
        setSocialMediaPlatform('facebook');
      } else if (urlInput.includes('instagram.com')) {
        setSocialMediaPlatform('instagram');
      } else if (urlInput.includes('reddit.com')) {
        setSocialMediaPlatform('reddit');
      } else if (urlInput.includes('youtube.com') || urlInput.includes('youtu.be')) {
        setSocialMediaPlatform('youtube');
      } else {
        setSocialMediaPlatform(null);
      }
    } else {
      setSocialMediaPlatform(null);
    }
  }, [urlInput]);
  
  const processImageWithOcr = async () => {
    if (!file) return;
    
    try {
      setIsOcrProcessing(true);
      const text = await extractTextFromImage(file);
      setExtractedText(text);
      setShowExtractedText(true);
    } catch (error) {
      console.error('OCR processing error:', error);
      alert('Failed to extract text from image. You can still submit the image for analysis or enter text manually.');
    } finally {
      setIsOcrProcessing(false);
    }
  };
  
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
    
    if (activeTab === 'text' && textInput.trim()) {
      onSubmit({ type: 'text', content: textInput });
    } else if (activeTab === 'url' && urlInput.trim()) {
      onSubmit({ type: 'url', content: urlInput });
    } else if (activeTab === 'image' && file) {
      // If we have extracted text, use that as the content to check
      const contentToCheck = showExtractedText && extractedText.trim() 
        ? extractedText 
        : 'Image verification';
        
      onSubmit({ type: 'image', content: contentToCheck, file });
    }
  };
  
  const isSubmitDisabled = () => {
    if (isProcessing || isOcrProcessing) return true;
    if (activeTab === 'text') return !textInput.trim();
    if (activeTab === 'url') return !urlInput.trim();
    if (activeTab === 'image') return !file;
    return true;
  };

  const getSocialMediaIcon = () => {
    switch (socialMediaPlatform) {
      case 'twitter': return <FaTwitter className="text-[#1DA1F2]" />;
      case 'facebook': return <FaFacebook className="text-[#1877F2]" />;
      case 'instagram': return <FaInstagram className="text-[#E4405F]" />;
      case 'reddit': return <FaReddit className="text-[#FF4500]" />;
      case 'youtube': return <FaYoutube className="text-[#FF0000]" />;
      default: return <FiLink />;
    }
  };

  const TabButton = ({ type, label, icon: Icon }: { type: 'text' | 'image' | 'url', label: string, icon: React.ComponentType }) => (
    <MotionButton 
      type="button"
      onClick={() => setActiveTab(type)}
      className={`flex-1 py-3 flex items-center justify-center space-x-2 transition-colors ${
        activeTab === type 
          ? 'text-primary-600 border-b-2 border-primary-500 font-medium' 
          : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
      }`}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
    >
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: activeTab === type ? [1, 1.2, 1] : 1 }}
        transition={{ duration: 0.5 }}
      >
        <Icon />
      </motion.div>
      <span>{label}</span>
    </MotionButton>
  );
  
  return (
    <MotionDiv
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Tab navigation */}
      <motion.div className="flex border-b border-gray-100" variants={itemVariants}>
        <TabButton type="text" label="Text" icon={FiMessageSquare} />
        <TabButton type="image" label="Image" icon={FiUploadCloud} />
        <TabButton type="url" label="URL / Social" icon={FiLink} />
      </motion.div>
      
      {/* Input form */}
      <motion.div className="p-6" variants={itemVariants}>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Text Input */}
            <div style={{ display: activeTab === 'text' ? 'block' : 'none' }}>
              <motion.label 
                htmlFor="claim-text" 
                className="block text-sm font-medium text-gray-700 mb-2"
                variants={itemVariants}
              >
                Enter a claim to fact-check
              </motion.label>
              <MotionTextArea 
                id="claim-text"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                placeholder="E.g., Pakistan has deployed additional troops along the Line of Control."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                variants={itemVariants}
                whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }}
              ></MotionTextArea>
              <motion.p className="mt-2 text-xs text-gray-500" variants={itemVariants}>
                For best results, enter a specific claim rather than a general question.
              </motion.p>
            </div>
            
            {/* Image Input */}
            <div style={{ display: activeTab === 'image' ? 'block' : 'none' }}>
              <motion.div 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-primary-500 bg-primary-50' 
                    : file 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-gray-200 hover:border-primary-300'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                variants={itemVariants}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                {file ? (
                  <motion.div 
                    className="flex flex-col items-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-3"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <FiUploadCloud size={24} />
                    </motion.div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <MotionButton 
                      type="button"
                      className="mt-3 px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-md text-xs hover:bg-gray-50 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setExtractedText('');
                        setShowExtractedText(false);
                      }}
                      whileHover={{ scale: 1.05, backgroundColor: "#f9fafb" }}
                    >
                      <FiX size={12} className="mr-1" />
                      Remove
                    </MotionButton>
                  </motion.div>
                ) : (
                  <div>
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                      <FiUploadCloud size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Drag and drop an image, or click to browse</p>
                    <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, GIF</p>
                  </div>
                )}
              </motion.div>
            
              {/* OCR Results */}
              {isOcrProcessing && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center">
                  <div className="animate-spin h-5 w-5 text-blue-500 mr-3">
                    <FiLoader />
                  </div>
                  <p className="text-sm text-blue-700">Analyzing image text...</p>
                </div>
              )}
              
              {showExtractedText && (
                <motion.div 
                  className="mt-4 border border-gray-200 rounded-md p-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Extracted Text:</h4>
                    <MotionButton
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                      onClick={() => setShowExtractedText(!showExtractedText)}
                      whileHover={{ scale: 1.05 }}
                    >
                      <FiEdit2 size={12} className="mr-1" />
                      Edit
                    </MotionButton>
                  </div>
                  <MotionTextArea 
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    whileFocus={{ scale: 1.01 }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You can edit the extracted text if needed for more accurate results.
                  </p>
                </motion.div>
              )}
            </div>
            
            {/* URL Input */}
            <div style={{ display: activeTab === 'url' ? 'block' : 'none' }}>
              <motion.label 
                htmlFor="url-input" 
                className="block text-sm font-medium text-gray-700 mb-2"
                variants={itemVariants}
              >
                Enter a URL to fact-check
              </motion.label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {getSocialMediaIcon()}
                </div>
                <MotionInput 
                  id="url-input"
                  type="url"
                  className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                  placeholder="e.g., https://twitter.com/username/status/123456789"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  variants={itemVariants}
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }}
                />
              </div>
              
              <motion.div className="mt-3 flex flex-wrap gap-2" variants={itemVariants}>
                <div className="text-xs text-gray-500 mb-1 w-full">Popular platforms:</div>
                <button 
                  type="button" 
                  onClick={() => setUrlInput(urlInput => urlInput.includes('twitter.com') ? urlInput : 'https://twitter.com/')}
                  className="px-2 py-1 rounded-md text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <FaTwitter className="text-[#1DA1F2]" /> Twitter/X
                </button>
                <button 
                  type="button" 
                  onClick={() => setUrlInput(urlInput => urlInput.includes('facebook.com') ? urlInput : 'https://facebook.com/')}
                  className="px-2 py-1 rounded-md text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <FaFacebook className="text-[#1877F2]" /> Facebook
                </button>
                <button 
                  type="button" 
                  onClick={() => setUrlInput(urlInput => urlInput.includes('instagram.com') ? urlInput : 'https://instagram.com/')}
                  className="px-2 py-1 rounded-md text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <FaInstagram className="text-[#E4405F]" /> Instagram
                </button>
                <button 
                  type="button" 
                  onClick={() => setUrlInput(urlInput => urlInput.includes('reddit.com') ? urlInput : 'https://reddit.com/')}
                  className="px-2 py-1 rounded-md text-xs flex items-center gap-1 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <FaReddit className="text-[#FF4500]" /> Reddit
                </button>
              </motion.div>
              
              <motion.p className="mt-2 text-xs text-gray-500" variants={itemVariants}>
                Paste a link to a news article, social media post, or any web content for verification.
              </motion.p>
            </div>
          </div>
          
          <motion.div 
            className="mt-6"
            variants={itemVariants}
          >
            <MotionButton
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all ${
                isSubmitDisabled() 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
              disabled={isSubmitDisabled()}
              variants={buttonVariants}
              whileHover={!isSubmitDisabled() ? "hover" : undefined}
              whileTap={!isSubmitDisabled() ? "tap" : undefined}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Now'
              )}
            </MotionButton>
          </motion.div>
        </form>
      </motion.div>
    </MotionDiv>
  );
};

export default FactCheckInput; 