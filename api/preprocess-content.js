const axios = require('axios');
const { summarizeText, extractClaims } = require('./utils/apiHelpers');

// Google Gemini API settings
const GEMINI_API_ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'; 
const GEMINI_MODEL = 'gemini-1.5-flash-latest';

// No hardcoded keys in production code
const HARDCODED_GEMINI_KEY = null;

module.exports = (req, res) => {
    console.log('[API /api/preprocess-content] HANDLER STARTED');
    
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { content } = req.body;
    console.log(`[API /api/preprocess-content] Received content length: ${content?.length || 0}`);

    if (!content) {
        console.log('[API /api/preprocess-content] Content missing. Sending 400.');
        return res.status(400).json({ error: 'Content is required for preprocessing' });
    }

    // Try both environment variable and hardcoded key
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || HARDCODED_GEMINI_KEY;
    console.log('[API /api/preprocess-content] GEMINI_API_KEY:', GEMINI_API_KEY ? 'Present' : 'MISSING');

    if (!GEMINI_API_KEY) {
        console.warn('[API /api/preprocess-content] Gemini API key is missing. Falling back to heuristic methods.');
        const result = {
            claims: extractClaims(content),
            summary: summarizeText(content),
            mainTopics: []
        };
        console.log('[API /api/preprocess-content] Sending fallback result.');
        return res.status(200).json(result);
    }
        
    const geminiApiUrl = `${GEMINI_API_ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    
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
            response_mime_type: "application/json",
        }
    };

    console.log('[API /api/preprocess-content] Sending request to Gemini API.');

    axios.post(
        geminiApiUrl,
        requestPayload,
        {
            headers: {
                'Content-Type': 'application/json',
            }
        }
    )
    .then(response => {
        console.log('[API /api/preprocess-content] Received response from Gemini API.');
        
        let typedResult = {};
        if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            try {
                typedResult = JSON.parse(response.data.candidates[0].content.parts[0].text);
                console.log('[API /api/preprocess-content] Successfully parsed Gemini response.');
            } catch (parseError) {
                console.error('[API /api/preprocess-content] Failed to parse JSON from Gemini API content:', 
                    { parseError, content: response.data.candidates[0].content.parts[0].text.substring(0, 100) + '...' });
                
                // Use fallback
                typedResult = {
                    claims: extractClaims(content),
                    summary: summarizeText(content),
                    mainTopics: []
                };
                console.log('[API /api/preprocess-content] Using fallback due to parse error.');
            }
        } else {
            console.error('[API /api/preprocess-content] Unexpected response structure from Gemini API:', 
                { responseStructure: JSON.stringify(response.data).substring(0, 100) + '...' });
            
            // Use fallback
            typedResult = {
                claims: extractClaims(content),
                summary: summarizeText(content),
                mainTopics: []
            };
            console.log('[API /api/preprocess-content] Using fallback due to unexpected response structure.');
        }

        return res.status(200).json({
            claims: typedResult.claims || [],
            summary: typedResult.summary || "",
            mainTopics: typedResult.mainTopics || []
        });
    })
    .catch(error => {
        console.error("[API /api/preprocess-content] Error in Gemini AI preprocessing, falling back to heuristics:", 
            error.message);
        
        // Fallback logic
        const result = {
            claims: extractClaims(content),
            summary: summarizeText(content),
            mainTopics: []
        };
        
        console.log('[API /api/preprocess-content] Sending fallback result due to error.');
        return res.status(200).json(result);
    });
}; 