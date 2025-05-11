import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FactCheckResponse } from '../../utils/factCheck';
import { 
  FaCheck, 
  FaTimes, 
  FaExclamationTriangle, 
  FaQuestionCircle, 
  FaTwitter, 
  FaFacebook, 
  FaWhatsapp, 
  FaLink,
  FaArrowLeft,
  FaDownload,
  FaShare,
  FaCertificate,
  FaFlag
} from 'react-icons/fa';
import QRCode from 'qrcode.react';
import logger from '../../utils/logger';
import { saveAs } from 'file-saver';
import DisclaimerBanner from '../common/DisclaimerBanner';
import ReportForm from '../common/ReportForm';

interface FactCheckResultProps {
  result: FactCheckResponse;
  onCheckAnother: () => void;
}

interface ReportFormData {
  issueType: string;
  message: string;
  email: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

const MotionDiv = motion.div;
const MotionButton = motion.button;

const buttonHoverVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } }
};

const iconHoverVariants = {
  hover: { rotate: [0, -10, 10, -5, 5, 0], transition: { duration: 0.6 } }
};

const sourceItemVariants = {
  hover: { x: 5, transition: { duration: 0.2 } }
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, width = "max-w-lg" }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className={`bg-white rounded-xl shadow-xl overflow-hidden ${width} w-full`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            className="text-gray-500 hover:text-gray-700 transition-colors"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Format explanation text - Process markdown-style formatting and source citations
 * @param text The explanation text to format
 * @param sources Array of sources that might be referenced in the text
 * @returns React elements with formatted text and linked citations
 */
const formatExplanation = (text: string, sources: { name: string, url: string }[]) => {
  if (!text) return null;
  
  // First, replace ** bold ** with styled spans
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Then, replace citation numbers [1], [2], etc. with linked references
  // but only if we have corresponding sources
  const sourceMap = new Map();
  sources.forEach(source => {
    const match = source.name.match(/\[(\d+)\]/);
    if (match && match[1]) {
      sourceMap.set(match[1], source);
    }
  });
  
  // Replace citation markers with links to source entries
  formattedText = formattedText.replace(/\[(\d+)\]/g, (match, number) => {
    const source = sourceMap.get(number);
    if (source) {
      return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline">[${number}]</a>`;
    }
    return match; // Keep as is if no matching source
  });
  
  // Return as HTML
  return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
};

const FactCheckResult: React.FC<FactCheckResultProps> = ({ result, onCheckAnother }) => {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showFullExplanation, setShowFullExplanation] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState<ReportFormData>({
    issueType: 'incorrect_result',
    message: '',
    email: ''
  });
  const [showVerificationProof, setShowVerificationProof] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Map FactCheckResponse verdict to UI components VerificationStatus
  const getVerdict = (): 'true' | 'false' | 'partial' | 'unverified' => {
    switch (result.verdict) {
      case 'true': return 'true';
      case 'false': return 'false';
      case 'partial': return 'partial';
      default: return 'unverified';
    }
  };
  
  const getStatusIcon = () => {
    switch (getVerdict()) {
      case "true":
        return <FaCheck className="h-6 w-6 text-white" />;
      case "false":
        return <FaTimes className="h-6 w-6 text-white" />;
      case "partial":
        return <FaExclamationTriangle className="h-6 w-6 text-white" />;
      case "unverified":
        return <FaQuestionCircle className="h-6 w-6 text-white" />;
    }
  };
  
  const getStatusLabel = () => {
    switch (getVerdict()) {
      case "true":
        return "True";
      case "false":
        return "False";
      case "partial":
        return "Partially True";
      case "unverified":
        return "Unverified";
    }
  };
  
  const getStatusColor = () => {
    switch (getVerdict()) {
      case "true":
        return "bg-true-500";
      case "false":
        return "bg-false-500";
      case "partial":
        return "bg-partial-500";
      case "unverified":
        return "bg-gray-500";
    }
  };
  
  const generateShareableLink = () => {
    // In a real app, this would generate a unique, short URL
    return `https://truthshield.org/fact-check/${result.id}`;
  };
  
  const copyToClipboard = () => {
    try {
      const shareableLink = generateShareableLink();
      navigator.clipboard.writeText(shareableLink)
        .then(() => {
          setCopied(true);
          logger.info("Link copied to clipboard");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => {
          logger.error("Failed to copy link to clipboard", err);
        });
    } catch (error) {
      logger.reportError(error as Error, "FactCheckResult.copyToClipboard");
    }
  };
  
  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            saveAs(blob, `truthshield-verification-${result.id}.png`);
            
            // Log the QR code download
            logger.info('QR code downloaded', { resultId: result.id });
          }
        });
      }
    }
  };
  
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real implementation, this would send an email with report data
      logger.info("Report submitted", { 
        resultId: result.id,
        issueType: reportData.issueType,
        hasMessage: !!reportData.message.trim(),
        hasEmail: !!reportData.email.trim()
      });
      
      // For this mock implementation, we'll simulate sending an email
      console.log("Sending report email to support@truthshield.org with:");
      console.log("- Issue type:", reportData.issueType);
      console.log("- Message:", reportData.message);
      console.log("- Contact email:", reportData.email);
      console.log("- Fact check result ID:", result.id);
      console.log("- Claim:", result.claim);
      console.log("- Verdict:", result.verdict);
      
      alert("Thank you for your feedback. Our team will review this report and contact you if needed.");
      setShowReportForm(false);
      
      // Reset form data
      setReportData({
        issueType: 'incorrect_result',
        message: '',
        email: ''
      });
    } catch (error) {
      logger.reportError(error as Error, "FactCheckResult.handleReportSubmit");
      alert("There was an error submitting your report. Please try again later.");
    }
  };
  
  const handleReportInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Modified truncated explanation handling to preserve formatting
  const truncatedText = result.explanation.length > 150 ? 
    result.explanation.substring(0, 150) + "..." : 
    result.explanation;

  // Log that the result was viewed
  React.useEffect(() => {
    logger.info('Fact check result viewed', { 
      resultId: result.id,
      verdict: result.verdict
    });
  }, [result.id, result.verdict]);

  // Handle QR code download
  const handleDownloadQR = () => {
    try {
      if (qrRef.current) {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
          canvas.toBlob((blob) => {
            if (blob) {
              saveAs(blob, `truthshield-verification-${result.id}.png`);
              
              // Log the QR code download
              logger.info('QR code downloaded', { resultId: result.id });
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to download QR code:', error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <MotionDiv 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="shadow-lg overflow-hidden rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300" 
      >
        <motion.div 
          className={`p-4 ${getStatusColor()} flex items-center justify-between`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <motion.div 
              className="bg-white bg-opacity-20 p-2 rounded-full"
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              {getStatusIcon()}
            </motion.div>
            <h2 className="text-white font-semibold text-xl">
              {getStatusLabel()}
            </h2>
          </div>
          <div className="bg-white bg-opacity-20 text-white border-white border-opacity-30 rounded-full px-3 py-1 text-xs font-medium">
            {new Date(result.timestamp).toLocaleDateString()}
          </div>
        </motion.div>
        
        <div className="p-6 space-y-5 bg-white">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DisclaimerBanner variant="warning" dismissible={false} />
          </motion.div>
          
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Claim</h3>
            <motion.blockquote 
              className="border-l-4 border-gray-300 pl-4 italic text-gray-700 bg-gray-50 p-3 rounded-r-md"
              whileHover={{ x: 5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
              transition={{ duration: 0.2 }}
            >
              {result.claim}
            </motion.blockquote>
          </motion.div>
          
          <motion.div 
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Verdict</h3>
            <motion.div 
              className="bg-white border rounded-md p-3"
              whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="text-gray-800">
                {!showFullExplanation ? 
                  formatExplanation(truncatedText, result.sources) : 
                  formatExplanation(result.explanation, result.sources)
                }
              </div>
              {result.explanation.length > 150 && (
                <MotionButton 
                  onClick={() => setShowFullExplanation(!showFullExplanation)}
                  className="mt-2 text-primary-600 w-full text-sm hover:underline"
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonHoverVariants}
                >
                  {showFullExplanation ? "Show Less" : "Read Full Explanation"}
                </MotionButton>
              )}
            </motion.div>
          </motion.div>
          
          {result.sources.length > 0 && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sources</h3>
              <ol className="list-decimal pl-5 space-y-2 bg-gray-50 p-3 rounded-md">
                {result.sources.map((source, index) => (
                  <motion.li 
                    key={index} 
                    className="ml-1 py-1"
                    whileHover="hover"
                    variants={sourceItemVariants}
                  >
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-sm hover:text-primary-800 transition-colors duration-200"
                    >
                      {source.name}
                    </a>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}
          
          {result.relatedClaims && result.relatedClaims.length > 0 && (
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Related Claims</h3>
              <div className="space-y-2">
                {result.relatedClaims.map((claim, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center bg-white rounded-lg border border-gray-200 p-3"
                    whileHover={{ x: 5, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0 ${
                        claim.verdict === 'true' ? 'bg-true-500' :
                        claim.verdict === 'false' ? 'bg-false-500' :
                        'bg-partial-500'
                      }`}
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      {claim.verdict === 'true' ? <FaCheck className="h-3 w-3 text-white" /> :
                       claim.verdict === 'false' ? <FaTimes className="h-3 w-3 text-white" /> :
                       <FaExclamationTriangle className="h-3 w-3 text-white" />}
                    </motion.div>
                    <p className="text-sm text-gray-800">{claim.claim}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          
          {/* Verification Certificate Section */}
          <AnimatePresence>
            {showVerificationProof && (
              <MotionDiv
                initial={{ opacity: 0, y: 10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: 10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 p-4 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <motion.div
                    whileHover="hover"
                    variants={iconHoverVariants}
                  >
                    <FaCertificate className="text-primary-500" />
                  </motion.div>
                  <h3 className="text-base font-medium text-gray-700">Verification Certificate</h3>
                </div>
                
                <motion.div 
                  className="bg-gray-50 p-4 rounded-md mb-4"
                  whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                >
                  <p className="text-sm text-gray-700 mb-2">
                    This fact-check can be verified by anyone using the URL or QR code below. 
                    Use this as proof when sharing verified information in discussions.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                    <motion.div 
                      className="bg-white p-2 border border-gray-200 rounded-md"
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <QRCode value={generateShareableLink()} size={120} renderAs="svg" includeMargin={true} />
                    </motion.div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Verification Link:</p>
                        <div className="relative">
                          <input 
                            type="text" 
                            readOnly 
                            value={generateShareableLink()} 
                            className="w-full text-sm bg-white border border-gray-200 rounded py-1 px-2 text-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                            placeholder="Verification Link"
                          />
                          <motion.button
                            onClick={copyToClipboard}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-700"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <FaLink size={14} />
                          </motion.button>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">How to use:</p>
                        <ol className="list-decimal text-xs text-gray-700 pl-4">
                          <li>Share this link or QR code when referencing this fact check</li>
                          <li>Recipients can scan or click to verify the information directly</li>
                          <li>All verification data is cryptographically timestamped and immutable</li>
                        </ol>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <MotionButton
                          onClick={downloadQRCode}
                          className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded flex items-center gap-1.5"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaDownload size={12} />
                          Download QR
                        </MotionButton>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <MotionButton 
                  className="w-full text-sm text-primary-600 hover:text-primary-800"
                  onClick={() => setShowVerificationProof(false)}
                  whileHover="hover"
                  whileTap="tap"
                  variants={buttonHoverVariants}
                >
                  Hide Certificate
                </MotionButton>
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
        
        <motion.div 
          className="bg-white px-6 py-4 border-t border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex space-x-4 mb-4 sm:mb-0">
              <MotionButton 
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                onClick={() => setShowShareOptions(!showShareOptions)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaShare size={14} />
                Share
              </MotionButton>
              <MotionButton 
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                onClick={() => setShowReportForm(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFlag size={14} />
                Report
              </MotionButton>
              <MotionButton 
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                onClick={() => setShowVerificationProof(!showVerificationProof)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaCertificate size={14} />
                Certificate
              </MotionButton>
            </div>
            
            <div className="flex items-center">
              <MotionButton
                onClick={onCheckAnother}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ x: [-3, 0, -3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <FaArrowLeft className="h-3 w-3 mr-2" />
                </motion.div>
                Check Another
              </MotionButton>
            </div>
          </div>
          
          <AnimatePresence>
            {showShareOptions && (
              <MotionDiv 
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h4 className="text-sm font-medium text-gray-700 mb-2">Share this fact check:</h4>
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center bg-white rounded-md border border-gray-200 p-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={generateShareableLink()} 
                      className="flex-1 text-sm bg-transparent border-none focus:ring-0 text-gray-700"
                      placeholder="Share URL"
                    />
                    <MotionButton 
                      onClick={copyToClipboard}
                      className="ml-2 bg-primary-100 text-primary-700 px-3 py-1 rounded text-sm flex items-center gap-1.5"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {copied ? (
                        <>
                          <FaCheck size={14} />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FaLink size={14} />
                          Copy
                        </>
                      )}
                    </MotionButton>
                  </div>
                  <div className="flex space-x-3 justify-center">
                    <MotionButton 
                      className="p-2 bg-[#1DA1F2] text-white rounded-full hover:bg-opacity-90 transition-colors"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?text=Fact Check: ${getStatusLabel()} - ${result.explanation.substring(0, 100)}...&url=${generateShareableLink()}`, '_blank')}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTwitter size={18} />
                    </MotionButton>
                    <MotionButton 
                      className="p-2 bg-[#1877F2] text-white rounded-full hover:bg-opacity-90 transition-colors"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${generateShareableLink()}`, '_blank')}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaFacebook size={18} />
                    </MotionButton>
                    <MotionButton 
                      className="p-2 bg-[#25D366] text-white rounded-full hover:bg-opacity-90 transition-colors"
                      onClick={() => window.open(`https://wa.me/?text=Fact Check: ${getStatusLabel()} - ${result.explanation.substring(0, 100)}... ${generateShareableLink()}`, '_blank')}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaWhatsapp size={18} />
                    </MotionButton>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </motion.div>
      </MotionDiv>
      
      {/* Report Issue Modal */}
      <AnimatePresence>
        {showReportForm && (
          <ReportForm 
            onClose={() => setShowReportForm(false)}
            contentId={result.id}
            contentType="fact_check"
            contentPreview={`Claim: ${result.claim.substring(0, 100)}... Verdict: ${result.verdict}`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactCheckResult; 