const axios = require('axios');
const { parseFactCheckResponse } = require('./utils/apiHelpers');

// Perplexity API settings
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const PERPLEXITY_MODEL = 'llama-3.1-sonar-small-128k-online';

// TEMPORARY: Hardcoded key for testing - REMOVE AFTER TESTING
const HARDCODED_API_KEY = null; // No hardcoded keys for production use

module.exports = (req, res) => {
    console.log('[API /api/analyze-web-content] HANDLER STARTED');
    
    if (req.method !== 'POST') {
        console.log('[API /api/analyze-web-content] Invalid method:', req.method);
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { url } = req.body;
    console.log('[API /api/analyze-web-content] URL to analyze:', url);

    if (!url) {
        console.log('[API /api/analyze-web-content] URL is missing. Sending 400.');
        return res.status(400).json({ error: 'URL is required' });
    }

    // Try both environment variable and hardcoded key
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || HARDCODED_API_KEY;
    console.log('[API /api/analyze-web-content] PERPLEXITY_API_KEY:', PERPLEXITY_API_KEY ? 'Present' : 'MISSING');
    
    if (!PERPLEXITY_API_KEY) {
        console.error('[API /api/analyze-web-content] Perplexity API key is missing. Sending 500.');
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
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

When verifying information, use a diverse range of sources including:
- Official government statements and documents
- Major news publications
- Social media (X/Twitter, YouTube, etc.) from verified accounts
- Academic and research publications
- Expert analyses and official statements
- Primary source materials whenever available

Structure your response as: 
[SUMMARY] - Brief overview of the content
[KEY CLAIMS ANALYSIS] - Assessment of major claims with specific verdicts (TRUE/FALSE/PARTIALLY TRUE)
[CREDIBILITY ASSESSMENT] - Evaluation of the overall reliability
[SOURCES] - Numbered list with diverse source types and direct URLs

For each source, provide a clear citation format with title and URL.`
            },
            {
                role: 'user',
                content: `Please analyze and fact-check the content at this URL: ${url}`
            }
        ],
        max_tokens: 1500,
        temperature: 0.1
    };

    console.log('[API /api/analyze-web-content] Sending request to Perplexity API.');

    axios.post(
        PERPLEXITY_API_URL,
        requestPayload,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
            }
        }
    )
    .then(response => {
        console.log('[API /api/analyze-web-content] Received response from Perplexity API.');
        const factCheckResult = parseFactCheckResponse(response.data);
        console.log('[API /api/analyze-web-content] Parsed response, sending result.');
        return res.status(200).json(factCheckResult);
    })
    .catch(error => {
        console.error("[API /api/analyze-web-content] Error calling Perplexity API:", 
            error.response ? { status: error.response.status, data: JSON.stringify(error.response.data).substring(0, 100) } : error.message);
        
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                return res.status(500).json({ error: "Authentication with Perplexity API failed on server." });
            }
            if (error.response?.status === 429) {
                return res.status(429).json({ error: "Perplexity API rate limit exceeded." });
            }
            if (error.response) {
                const errorMsg = error.response.data?.error?.message || 'Unknown API error';
                return res.status(error.response.status || 500).json({ error: `Perplexity API error: ${errorMsg}` });
            }
            if (error.request) {
                return res.status(503).json({ error: "No response received from Perplexity API." });
            }
        }
        
        return res.status(500).json({ error: "Failed to analyze web content due to an internal server error." });
    });
}; 