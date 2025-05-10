# Perplexity API Integration Guide

This guide provides step-by-step instructions for integrating the Perplexity API into TruthShield for advanced fact-checking capabilities.

## Prerequisites

1. A Perplexity API account (sign up at [perplexity.ai](https://www.perplexity.ai/))
2. An API key with sufficient credits
3. Node.js and npm installed

## Step 1: Obtain API Credentials

1. Log in to your Perplexity account at [perplexity.ai](https://www.perplexity.ai/)
2. Navigate to the API section in your account settings
3. Create a new API key and copy it to a secure location
4. Make note of your account ID (you'll need this for API calls)

## Step 2: Set Up Environment Variables

1. Create a `.env` file in the root of your project (if not already present)
2. Add the following variables:

```
REACT_APP_PERPLEXITY_API_KEY=your_api_key_here
REACT_APP_PERPLEXITY_ACCOUNT_ID=your_account_id_here
```

3. Add `.env` to your `.gitignore` file to keep your API credentials secure

## Step 3: Install Required Packages

```bash
npm install axios dotenv
```

## Step 4: Create API Service

1. Navigate to `/src/services/perplexityService.ts`
2. Update the file with the following code structure:

```typescript
import axios from 'axios';
import { toast } from 'react-hot-toast'; // Make sure this is installed

// Define types for API responses
export interface FactCheckResult {
  isTrue: boolean;
  isPartiallyTrue: boolean;
  explanation: string;
  sources: {
    title: string;
    url: string;
  }[];
}

// Perplexity API settings
const API_URL = 'https://api.perplexity.ai/chat/completions';
const API_KEY = process.env.REACT_APP_PERPLEXITY_API_KEY;
const MODEL = 'pplx-70b-online'; // Choose the model that best fits your needs

// Create axios instance with Perplexity API configuration
const perplexityClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  }
});

/**
 * Verifies facts using the Perplexity API
 */
export const verifyFactsWithPerplexity = async (text: string): Promise<FactCheckResult> => {
  try {
    // Create prompt for fact-checking
    const prompt = `
      As a fact-checker for the India-Pakistan conflict, analyze this claim:
      "${text}"
      
      Provide a detailed fact-check with:
      1. Determine if the claim is completely true, false, or partially true
      2. Clear explanation with relevant context
      3. List credible sources with titles and URLs
      
      Format your response as a JSON object with these fields:
      {
        "isTrue": boolean,
        "isPartiallyTrue": boolean,
        "explanation": "string",
        "sources": [{"title": "string", "url": "string"}, ...]
      }
      
      Only respond with the formatted JSON.
    `;
    
    // Make API request to Perplexity
    const response = await perplexityClient.post('', {
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert fact-checker for the India-Pakistan conflict. Provide accurate, unbiased analysis with reliable sources.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1000
    });
    
    // Parse and validate the response
    const data = response.data;
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid API response format');
    }
    
    // Extract JSON response
    const messageContent = data.choices[0].message.content;
    let parsedResult: FactCheckResult;
    
    try {
      // Parse JSON from response text
      parsedResult = JSON.parse(messageContent);
      
      // Validate required fields
      if (typeof parsedResult.isTrue !== 'boolean' || 
          typeof parsedResult.isPartiallyTrue !== 'boolean' || 
          typeof parsedResult.explanation !== 'string' ||
          !Array.isArray(parsedResult.sources)) {
        throw new Error('Missing required fields in API response');
      }
      
      return parsedResult;
      
    } catch (parseError) {
      console.error('Error parsing API response:', parseError);
      throw new Error('Failed to parse API response');
    }
    
  } catch (error) {
    console.error('Error verifying facts:', error);
    toast.error('Failed to verify facts. Please try again later.');
    
    // Return a default error result
    return {
      isTrue: false,
      isPartiallyTrue: false,
      explanation: 'Sorry, we couldn\'t verify this information due to a technical issue. Please try again later.',
      sources: []
    };
  }
};
```

## Step 5: Test the Integration

1. Create a simple test component to verify the API works correctly:

```tsx
import React, { useState } from 'react';
import { verifyFactsWithPerplexity } from '../services/perplexityService';

const PerplexityTest: React.FC = () => {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleTest = async () => {
    setLoading(true);
    try {
      const response = await verifyFactsWithPerplexity(claim);
      setResult(response);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h2>Perplexity API Test</h2>
      <input 
        type="text" 
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Enter a claim to fact-check"
      />
      <button onClick={handleTest} disabled={loading || !claim}>
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {result && (
        <div>
          <h3>Result:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default PerplexityTest;
```

2. Add this component to a test route in your application

## Step 6: Implement Error Handling and Fallback

1. Create fallback mechanisms in case the API is unavailable
2. Implement proper error handling throughout the application
3. Consider implementing retry logic for failed API calls

## Step 7: Monitor API Usage

1. Keep track of your API usage to avoid unexpected costs
2. Implement rate limiting if necessary
3. Consider caching common queries to reduce API calls

## Step 8: Production Considerations

1. Set up a server-side proxy for API calls to protect your API key
2. Implement proper logging for debugging issues
3. Consider setting up analytics to track API performance and usage

## Resources

- [Perplexity API Documentation](https://docs.perplexity.ai/)
- [React Environment Variables Guide](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Axios Documentation](https://axios-http.com/docs/intro) 