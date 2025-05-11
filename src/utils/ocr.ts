import logger from './logger';
import { extractTextFromImageWithGemini, getStructuredClaimFromText } from '../services/geminiService';

/**
 * Main exported function to extract text from an image using OCR.
 * @param file The image file to process.
 * @returns Extracted and cleaned text from the image.
 */
export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    logger.info('Starting OCR text extraction', { 
      provider: 'Gemini',
      fileName: file.name,
      fileSize: file.size
    });
    
    const timing = logger.timing('OCR extraction');
    
    // Convert file to base64
    const base64Image = await fileToDataUrl(file);
    
    // Use Gemini for OCR extraction
    const geminiResult = await extractTextFromImageWithGemini(base64Image);
    
    // Post-process the text for better display
    const processedText = postProcessOcrText(geminiResult.extractedText);
    
    timing.end({ 
      originalLength: geminiResult.extractedText.length,
      cleanedLength: processedText.length
    });
    
    logger.debug('OCR extraction completed with Gemini', {
      extractedTextLength: geminiResult.extractedText.length,
      processedTextLength: processedText.length,
      textSample: processedText.substring(0, 100),
      hasText: processedText.trim().length > 0
    });
    
    if (!processedText.trim()) {
      return "No significant text detected in image. Please try a clearer image or enter text manually.";
    }
    
    return processedText;
  } catch (error) {
    logger.error('OCR Error in extractTextFromImage', { 
      error: error instanceof Error ? error.message : String(error),
      fileName: file.name 
    });
    throw new Error('Failed to extract text from image due to an OCR error.');
  }
};

/**
 * Post-processes OCR text to improve readability in UI
 * @param text Raw OCR text
 * @returns Formatted text
 */
function postProcessOcrText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remove any instruction or prefix content (like "EXTRACTED TEXT:")
  if (text.includes('EXTRACTED TEXT:')) {
    const startIndex = text.indexOf('EXTRACTED TEXT:') + 'EXTRACTED TEXT:'.length;
    let endIndex = text.length;
    
    // Check if there are other section markers
    const nextSectionMatch = text.substring(startIndex).match(/\n\n[A-Z\s]+:/);
    if (nextSectionMatch && nextSectionMatch.index !== undefined) {
      endIndex = startIndex + nextSectionMatch.index;
    }
    
    text = text.substring(startIndex, endIndex).trim();
  }
  
  // Normalize newlines and remove excess whitespace
  text = text.replace(/\r\n|\r/g, '\n');
  text = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
    
  // Remove duplicate newlines but preserve paragraph breaks
  text = text.replace(/\n{3,}/g, '\n\n');
  
  return text.trim();
}

/**
 * Processes a social media screenshot to extract content and context.
 * Uses Gemini for advanced image understanding.
 * @param file The screenshot image file.
 * @returns Object containing extracted text and platform information.
 */
export const processSocialMediaScreenshot = async (file: File): Promise<{
  text: string;
  platform?: 'twitter' | 'facebook' | 'instagram' | 'reddit' | 'tiktok' | 'other';
  hasUsername: boolean;
  potentialClaim: string;
  imageDimensions?: { width: number; height: number };
}> => {
  try {
    // Convert file to base64
    const base64Image = await fileToDataUrl(file);
    
    // Use Gemini for OCR and analysis
    const geminiResult = await extractTextFromImageWithGemini(base64Image);
    const dimensions = await getImageDimensions(file);
    
    // Basic platform detection based on extracted text
    let platform: 'twitter' | 'facebook' | 'instagram' | 'reddit' | 'tiktok' | 'other' | undefined;
    const rawText = geminiResult.extractedText;
    
    if (/twitter|tweet|@\w+|x\.com/i.test(rawText)) platform = 'twitter';
    else if (/facebook|fb\.com/i.test(rawText)) platform = 'facebook';
    else if (/instagram|insta|ig/i.test(rawText)) platform = 'instagram';
    else if (/reddit|r\/|\/r\/|subreddit/i.test(rawText)) platform = 'reddit';
    else if (/tiktok|tik tok/i.test(rawText)) platform = 'tiktok';
    
    const hasUsername = /@\w+|u\/\w+|\/u\/\w+/i.test(rawText);
    
    // Use Gemini's structured claim as the potential claim
    const potentialClaim = geminiResult.structuredClaim;
    
    logger.info('Social media screenshot processed with Gemini', { 
      platform, 
      hasUsername, 
      dimensions 
    });
    
    return {
      text: rawText,
      platform,
      hasUsername,
      potentialClaim,
      imageDimensions: dimensions
    };
  } catch (error) {
    logger.error('Social media screenshot processing error with Gemini', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error('Failed to process social media screenshot.');
  }
};

/**
 * Get image dimensions.
 * @param file Image file.
 * @returns Promise resolving to width and height.
 */
const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.URL || !window.Image) {
      logger.warn('Browser environment for getImageDimensions not available.');
      resolve({ width: 0, height: 0 });
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      logger.warn('Could not get image dimensions for', { fileName: file.name });
      resolve({ width: 0, height: 0 }); // Default or error state
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
};

/**
 * Generates a prompt optimized for fact-checking a social media screenshot.
 * @param ocrResult Result from OCR processing.
 * @returns A prompt string for the AI.
 */
export const generateSocialMediaFactCheckPrompt = (ocrResult: {
  text: string;
  platform?: string;
  potentialClaim: string;
  imageDimensions?: { width: number; height: number };
}): string => {
  const dimensionInfo = ocrResult.imageDimensions && ocrResult.imageDimensions.width > 0
    ? `The image dimensions are ${ocrResult.imageDimensions.width}x${ocrResult.imageDimensions.height}px.` 
    : '';
  
  return `I need to fact-check a ${ocrResult.platform || 'social media'} post with the following content:
  
"${ocrResult.potentialClaim || '[No specific claim extracted]'}"

The full extracted text from the screenshot is:
"${ocrResult.text || '[No text extracted]'}"

${dimensionInfo}

Please analyze this content for factual claims and check their accuracy. If the post contains multiple claims, focus on the most significant or controversial ones. Consider the possibility of misinterpretation or missing context from the OCR.`;
};

/**
 * Converts a file to a base64 data URL.
 * @param file The file to convert.
 * @returns A Promise resolving to the base64 data URL.
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.FileReader) {
      logger.warn('Browser environment for fileToDataUrl not available.');
      reject(new Error('FileReader API not available.'));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => {
      logger.error('Error converting file to Base64', { error });
      reject(error);
    };
  });
}; 