const axios = require('axios');

// Google Gemini API settings
const GEMINI_API_ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_MODEL = 'gemini-1.5-flash-latest'; // Consistent model

module.exports = async (req, res) => {
    console.log('[API /api/extract-text-from-image] HANDLER STARTED');

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { imageBase64, mimeType } = req.body;

    if (!imageBase64 || !mimeType) {
        console.log('[API /api/extract-text-from-image] imageBase64 or mimeType missing. Sending 400.');
        return res.status(400).json({ error: 'imageBase64 and mimeType are required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log('[API /api/extract-text-from-image] GEMINI_API_KEY:', GEMINI_API_KEY ? 'Present' : 'MISSING');

    if (!GEMINI_API_KEY) {
        console.error('[API /api/extract-text-from-image] Gemini API key is missing in server environment.');
        return res.status(500).json({ error: 'Gemini API key is not configured on the server.' });
    }

    const geminiApiUrl = `${GEMINI_API_ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const base64Data = imageBase64.includes('base64,')
      ? imageBase64.split('base64,')[1]
      : imageBase64;

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

    console.log('[API /api/extract-text-from-image] Sending request to Gemini API for OCR.');

    try {
        const response = await axios.post(geminiApiUrl, requestPayload, {
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('[API /api/extract-text-from-image] Received response from Gemini API.');

        if (!response.data || !response.data.candidates || !response.data.candidates[0] || !response.data.candidates[0].content || !response.data.candidates[0].content.parts || !response.data.candidates[0].content.parts[0].text) {
            console.error('[API /api/extract-text-from-image] Unexpected response structure from Gemini API:', response.data);
            return res.status(500).json({ error: 'Invalid response structure from Gemini API' });
        }

        const fullResponseText = response.data.candidates[0].content.parts[0].text;
        const safetyRatings = response.data.candidates[0].safetyRatings;
        const confidence = (safetyRatings && safetyRatings[0] && typeof safetyRatings[0].score === 'number') ? safetyRatings[0].score : 0.9; // Default 0.9

        let extractedText = fullResponseText;
        const marker = 'EXTRACTED TEXT:';
        const markerIndex = fullResponseText.indexOf(marker);

        if (markerIndex !== -1) {
            const startIndex = markerIndex + marker.length;
            const contentAfterMarker = fullResponseText.substring(startIndex);
            
            const nextSectionRegex = /\n\n([A-Z][A-Z\s]*:)/; 
            const nextSectionMatch = contentAfterMarker.match(nextSectionRegex);
            
            if (nextSectionMatch && nextSectionMatch.index !== undefined) {
                extractedText = contentAfterMarker.substring(0, nextSectionMatch.index).trim();
            } else {
                extractedText = contentAfterMarker.trim();
            }
        } else {
            console.warn('[API /api/extract-text-from-image] "EXTRACTED TEXT:" marker not found in Gemini response. Using full response as extracted text.');
            extractedText = fullResponseText.trim(); 
        }
        
        console.log(`[API /api/extract-text-from-image] Extracted text length: ${extractedText.length}`);
        return res.status(200).json({ extractedText, confidence });

    } catch (error) {
        console.error("[API /api/extract-text-from-image] Error calling Gemini API:", error.response ? JSON.stringify(error.response.data) : error.message);
        let errorMessage = 'Failed to extract text from image using Gemini.';
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
            errorMessage = error.response.data.error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        return res.status(500).json({ error: errorMessage });
    }
}; 