import { createWorker, PSM } from 'tesseract.js';
import logger from './logger';

/**
 * Main exported function to extract text from an image using OCR.
 * @param file The image file to process.
 * @returns Extracted and cleaned text from the image.
 */
export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    logger.info('Starting OCR text extraction', { 
      provider: 'Tesseract.js',
      fileName: file.name,
      fileSize: file.size
    });
    
    const timing = logger.timing('OCR extraction');
    
    const rawText = await extractTextWithTesseract(file);
    const cleanedText = cleanupOcrText(rawText);
    
    timing.end({ 
      originalLength: rawText.length,
      cleanedLength: cleanedText.length
    });
    
    logger.debug('OCR extraction completed', {
      cleanedTextLength: cleanedText.length,
      textSample: cleanedText.substring(0, 100),
      hasText: cleanedText.trim().length > 0
    });
    
    if (!cleanedText.trim()) {
      return "No significant text detected in image. Please try a clearer image or enter text manually.";
    }
    
    return cleanedText;
  } catch (error) {
    logger.error('OCR Error in extractTextFromImage', { 
      error: error instanceof Error ? error.message : String(error),
      fileName: file.name 
    });
    // Return a user-friendly error message or rethrow, depending on desired app behavior
    throw new Error('Failed to extract text from image due to an OCR error.');
  }
};

/**
 * Core Tesseract OCR extraction logic.
 * @param file Image file to process.
 * @returns Raw extracted text.
 */
async function extractTextWithTesseract(file: File): Promise<string> {
  let worker;
  try {
    logger.debug('Initializing Tesseract worker');
    worker = await createWorker('eng', undefined, {
      logger: m => {
        if (m.status === 'recognizing text') {
          logger.debug(`Tesseract OCR progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT_OSD, // Use sparse text with OSD
      preserve_interword_spaces: '1',    // Preserve spaces between words.
    });
    
    logger.debug('Processing image with Tesseract');
    const { data } = await worker.recognize(file);
    logger.info('Tesseract recognition complete', { confidence: data?.confidence });
    
    return data?.text || '';
  } catch (error) {
    logger.error('Tesseract OCR core error', {
      error: error instanceof Error ? error.message : String(error)
    });
    throw error; // Rethrow to be caught by the calling function
  } finally {
    if (worker) {
      await worker.terminate();
      logger.debug('Tesseract worker terminated');
    }
  }
}

/**
 * Cleans up raw OCR text output.
 * @param rawText The raw text string from Tesseract.
 * @returns A cleaned-up text string.
 */
function cleanupOcrText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') {
    return '';
  }

  let text = rawText;

  // 1. Normalize newline characters to a single \n
  text = text.replace(/\r\n|\r/g, '\n');

  // 2. Replace multiple spaces/tabs with a single space, then trim lines
  const lines = text.split('\n').map(line => line.replace(/[\s\t]+/g, ' ').trim());

  // 3. Filter out very short lines or lines that are mostly non-alphanumeric (OCR noise)
  //    Also, remove lines that seem to be page separators or artifacts.
  const cleanedLines = lines.filter(line => {
    if (line.length < 3) return false; // Remove very short lines
    // Remove lines that are just separators like '-----' or '====='
    if (/^[\-=_—\*\+ ]+$/.test(line)) return false; 
    const alphanumericChars = (line.match(/[a-zA-Z0-9]/g) || []).length;
    const totalChars = line.length;
    // Keep lines with a decent ratio of alphanumeric characters
    // Adjust ratio as needed; 0.4 means at least 40% alphanumeric
    return (alphanumericChars / totalChars) > 0.4 || line.length > 10; // Keep longer lines even if lower ratio
  });

  text = cleanedLines.join('\n');

  // 4. Attempt to rejoin words hyphenated at the end of a line
  //    e.g., "example-
  //           text" becomes "exampletext"
  text = text.replace(/([a-zA-Z])-\n([a-zA-Z])/g, '$1$2');

  // 5. Reduce multiple consecutive newlines to a maximum of two (to preserve paragraph breaks)
  text = text.replace(/\n{3,}/g, '\n\n');

  // 6. Final trim of the whole text
  return text.trim();
}


/**
 * Processes a social media screenshot to extract content and context.
 * Uses the improved general OCR function.
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
    const rawText = await extractTextFromImage(file); // Uses general, cleaned OCR
    const dimensions = await getImageDimensions(file);
    
    let platform: 'twitter' | 'facebook' | 'instagram' | 'reddit' | 'tiktok' | 'other' | undefined;
    
    // Basic platform detection based on keywords (can be expanded)
    if (/twitter|tweet|@\w+|x\.com/i.test(rawText)) platform = 'twitter';
    else if (/facebook|fb\.com/i.test(rawText)) platform = 'facebook';
    else if (/instagram|insta|ig/i.test(rawText)) platform = 'instagram';
    else if (/reddit|r\/|\/r\/|subreddit/i.test(rawText)) platform = 'reddit';
    else if (/tiktok|tik tok/i.test(rawText)) platform = 'tiktok';
    
    const hasUsername = /@\w+|u\/\w+|\/u\/\w+/i.test(rawText);
    
    // Basic claim extraction (longest sentence or first 200 chars)
    const sentences = rawText.split(/[.!?]+/).filter(s => s.trim().length > 15); // Consider longer sentences for claims
    sentences.sort((a, b) => b.length - a.length);
    const potentialClaim = sentences.length > 0 ? sentences[0].trim() : rawText.substring(0, 200).trim();
    
    logger.info('Social media screenshot processed (using general OCR)', { platform, hasUsername, dimensions });
    
    return {
      text: rawText,
      platform,
      hasUsername,
      potentialClaim,
      imageDimensions: dimensions
    };
  } catch (error) {
    logger.error('Social media screenshot processing error (general OCR)', {
      error: error instanceof Error ? error.message : String(error)
    });
    // Decide if you want to throw or return a default object
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