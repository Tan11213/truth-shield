import axios from 'axios';
import logger from '../utils/logger';

/**
 * Types for Gemini API responses and requests
 */
export interface GeminiOcrResult {
  extractedText: string;
  structuredClaim: string;
  confidence: number;
}

export interface GeminiTextAnalysisResult {
  claims: string[];
  summary: string;
  mainTopics: string[];
}

/**
 * Extracts text from an image by calling our backend service.
 * 
 * @param imageBase64 Base64 encoded image data (with data:image/... prefix)
 * @returns Extracted text and structured claim from the image
 */
export async function extractTextFromImageWithGemini(imageBase64: string): Promise<GeminiOcrResult> {
  try {
    const mimeType = getMimeType(imageBase64);
    
    logger.debug('Calling backend API for image OCR', { endpoint: '/api/extract-text-from-image' });

    const backendOcrResponse = await axios.post<{ extractedText: string, confidence: number }>('/api/extract-text-from-image', {
      imageBase64,
      mimeType
    });

    const { extractedText, confidence } = backendOcrResponse.data;

    logger.debug('Received OCR response from backend', { extractedTextLength: extractedText.length, confidence });

    if (typeof extractedText !== 'string') {
      logger.error('Backend OCR endpoint did not return valid extracted text.', { responseData: backendOcrResponse.data });
      throw new Error('Invalid response from backend OCR service: extracted text is missing or not a string.');
    }
    
    const structuredResult = await getStructuredClaimFromText(extractedText);

    return {
      extractedText: extractedText,
      structuredClaim: structuredResult.summary,
      confidence: confidence !== undefined ? confidence : 0.9
    };
  } catch (error: any) {
    logger.error('Error in frontend extractTextFromImageWithGemini (calling backend):', { 
      error: error.response ? error.response.data : (error.message || String(error))
    });
    const errorMessage = error.response?.data?.error || 
                         (error.message || 'Failed to extract text from image via backend service.');
    throw new Error(errorMessage);
  }
}

/**
 * Helper function to get the MIME type from a base64 image string
 */
function getMimeType(base64Image: string): string {
  if (base64Image.startsWith('data:image/jpeg;base64,')) {
    return 'image/jpeg';
  } else if (base64Image.startsWith('data:image/png;base64,')) {
    return 'image/png';
  } else if (base64Image.startsWith('data:image/gif;base64,')) {
    return 'image/gif';
  } else if (base64Image.startsWith('data:image/webp;base64,')) {
    return 'image/webp';
  } else {
    logger.warn('Could not determine MIME type from base64 prefix, defaulting to image/jpeg');
    return 'image/jpeg';
  }
}

/**
 * Process raw extracted text to get a structured claim for fact-checking
 * by calling our backend /api/preprocess-content endpoint.
 * 
 * @param extractedText Raw text (e.g., from OCR)
 * @returns Structured analysis with claims and summary
 */
export async function getStructuredClaimFromText(extractedText: string): Promise<GeminiTextAnalysisResult> {
  try {
    const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
    const potentialHeadlines = lines.slice(0, 3).filter(line => 
      line.length < 150 && 
      !line.endsWith(':') && 
      !line.includes('@') && 
      line.trim().length > 10
    );
    
    const headlineContext = potentialHeadlines.length > 0 
      ? `\n\nNOTE: The following appear to be headlines or titles from the content:\n${potentialHeadlines.join('\n')}\nPrioritize extracting factual claims from these headlines.`
      : '';

    const textToSubmit = `${extractedText}${headlineContext}`;

    logger.debug('Calling backend API for text structuring', { endpoint: '/api/preprocess-content' });

    const response = await axios.post<GeminiTextAnalysisResult>('/api/preprocess-content', {
      content: textToSubmit 
    });
    
    logger.debug('Received text structuring response from backend');

    if (!response.data || !Array.isArray(response.data.claims) || typeof response.data.summary !== 'string' || !Array.isArray(response.data.mainTopics)) {
      logger.error('Invalid response structure from /api/preprocess-content', { responseData: response.data });
      return {
        claims: [],
        summary: extractedText.substring(0, 200),
        mainTopics: []
      };
    }

    return response.data;

  } catch (error: any) {
    logger.error("Error in frontend getStructuredClaimFromText (calling backend /api/preprocess-content):", { 
      error: error.response ? error.response.data : (error.message || String(error)) 
    });
    
    logger.warn('Falling back to basic result for getStructuredClaimFromText due to error.', { originalTextLength: extractedText.length });
    return {
      claims: [],
      summary: extractedText.substring(0, 200),
      mainTopics: []
    };
  }
} 