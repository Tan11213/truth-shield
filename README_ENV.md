# Environment Variables in React

This guide explains how to properly set up environment variables for React applications, particularly for TruthShield.

## How Environment Variables Work in React

React applications created with Create React App can use environment variables for configuration. These variables must follow specific rules:

1. Variables must start with `REACT_APP_` to be accessible
2. They're embedded during the build process
3. They're publicly visible in your built JavaScript bundle (not secure for secrets)

## Setting Up Environment Variables

### Method 1: Create a .env File (Recommended)

1. Create a file named `.env` in the project root (same directory as package.json)
2. Add your variables in KEY=VALUE format:

```
REACT_APP_PERPLEXITY_API_KEY=your_api_key_here
```

3. Make sure to restart your development server after creating or changing the .env file

### Method 2: Set Environment Variables in the Terminal

#### Windows (PowerShell):
```
$env:REACT_APP_PERPLEXITY_API_KEY="your_api_key_here"
npm start
```

#### macOS/Linux:
```
REACT_APP_PERPLEXITY_API_KEY=your_api_key_here npm start
```

### Method 3: Set Environment Variables in npm scripts

You can add environment variables directly in your package.json scripts:

```json
"scripts": {
  "start:dev": "REACT_APP_PERPLEXITY_API_KEY=your_api_key_here npm start"
}
```

## Required Environment Variables for TruthShield

```
# Perplexity API (required for fact-checking functionality)
REACT_APP_PERPLEXITY_API_KEY=your_perplexity_api_key_here 

# Optional: Gemini API for text-based fact checking
REACT_APP_GEMINI_API_KEY=your_gemini_api_key_here
```

## Troubleshooting

1. **Changes not taking effect**: Restart your development server
2. **Variables not accessible**: Ensure they start with `REACT_APP_`
3. **Value is undefined**: Check for typos in the variable name
4. **.env file ignored**: Make sure it's in the correct location
5. **Windows issues**: Try using `.env` file instead of command line

## Security Notes

Environment variables in client-side React are embedded in the built code and are NOT secure for secrets. For production applications:

1. Never store truly sensitive information in frontend environment variables
2. Consider using a backend service to handle API requests that require sensitive keys
3. Implement proper authentication and authorization mechanisms 