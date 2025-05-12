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
    console.log('[API Helper] Raw response text:', responseText.substring(0, 300) + '...');
    
    // Extract verdict - with improved pattern matching
    let isTrue = false;
    let isPartiallyTrue = false;
    
    // First try to extract from the formatted verdict section
    const verdictSectionRegex = /(?:\*\*VERDICT\*\*|\[VERDICT\]|VERDICT:)([\s\S]*?)(?=\*\*|\[|$)/i;
    const verdictSection = responseText.match(verdictSectionRegex);
    const verdictText = verdictSection ? verdictSection[1].trim() : '';
    
    console.log('[API Helper] Extracted verdict text:', verdictText);
    
    // Enhanced verdict detection with more patterns
    if (verdictText) {
      // Direct verdict text analysis
      const truePatterns = [
        /\btrue\b/i,
        /\baccurate\b/i,
        /\bcorrect\b/i,
        /\bverified\b/i
      ];
      
      const falsePatterns = [
        /\bfalse\b/i,
        /\binaccurate\b/i,
        /\bincorrect\b/i,
        /\bmisleading\b/i
      ];
      
      const partialPatterns = [
        /\bpartially true\b/i,
        /\bpartly true\b/i,
        /\bmostly true\b/i,
        /\bsomewhat true\b/i,
        /\bmixed\b/i
      ];
      
      // Check for negative qualifiers
      const hasNegativeQualifier = 
        verdictText.match(/\bnot\s+true\b/i) || 
        verdictText.match(/\bunclear\b/i) ||
        verdictText.match(/\bcannot\s+verify\b/i);
      
      // Check if any true patterns matched and no false patterns matched
      const hasTrue = truePatterns.some(pattern => pattern.test(verdictText)) && !hasNegativeQualifier;
      const hasFalse = falsePatterns.some(pattern => pattern.test(verdictText));
      const hasPartial = partialPatterns.some(pattern => pattern.test(verdictText));
      
      // Check for "overall" in combination with verdict
      const hasOverallTrue = verdictText.match(/overall.*?true/i) || 
                             verdictText.match(/true.*?overall/i) ||
                             responseText.match(/overall.*?true/i);
                             
      if (hasOverallTrue && !hasFalse && !hasPartial) {
        isTrue = true;
      } else if (hasPartial) {
        isPartiallyTrue = true;
      } else if (hasTrue && !hasFalse && !hasPartial) {
        isTrue = true;
      }
    }
    
    // Check the entire response for verdict patterns if not found in verdict section
    if (!isTrue && !isPartiallyTrue) {
      // Search for overall verdict statements in the full text
      const overallTruePatterns = [
        /overall.*?true/i,
        /verdict.*?true/i,
        /claim.*?true/i,
        /claim.*?accurate/i,
        /claim.*?correct/i,
        /conclusion.*?true/i
      ];
      
      const overallPartiallyPatterns = [
        /overall.*?partially\s+true/i,
        /verdict.*?partially\s+true/i,
        /claim.*?partially\s+true/i,
        /claim.*?somewhat\s+true/i
      ];
      
      if (overallTruePatterns.some(pattern => pattern.test(responseText)) && 
          !responseText.match(/overall.*?false/i) &&
          !responseText.match(/not\s+true/i)) {
        isTrue = true;
      } else if (overallPartiallyPatterns.some(pattern => pattern.test(responseText))) {
        isPartiallyTrue = true;
      }
    }
    
    console.log('[API Helper] Verdict determination:', { isTrue, isPartiallyTrue });

    // Extract explanation
    let explanation = "";
    
    // Get the full formatted verdict + explanation rather than just the explanation part
    if (responseText.includes("**VERDICT**") || responseText.includes("[VERDICT]") || responseText.includes("VERDICT:")) {
      // First attempt to extract just the explanation part
      const explanationSection = responseText.match(/(?:\*\*EXPLANATION\*\*|\[EXPLANATION\]|EXPLANATION:)([\s\S]*?)(?=\*\*SOURCES\*\*|\[SOURCES\]|SOURCES:|$)/i);
      if (explanationSection && explanationSection[1].trim().length > 20) {
        explanation = explanationSection[1].trim();
      } else {
        // Fall back to the full response text but remove sources section
        const withoutSources = responseText.split(/\*\*SOURCES\*\*|\[SOURCES\]|SOURCES:/i)[0];
        explanation = withoutSources || responseText;
      }
    } else {
      // If no formal sections, use the whole response but remove sources section if present
      const withoutSources = responseText.split(/\*\*SOURCES\*\*|\[SOURCES\]|SOURCES:/i)[0];
      explanation = withoutSources || responseText;
    }
    
    // Make sure explanation is not empty or too short
    if (!explanation || explanation.trim().length < 20) {
      // Try to get just the content before sources
      const withoutSources = responseText.split(/\*\*SOURCES\*\*|\[SOURCES\]|SOURCES:/i)[0];
      explanation = withoutSources || responseText;
    }

    // Clean and simplify explanation format
    let cleanExplanation = explanation;
    
    // Add proper line breaks and remove excessive formatting
    cleanExplanation = cleanExplanation
      .replace(/\n\s*\n/g, '\n') // Remove multiple empty lines
      .replace(/\*\*/g, '') // Remove markdown ** formatting
      .replace(/^#+\s+/gm, '') // Remove markdown headers
      .trim();
    
    // DO NOT remove reference numbers - we'll keep them for linking
    // Only clean up extra spaces
    cleanExplanation = cleanExplanation
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
      .trim();
      
    console.log('[API Helper] Extracted explanation length:', cleanExplanation.length);

    // Enhanced source extraction
    let sources = [];
    
    // If there's a sources section in the text, extract it
    const sourceSectionRegex = /(?:\*\*SOURCES\*\*|\[SOURCES\]|SOURCES:)([\s\S]*?)(?=\*\*|\[|$)/i;
    const sourcesSection = responseText.match(sourceSectionRegex);
    const sourcesText = sourcesSection ? sourcesSection[1].trim() : '';
    
    // Process citations array if available
    if (apiResponse.citations && Array.isArray(apiResponse.citations) && apiResponse.citations.length > 0) {
      console.log('[API Helper] Found citations array with', apiResponse.citations.length, 'entries');
      
      // Look for numbered references in the original text, not the cleaned explanation
      const referenceMatches = responseText.match(/\[(\d+)\]/g) || [];
      const references = referenceMatches.map(ref => parseInt(ref.replace(/[\[\]]/g, '')));
      
      // Create a map of reference numbers to URLs
      const referenceMap = {};
      
      // First map numbers to URLs from the citation array
      apiResponse.citations.forEach((url, index) => {
        referenceMap[index + 1] = url;
      });
      
      // Extract source lines from the sources section
      const sourceLines = sourcesText.split('\n').filter(line => line.trim().length > 0);
      
      // Process source lines to extract reference numbers and descriptions
      sourceLines.forEach(line => {
        // Try to match different formats of source references
        const formatPatterns = [
          /(?:\d+\.\s*)?\[(\d+)\](?:\s*-\s*)(.*)/,  // [1] - Description or 1. [1] - Description
          /(\d+)\.\s+\[.*?\](.*)/,                  // 1. [Title] Description
          /(\d+)\.\s+(.*)/                          // 1. Description
        ];
        
        let refNumber = null;
        let description = null;
        let url = null;
        
        // Try each pattern
        for (const pattern of formatPatterns) {
          const match = line.match(pattern);
          if (match) {
            refNumber = parseInt(match[1]);
            description = match[2]?.trim() || '';
            url = referenceMap[refNumber];
            break;
          }
        }
        
        // If no pattern matched but line contains a URL, extract it
        if (!url) {
          const urlMatch = line.match(/https?:\/\/[^\s)]+/);
          if (urlMatch) {
            url = urlMatch[0];
            // Try to extract reference number
            const refMatch = line.match(/\[(\d+)\]/) || line.match(/^(\d+)\./);
            if (refMatch) {
              refNumber = parseInt(refMatch[1]);
            }
            description = line.replace(url, '').replace(/^\s*\[?(\d+)\]?\.?\s*/, '').trim();
          }
        }
        
        if (refNumber !== null) {
          // Update the reference map with any URLs found in the source lines
          if (url && !referenceMap[refNumber]) {
            referenceMap[refNumber] = url;
          }
          
          // Add to sources with the URL from the reference map or the one found directly
          // Don't prefix with [refNumber] since that will be handled by the frontend
          sources.push({
            title: description || `Source ${refNumber}`,
            url: url || referenceMap[refNumber] || '',
            refNumber
          });
        } else if (url) {
          // If we found a URL but no reference number
          const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
          const domain = domainMatch ? domainMatch[1] : 'Source';
          sources.push({
            title: description || domain,
            url
          });
        } else if (line.trim().length > 5) {
          // Just use the line as a source with no URL
          sources.push({
            title: line.trim(),
            url: '',
            refNumber: index + 1
          });
        }
      });
      
      // If no sources were extracted from the source section but we have citations
      if (sources.length === 0) {
        // Use the citations array directly
        apiResponse.citations.forEach((url, index) => {
          const domainMatch = url.match(/https?:\/\/(?:www\.)?([^\/]+)/);
          const domain = domainMatch ? domainMatch[1] : 'Source';
          sources.push({
            title: `Source ${index + 1}: ${domain}`,
            url,
            refNumber: index + 1
          });
        });
      }
      
      // Ensure sources are unique by URL
      const uniqueSources = [];
      const urlSet = new Set();
      
      sources.forEach(source => {
        if (source.url && !urlSet.has(source.url)) {
          urlSet.add(source.url);
          uniqueSources.push(source);
        } else if (!source.url) {
          uniqueSources.push(source);
        }
      });
      
      sources = uniqueSources;
    } else {
      // No citations array - extract sources from text only
      console.log('[API Helper] No citations array found, extracting sources from text');
      
      if (sourcesText) {
        const sourceLines = sourcesText.split('\n').filter(line => line.trim().length > 0);
        
        sourceLines.forEach((line, index) => {
          const urlMatch = line.match(/https?:\/\/[^\s)]+/);
          const refMatch = line.match(/\[?(\d+)\]?\.?\s*(.*)/);
          
          if (urlMatch) {
            // Source has URL directly in the text
            const url = urlMatch[0];
            const title = line.replace(url, '').replace(/^\s*\[?(\d+)\]?\.?\s*/, '').trim() || 
                          `Source ${index + 1}`;
            
            sources.push({
              title,
              url,
              refNumber: refMatch ? parseInt(refMatch[1]) : index + 1
            });
          } else if (refMatch) {
            // Source has a reference number but no URL
            const refNumber = refMatch[1];
            const description = refMatch[2].trim() || `Source ${refNumber}`;
            
            sources.push({
              title: description,
              url: '',
              refNumber: parseInt(refNumber)
            });
          } else if (line.trim().length > 5) {
            // Just use the line text
            sources.push({
              title: line.trim(),
              url: '',
              refNumber: index + 1
            });
          }
        });
      }
    }
    
    // Sort sources by reference number if available
    sources.sort((a, b) => {
      if (a.refNumber && b.refNumber) {
        return a.refNumber - b.refNumber;
      }
      return 0;
    });
    
    // Create a map of reference numbers to source info for frontend linking
    const sourceRefs = {};
    sources.forEach(source => {
      if (source.refNumber) {
        sourceRefs[source.refNumber] = {
          url: source.url,
          title: source.title
        };
      }
    });
    
    console.log('[API Helper] Extracted', sources.length, 'sources');
    
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
      if (sourceURLs.some(url => url && url.includes(domain))) {
        hasInternationalSources = true;
        break;
      }
    }

    return {
      isTrue,
      isPartiallyTrue,
      explanation: cleanExplanation,
      sources,
      sourceRefs,
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