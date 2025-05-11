const axios = require('axios');
const { parseFactCheckResponse } = require('./utils/apiHelpers');
const { logRequest, logExternalAPICall, logExternalAPIResponse, logResponse } = require('./utils/apiLogger');
const fs = require('fs');
const path = require('path');

// Debug environment variables
console.log('[API /api/verify-fact] ENVIRONMENT VARIABLES CHECK:');
console.log('[API /api/verify-fact] NODE_ENV:', process.env.NODE_ENV);
console.log('[API /api/verify-fact] PERPLEXITY_API_KEY exists:', !!process.env.PERPLEXITY_API_KEY);
console.log('[API /api/verify-fact] PERPLEXITY_API_KEY first 4 chars:', process.env.PERPLEXITY_API_KEY ? process.env.PERPLEXITY_API_KEY.substring(0, 4) : 'none');
console.log('[API /api/verify-fact] GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('[API /api/verify-fact] GEMINI_API_KEY first 4 chars:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 4) : 'none');
console.log('[API /api/verify-fact] ENV KEYS:', Object.keys(process.env).filter(key => key.includes('API') || key.includes('KEY')));

// Try to load .env file directly (in dev environment)
let envFileKey = '';
try {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const perplexityKeyMatch = envContent.match(/PERPLEXITY_API_KEY=([^\s\r\n]+)/);
    if (perplexityKeyMatch && perplexityKeyMatch[1]) {
      envFileKey = perplexityKeyMatch[1];
      console.log('[API /api/verify-fact] Found API key in .env file:', envFileKey.substring(0, 4) + '...');
    }
  }
} catch (error) {
  console.error('[API /api/verify-fact] Error reading .env file:', error.message);
}

// Perplexity API settings
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_MODEL = 'llama-3.1-sonar-small-128k-online';
const SERVICE_NAME = 'verify-fact';

// TEMPORARY: For testing only - this requires an actual working Perplexity API key
// which should start with "pplx-"
const HARDCODED_API_KEY = null; // Remove hardcoded key since it's invalid

module.exports = (req, res) => {
  try {
    const requestTimestamp = logRequest(req, SERVICE_NAME);
    
    // Simple request validation
    if (req.method !== 'POST') {
      console.log('[API /api/verify-fact] Invalid method. Sending 405.');
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Debug the request body
    console.log('[API /api/verify-fact] Request body type:', typeof req.body);
    console.log('[API /api/verify-fact] Request body:', JSON.stringify(req.body));

    // Handle null or undefined body
    if (!req.body) {
      console.error('[API /api/verify-fact] Request body is null or undefined');
      return res.status(400).json({ 
        error: 'Missing request body' 
      });
    }

    // Extract claim with better error handling
    let claim;
    try {
      claim = req.body.claim;
      console.log(`[API /api/verify-fact] Extracted claim: '${claim}'`);
    } catch (err) {
      console.error('[API /api/verify-fact] Error extracting claim:', err);
      return res.status(400).json({ 
        error: 'Invalid request body format' 
      });
    }

    if (!claim) {
      console.log('[API /api/verify-fact] Claim is missing. Sending 400.');
      const response = { error: 'Claim is required' };
      logResponse(requestTimestamp, SERVICE_NAME, 400, response);
      return res.status(400).json(response);
    }

    // Try multiple sources for the API key
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || 
                               envFileKey ||
                               HARDCODED_API_KEY;
                               
    console.log('[API /api/verify-fact] Using API key source:', 
      process.env.PERPLEXITY_API_KEY ? 'process.env' : 
      envFileKey ? '.env file' : 
      'hardcoded');
                               
    if (!PERPLEXITY_API_KEY) {
      console.error('[API /api/verify-fact] CRITICAL ERROR: No valid Perplexity API key found.');
      const response = { 
        error: 'Server configuration error: Perplexity API key is missing. Get a valid API key from https://www.perplexity.ai/settings/api and add it to your .env file.' 
      };
      logResponse(requestTimestamp, SERVICE_NAME, 500, response);
      return res.status(500).json(response);
    }

    // IMPORTANT: Check the first few characters to ensure we have a valid key
    // A Perplexity key typically starts with "pplx-" followed by a string
    if (!PERPLEXITY_API_KEY.startsWith('pplx-')) {
      console.error('[API /api/verify-fact] The API key format is invalid. Current key starts with:', PERPLEXITY_API_KEY.substring(0, 5));
      return res.status(500).json({ 
        error: "Invalid Perplexity API key format. The key should start with 'pplx-'. Get a valid API key from https://www.perplexity.ai/settings/api and add it to your .env file."
      });
    }

    console.log('[API /api/verify-fact] Attempting to call Perplexity API.');
    const isShortClaim = claim.trim().length < 100;
    
    const systemPrompt = isShortClaim 
      ? `You are a precise, fact-checking AI assistant with access to the latest information.
         For short, direct claims, provide:
         1. A clear TRUE, FALSE, or PARTIALLY TRUE verdict
         2. A brief but informative explanation with factual context
         3. Numbered citations [1], [2] to reliable sources including official statements, news, and verified social media posts
         
         Format your response as:
         [VERDICT] - Single line with your judgment
         [EXPLANATION] - 2-3 paragraphs with citations [1], [2]
         [SOURCES] - Numbered list matching citations, include diverse source types (news, social media, official sources)
         
         Be factual, balanced, and precise.`
      : `You are a precise, thorough fact-checking AI assistant with access to the latest information.

        When analyzing claims:
        1. Evaluate each specific point for accuracy, providing a clear verdict (TRUE, FALSE, PARTIALLY TRUE).
        2. For any claims that are FALSE or PARTIALLY TRUE, explain what the correct information is, with evidence.
        3. Use numbered in-text citations [1], [2], etc. in your explanations to reference sources.
        4. Include a clear "SOURCES:" section at the end with a numbered list matching your in-text citations.
        5. Format each source as: NUMBER. TITLE - URL
           Example: 1. NASA Climate Data - https://climate.nasa.gov/evidence/
        6. Use a diverse range of sources including news articles, academic publications, YouTube videos, social media statements (X/Twitter, Facebook, etc.), government data, and other reliable sources. Don't limit yourself only to news articles.

        Your response MUST follow this structure:
        [VERDICT] - A clear overall judgment.
        [EXPLANATION] - Detailed analysis with numbered citations [1], [2].
        [SOURCES] - Numbered list matching your citations.
                      
        Keep your analysis factual, balanced, and comprehensive. Cite primary sources whenever possible.`;

    const userPrompt = isShortClaim
      ? `Verify this claim: \\"${claim}\\"`
      : `Please fact-check the following information: \\"${claim}\\"`;
      
    const requestPayload = {
      model: PERPLEXITY_MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: isShortClaim ? 1000 : 1500,
      temperature: 0.1
    };
    
    // Log the external API call
    logExternalAPICall('Perplexity', PERPLEXITY_API_URL, requestPayload);
    
    // Make the API call with better error handling
    axios.post(
      PERPLEXITY_API_URL,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        },
        // Add timeout to prevent hanging requests
        timeout: 30000
      }
    )
    .then(response => {
      try {
        console.log(`[API /api/verify-fact] Received response from Perplexity API. Status: ${response.status}`);
        
        // Debug response shape
        console.log('[API /api/verify-fact] Response data type:', typeof response.data);
        console.log('[API /api/verify-fact] Response data structure:', JSON.stringify(Object.keys(response.data)));
        
        // Log the external API response
        logExternalAPIResponse('Perplexity', response.status, response.data);
        
        // Parse with try/catch to handle unexpected response formats
        const factCheckResult = parseFactCheckResponse(response.data);
        console.log('[API /api/verify-fact] Parsed Perplexity response. Sending 200.');
        
        // Log our response to the client
        logResponse(requestTimestamp, SERVICE_NAME, 200, factCheckResult);
        
        return res.status(200).json(factCheckResult);
      } catch (parseError) {
        console.error('[API /api/verify-fact] Error parsing response:', parseError);
        console.error('[API /api/verify-fact] Raw response:', JSON.stringify(response.data).substring(0, 500));
        return res.status(500).json({ 
          error: 'Failed to parse AI response', 
          details: parseError.message 
        });
      }
    })
    .catch(error => {
      console.error("[API /api/verify-fact] Error during Perplexity call or parsing:", 
        error.response ? { 
          status: error.response.status, 
          data: error.response.data,
          headers: error.response.headers
        } : error.message);
      
      // Additional debugging for Axios errors
      if (error.request) {
        console.error('[API /api/verify-fact] No response received. Request details:', {
          method: error.request.method,
          path: error.request.path,
          host: error.request.host
        });
      }
      
      let statusCode = 500;
      let errorResponse = { error: "Failed to verify claim due to an internal server error in API handler." };
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          statusCode = 500;
          errorResponse = { 
            error: "Authentication with Perplexity API failed. The API key is invalid or expired. Get a valid API key from https://www.perplexity.ai/settings/api and add it to your .env file."
          };
        }
        else if (error.response?.status === 429) {
          statusCode = 429;
          errorResponse = { error: "Perplexity API rate limit exceeded." };
        }
        else if (error.response) {
          statusCode = error.response.status || 500;
          const errorMsg = error.response.data?.error?.message || 'Unknown API error';
          errorResponse = { error: `Perplexity API error: ${errorMsg}` };
        }
        else if (error.request) {
          statusCode = 503;
          errorResponse = { error: "No response received from Perplexity API." };
        }
      }
      
      // Log our error response
      logResponse(requestTimestamp, SERVICE_NAME, statusCode, errorResponse);
      
      return res.status(statusCode).json(errorResponse);
    });
  } catch (uncaughtError) {
    // Catch any uncaught errors in the main function
    console.error('[API /api/verify-fact] Uncaught error in main handler:', uncaughtError);
    return res.status(500).json({ 
      error: 'Unexpected server error',
      message: uncaughtError.message
    });
  }
}; 