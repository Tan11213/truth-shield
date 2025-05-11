import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromImage, processSocialMediaScreenshot, generateSocialMediaFactCheckPrompt } from '../../utils/ocr';
import { FiUploadCloud, FiLink, FiMessageSquare, FiX, FiEdit2, FiLoader, FiInfo } from 'react-icons/fi';
import { FaTwitter, FaFacebook, FaInstagram, FaReddit, FaYoutube, FaCamera } from 'react-icons/fa';
import logger from '../../utils/logger';

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
  const [showPlatformIndicator, setShowPlatformIndicator] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [showImageError, setShowImageError] = useState(false);
  const [imageError, setImageError] = useState('');
  const [showUploading, setShowUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [claimText, setClaimText] = useState('');
  const [processedFileId, setProcessedFileId] = useState<string | null>(null);
  
  // When a file is added, process it with OCR only if it's a new file
  useEffect(() => {
    if (file && activeTab === 'image') {
      // Create a unique ID for the current file
      const currentFileId = `${file.name}-${file.size}-${file.lastModified}`;
      
      // Only process the file if it hasn't been processed yet
      if (processedFileId !== currentFileId) {
        setProcessedFileId(currentFileId);
        processImageWithOcr();
      }
    }
  }, [file, activeTab]);
  
  // Modify the useEffect that handles OCR completion
  useEffect(() => {
    // Check if OCR has just completed (transition from processing to not processing)
    // and we have extracted text
    if (isOcrProcessing === false && file && extractedText) {
      // Ensure the text area is visible
      setShowExtractedText(true);
      
      // Attempt to focus the text area (helps with visibility)
      setTimeout(() => {
        const textArea = document.getElementById('extracted-text') as HTMLTextAreaElement;
        if (textArea) {
          // Ensure it's visible in the DOM
          textArea.style.display = 'block';
          
          // Scroll it into view if needed
          textArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          
          // Log success for debugging
          console.log('OCR processing completed, text area ensured visible');
        }
      }, 200);
    }
  }, [isOcrProcessing, file, extractedText]);
  
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
  
  const retryOcr = () => {
    if (file) {
      setShowImageError(false);
      setImageError('');
      processImageWithOcr();
    }
  };
  
  const processImageWithOcr = async () => {
    if (!file) return;
    
    try {
      setIsOcrProcessing(true);
      setShowImageError(false);
      setExtractedText('');
      setShowExtractedText(true);
      // Reset detected platform for each new image
      setDetectedPlatform(null);
      setShowPlatformIndicator(false);
      
      let processedText = '';
      const isScreenshot = file.name.toLowerCase().includes('screenshot');

      // Simplified logic: Check if it's a social media screenshot, otherwise treat as general image
      const isSocialMediaScreenshot = 
        isScreenshot && (
          file.name.toLowerCase().includes('twitter') ||
          file.name.toLowerCase().includes('facebook') ||
          file.name.toLowerCase().includes('instagram') ||
          file.name.toLowerCase().includes('reddit')
        );

      if (isSocialMediaScreenshot) {
        logger.info('Processing potential social media screenshot with general OCR');
        try {
          // processSocialMediaScreenshot internally calls extractTextFromImage (general OCR)
          const screenshotData = await processSocialMediaScreenshot(file); 
          processedText = screenshotData.text || '';
          const prompt = generateSocialMediaFactCheckPrompt(screenshotData);
          setClaimText(prompt);
          if (screenshotData.platform) {
            setDetectedPlatform(screenshotData.platform);
            setShowPlatformIndicator(true);
          }
        } catch (socialMediaError) {
          logger.error('Social media screenshot processing failed (after general OCR)', {
            error: socialMediaError instanceof Error ? socialMediaError.message : String(socialMediaError)
          });
          setImageError(socialMediaError instanceof Error ? socialMediaError.message : 'Failed to process social media screenshot');
          setShowImageError(true);
          // Fall back to basic text extraction if social media specific logic fails
          logger.info('Falling back to basic image text extraction for social media image.');
          processedText = await extractTextFromImage(file);
        }
      } else {
        // Standard extraction for all other images (including news, now handled generally)
        logger.info('Processing general image/screenshot with general OCR');
        processedText = await extractTextFromImage(file);
      }
      
      console.log('OCR completed with result (general):', {
        textLength: processedText.length,
        textSample: processedText.substring(0, 50),
        isEmpty: !processedText.trim(),
        isSocialMedia: isSocialMediaScreenshot // Keep this for logging clarity
      });
      
      // Updated condition for minimal text
      if (processedText.trim().length > 0 && processedText.trim().length < 10) {
        logger.warn('OCR produced minimal text. Displaying as is.', { text: processedText });
      } else if (!processedText.trim()) {
        setImageError("No text detected in image. You can manually edit the text below or try a clearer image.");
        setShowImageError(true);
      }
      
      // Update the extracted text state directly
      setExtractedText(processedText);

    } catch (error) {
      console.error('OCR processing error (general flow):', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract text from image.';
      setImageError(errorMessage + "\n\nYou can try using a clearer image or manually enter the text.");
      setShowImageError(true);
      setExtractedText('');
      setShowExtractedText(true);
    } finally {
      setIsOcrProcessing(false);
      setShowUploading(false);
    }
  };
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFile(file);
      setShowUploading(true);
      setSelectedFile(file);
      // Reset processed file ID to force processing of the new file
      setProcessedFileId(null);
      
      // The useEffect hook will trigger processImageWithOcr when the file state changes
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
      const newFile = e.dataTransfer.files[0];
      setFile(newFile);
      // Reset processed file ID to force processing of the new file
      setProcessedFileId(null);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'text' && textInput.trim()) {
      onSubmit({ type: 'text', content: textInput });
    } else if (activeTab === 'url' && urlInput.trim()) {
      onSubmit({ type: 'url', content: urlInput });
    } else if (activeTab === 'image') {
      // For image tab, always use the extracted text if available
      if (file && extractedText.trim()) {
        onSubmit({ type: 'text', content: extractedText });
      } else if (file) {
        // If no extracted text but we have an image, let the user know they need text
        alert("Please wait for the OCR to complete or enter some text manually before verifying.");
      }
    }
  };
  
  const isSubmitDisabled = () => {
    if (isProcessing || isOcrProcessing) return true;
    
    if (activeTab === 'text') {
      return !textInput.trim();
    }
    
    if (activeTab === 'url') {
      return !urlInput.trim();
    }
    
    if (activeTab === 'image') {
      // For image tab, require both a file and text to be extracted/entered
      return !file || !extractedText.trim();
    }
    
    return true;
  };

  const getSubmitButtonText = () => {
    if (isProcessing) {
      return (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Verifying...
        </div>
      );
    }
    
    if (activeTab === 'image' && file && extractedText.trim()) {
      return 'Verify Extracted Text';
    }
    
    return 'Verify Now';
  };

  const getSocialMediaIcon = () => {
    // Removed 'news' case as platform detection is simplified to only social media types
    switch (detectedPlatform) { // Rely only on detectedPlatform which is set for social media
      case 'twitter': return <FaTwitter className="text-[#1DA1F2]" />;
      case 'facebook': return <FaFacebook className="text-[#1877F2]" />;
      case 'instagram': return <FaInstagram className="text-[#E4405F]" />;
      case 'reddit': return <FaReddit className="text-[#FF4500]" />;
      // Removed YouTube as it's not part of social media screenshot processing above
      // If URL tab handles YouTube separately, that logic is independent
      default: return <FiLink />; // Default icon for URL tab or if no platform detected
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
      <span className="relative">
        {label}
        {type === 'url' && (
          <span className="absolute -top-2 -right-12 bg-gray-200 text-gray-600 text-[8px] px-1 py-0.5 rounded-sm whitespace-nowrap">
            Coming Soon
          </span>
        )}
      </span>
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
              <motion.label 
                htmlFor="image-input" 
                className="block text-sm font-medium text-gray-700 mb-2"
                variants={itemVariants}
              >
                Upload an image or screenshot to verify
              </motion.label>
              
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
                  onChange={handleImageUpload}
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
                    
                    {/* Image Preview */}
                    <div className="mt-3 mb-2 border rounded-lg overflow-hidden shadow-sm max-w-[320px] max-h-[200px] w-full">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-full object-contain"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                    
                    <MotionButton 
                      type="button"
                      className="mt-2 px-3 py-1 bg-white text-gray-600 border border-gray-200 rounded-md text-xs hover:bg-gray-50 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setSelectedFile(null);
                        setExtractedText('');
                        setShowExtractedText(false);
                        setImageError('');
                        setShowImageError(false);
                        setDetectedPlatform(null);
                        setShowPlatformIndicator(false);
                        setIsOcrProcessing(false);
                        setProcessedFileId(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
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
                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        <FaCamera className="mr-1" size={12} />
                        Screenshots
                      </div>
                      <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        <FaTwitter className="mr-1" size={12} />
                        Twitter/X Posts
                      </div>
                      <div className="flex items-center text-xs text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                        <FaFacebook className="mr-1" size={12} />
                        Facebook Posts
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.p className="mt-2 text-xs text-gray-500" variants={itemVariants}>
                Upload screenshots of social media posts, news articles, or any content you want to verify. Our system will analyze the image and extract text for fact-checking.
              </motion.p>
            
              {/* OCR limitations information */}
              <motion.div 
                className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-xs text-blue-700 flex items-start"
                variants={itemVariants}
              >
                <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Gemini OCR Tips:</p>
                  <ul className="mt-1 list-disc list-inside">
                    <li>Use high-contrast images for best results</li>
                    <li>Processing may take time for larger images</li>
                    <li>Edit extracted text if needed before verification</li>
                  </ul>
                  <motion.a
                    href="OCR_TROUBLESHOOTING.md"
                    target="_blank"
                    className="mt-1 inline-block text-blue-600 hover:text-blue-800 underline"
                    whileHover={{ scale: 1.03 }}
                  >
                    View OCR Guide
                  </motion.a>
                </div>
              </motion.div>
            
              {/* OCR Results - Only show the OCR processing status when loading, not a separate block */}
              {isOcrProcessing && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md flex items-center">
                  <div className="animate-spin h-5 w-5 text-blue-500 mr-3">
                    <FiLoader />
                  </div>
                  <p className="text-sm text-blue-700">
                    Analyzing image with Gemini OCR... This may take a moment.
                  </p>
                </div>
              )}
              
              {/* OCR Error Display */}
              {showImageError && (
                <motion.div 
                  className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start">
                    <FiInfo className="mt-0.5 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Gemini OCR Error</p>
                      <p className="mt-1 text-red-500 whitespace-pre-line">{imageError}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {file && (
                          <motion.button
                            type="button"
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-xs font-medium flex items-center"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={retryOcr}
                          >
                            <FiLoader className="mr-1" /> Retry OCR
                          </motion.button>
                        )}
                        <motion.a
                          href="OCR_TROUBLESHOOTING.md"
                          target="_blank"
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-xs font-medium flex items-center"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <FiInfo className="mr-1" /> View OCR Tips
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Always show the textarea whenever we have a file, even during processing */}
              {file && (
                <motion.div 
                  className="mt-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="extracted-text" className="block text-sm font-medium text-gray-700">
                      {imageError 
                        ? "Enter or edit text for verification" 
                        : isOcrProcessing 
                          ? "Extracting text..." 
                          : "Extracted text (edit if needed)"}
                    </label>
                    <div className="text-xs text-gray-500 flex items-center">
                      <FiEdit2 className="mr-1" /> Editable
                    </div>
                  </div>
                  
                  {/* Force textarea visibility with inline style */}
                  <MotionTextArea
                    id="extracted-text"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder={isOcrProcessing ? "Extracting text..." : "Extracted text will appear here. You can edit it before verification."}
                    value={extractedText}
                    onChange={(e) => {
                      // Simple direct update without additional processing to prevent editing issues
                      setExtractedText(e.target.value);
                    }}
                    variants={itemVariants}
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" }}
                    disabled={isOcrProcessing}
                    style={{ display: 'block' }} // Force display
                  ></MotionTextArea>
                  
                  {process.env.NODE_ENV !== 'production' && (
                    <div className="text-xs text-gray-400 mt-1">
                      Text length: {extractedText.length} chars | Processing: {isOcrProcessing ? 'Yes' : 'No'}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
            
            {/* URL Input */}
            <div style={{ display: activeTab === 'url' ? 'block' : 'none' }} className="relative">
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 z-10 bg-white bg-opacity-80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="bg-primary-100 text-primary-800 font-semibold py-1 px-3 rounded-full text-sm mb-2">Coming Soon</div>
                <p className="text-gray-600 text-center text-sm max-w-md px-4">URL and social media verification functionality is under development. Check back soon!</p>
              </div>
              
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
            <div className="relative">
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
                {getSubmitButtonText()}
              </MotionButton>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </MotionDiv>
  );
};

export default FactCheckInput;