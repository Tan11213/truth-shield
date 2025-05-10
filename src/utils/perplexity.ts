import axios from 'axios';
import logger from './logger';

// Types for Perplexity API
interface PerplexityOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface PerplexityResponse {
  id: string;
  choices: {
    text: string;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface SourceInfo {
  url: string;
  title: string;
  snippet: string;
}

interface VerificationResult {
  verdict: 'true' | 'false' | 'partial' | 'unverified';
  confidence: number;
  explanation: string;
  sources: SourceInfo[];
}

/**
 * Perplexity API client for enhanced fact-checking
 */
class PerplexityAPI {
  private apiKey: string;
  private baseURL: string = 'https://api.perplexity.ai';
  private defaultModel: string = 'sonar-medium-online';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Set the API key for Perplexity
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Make a request to the Perplexity API
   */
  private async makeRequest(
    prompt: string,
    options: PerplexityOptions = {}
  ): Promise<PerplexityResponse> {
    try {
      if (!this.hasApiKey()) {
        throw new Error('Perplexity API key not configured');
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: options.model || this.defaultModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: options.temperature || 0.1,
          max_tokens: options.max_tokens || 1024,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.reportError(error as Error, 'PerplexityAPI.makeRequest');
      throw error;
    }
  }

  /**
   * Verify a claim using Perplexity API
   */
  async verifyClaim(claim: string): Promise<VerificationResult> {
    try {
      const prompt = `
        I need you to fact-check the following claim and provide a detailed verification:
        
        CLAIM: "${claim}"
        
        Please analyze this claim and:
        1. Determine if it is TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIED
        2. Provide a confidence score from 0.0 to 1.0
        3. Give a detailed explanation with evidence
        4. List sources with URLs, titles, and relevant snippets
        
        Format your response as JSON with the following structure:
        {
          "verdict": "true|false|partial|unverified",
          "confidence": 0.XX,
          "explanation": "detailed explanation",
          "sources": [
            {
              "url": "source URL",
              "title": "source title",
              "snippet": "relevant text from source"
            }
          ]
        }
      `;

      const response = await this.makeRequest(prompt);
      const resultText = response.choices[0].text.trim();
      
      // Extract the JSON part from the response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Perplexity API response');
      }
      
      const result = JSON.parse(jsonMatch[0]) as VerificationResult;
      
      // Validate the response
      if (!['true', 'false', 'partial', 'unverified'].includes(result.verdict)) {
        result.verdict = 'unverified';
      }
      
      if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
        result.confidence = 0.5;
      }
      
      return result;
    } catch (error) {
      logger.reportError(error as Error, 'PerplexityAPI.verifyClaim');
      throw error;
    }
  }

  /**
   * Analyze an image URL using Perplexity API
   */
  async analyzeImageUrl(imageUrl: string): Promise<VerificationResult> {
    try {
      const prompt = `
        Analyze the following image and provide a detailed verification:
        
        IMAGE URL: "${imageUrl}"
        
        Please analyze this image and:
        1. Describe what the image shows
        2. Identify if there are any signs of manipulation or editing
        3. Determine if the image contains misleading or false information
        4. Provide a confidence score from 0.0 to 1.0
        5. Give a detailed explanation with evidence
        
        Format your response as JSON with the following structure:
        {
          "verdict": "true|false|partial|unverified",
          "confidence": 0.XX,
          "explanation": "detailed explanation",
          "sources": [
            {
              "url": "source URL",
              "title": "source title",
              "snippet": "relevant text from source"
            }
          ]
        }
      `;

      const response = await this.makeRequest(prompt);
      const resultText = response.choices[0].text.trim();
      
      // Extract the JSON part from the response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Perplexity API response');
      }
      
      const result = JSON.parse(jsonMatch[0]) as VerificationResult;
      
      // Validate the response
      if (!['true', 'false', 'partial', 'unverified'].includes(result.verdict)) {
        result.verdict = 'unverified';
      }
      
      if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
        result.confidence = 0.5;
      }
      
      return result;
    } catch (error) {
      logger.reportError(error as Error, 'PerplexityAPI.analyzeImageUrl');
      throw error;
    }
  }

  /**
   * Analyze a URL (article, social media post) using Perplexity API
   */
  async analyzeUrl(url: string): Promise<VerificationResult> {
    try {
      const prompt = `
        Analyze the content at the following URL and provide a detailed verification:
        
        URL: "${url}"
        
        Please analyze this content and:
        1. Summarize the main claims made
        2. Determine if these claims are TRUE, FALSE, PARTIALLY TRUE, or UNVERIFIED
        3. Provide a confidence score from 0.0 to 1.0
        4. Give a detailed explanation with evidence
        5. List sources with URLs, titles, and relevant snippets
        
        Format your response as JSON with the following structure:
        {
          "verdict": "true|false|partial|unverified",
          "confidence": 0.XX,
          "explanation": "detailed explanation",
          "sources": [
            {
              "url": "source URL",
              "title": "source title",
              "snippet": "relevant text from source"
            }
          ]
        }
      `;

      const response = await this.makeRequest(prompt, { 
        model: 'sonar-medium-online',
        max_tokens: 2048 
      });
      
      const resultText = response.choices[0].text.trim();
      
      // Extract the JSON part from the response
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse Perplexity API response');
      }
      
      const result = JSON.parse(jsonMatch[0]) as VerificationResult;
      
      // Validate the response
      if (!['true', 'false', 'partial', 'unverified'].includes(result.verdict)) {
        result.verdict = 'unverified';
      }
      
      if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
        result.confidence = 0.5;
      }
      
      return result;
    } catch (error) {
      logger.reportError(error as Error, 'PerplexityAPI.analyzeUrl');
      throw error;
    }
  }
}

// Create a singleton instance
const perplexityAPI = new PerplexityAPI(process.env.REACT_APP_PERPLEXITY_API_KEY || '');

export default perplexityAPI; 