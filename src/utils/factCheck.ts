import { 
  verifyFactsWithPerplexity, 
  analyzeWebContentWithPerplexity, 
  enhancedFactCheck,
  FactCheckResult as PerplexityFactCheckResult 
} from '../services/perplexityService';
import logger from './logger';
import { toast } from 'react-hot-toast';

// Define interfaces for the data structures
export interface Source {
  name: string;
  url: string;
  credibilityScore?: number; // Made optional as Perplexity might not provide this directly
}

export interface RelatedClaim {
  id: string;
  claim: string;
  verdict: 'true' | 'false' | 'partial';
}

export interface FactCheckResponse {
  id: string;
  verdict: 'true' | 'false' | 'partial' | 'unverified'; // Added unverified based on Perplexity output
  claim: string;
  explanation: string;
  sources: Source[];
  timestamp: string;
  imageUrl?: string;
  relatedClaims?: RelatedClaim[]; // Made optional
  propagandaIndicators?: string[];
  sourceBalance?: {
    hasMultipleSources: boolean;
    hasInternationalSources: boolean;
  };
  fullResponse?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Error codes for fact checking operations
 */
export enum FactCheckErrorCode {
  MISSING_API_KEY = 'missing_api_key',
  GEMINI_API_ERROR = 'gemini_api_error',
  PERPLEXITY_API_ERROR = 'perplexity_api_error',
  IMAGE_PROCESSING_ERROR = 'image_processing_error',
  NETWORK_ERROR = 'network_error',
  PARSE_ERROR = 'parse_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Check a claim using the Perplexity API
 * @param claim The input to check (text claim, image URL, or web URL)
 * @param type The type of input (text, image, url)
 * @returns Fact check results
 */
export const checkFact = async (claim: string, type: 'text' | 'image' | 'url' = 'text'): Promise<FactCheckResponse> => {
  try {
    // Check for missing API keys
    if (!process.env.REACT_APP_PERPLEXITY_API_KEY) {
      logger.error('Perplexity API key is missing. This is required for fact-checking.');
      return createErrorResponse(
        FactCheckErrorCode.MISSING_API_KEY,
        'Missing Perplexity API key. This is required for fact-checking.',
        claim
      );
    }

    // Make Gemini API key required for text fact checking
    if (type === 'text' && !process.env.REACT_APP_GEMINI_API_KEY) {
      logger.error('Gemini API key is missing. This is required for enhanced fact-checking.');
      return createErrorResponse(
        FactCheckErrorCode.MISSING_API_KEY,
        'Missing Gemini API key. This is required for enhanced fact-checking.',
        claim
      );
    }

    let perplexityApiResult: PerplexityFactCheckResult;

    if (type === 'text') {
      logger.info('Using enhancedFactCheck with Gemini preprocessing for text input.', { contentLength: claim.length });
      perplexityApiResult = await enhancedFactCheck(claim);
    } else {
      logger.info(`Fact checking ${type} content directly with Perplexity.`, { type });
      switch (type) {
        case 'image':
          // Use enhancedFactCheck for image content after OCR extraction
          // Image has already been processed with OCR, so treat the claim as text
          logger.info('Using enhancedFactCheck for OCR-processed image text.', { contentLength: claim.length });
          perplexityApiResult = await enhancedFactCheck(claim);
          break;
        case 'url':
          perplexityApiResult = await analyzeWebContentWithPerplexity(claim);
          break;
        default:
          throw new Error(`Unsupported content type for direct checking: ${type}`);
      }
    }
    
    // Validate API result
    if (!perplexityApiResult || typeof perplexityApiResult.explanation === 'undefined' || typeof perplexityApiResult.sources === 'undefined') {
        logger.error('Perplexity API result was incomplete or undefined.', { receivedResult: perplexityApiResult });
        return createErrorResponse(
          FactCheckErrorCode.PARSE_ERROR,
          'Received incomplete response from the fact-checking service.',
          claim
        );
    }

    // Map the Perplexity result to our response format
    let verdict: FactCheckResponse['verdict'] = 'unverified';
    if (perplexityApiResult.isTrue) {
      verdict = 'true';
    } else if (perplexityApiResult.isPartiallyTrue) {
      verdict = 'partial';
    } else if (perplexityApiResult.explanation) {
      verdict = 'false';
    }

    const uniqueId = `truthshield-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    return {
      id: uniqueId,
      verdict,
      claim: claim,
      explanation: perplexityApiResult.explanation,
      sources: perplexityApiResult.sources.map(s => ({ name: s.title, url: s.url })),
      timestamp: new Date().toISOString(),
      propagandaIndicators: perplexityApiResult.propagandaIndicators,
      sourceBalance: perplexityApiResult.sourceBalance,
      fullResponse: perplexityApiResult.fullResponse
    };
  } catch (error) {
    // Log the error with details
    logger.error('Fact Check Error in checkFact wrapper', {
      error: error instanceof Error ? error.message : String(error),
      type,
      claimLength: claim.length
    });

    // Format error based on the type/message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    let errorCode = FactCheckErrorCode.UNKNOWN_ERROR;
    
    if (errorMessage.includes('API key')) {
      errorCode = FactCheckErrorCode.MISSING_API_KEY;
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      errorCode = FactCheckErrorCode.NETWORK_ERROR;
    } else if (errorMessage.includes('Gemini') || errorMessage.includes('preprocessing')) {
      errorCode = FactCheckErrorCode.GEMINI_API_ERROR;
    } else if (errorMessage.includes('Perplexity') || errorMessage.includes('fact-check')) {
      errorCode = FactCheckErrorCode.PERPLEXITY_API_ERROR;
    } else if (type === 'image') {
      errorCode = FactCheckErrorCode.IMAGE_PROCESSING_ERROR;
    }
    
    return createErrorResponse(errorCode, errorMessage, claim);
  }
};

/**
 * Create an error response in the FactCheckResponse format
 */
function createErrorResponse(
  code: FactCheckErrorCode, 
  message: string, 
  claim: string
): FactCheckResponse {
  return {
    id: `error-${Date.now()}`,
    verdict: 'unverified',
    claim,
    explanation: 'We could not verify this claim due to a technical issue.',
    sources: [],
    timestamp: new Date().toISOString(),
    error: {
      code,
      message
    }
  };
} 