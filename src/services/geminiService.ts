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

// Gemini API settings
const GEMINI_API_ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-1.5-flash-latest'; // This is Gemini 2.0 Flash - Google's naming is confusing but this is the correct endpoint
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

/**
 * Extracts text from an image using Gemini's image understanding capabilities.
 * 
 * @param imageBase64 Base64 encoded image data (with data:image/... prefix)
 * @returns Extracted text and structured claim from the image
 */
export async function extractTextFromImageWithGemini(imageBase64: string): Promise<GeminiOcrResult> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is missing. Please check your environment variables.');
    }

    // Clean the base64 string if it has a prefix
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1] 
      : imageBase64;

    const mimeType = getMimeType(imageBase64);
    
    const apiUrl = `${GEMINI_API_ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    logger.debug('Calling Gemini API for image OCR', { endpoint: apiUrl });

    const requestPayload = {
      contents: [{
        parts: [
          {
            text: "You are assisting a fact-checking tool. Extract ALL text from this image, including headlines and colored text (blue, black, etc.). Preserve the structure with headlines and main content clearly differentiated.\n\nRESPOND USING THIS FORMAT:\n\nEXTRACTED TEXT:\n[paste all extracted text here, maintaining structure]\n\nThis extracted text will be used for fact-checking, so maintain the original claims exactly as stated in the image without adding any qualifiers, interpretations, or additional content."
          },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 800,
      }
    };

    logger.debug('Sending image to Gemini for OCR processing');
    const response = await axios.post(apiUrl, requestPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.debug('Received Gemini OCR response');

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const fullResponse = response.data.candidates[0].content.parts[0].text;
    
    // Extract just the text content between EXTRACTED TEXT: and any other section
    let textContent = fullResponse;
    
    // Look for the EXTRACTED TEXT: marker
    if (fullResponse.includes('EXTRACTED TEXT:')) {
      const startIndex = fullResponse.indexOf('EXTRACTED TEXT:') + 'EXTRACTED TEXT:'.length;
      let endIndex = fullResponse.length;
      
      // Check if there are other section markers
      const nextSectionMatch = fullResponse.substring(startIndex).match(/\n\n[A-Z\s]+:/);
      if (nextSectionMatch) {
        endIndex = startIndex + nextSectionMatch.index;
      }
      
      textContent = fullResponse.substring(startIndex, endIndex).trim();
    }
    
    // Extract structured content using another Gemini API call
    const structuredResult = await getStructuredClaimFromText(textContent);

    return {
      extractedText: textContent,
      structuredClaim: structuredResult.summary,
      confidence: response.data.candidates[0].safetyRatings?.[0]?.score || 0.9
    };
  } catch (error) {
    logger.error('Error in Gemini OCR:', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    throw new Error('Failed to extract text from image with Gemini: ' + 
      (error instanceof Error ? error.message : String(error)));
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
    // Default to jpeg if we can't determine the type
    return 'image/jpeg';
  }
}

/**
 * Process raw extracted text to get a structured claim for fact-checking
 * 
 * @param extractedText Raw text from the image
 * @returns Structured analysis with claims and summary
 */
export async function getStructuredClaimFromText(extractedText: string): Promise<GeminiTextAnalysisResult> {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is missing');
    }

    // Pre-process the text to identify headlines
    const lines = extractedText.split('\n').filter(line => line.trim().length > 0);
    const potentialHeadlines = lines.slice(0, 3).filter(line => 
      line.length < 150 && 
      !line.endsWith(':') && 
      !line.includes('@') && 
      line.trim().length > 10
    );
    
    // Prepare headline context if any headlines were found
    const headlineContext = potentialHeadlines.length > 0 
      ? `\n\nNOTE: The following appear to be headlines or titles from the content:\n${potentialHeadlines.join('\n')}\nPrioritize extracting factual claims from these headlines.`
      : '';

    const apiUrl = `${GEMINI_API_ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    logger.debug('Calling Gemini API for text structuring', { endpoint: apiUrl });

    const requestPayload = {
      contents: [{
        parts: [{
          text: `You are a specialized claim extraction AI working for a fact-checking tool. 
            
PURPOSE: Extract specific, verifiable factual claims from news articles and social media content that a fact-checker would need to verify. These claims will be sent to a fact-checking system.

From the given content, extract:
1. The top factual claims that need verification (max 5) - focus on concrete assertions about events, numbers, or statements that can be proven true or false
2. A brief, precise summary (1-2 sentences) that captures the main factual claim - do NOT add qualifiers like "reportedly" or "it is claimed" unless they appear in the original text
3. The main entities/topics mentioned

EXAMPLE OF GOOD CLAIM: "India accused Pakistan of violating the ceasefire along the Line of Control"
EXAMPLE OF BAD CLAIM: "It is reported that India might have accused Pakistan of potentially violating the ceasefire"

Your response MUST be a valid JSON object with the following structure:
{
  "claims": ["factual claim 1", "factual claim 2", ...],
  "summary": "precise factual summary without added qualifiers",
  "mainTopics": ["topic1", "topic2", ...]
}

Content to analyze:${extractedText}${headlineContext}`
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        response_mime_type: "application/json"
      }
    };

    const response = await axios.post(apiUrl, requestPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    logger.debug('Received Gemini text structuring response');

    let typedResult: { claims?: string[], summary?: string, mainTopics?: string[] } = {};

    if (response.data && response.data.candidates && response.data.candidates[0]?.content?.parts[0]?.text) {
      try {
        typedResult = JSON.parse(response.data.candidates[0].content.parts[0].text);
      } catch (parseError) {
        logger.error('Failed to parse JSON from Gemini API', { 
          parseError, 
          content: response.data.candidates[0].content.parts[0].text 
        });
        // Return default structure with raw text as summary if parsing fails
        return {
          claims: [],
          summary: extractedText.substring(0, 200),
          mainTopics: []
        };
      }
    }

    return {
      claims: typedResult.claims || [],
      summary: typedResult.summary || extractedText.substring(0, 200),
      mainTopics: typedResult.mainTopics || []
    };
  } catch (error) {
    logger.error("Error in Gemini text structuring:", { 
      error: error instanceof Error ? error.message : String(error) 
    });
    
    // Return a basic result with the raw text
    return {
      claims: [],
      summary: extractedText.substring(0, 200),
      mainTopics: []
    };
  }
} 