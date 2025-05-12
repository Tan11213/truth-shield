# TruthShield https://truth-shield-blond.vercel.app/

TruthShield is a modern fact-checking application designed to help users verify information in various formats including text, images, and URLs. It uses a secure backend architecture with Vercel Serverless Functions to protect API keys.

## Features

- **Text Fact Checking**: Submit claims and statements to verify their accuracy
- **Image Analysis**: Upload images and extract text using Google Gemini 2.0 Flash for advanced OCR
- **URL Verification**: Check the credibility of websites and social media posts
- **Comprehensive Results**: Get detailed explanations, sources, and confidence levels
- **Secure Architecture**: Backend serverless functions protect API keys and credentials 
- **Cross-Platform**: Works on desktop and mobile browsers
- **Report Functionality**: Users can report issues with fact checks via email notifications

## Technology Stack

- React.js + TypeScript for the frontend
- Vercel Serverless Functions (Node.js) for backend API calls
- Perplexity Llama-3.1-Sonar-Small-128k-Online model for fact-checking
- Google Gemini 2.0 Flash for OCR and text extraction
- Nodemailer for email notifications
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
   
   # Email Configuration (for report functionality)
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_APP_PASSWORD=your-app-password-here
   EMAIL_TO=your-email@example.com
   EMAIL_FROM=noreply@truthshield.org
   
   # Frontend config
   REACT_APP_DEBUG=true
   ```
4. Start the development server:
   ```bash
   npm start
   ```

## Required API Keys and Credentials

To use all features of TruthShield, you need the following:

1. **Perplexity API Key**: For fact-checking and analysis
   - Get it from: https://www.perplexity.ai/settings/api
   - **IMPORTANT**: Your key must start with `pplx-`

2. **Google Gemini API Key**: For preprocessing and content analysis
   - Get it from: https://aistudio.google.com/app/apikey

3. **Gmail Credentials** (for report emails):
   - You'll need a Gmail account and an App Password
   - To generate an App Password:
     1. Enable 2-Step Verification on your Google Account
     2. Go to your Google Account → Security → App passwords
     3. Select "Mail" as the app and "Other" as the device
     4. Enter "TruthShield" as the name
     5. Copy the generated 16-character password
   - Add these credentials to your `.env` file as shown in the Installation section

Add these credentials to your `.env` file as shown in the Installation section.

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
  - `api/send-report.js`: Handles sending email notifications for user reports

This architecture ensures that API keys are never exposed in the client-side code.

## Email Functionality

TruthShield includes a reporting system that sends email notifications when users report issues with fact-checking results:

1. **Configuration**: 
   - Email functionality uses Nodemailer with Gmail SMTP
   - You must configure the email settings in the `.env` file
   - For Gmail, you'll need to use an App Password (not your regular Gmail password)

2. **Email Template**:
   - Reports are sent with both plain text and HTML versions
   - The HTML template includes styling and formatting for better readability
   - All user-submitted data and fact-check details are included in the report

3. **Vercel Deployment**:
   - When deploying to Vercel, add your email credentials as Environment Variables
   - Required variables: `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `EMAIL_TO`, `EMAIL_FROM`

4. **Local Testing**:
   - Reports will be logged to the console if email credentials are not configured
   - You can check this logging to ensure report data is being captured correctly

## Deployment with Vercel

TruthShield is optimized for deployment on Vercel. The project uses Vercel Serverless Functions to handle API calls that require API keys, avoiding exposure of sensitive credentials in the frontend code.

### Important Environment Variable Setup

1. **LOCAL DEVELOPMENT**:
   - Add your credentials to the `.env` file in the project root:
   ```
   PERPLEXITY_API_KEY=pplx-your_key_here
   GEMINI_API_KEY=your_gemini_key_here
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_APP_PASSWORD=your-app-password-here
   EMAIL_TO=your-email@example.com
   EMAIL_FROM=noreply@truthshield.org
   REACT_APP_DEBUG=true
   ```
   - Note that Perplexity API keys should start with `pplx-`

2. **VERCEL DEPLOYMENT**:
   - When deploying to Vercel, add your credentials as Environment Variables in the Vercel dashboard
   - Go to your project settings → Environment Variables
   - Add the following variables:
     - `PERPLEXITY_API_KEY` - Your Perplexity API key (must start with pplx-)
     - `GEMINI_API_KEY` - Your Google Gemini API key
     - `EMAIL_USER` - Your Gmail address
     - `EMAIL_APP_PASSWORD` - Your Gmail App Password
     - `EMAIL_TO` - Destination email for reports
     - `EMAIL_FROM` - Sender email address

## Troubleshooting

If you encounter any issues:

1. **API Key Format**: Ensure your Perplexity API key starts with `pplx-`
2. **Environment Variables**: Verify that your credentials are correctly set in both local `.env` file and Vercel dashboard
3. **Server Logs**: Check the server logs in the Vercel dashboard for any errors
4. **Email Issues**: 
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify that 2-Step Verification is enabled on your Google account
   - Check if your email address has any restrictions on third-party app access
5. **Invalid API Key Errors**: If you receive "Authentication failed" errors, regenerate your API keys

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
PERPLEXITY_API_KEY=pplx-your_key_here

# Google Gemini API for preprocessing (REQUIRED)
GOOGLE_GEMINI_API_KEY=your_gemini_key_here

# Email Configuration (for report functionality)
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_APP_PASSWORD=your-app-password-here
EMAIL_TO=your-email@example.com
EMAIL_FROM=noreply@truthshield.org

# Analytics and logging (optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_LOG_LEVEL=info

# Application settings
REACT_APP_APP_NAME=TruthShield
REACT_APP_API_BASE_URL=https://api.truthshield.app

# Optional: Set to true to enable persistent debug mode
REACT_APP_DEBUG=false
```
