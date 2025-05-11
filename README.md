# TruthShield

TruthShield is a modern fact-checking application designed to help users verify information in various formats including text, images, and URLs. It uses a secure backend architecture with Vercel Serverless Functions to protect API keys.

## Features

- **Text Fact Checking**: Submit claims and statements to verify their accuracy
- **Image Analysis**: Upload images and extract text using Google Gemini 2.0 Flash for advanced OCR
- **URL Verification**: Check the credibility of websites and social media posts
- **Comprehensive Results**: Get detailed explanations, sources, and confidence levels
- **Secure Architecture**: Backend serverless functions protect API keys and credentials 
- **Cross-Platform**: Works on desktop and mobile browsers

## Technology Stack

- React.js + TypeScript for the frontend
- Vercel Serverless Functions (Node.js) for backend API calls
- Perplexity Llama-3.1-Sonar-Small-128k-Online model for fact-checking
- Google Gemini 2.0 Flash for OCR and text extraction
- Framer Motion for animations
- TailwindCSS for styling

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the project root with the following structure:
   ```
   # API Keys - REQUIRED for functionality
   PERPLEXITY_API_KEY=pplx-your_key_here
   GEMINI_API_KEY=your_gemini_key_here
   
   # Frontend config
   REACT_APP_DEBUG=true
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Required API Keys

To use all features of TruthShield, you need the following API keys:

1. **Perplexity API Key**: For fact-checking and analysis
   - Get it from: https://www.perplexity.ai/settings/api
   - **IMPORTANT**: Your key must start with `pplx-`

2. **Google Gemini API Key**: For preprocessing and content analysis
   - Get it from: https://aistudio.google.com/app/apikey

Add these keys to your `.env` file as shown in the Installation section.

## Architecture

TruthShield follows a secure architecture:

- **Frontend**:
  - `src/components/`: UI components organized by feature
  - `src/services/`: API integration services that call backend endpoints
  - `src/utils/`: Utility functions including logging
  - `src/pages/`: Main application pages

- **Backend** (Vercel Serverless Functions):
  - `api/verify-fact.js`: Verifies text claims using Perplexity AI
  - `api/analyze-web-content.js`: Analyzes URLs and web content
  - `api/preprocess-content.js`: Preprocesses content using Gemini AI
  - `api/logs.js`: Client-side logging endpoint

This architecture ensures that API keys are never exposed in the client-side code.

## Deployment with Vercel

TruthShield is optimized for deployment on Vercel. The project uses Vercel Serverless Functions to handle API calls that require API keys, avoiding exposure of sensitive credentials in the frontend code.

### Important API Key Setup

1. **LOCAL DEVELOPMENT**:
   - Add your API keys to the `.env` file in the project root:
   ```
   PERPLEXITY_API_KEY=pplx-your_key_here
   GEMINI_API_KEY=your_gemini_key_here
   REACT_APP_DEBUG=true
   ```
   - Note that Perplexity API keys should start with `pplx-`

2. **VERCEL DEPLOYMENT**:
   - When deploying to Vercel, add your API keys as Environment Variables in the Vercel dashboard
   - Go to your project settings → Environment Variables
   - Add the following variables:
     - `PERPLEXITY_API_KEY` - Your Perplexity API key (must start with pplx-)
     - `GEMINI_API_KEY` - Your Google Gemini API key

## Troubleshooting

If you encounter any issues with the API endpoints:

1. **API Key Format**: Ensure your Perplexity API key starts with `pplx-`
2. **Environment Variables**: Verify that your API keys are correctly set in both local `.env` file and Vercel dashboard
3. **Server Logs**: Check the server logs in the Vercel dashboard for any errors
4. **Invalid API Key Errors**: If you receive "Authentication failed" errors, regenerate your API keys

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)

---

For additional deployment information, see [PRODUCTION.md](./PRODUCTION.md).
For OCR implementation details, see [OCR_TROUBLESHOOTING.md](./OCR_TROUBLESHOOTING.md).

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

## Environment Variables

For production deployment, create a `.env` file in the project root with the following variables:

```
# TruthShield Environment Configuration

# Perplexity API for fact-checking (REQUIRED)
# Get your API key from https://www.perplexity.ai/settings/api
REACT_APP_PERPLEXITY_API_KEY=your_perplexity_api_key_here

# Analytics and logging (optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_LOG_LEVEL=info

# Application settings
REACT_APP_APP_NAME=TruthShield
REACT_APP_API_BASE_URL=https://api.truthshield.app

# Optional: Set to true to enable persistent debug mode
REACT_APP_DEBUG=false

# OCR Options Comparison: Google Cloud Vision vs Tesseract

TruthShield supports two OCR engines for processing images and screenshots:

### Google Cloud Vision API (Recommended)
Google Cloud Vision API is **significantly better** than Tesseract.js for social media screenshots for these reasons:
- Much higher accuracy with complex layouts and small text
- Better handling of different fonts and styles
- Superior language support
- Contextual understanding of text elements
- Faster processing times
- Better handling of rotated or skewed text

### Tesseract.js (Default)
We use Tesseract.js as the default option because:
- It works entirely in the browser (no external API calls)
- No API key or billing setup required
- Free to use with no usage limits
- Provides adequate results for simple, clear text

To enable Google Cloud Vision:
1. Get a Google Cloud Vision API key
2. Add these to your .env file:
```
REACT_APP_USE_CLOUD_VISION=true
REACT_APP_GOOGLE_CLOUD_VISION_API_KEY=your_key_here
```

For production use and social media screenshots, we strongly recommend using Google Cloud Vision API for better accuracy.
