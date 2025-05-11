import axios from 'axios';
import { toast } from 'react-hot-toast';
import logger from '../utils/logger'; // Import logger

// Define types for API responses
export interface FactCheckResult {
  isTrue: boolean;
  isPartiallyTrue: boolean;
  explanation: string;
  sources: {
    title: string;
    url: string;
  }[];
  propagandaIndicators?: string[];
  sourceBalance?: {
    hasMultipleSources: boolean;
    hasInternationalSources: boolean;
  };
  fullResponse?: string;
}

/**
 * Helper function to summarize text
 */
export const summarizeText = (text: string): string => {
  if (text.length < 300) return text;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join('. ') + '.';
  return summary;
};

/**
 * Helper function to extract key claims from text (Simple version)
 */
export const extractClaims = (text: string): string[] => {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.filter(s => s.trim().length > 20);
};

/**
 * Verify a claim using the backend API
 */
export async function verifyFactsWithPerplexity(claim: string): Promise<FactCheckResult> {
  try {
    logger.info(`Calling backend API to verify claim: "${claim.substring(0, 50)}${claim.length > 50 ? '...' : ''}"`);
    
    const response = await fetch('/api/verify-fact', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim }),
    });

    // Check for non-JSON responses (which could indicate a proxy issue or server error)
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      logger.error('API returned non-JSON response:', { 
        contentType, 
        status: response.status,
        statusText: response.statusText
      });
      
      // Try to get the response text to see what was returned
      const responseText = await response.text();
      logger.error('Non-JSON response body preview:', responseText.substring(0, 200));
      
      throw new Error(`API returned ${contentType} instead of JSON. The server might be misconfigured.`);
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: { message: response.statusText } };
      }
      logger.error('API Error from /api/verify-fact:', { status: response.status, data: errorData });
      throw new Error(`Verification failed: ${errorData?.error?.message || response.statusText}`);
    }

    const result: FactCheckResult = await response.json();
    logger.info('Successfully received fact check result from backend API');
    return result;
  } catch (error) {
    logger.error('Error calling /api/verify-fact endpoint:', error);
    
    // Handle axios/fetch network errors specifically
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      toast.error('Network error: Could not connect to the backend service');
      throw new Error('Network error: Could not connect to the verification service. Check your internet connection.');
    } 
    
    // Generic error
    toast.error(`Failed to verify claim: ${error instanceof Error ? error.message : 'Unknown client-side error'}`);
    throw error;
  }
}

/**
 * Analyze a web page content using the backend API
 */
export async function analyzeWebContentWithPerplexity(url: string): Promise<FactCheckResult> {
  try {
    logger.info(`Analyzing web content at URL: ${url}`);
    
    const response = await fetch('/api/analyze-web-content', {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    // Check for non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && !contentType.includes('application/json')) {
      logger.error('API returned non-JSON response:', { 
        contentType, 
        status: response.status,
        statusText: response.statusText
      });
      
      throw new Error(`API returned ${contentType} instead of JSON. The server might be misconfigured.`);
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: { message: response.statusText } };
      }
      logger.error('API Error from /api/analyze-web-content:', { status: response.status, data: errorData });
      throw new Error(`Web content analysis failed: ${errorData?.error?.message || response.statusText}`);
    }

    const result: FactCheckResult = await response.json();
    return result;
  } catch (error) {
    logger.error('Error calling /api/analyze-web-content endpoint:', error);
    toast.error(`Failed to analyze web content: ${error instanceof Error ? error.message : 'Unknown client-side error'}`);
    throw error;
  }
}

/**
 * Use the backend API to preprocess content and extract key claims
 */
export async function preprocessWithAI(content: string): Promise<{
  claims: string[];
  summary: string;
  mainTopics: string[];
}> {
  try {
    const response = await fetch('/api/preprocess-content', {
      method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: { message: response.statusText } }; 
      }
      logger.error('API Error from /api/preprocess-content:', { status: response.status, data: errorData });
      logger.warn('Backend preprocessing failed, falling back to client-side heuristics.', errorData?.error?.message || response.statusText);
      return {
        claims: extractClaims(content),
        summary: summarizeText(content),
        mainTopics: []
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    logger.error('Error calling /api/preprocess-content endpoint, falling back to client-side heuristics:', error);
    toast.error(`AI preprocessing failed: ${error instanceof Error ? error.message : 'Client-side error'}. Using basic processing.`);
    return {
      claims: extractClaims(content),
      summary: summarizeText(content),
      mainTopics: []
    };
  }
}

/**
 * Enhanced version of the fact-checking function.
 * It uses AI to preprocess the content into a summary and key claims,
 * then sends a structured compilation for a comprehensive fact-check through the backend.
 * @param content The text content to fact-check.
 * @returns A single FactCheckResult.
 */
export async function enhancedFactCheck(content: string): Promise<FactCheckResult> {
  try {
    logger.info('Starting enhanced fact check for content:', content);
    
    if (content.trim().length < 100) {
      logger.info('Short claim detected, bypassing complex preprocessing. Calling backend directly.');
      return await verifyFactsWithPerplexity(content);
    }
    
    const preprocessed = await preprocessWithAI(content);
    logger.debug('AI Preprocessing result from backend:', preprocessed);

    let contentForPerplexity = "Fact-check the following information:\n\n";
    
    if (preprocessed.summary && preprocessed.summary.trim().length > 0) {
      contentForPerplexity += `OVERALL SUMMARY: ${preprocessed.summary}\n\n`;
    }
    
    if (preprocessed.claims && preprocessed.claims.length > 0) {
      contentForPerplexity += "SPECIFIC CLAIMS TO VERIFY:\n";
      preprocessed.claims.forEach((claim, index) => {
        contentForPerplexity += `${index + 1}. ${claim}\n`;
      });
      contentForPerplexity += "\n";
    }
    
    if (preprocessed.mainTopics && preprocessed.mainTopics.length > 0) {
      contentForPerplexity += `MAIN TOPICS: ${preprocessed.mainTopics.join(", ")}\n\n`;
    }
    
    contentForPerplexity += "Please evaluate each specific claim and the overall summary. Provide a clear verdict for each, explain what's accurate and what's not, and cite your sources using numbered references.";

    if (contentForPerplexity.trim().length < 50) {
      logger.warn('Preprocessing produced insufficient content. Using original text with basic summarization for backend call.');
      contentForPerplexity = `Fact-check this information: ${summarizeText(content)}`;
    }
    
    if (contentForPerplexity.length > 4000) {
      logger.warn('Preprocessed content too long for backend. Truncating to 4000 characters.');
      contentForPerplexity = contentForPerplexity.substring(0, 4000) + "...";
    }
    
    logger.info('Sending structured content to backend for fact-checking:', contentForPerplexity.substring(0, 200) + "...");
    const result = await verifyFactsWithPerplexity(contentForPerplexity);
    logger.info('Received consolidated result from backend after enhancement.');
    return result;

  } catch (error) {
    logger.error("Error during enhanced fact checking pipeline:", { 
        errorMessage: error instanceof Error ? error.message : String(error),
        originalContent: content.substring(0,100) 
    });
    logger.info('Falling back to basic verification of summarized original content (via backend) due to error in enhanced pipeline.');
    const fallbackClaim = summarizeText(content);
    if (!fallbackClaim) {
        logger.error('Content summary is empty for fallback in enhancedFactCheck. Cannot verify.');
        return {
            isTrue: false,
            isPartiallyTrue: false,
            explanation: "TruthShield encountered an error and could not process the input for fact-checking.",
            sources: [],
            fullResponse: "Content unprocessable after error."
        };
    }
    return await verifyFactsWithPerplexity(fallbackClaim);
  }
} 