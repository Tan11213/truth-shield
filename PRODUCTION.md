# TruthShield Production Deployment Guide

This guide provides instructions for deploying TruthShield to production environments.

## Prerequisites

- Node.js 16.x or higher
- NPM 8.x or higher
- Perplexity API key (https://www.perplexity.ai/settings/api)
- Optional: Google Cloud Vision API key (for improved OCR)

## Environment Setup

1. Create a `.env` file in the project root with the following variables:

```
# TruthShield Environment Configuration

# Perplexity API for fact-checking (REQUIRED)
REACT_APP_PERPLEXITY_API_KEY=your_perplexity_api_key_here

# OCR Configuration 
# Set to true to use Google Cloud Vision instead of Tesseract.js
REACT_APP_USE_CLOUD_VISION=true
# Required if REACT_APP_USE_CLOUD_VISION is true
REACT_APP_GOOGLE_CLOUD_VISION_API_KEY=your_google_cloud_vision_key_here

# Analytics and logging (optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_LOG_LEVEL=info
# Endpoint for centralized logging
REACT_APP_LOG_API=https://api.truthshield.app/logs

# Application settings
REACT_APP_APP_NAME=TruthShield
REACT_APP_API_BASE_URL=https://api.truthshield.app

# Optional: Set to true to enable persistent debug mode
REACT_APP_DEBUG=false
```

2. Make sure `.env` is listed in your `.gitignore` file to prevent exposing sensitive information.

## OCR Configuration

TruthShield supports two OCR engines for processing social media screenshots and images:

1. **Tesseract.js (Default)**: 
   - Open-source OCR engine that works entirely in the browser
   - No API keys required
   - Limited accuracy with complex screenshots
   - Lower cost (free)

2. **Google Cloud Vision API (Recommended)**:
   - Much higher accuracy, especially for social media content
   - Requires a Google Cloud account and API key
   - Better language support
   - Higher cost (pay-per-use)

To enable Google Cloud Vision:
1. Create a Google Cloud account
2. Enable the Vision API
3. Create an API key
4. Set `REACT_APP_USE_CLOUD_VISION=true` in your .env file
5. Add your API key as `REACT_APP_GOOGLE_CLOUD_VISION_API_KEY`

## Reporting and Logging Integration

TruthShield includes a comprehensive content reporting system integrated with logging:

1. **User Reports**: 
   - Users can report issues with fact-checking results
   - Reports are categorized (misinformation, bias, offensive content, technical issues)
   - Optional user email for follow-up

2. **Logging Integration**:
   - All reports are automatically logged to the centralized logging system
   - Reports include content context, timestamp, and user feedback
   - Performance metrics for report handling are tracked

3. **Analytics Dashboard** (requires backend implementation):
   - Track report volume and categories
   - Identify problematic content or sources
   - Monitor user engagement with reporting features

Configure the logging endpoint with `REACT_APP_LOG_API` in your environment settings.

## Building for Production

We've added special scripts for production builds:

```bash
# Build with source maps disabled (recommended for production)
npm run build:production

# Analyze the bundle size (useful for optimization)
npm run build:analyze

# Test the production build locally
npm run serve:build
```

## Optimizations Applied

The following optimizations have been applied to make the app production-ready:

1. **Perplexity API Integration**:
   - Improved error handling and retries
   - Better prompt engineering for accurate fact checking
   - Support for text, image, and URL content types
   
2. **Social Media Screenshot Analysis**:
   - Enhanced OCR with Google Cloud Vision support
   - Platform detection (Twitter/X, Facebook, Instagram, Reddit, TikTok)
   - Automatic extraction of claims from screenshots
   - Image dimension analysis for better context
   
3. **Logging and Monitoring**:
   - Production-grade logging with configurable levels
   - Error reporting with session tracking
   - Performance monitoring for critical operations
   - Content reporting integration

4. **Security Improvements**:
   - Environment variable protection
   - API key security
   - Source map protection for production builds

## Deployment Options

### Option 1: Static Hosting

The app can be deployed to any static hosting service:

1. Run `npm run build:production`
2. Deploy the `build` directory to your hosting provider
3. Configure environment variables on your hosting platform

Recommended providers:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Firebase Hosting

### Option 2: Docker Deployment

For containerized deployments:

1. Build the Docker image:
   ```
   docker build -t truthshield:latest .
   ```

2. Run the container:
   ```
   docker run -p 80:80 -e REACT_APP_PERPLEXITY_API_KEY=your_api_key truthshield:latest
   ```

## Maintenance and Monitoring

1. **Regular Updates**:
   - Keep dependencies updated using `npm audit` and `npm update`
   - Check Perplexity API usage and billing
   - Monitor Google Cloud Vision API usage if enabled

2. **Performance Monitoring**:
   - Monitor API response times through our built-in timing loggers
   - Use browser performance tools to identify client-side bottlenecks
   - Track OCR performance metrics to determine if Vision API is cost-effective

3. **Error Tracking**:
   - Set up alert notifications for critical errors
   - Review error logs regularly to identify common issues
   - Monitor user reports for potential system improvements

## Contact and Support

For deployment assistance or troubleshooting, contact the TruthShield development team. 