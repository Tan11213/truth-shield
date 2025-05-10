import axios from 'axios';

// Define interfaces for the data structures
export interface Source {
  name: string;
  url: string;
  credibilityScore: number;
}

export interface RelatedClaim {
  id: string;
  claim: string;
  verdict: 'true' | 'false' | 'partial';
}

export interface FactCheckResponse {
  id: string;
  verdict: 'true' | 'false' | 'partial';
  claim: string;
  explanation: string;
  sources: Source[];
  timestamp: string;
  imageUrl?: string;
  relatedClaims: RelatedClaim[];
}

/**
 * Check a claim using the Perplexity API
 * @param claim The claim to check
 * @returns Fact check results
 */
export const checkFact = async (claim: string): Promise<FactCheckResponse> => {
  try {
    // In a real implementation, this would make an API call to Perplexity
    // For now, we'll simulate the API response with a mock
    
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // TODO: Replace with actual API call:
    // const response = await axios.post('https://api.perplexity.ai/factcheck', {
    //   claim
    // });
    // return response.data;
    
    // Mock response for demo
    return {
      id: `fc-${Math.random().toString(36).substring(2, 10)}`,
      verdict: ['true', 'false', 'partial'][Math.floor(Math.random() * 3)] as 'true' | 'false' | 'partial',
      claim,
      explanation: `This is a simulated fact check response for the claim: "${claim}". 
      
In a real implementation, this would provide a detailed explanation based on verified sources and an AI-powered analysis of the claim's accuracy.

The explanation would include context about the claim, any misleading elements, and factual corrections as needed.`,
      sources: [
        {
          name: 'Reuters',
          url: 'https://www.reuters.com/',
          credibilityScore: 92
        },
        {
          name: 'Associated Press',
          url: 'https://apnews.com/',
          credibilityScore: 90
        },
        {
          name: 'BBC',
          url: 'https://www.bbc.com/',
          credibilityScore: 88
        }
      ],
      timestamp: new Date().toISOString(),
      relatedClaims: [
        {
          id: 'rel1',
          claim: 'Related claim about the same topic.',
          verdict: 'true'
        },
        {
          id: 'rel2',
          claim: 'Another related claim with different verdict.',
          verdict: 'false'
        }
      ]
    };
  } catch (error) {
    console.error('Fact Check Error:', error);
    throw new Error('Failed to verify claim. Please try again later.');
  }
}; 