/**
 * Helper function to summarize text
 */
const summarizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length < 300) return text;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summary = sentences.slice(0, 3).join('. ') + '.';
  return summary;
};

/**
 * Helper function to extract key claims from text (Simple version)
 */
const extractClaims = (text) => {
  if (!text || typeof text !== 'string') return [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.filter(s => s.trim().length > 20);
};

/**
 * Parse the API response from Perplexity to extract structured fact check information
 */
const parseFactCheckResponse = (apiResponse) => {
  try {
    console.log('[API Helper] Processing Perplexity API response');
    
    // New validation to detect HTML responses which could happen if there's a proxy issue
    if (typeof apiResponse === 'string' && (apiResponse.includes('<!DOCTYPE') || apiResponse.includes('<html'))) {
      console.error('[API Helper] Received HTML response instead of JSON:', apiResponse.substring(0, 200));
      return {
        isTrue: false,
        isPartiallyTrue: false,
        explanation: "API error: Received HTML instead of JSON response. This may indicate a network or proxy issue.",
        sources: [],
        fullResponse: apiResponse.substring(0, 500) // Limit size of HTML
      };
    }
    
    // Check for malformed JSON response
    if (!apiResponse || typeof apiResponse !== 'object') {
      console.error('[API Helper] Invalid API response type:', typeof apiResponse);
      return {
        isTrue: false,
        isPartiallyTrue: false,
        explanation: "Could not process API response: Invalid data format received.",
        sources: [],
        fullResponse: JSON.stringify(apiResponse)
      };
    }

    // Check for missing choices array
    if (!apiResponse.choices || !Array.isArray(apiResponse.choices) || apiResponse.choices.length === 0) {
      console.error('[API Helper] Missing choices array in response:', JSON.stringify(apiResponse).substring(0, 200));
      return {
        isTrue: false,
        isPartiallyTrue: false,
        explanation: "Could not process AI response: Missing expected data structure.",
        sources: [],
        fullResponse: JSON.stringify(apiResponse)
      };
    }

    // Check for missing message content
    if (!apiResponse.choices[0].message || typeof apiResponse.choices[0].message.content !== 'string') {
      console.error('[API Helper] Invalid message content in first choice:', JSON.stringify(apiResponse.choices[0]).substring(0, 200));
      return {
        isTrue: false,
        isPartiallyTrue: false,
        explanation: "Could not process AI response due to unexpected format.",
        sources: [],
        fullResponse: JSON.stringify(apiResponse)
      };
    }

    const responseText = apiResponse.choices[0].message.content;
    
    // Extract verdict
    let isTrue = false;
    let isPartiallyTrue = false;
    const verdictSection = responseText.match(/\[VERDICT\](.*?)(?=\[|$)/is);
    const verdictText = verdictSection ? verdictSection[1].trim() : '';
    
    if (verdictText.match(/true/i) && verdictText.match(/partially|partly|somewhat|not entirely/i)) {
      isPartiallyTrue = true;
    } else if (verdictText.match(/true/i) && !verdictText.match(/not true|false/i)) {
      isTrue = true;
    }

    // Extract explanation
    const explanationSection = responseText.match(/\[EXPLANATION\](.*?)(?=\[|$)/is);
    const explanation = explanationSection 
      ? explanationSection[1].trim()
      : "No detailed explanation provided.";

    // Extract sources
    const sourcesSection = responseText.match(/\[SOURCES\](.*?)(?=\[|$)/is);
    const sourcesText = sourcesSection ? sourcesSection[1].trim() : '';
    
    // Parse numbered sources
    const sources = [];
    const sourceMatches = sourcesText.match(/\d+\.\s+.+?(?=\d+\.|$)/gs) || [];
    
    for (const sourceMatch of sourceMatches) {
      // Try to extract title and URL
      const urlMatch = sourceMatch.match(/https?:\/\/[^\s)]+/);
      const url = urlMatch ? urlMatch[0] : '';
      
      // Remove the number and URL to get title
      let title = sourceMatch
        .replace(/^\d+\.\s+/, '') // Remove number prefix
        .replace(url, '') // Remove URL
        .replace(/[-–—]\s*$/, '') // Remove trailing dash
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // If no URL in the source, check if the whole thing is a title
      if (!url && title) {
        sources.push({ title, url: '' });
        continue;
      }
      
      // If no title extracted or it's just punctuation, use a generic title
      if (!title || /^[.,;:\s]*$/.test(title)) {
        const urlParts = url.split('/');
        title = urlParts[2] || 'Reference';
      }
      
      sources.push({ title, url });
    }

    // Additional analysis: Check for propaganda indicators
    const propagandaIndicators = [];
    const propagandaTerms = [
      'propaganda', 'misleading', 'deceptive', 'exaggerated', 
      'out of context', 'bias', 'cherry-picked', 'misleadingly'
    ];
    
    for (const term of propagandaTerms) {
      if (responseText.toLowerCase().includes(term)) {
        propagandaIndicators.push(term);
      }
    }

    // Check source balance
    const hasMultipleSources = sources.length > 1;
    
    // Try to detect if sources are from multiple countries/perspectives
    let hasInternationalSources = false;
    const internationalDomains = ['.uk', '.au', '.ca', '.eu', '.in', '.cn', '.jp', '.ru'];
    const sourceURLs = sources.map(s => s.url);
    
    for (const domain of internationalDomains) {
      if (sourceURLs.some(url => url.includes(domain))) {
        hasInternationalSources = true;
        break;
      }
    }

    return {
      isTrue,
      isPartiallyTrue,
      explanation,
      sources,
      propagandaIndicators: propagandaIndicators.length > 0 ? propagandaIndicators : undefined,
      sourceBalance: {
        hasMultipleSources,
        hasInternationalSources
      },
      fullResponse: responseText
    };
    
  } catch (error) {
    console.error('[API Helper] Error parsing fact check response:', error);
    console.error('[API Helper] Response that caused error:', 
      typeof apiResponse === 'string' 
        ? apiResponse.substring(0, 200) 
        : JSON.stringify(apiResponse).substring(0, 200)
    );
    
    return {
      isTrue: false,
      isPartiallyTrue: false,
      explanation: "Failed to analyze response data due to a processing error: " + error.message,
      sources: [],
      fullResponse: apiResponse?.choices?.[0]?.message?.content || JSON.stringify(apiResponse).substring(0, 500)
    };
  }
};

module.exports = {
  summarizeText,
  extractClaims,
  parseFactCheckResponse
}; 