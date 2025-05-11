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

interface PerplexityResponse {
  id: string;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
}

// Perplexity API settings
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_API_KEY = process.env.REACT_APP_PERPLEXITY_API_KEY;
const PERPLEXITY_MODEL = 'llama-3.1-sonar-small-128k-online';

// Google Gemini API settings for preprocessing
const GEMINI_API_ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'; 
const GEMINI_MODEL = 'gemini-1.5-flash-latest'; // Or your preferred Gemini model
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Create axios instance for Perplexity API
const perplexityClient = axios.create({
  baseURL: PERPLEXITY_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
  }
});

// Re-add summarizeText function as it's used in fallbacks for new functions
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
 * Verify a claim using Perplexity API
 */
export async function verifyFactsWithPerplexity(claim: string): Promise<FactCheckResult> {
  try {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key is missing. Please check your environment variables.');
    }
    const requestPayload = {
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a precise, thorough fact-checking AI assistant with access to the latest information.

When analyzing claims:
1. Evaluate each specific point for accuracy, providing a clear verdict (TRUE, FALSE, PARTIALLY TRUE).
2. For any claims that are FALSE or PARTIALLY TRUE, explain what the correct information is, with evidence.
3. Use numbered in-text citations [1], [2], etc. in your explanations to reference sources.
4. Include a clear "SOURCES:" section at the end with a numbered list matching your in-text citations.
5. Format each source as: NUMBER. TITLE - URL
   Example: 1. NASA Climate Data - https://climate.nasa.gov/evidence/

Your response MUST follow this structure:
[VERDICT] - A clear overall judgment.
[EXPLANATION] - Detailed analysis with numbered citations [1], [2].
[SOURCES] - Numbered list matching your citations.
          
Keep your analysis factual, balanced, and comprehensive. Cite primary sources whenever possible.`
        },
        {
          role: 'user',
          content: `Please fact-check the following information: "${claim}"`
        }
      ],
      max_tokens: 1500, // Increased for more comprehensive responses
      temperature: 0.1
    };
    logger.debug('Outgoing Perplexity API request payload (verifyFacts):', requestPayload);
    const response = await axios.post<PerplexityResponse>(
      PERPLEXITY_API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        }
      }
    );
    return parseFactCheckResponse(response.data);
  } catch (error) {
    console.error("Error calling Perplexity API:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please check your API key.");
      } else if (error.response?.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (error.response) {
        throw new Error(`API error: ${error.response.status} ${error.response.data?.message || ''}`);
      } else if (error.request) {
        throw new Error("No response received from API. Check your internet connection.");
      }
    }
    throw new Error("Failed to verify claim. Please try again later.");
  }
}

/**
 * Analyze an image URL using Perplexity API
 */
export async function analyzeImageWithPerplexity(imageUrl: string): Promise<FactCheckResult> {
  try {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key is missing');
    }
    const requestPayload = {
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a neutral, fact-checking AI assistant specializing in analyzing images. 
            Analyze the content of the image from the provided URL.
            Check for signs of manipulation, misinformation, or misleading context.
            Identify the source and context of the image when possible.
            Structure your response as: 
            [ANALYSIS], [POTENTIAL MISINFORMATION INDICATORS], [SOURCES if available], [CONTEXT]`
        },
        {
          role: 'user',
          content: `Please analyze this image and verify its authenticity: ${imageUrl}`
        }
      ],
      max_tokens: 1024,
      temperature: 0.1
    };
    logger.debug('Outgoing Perplexity API request payload (analyzeImage):', requestPayload);
    const response = await axios.post<PerplexityResponse>(
      PERPLEXITY_API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        }
      }
    );
    return parseFactCheckResponse(response.data);
  } catch (error) {
    console.error("Error analyzing image with Perplexity:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please check your API key.");
      } else if (error.response) {
        throw new Error(`API error: ${error.response.status} ${error.response.data?.message || ''}`);
      }
    }
    throw new Error("Failed to analyze image. Please try again later.");
  }
}

/**
 * Analyze a web page content using Perplexity API
 */
export async function analyzeWebContentWithPerplexity(url: string): Promise<FactCheckResult> {
  try {
    if (!PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key is missing');
    }
    const requestPayload = {
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'system',
          content: `You are a neutral, fact-checking AI assistant. 
            Analyze the content of the provided URL.
            Identify key claims and verify them with multiple sources.
            Check for biased framing, misinformation, or misleading content.
            Structure your response as: 
            [SUMMARY], [KEY CLAIMS ANALYSIS], [CREDIBILITY ASSESSMENT], [SOURCES]`
        },
        {
          role: 'user',
          content: `Please analyze and fact-check the content at this URL: ${url}`
        }
      ],
      max_tokens: 1024,
      temperature: 0.1
    };
    logger.debug('Outgoing Perplexity API request payload (analyzeWeb):', requestPayload);
    const response = await axios.post<PerplexityResponse>(
      PERPLEXITY_API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
        }
      }
    );
    return parseFactCheckResponse(response.data);
  } catch (error) {
    console.error("Error analyzing web content with Perplexity:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error("Authentication failed. Please check your API key.");
      } else if (error.response) {
        throw new Error(`API error: ${error.response.status} ${error.response.data?.message || ''}`);
      }
    }
    throw new Error("Failed to analyze web content. Please try again later.");
  }
}

/**
 * Parse the API response to extract structured fact check information
 * @param apiResponse Raw API response
 * @returns Structured fact check result
 */
function parseFactCheckResponse(apiResponse: PerplexityResponse): FactCheckResult {
  try {
    const content = apiResponse.choices[0].message.content;
    logger.debug('Raw Perplexity API content:', content); 
    
    // Extract verdict - now looking specifically for [VERDICT] section or pattern
    let isTrue = false;
    let isPartiallyTrue = false;
    
    // Extract verdict from the first part of the content or a [VERDICT] section if it exists
    // Using case-insensitive regex without 's' flag for compatibility
    const verdictMatch = content.match(/\[VERDICT\]([\s\S]*?)(?:\[|$)/i) || 
                         content.match(/^([\s\S]*?)(?:\[EXPLANATION\]|\[SOURCES\]|$)/i);
    
    const verdictText = verdictMatch ? verdictMatch[1].trim() : content.split('\n\n')[0];
    
    // Check for TRUE, FALSE, PARTIALLY TRUE patterns in the verdict section
    if (/\b(TRUE|VERIFIED|CORRECT|ACCURATE)\b/i.test(verdictText) && 
        !/(FALSE|NOT TRUE|INCORRECT|INACCURATE)/i.test(verdictText) && 
        !/(PARTIALLY|PARTLY|SOMEWHAT|MIXED)/i.test(verdictText)) {
      isTrue = true;
    } else if (/(PARTIALLY TRUE|PARTLY TRUE|SOMEWHAT TRUE|MIXED|PARTIALLY CORRECT)/i.test(verdictText)) {
      isPartiallyTrue = true;
    }
    
    // Extract explanation - look specifically for [EXPLANATION] section or use paragraphs after verdict
    let explanation = '';
    // Using [\s\S] instead of dot with 's' flag for multiline matching
    const explanationMatch = content.match(/\[EXPLANATION\]([\s\S]*?)(?:\[SOURCES\]|$)/i);
    
    if (explanationMatch) {
      explanation = explanationMatch[1].trim();
    } else {
      // Fallback to traditional paragraph extraction if no explicit [EXPLANATION] section
      const paragraphs = content.split('\n\n');
      if (paragraphs.length >= 2) {
        explanation = paragraphs[1].trim();
        // If explanation is too short, add another paragraph
        if (explanation.length < 100 && paragraphs.length >= 3) {
          explanation += '\n\n' + paragraphs[2].trim();
        }
      } else {
        explanation = content; // Use whole content if structure is unclear
      }
    }
    
    // Look for a dedicated SOURCES section with numbered list 
    let sourcesSection = '';
    const sourcesMatch = content.match(/\[SOURCES\]|\bSOURCES\s*:|\bREFERENCES\s*:|\bCITATIONS\s*:/i);
    
    if (sourcesMatch) {
      sourcesSection = content.substring(sourcesMatch.index!);
    }
    
    // Extract sources with URLs - improved for both numbered lists and inline URLs
    const sources: { title: string, url: string }[] = [];
    
    // Pattern for numbered sources like "1. Title - URL" or "[1] Title - URL"
    const numberedSourceRegex = /(?:^|\n)\s*(?:\[?(\d+)\]?\.?\s+)([^-\n]+)(?:-\s*)((?:https?:\/\/)[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gm;
    
    // Extract numbered sources from the sources section
    let numberedMatch;
    while ((numberedMatch = numberedSourceRegex.exec(sourcesSection))) {
      const sourceNumber = numberedMatch[1]; // Capture group for the number
      const sourceTitle = numberedMatch[2].trim();
      const sourceUrl = numberedMatch[3].trim();
      
      sources.push({
        title: `[${sourceNumber}] ${sourceTitle}`,
        url: sourceUrl
      });
    }
    
    // If no numbered sources were found in the sources section, fall back to general URL extraction
    if (sources.length === 0) {
      // Extract all URLs from the content
      const urlRegex = /(?:https?:\/\/)[a-zA-Z0-9][-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      const urls = Array.from(new Set(content.match(urlRegex) || [])); // Use Set to remove duplicates
      
      // For each URL, try to find a relevant title
      for (const url of urls) {
        // Look for text around the URL
        const surroundingText = content.substring(
          Math.max(0, content.indexOf(url) - 100),
          content.indexOf(url) + url.length + 20
        );
        
        // Check for patterns like "[1] Title" or "Title:" before the URL
        let titleMatch = surroundingText.match(/\[(\d+)\]\s+([^:]*?)(?=\s*-\s*https?:\/\/)/i) || 
                        surroundingText.match(/([^:\n]{5,50})(?=\s*:\s*https?:\/\/)/i);
        
        // If no match, extract domain from URL as fallback title
        let title;
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim();
        } else {
          // Extract domain name from URL
          const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
          title = domainMatch ? domainMatch[1] : `Source for ${url}`;
        }
        
        sources.push({ title, url });
      }
    }
    
    // Replace citation markers with linked format to improve UI display
    // This helps ensure that citation markers like [1], [2] in the text are visually connected to sources
    const citationMarkers = explanation.match(/\[(\d+)\]/g) || [];
    for (const marker of citationMarkers) {
      const numberMatch = marker.match(/\d+/);
      if (numberMatch && numberMatch[0]) {
        const number = numberMatch[0];
        // Don't actually modify the text here - this will be handled in the UI component
        // Just ensure we have source entries for all cited numbers
        const sourceExists = sources.some(s => s.title.includes(`[${number}]`));
        if (!sourceExists && sources.length > 0) {
          // If we have a citation with no matching source but we do have other sources,
          // create a placeholder source to prevent broken references
          sources.push({ 
            title: `[${number}] Referenced Source`,
            url: sources[0].url // Use the URL of the first source as fallback
          });
        }
      }
    }
    
    // Check for propaganda and misinformation indicators - expanded list
    const misinformationKeywords = [
      'propaganda', 'misleading', 'biased', 'manipulated', 'out of context', 
      'emotional language', 'false', 'fake', 'doctored', 'staged', 'misattributed',
      'conspiracy', 'unverified', 'viral', 'sensationalized', 'clickbait',
      'exaggerated', 'cherry-picked', 'misrepresented', 'lacks context'
    ];
    
    const propagandaIndicators = misinformationKeywords.filter(word => 
      content.toLowerCase().includes(word)
    );
    
    // Better assessment of source diversity
    const hasInternationalSources = sources.some(({ url }) => {
      const nonUSTLDs = ['.uk', '.ca', '.au', '.eu', '.de', '.fr', '.jp', '.in', '.br', '.ru', '.cn'];
      return nonUSTLDs.some(tld => url.toLowerCase().includes(tld));
    });
    
    const hasMultipleSources = sources.length > 1;
    
    return {
      isTrue,
      isPartiallyTrue,
      explanation,
      sources,
      propagandaIndicators,
      sourceBalance: {
        hasMultipleSources,
        hasInternationalSources,
      },
      fullResponse: content // Keep the full response for reference
    };
  } catch (error) {
    console.error("Error parsing fact check response:", error);
    logger.error("Error parsing fact check response in perplexityService", { error, apiResponse }); // Also log the error and raw response if parsing fails
    return {
      isTrue: false,
      isPartiallyTrue: false,
      explanation: "We encountered an error analyzing this claim. Our system could not properly interpret the verification results.",
      sources: [],
      fullResponse: apiResponse?.choices?.[0]?.message?.content || "No content in API response" // Ensure fullResponse is always a string
    };
  }
}

/**
 * Use Google Gemini to preprocess content and extract key claims
 * This function can be used before sending to Perplexity for verification
 * @param content The content to analyze
 * @returns Extracted claims and context
 */
export async function preprocessWithAI(content: string): Promise<{
  claims: string[];
  summary: string;
  mainTopics: string[];
}> {
  try {
    if (!GEMINI_API_KEY) {
      logger.warn('Gemini API key is missing for preprocessing. Falling back to heuristic methods.');
      throw new Error('Gemini API key not configured'); // Trigger fallback
    }
    
    const geminiApiUrl = `${GEMINI_API_ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    logger.debug('Preprocessing content with Gemini:', { endpoint: geminiApiUrl });
    
    const requestPayload = {
      contents: [{
        parts: [{
          text: `You are a specialized claim extraction AI. 
            From the given content, extract:
            1. The top factual claims that can be verified (max 5)
            2. A brief summary of the content (2-3 sentences)
            3. The main topics discussed
            
            Your response MUST be a valid JSON object with the following structure:
            {
              "claims": ["claim 1", "claim 2", ...],
              "summary": "brief summary",
              "mainTopics": ["topic1", "topic2", ...]
            }
            
            Content to analyze:
            ${content}`
        }]
      }],
      generationConfig: {
        response_mime_type: "application/json", // Request JSON output from Gemini
      }
    };
    logger.debug('Outgoing Gemini API request payload:', requestPayload);

    const response = await axios.post(
      geminiApiUrl,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    logger.debug('Gemini API raw response:', response.data);
    
    let typedResult: { claims?: string[], summary?: string, mainTopics?: string[] } = {};

    if (response.data && response.data.candidates && response.data.candidates[0] && response.data.candidates[0].content && response.data.candidates[0].content.parts && response.data.candidates[0].content.parts[0] && response.data.candidates[0].content.parts[0].text) {
      try {
        // Gemini with response_mime_type: "application/json" should directly return parseable JSON in the text part.
        typedResult = JSON.parse(response.data.candidates[0].content.parts[0].text);
      } catch (parseError) {
        logger.error('Failed to parse JSON from Gemini API content', { parseError, content: response.data.candidates[0].content.parts[0].text });
        throw parseError; // Trigger fallback
      }
    } else {
      logger.error('Unexpected response structure from Gemini API', { responseData: response.data });
      throw new Error('Unexpected response structure from Gemini API'); // Trigger fallback
    }

    return {
      claims: typedResult.claims || [],
      summary: typedResult.summary || "",
      mainTopics: typedResult.mainTopics || []
    };
  } catch (error) {
    logger.error("Error in Gemini AI preprocessing, falling back to heuristics:", { error: error instanceof Error ? error.message : String(error) });
    return {
      claims: extractClaims(content),
      summary: summarizeText(content),
      mainTopics: []
    };
  }
}

/**
 * Enhanced version of the fact-checking function.
 * It uses AI (Gemini) to preprocess the content into a summary and key claims,
 * then sends a structured compilation to Perplexity for a comprehensive fact-check.
 * @param content The text content to fact-check.
 * @returns A single FactCheckResult from Perplexity.
 */
export async function enhancedFactCheck(content: string): Promise<FactCheckResult> {
  try {
    logger.info('Starting enhanced fact check with AI preprocessing for content:', content.substring(0, 100));
    const preprocessed = await preprocessWithAI(content);
    logger.debug('AI Preprocessing result:', preprocessed);

    // Construct a comprehensive, structured query for Perplexity that includes both
    // the summary and the individual claims identified by Gemini
    let contentForPerplexity = "Fact-check the following information:\n\n";
    
    // Add summary if available
    if (preprocessed.summary && preprocessed.summary.trim().length > 0) {
      contentForPerplexity += `OVERALL SUMMARY: ${preprocessed.summary}\n\n`;
    }
    
    // Add specific claims if available
    if (preprocessed.claims && preprocessed.claims.length > 0) {
      contentForPerplexity += "SPECIFIC CLAIMS TO VERIFY:\n";
      preprocessed.claims.forEach((claim, index) => {
        contentForPerplexity += `${index + 1}. ${claim}\n`;
      });
      contentForPerplexity += "\n";
    }
    
    // Add main topics if available for additional context
    if (preprocessed.mainTopics && preprocessed.mainTopics.length > 0) {
      contentForPerplexity += `MAIN TOPICS: ${preprocessed.mainTopics.join(", ")}\n\n`;
    }
    
    contentForPerplexity += "Please evaluate each specific claim and the overall summary. Provide a clear verdict for each, explain what's accurate and what's not, and cite your sources using numbered references.";

    // If we couldn't extract anything useful from the preprocessing
    if (contentForPerplexity.trim().length < 50) {
      logger.warn('Gemini preprocessing produced insufficient content. Using original text with basic summarization.');
      contentForPerplexity = `Fact-check this information: ${summarizeText(content)}`;
    }
    
    // Ensure we don't exceed reasonable length limits
    if (contentForPerplexity.length > 4000) {
      logger.warn('Preprocessed content too long. Truncating to 4000 characters.');
      contentForPerplexity = contentForPerplexity.substring(0, 4000) + "...";
    }
    
    logger.info('Sending structured content to Perplexity for fact-checking:', contentForPerplexity.substring(0, 200) + "...");
    const result = await verifyFactsWithPerplexity(contentForPerplexity);
    logger.info('Received consolidated result from Perplexity after enhancement.');
    return result;

  } catch (error) {
    logger.error("Error during enhanced fact checking pipeline:", { 
        errorMessage: error instanceof Error ? error.message : String(error),
        originalContent: content.substring(0,100) 
    });
    // Fallback to verifying the summarized original content if enhanced pipeline fails badly
    logger.info('Falling back to basic verification of summarized original content due to error in enhanced pipeline.');
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