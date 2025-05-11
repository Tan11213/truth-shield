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
