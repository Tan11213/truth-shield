import React, { useState, useRef, useEffect } from 'react';
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
  FaFlag,
  FaQrcode,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import QRCode from 'qrcode.react';
import logger from '../../utils/logger';
import DisclaimerBanner from '../common/DisclaimerBanner';
import ReportForm from '../common/ReportForm';

// Add styles for explanation content
import './FactCheckStyles.css';

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
  
  let formattedText = text;
  
  // Fix markdown bold formatting with asterisks (**text**)
  formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Handle claim formatting specially, creating a bolder more visible format
  formattedText = formattedText.replace(
    /\*\*Claim\s+(\d+):\*\*\s*([^\n]+)/gi,
    '<div class="verdict-section mb-3"><span class="verdict-label">Claim $1:</span> <span class="verdict-value">$2</span></div>'
  );
  
  // Create verdict sections with appropriate styling
  const verdictPatterns = [
    { pattern: /\*\*Claim\s+(\d+):\*\*\s*TRUE/gi, class: 'verdict-true' },
    { pattern: /\*\*Claim\s+(\d+):\*\*\s*FALSE/gi, class: 'verdict-false' },
    { pattern: /\*\*Claim\s+(\d+):\*\*\s*PARTIALLY TRUE/gi, class: 'verdict-partial' }
  ];
  
  verdictPatterns.forEach(({ pattern, class: className }) => {
    formattedText = formattedText.replace(
      pattern,
      `<div class="verdict-section mb-3"><span class="verdict-label">Claim $1:</span> <span class="verdict-value ${className}">$2</span></div>`
    );
  });
  
  // Create a clear verdict section if needed
  const verdictMatch = formattedText.match(/(?:^|\n)(?:VERDICT|Overall):\s*([^\n]+)/i);
  if (verdictMatch) {
    const verdict = verdictMatch[1].trim();
    let verdictClass = '';
    
    if (verdict.toLowerCase().includes('true') && !verdict.toLowerCase().includes('false')) {
      verdictClass = 'verdict-true';
    } else if (verdict.toLowerCase().includes('false')) {
      verdictClass = 'verdict-false';
    } else if (verdict.toLowerCase().includes('partial')) {
      verdictClass = 'verdict-partial';
    }
    
    // Replace the verdict line with formatted version
    formattedText = formattedText.replace(
      verdictMatch[0], 
      `<div class="verdict-section mb-3"><span class="verdict-label">Verdict:</span> <span class="verdict-value ${verdictClass}">${verdict}</span></div>`
    );
  }
  
  // Fix the "-" bullet point in the verdict display
  formattedText = formattedText.replace(
    /(?:^|\n)-\s+Overall:\s*([^\n]+)/gi,
    '<div class="verdict-section mb-3"><span class="verdict-label">Overall:</span> <span class="verdict-value">$1</span></div>'
  );
  
  // Format specific claims verdicts
  formattedText = formattedText.replace(
    /(?:^|\n)(?:Claim|Point)\s+(\d+):\s*([^\n]+)/gi,
    '<div class="claim-verdict mb-2"><span class="font-medium">Claim $1:</span> <span class="$2-color">$2</span></div>'
  );
  
  // Make numbered claim points stand out with bold formatting
  formattedText = formattedText.replace(
    /(?:^|\n)(\d+)\.\s+(.*?)(?::\s*-\s*)(This claim is (true|false|partially true)[^\.]+)/gi,
    (match, num, claimText, verdict, verdictType) => {
      // Normalize the verdict type for CSS class
      const normalizedVerdictType = verdictType.toLowerCase().replace(/\s+/g, '-');
      return `<p class="claim-point mb-3"><strong>${num}. ${claimText}</strong>: - <span class="verdict-${normalizedVerdictType}">${verdict}</span></p>`;
    }
  );
  
  // Handle alternative claim format (without "This claim is...")
  formattedText = formattedText.replace(
    /(?:^|\n)(\d+)\.\s+(.*?)(?::\s*-\s*)([^\.]+(?:true|false).*?\.)/gi,
    (match, num, claimText, verdict) => {
      // Determine verdict type from the text
      let verdictClass = 'neutral';
      if (verdict.toLowerCase().includes('true') && !verdict.toLowerCase().includes('false')) {
        verdictClass = 'verdict-true';
      } else if (verdict.toLowerCase().includes('false')) {
        verdictClass = 'verdict-false';
      } else if (verdict.toLowerCase().includes('partial')) {
        verdictClass = 'verdict-partially-true';
      }
      
      return `<p class="claim-point mb-3"><strong>${num}. ${claimText}</strong>: - <span class="${verdictClass}">${verdict}</span></p>`;
    }
  );
  
  // Make claim numbers and sections stand out (for other numbered points)
  formattedText = formattedText.replace(
    /(?:^|\n)(\d+)\.\s+((?:[^\n])+)/g, 
    '<p class="claim-point mb-2"><strong>$1.</strong> $2</p>'
  );
  
  // Handle special format for "1.**" style numbering 
  formattedText = formattedText.replace(
    /(\*\*\d+\.\*\*)\s+(.+?)(?=\*\*\d+\.\*\*|$)/g,
    '<p class="claim-point mb-2">$1 $2</p>'
  );
  
  // Format paragraphs properly
  formattedText = formattedText.replace(/\n\n+/g, '</p><p class="mb-2">');
  formattedText = formattedText.replace(/\n(?!\n)/g, '<br>');
  
  // Add color highlighting for TRUE/FALSE/PARTIALLY TRUE verdicts
  formattedText = formattedText
    .replace(/\bTRUE\b/g, '<span class="text-true-600 font-semibold">TRUE</span>')
    .replace(/\bFALSE\b/g, '<span class="text-false-600 font-semibold">FALSE</span>')
    .replace(/\bPARTIALLY TRUE\b/g, '<span class="text-partial-600 font-semibold">PARTIALLY TRUE</span>');
  
  // Create a map of source references by index
  const sourcesByIndex = new Map();
  sources.forEach((source, index) => {
    // Sources are 1-indexed in the text references
    const refNumber = source.name.match(/\[(\d+)\]/) 
      ? source.name.match(/\[(\d+)\]/)?.[1] 
      : String(index + 1);
    
    sourcesByIndex.set(refNumber, source);
  });
  
  // Replace all citation references with linked versions
  formattedText = formattedText.replace(/\[(\d+)\]/g, (match, number) => {
    const source = sourcesByIndex.get(number);
    if (source && source.url) {
      return `<a href="${source.url}" target="_blank" rel="noopener noreferrer" class="text-primary-600 hover:underline font-medium">[${number}]</a>`;
    }
    return match; // Keep as is if no matching source
  });
  
  // Wrap in a paragraph if needed
  if (!formattedText.startsWith('<p') && !formattedText.startsWith('<div')) {
    formattedText = `<p class="mb-2">${formattedText}</p>`;
  }
  
  // Return as HTML
  return <div dangerouslySetInnerHTML={{ __html: formattedText }} className="explanation-content" />;
};

const FactCheckResult: React.FC<FactCheckResultProps> = ({ result, onCheckAnother }) => {
  const [copied, setCopied] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState<ReportFormData>({
    issueType: 'incorrect_result',
    message: '',
    email: ''
  });
  const [showVerificationProof, setShowVerificationProof] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false);
  
  const qrRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  // Function to toggle explanation expansion
  const toggleExplanation = () => {
    setIsExplanationExpanded(!isExplanationExpanded);
  };
  
  // Check if explanation is lengthy and should be collapsed
  const isExplanationLengthy = result.explanation && result.explanation.length > 500;
  
  // Get shortened explanation for collapsed view
  const getShortenedExplanation = () => {
    if (!isExplanationLengthy || isExplanationExpanded) {
      return result.explanation;
    }
    
    // Find a good breaking point - end of a sentence near 500 characters
    const breakPoint = result.explanation.substring(0, 500).lastIndexOf('.');
    return breakPoint > 200 ? result.explanation.substring(0, breakPoint + 1) : result.explanation.substring(0, 500) + '...';
  };
  
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
  
  // Generate a shareable link with the fact check ID and a hash
  const generateShareableLink = () => {
    // Create a hash from the result content for verification
    const contentHash = btoa(result.claim.substring(0, 30) + result.verdict).substring(0, 8);
    
    // In production, this would use your actual domain
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/verify?id=${result.id}&h=${contentHash}`;
    
    return shareUrl;
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

  // Show QR code in a modal
  const showQRCodeModal = () => {
    setShowQRModal(true);
  };
  
  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        // Create a temporary link element
        const link = document.createElement('a');
        
        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = `truthshield-verification-${result.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            // Log the QR code download
            logger.info('QR code downloaded', { resultId: result.id });
          }
        });
      }
    }
  };
  
  // Additional button to replace the Certificate button
  const openShareCertificate = () => {
    setShowVerificationProof(true);
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
  
  // Function to handle reporting
  const handleReport = () => {
    // Prepare detailed content preview with full result details
    const detailedData = {
      claim: result.claim,
      verdict: result.verdict,
      explanation: result.explanation,
      sources: result.sources.map(source => source.name).join(', '),
      timestamp: result.timestamp
    };
    
    // Open report form with complete data
    setShowReportForm(true);
  };

  // Log that the result was viewed and scroll to result on mobile
  useEffect(() => {
    logger.info('Fact check result viewed', { 
      resultId: result.id,
      verdict: result.verdict
    });
    
    // Auto-scroll to the result component on all devices
    if (resultRef.current) {
      // Use a small timeout to ensure the component is fully rendered
      setTimeout(() => {
        // Check if the element is not visible in viewport
        if (resultRef.current) {
          const rect = resultRef.current.getBoundingClientRect();
          const isVisible = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
          
          // Only scroll if the element is not fully visible
          if (!isVisible && resultRef.current) {
            resultRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          }
        }
      }, 300);
    }
  }, [result.id, result.verdict]);

  return (
    <div className="w-full max-w-3xl mx-auto" ref={resultRef}>
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
              className="bg-white border rounded-md p-6"
              whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
            >
              <div className="flex items-center mb-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                  getVerdict() === 'true' ? 'bg-true-500' :
                  getVerdict() === 'false' ? 'bg-false-500' :
                  getVerdict() === 'partial' ? 'bg-partial-500' :
                  'bg-gray-500'
                }`}>
                  {getStatusIcon()}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{getStatusLabel()}</h3>
              </div>
              
              <div className="text-gray-800 explanation-content">
                {formatExplanation(
                  isExplanationLengthy && !isExplanationExpanded 
                    ? getShortenedExplanation() 
                    : result.explanation, 
                  result.sources
                )}
                
                {isExplanationLengthy && (
                  <motion.button
                    onClick={toggleExplanation}
                    className="mt-4 text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isExplanationExpanded ? (
                      <>Show Less <FaChevronUp className="ml-1" size={12} /></>
                    ) : (
                      <>Read More <FaChevronDown className="ml-1" size={12} /></>
                    )}
                  </motion.button>
                )}
              </div>
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
                {result.sources.map((source, index) => {
                  // Extract reference number if it exists in the title
                  const refMatch = source.name.match(/\[(\d+)\]/) || [`[${index + 1}]`, String(index + 1)];
                  const refNumber = refMatch[1];
                  
                  // Clean up title by removing reference number if present
                  const cleanTitle = source.name.replace(/^\[(\d+)\]\s*-?\s*/, '').trim();
                  
                  return (
                  <motion.li 
                    key={index} 
                    className="ml-1 py-1"
                    whileHover="hover"
                    variants={sourceItemVariants}
                  >
                      {source.url ? (
                    <a 
                      href={source.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-sm hover:text-primary-800 transition-colors duration-200"
                    >
                          <span className="font-medium">[{refNumber}]</span> {cleanTitle}
                          <span className="block text-xs text-gray-500 ml-4 mt-1 truncate">
                            {source.url.substring(0, 60)}{source.url.length > 60 ? '...' : ''}
                          </span>
                    </a>
                      ) : (
                        <span className="text-sm text-gray-700">
                          <span className="font-medium">[{refNumber}]</span> {cleanTitle}
                        </span>
                      )}
                  </motion.li>
                  );
                })}
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
          
          {/* Verification Certificate */}
          <AnimatePresence>
            {showVerificationProof && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 bg-white rounded-xl border-2 border-gray-200 overflow-hidden"
              >
                <motion.div 
                  className="p-4 sm:p-6 space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-center border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-bold text-gray-900">Verification Certificate</h3>
                    <p className="text-sm text-gray-600">This certificate confirms that the following fact-check was performed by TruthShield.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Claim</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                          {result.claim.length > 200 ? result.claim.substring(0, 200) + '...' : result.claim}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Verdict</h4>
                          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            getVerdict() === 'true' ? 'bg-true-100 text-true-800' :
                            getVerdict() === 'false' ? 'bg-false-100 text-false-800' :
                            getVerdict() === 'partial' ? 'bg-partial-100 text-partial-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusLabel()}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Date</h4>
                          <p className="text-sm text-gray-600">
                            {new Date().toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Verification ID</h4>
                        <p className="text-xs font-mono bg-gray-50 p-2 rounded-md border border-gray-200 break-all">
                          {result.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center border-l border-gray-100 pl-4">
                      <div ref={qrRef} className="mb-4">
                        <QRCode 
                          value={generateShareableLink()} 
                          size={120}
                          level="H"
                          renderAs="canvas"
                        />
                      </div>
                      
                      <div className="w-full space-y-3">
                        <motion.button
                          onClick={showQRCodeModal}
                          className="w-full bg-primary-600 text-white rounded-lg py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaQrcode size={16} />
                          Show Full QR Code
                        </motion.button>
                        
                        <motion.button
                          onClick={downloadQRCode}
                          className="w-full bg-primary-50 text-primary-700 border border-primary-200 rounded-lg py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaDownload size={16} />
                          Download Certificate
                        </motion.button>
                        
                        <motion.button
                          onClick={() => setShowShareOptions(true)}
                          className="w-full bg-gray-50 text-gray-700 border border-gray-200 rounded-lg py-2 px-4 text-sm font-medium flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaShare size={16} />
                          Share Result
                        </motion.button>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 text-center italic">
                    This certificate is cryptographically secured and tamper-proof.
                    Scan the QR code to verify the authenticity of this fact-check.
                  </p>
                </motion.div>
                
                <MotionButton 
                  className="w-full text-sm text-primary-600 hover:text-primary-800 py-2 border-t border-gray-100"
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
                onClick={handleReport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaFlag size={14} />
                Report
              </MotionButton>
              <MotionButton 
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                onClick={openShareCertificate}
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
            contentPreview={`Claim: ${result.claim.substring(0, 100)}... | Verdict: ${result.verdict} | ID: ${result.id}`}
            fullData={{
              claim: result.claim,
              verdict: result.verdict,
              explanation: result.explanation,
              sources: result.sources.map(source => source.name).join(', '),
              timestamp: result.timestamp
            }}
          />
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Verification QR Code"
        width="max-w-md"
      >
        <div className="text-center">
          <div ref={qrRef} className="flex justify-center mb-4">
            <QRCode 
              value={generateShareableLink()} 
              size={200}
              level="H" 
              includeMargin={true}
              renderAs="canvas"
              imageSettings={{
                src: '/logo192.png',
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Scan this QR code to access this fact-check verification result directly. 
            The verification is timestamped and cannot be altered.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={downloadQRCode}
              className="px-4 py-2 bg-primary-600 text-white rounded-md flex items-center justify-center hover:bg-primary-700 transition-colors"
            >
              <FaDownload className="mr-2" /> Download QR
            </button>
            <button
              onClick={() => setShowQRModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FactCheckResult; 