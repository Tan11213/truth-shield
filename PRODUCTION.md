# TruthShield Production Deployment Guide

This guide provides instructions for deploying TruthShield to production environments, with a focus on Vercel deployment.

## Architecture Overview

TruthShield uses a modern architecture with:

1. **React Frontend**: The client-side application built with React and TypeScript.
2. **Vercel Serverless Functions**: Backend endpoints that handle API calls requiring authentication.
3. **External API Integration**: Perplexity AI for fact-checking and Google Gemini for content preprocessing.

## Prerequisites

- Node.js 16.x or higher
- NPM 8.x or higher
- Perplexity API key (must start with "pplx-")
- Gemini API key (optional but recommended)
- Vercel account (for deployment)

## API Key Security

TruthShield has been designed to use Vercel Serverless Functions for handling all API calls that require authentication keys. This approach provides several security benefits:

1. **No Client-Side API Keys**: API keys are never exposed in the client-side code
2. **Backend Validation**: All API calls are processed through secure server-side functions
3. **Proper Authentication**: Each API endpoint properly authenticates with external services
4. **Environment Variables**: API keys are stored as environment variables in Vercel

### Required API Keys

- **Perplexity API Key**: Must start with "pplx-" (Required for fact-checking)
  - Get from: https://www.perplexity.ai/settings/api
  
- **Google Gemini API Key**: (Optional, enhances text analysis)
  - Get from: https://aistudio.google.com/app/apikey

### Setting Up API Keys in Vercel

When deploying, set up these environment variables in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `PERPLEXITY_API_KEY` - Your Perplexity API key
   - `GEMINI_API_KEY` - Your Google Gemini API key

IMPORTANT: Never hardcode API keys in the source code. Always use environment variables.

## Local Development Setup

For local development, create a `.env` file in the project root with the following structure:

```
# API Keys
PERPLEXITY_API_KEY=pplx-your_perplexity_key_here
GEMINI_API_KEY=your_gemini_key_here

# Frontend config
REACT_APP_DEBUG=true
```

Make sure `.env` is listed in your `.gitignore` file to prevent exposing sensitive information.

## Vercel Deployment Steps

1. **Prepare your project**
   ```bash
   npm run build
   ```

2. **Install Vercel CLI (if not already installed)**
   ```bash
   npm i -g vercel
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Set environment variables**
   - You'll be prompted to set environment variables during deployment, or
   - You can set them in the Vercel dashboard after deployment

5. **Verify deployment**
   - Check the deployment URL provided by Vercel
   - Test all API endpoints to ensure they're working correctly
   - Monitor logs for any issues

## Serverless Function Structure

TruthShield uses the following serverless functions:

1. **`api/verify-fact.js`**: 
   - Purpose: Verifies text claims using Perplexity AI
   - Method: POST
   - Required parameters: `{ claim: "text to verify" }`

2. **`api/analyze-web-content.js`**: 
   - Purpose: Analyzes web content using Perplexity AI
   - Method: POST
   - Required parameters: `{ url: "https://example.com/article" }`

3. **`api/preprocess-content.js`**: 
   - Purpose: Preprocesses content to extract claims and summaries using Gemini AI
   - Method: POST
   - Required parameters: `{ content: "text to process" }`

4. **`api/logs.js`**: 
   - Purpose: Captures client-side logs for monitoring and debugging
   - Method: POST
   - Parameters: Varies based on log type

## Monitoring and Troubleshooting

### Vercel Logs

To view logs for your serverless functions:
1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Functions" or "Logs"
4. Filter by function name or status code

### Common Issues

1. **API Key Authentication Errors (401)**
   - Check that your Perplexity API key starts with "pplx-"
   - Verify the key is correctly set in environment variables
   - Try regenerating the API key

2. **Missing Environment Variables**
   - Ensure all required variables are set in the Vercel dashboard
   - Check for typos in variable names (case-sensitive)

3. **Rate Limiting Issues (429)**
   - Implement retry logic with exponential backoff
   - Consider upgrading your Perplexity API plan

## Performance Optimization

1. **Cold Start Mitigation**
   - Keep your serverless functions small and focused
   - Minimize dependencies to reduce bundle size
   - Consider using Vercel's Edge Functions for faster cold starts

2. **Caching Strategy**
   - Implement caching for frequently checked claims
   - Use Vercel's Edge Cache when possible

## Security Best Practices

1. **API Key Rotation**
   - Regularly rotate your API keys
   - Update environment variables in Vercel after rotation

2. **Input Validation**
   - All serverless functions implement input validation
   - Never trust client-side data without validation

3. **Rate Limiting**
   - Implement rate limiting for public endpoints
   - Monitor for unusual patterns of access

## Maintenance

1. **Regular Updates**
   - Keep dependencies updated using `npm audit` and `npm update`
   - Check for Perplexity API and Gemini API updates or changes

2. **Monitoring**
   - Set up Vercel Analytics to monitor performance
   - Implement error tracking and alerting

## Contact and Support

For deployment assistance or troubleshooting, contact the TruthShield development team. 