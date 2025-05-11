# OCR Troubleshooting Guide

## Overview

TruthShield now uses Google Gemini 2.0 Flash for image OCR and text extraction, replacing the previous Tesseract.js implementation. This provides significantly improved accuracy, especially for complex layouts like news articles and social media posts.

## Requirements

- You must have a valid Gemini API key set in your environment variables as `REACT_APP_GEMINI_API_KEY`
- For final fact checking, we now use Perplexity's Sonar Pro model, which requires a Perplexity API key set as `REACT_APP_PERPLEXITY_API_KEY`

## How It Works

1. When you upload an image, TruthShield converts it to base64 encoding
2. The image is sent to Google Gemini 2.0 Flash with carefully engineered prompts that:
   - Extract all text while preserving structure
   - Prioritize headlines and colored text
   - Extract exact factual claims without adding qualifiers
   - Ensure claims are presented exactly as stated in the original content
3. The extracted text is processed to improve formatting and readability
4. The text is displayed in the editor for you to review and modify if needed
5. When you verify the text, it's processed by Perplexity's Sonar Pro model for comprehensive fact-checking using diverse sources

## Tips for Best Results

- Use clear, high-resolution images whenever possible
- For news articles, ensure the headline and main text are visible and not cut off
- For social media posts, capture the entire post including relevant context
- The system can now extract text in different colors (blue, black, etc.) and styles
- Avoid images with extreme angles, glare, or other distortions
- If text extraction is incomplete, you can always edit the text manually before verification

## Recent Improvements

- **Enhanced Claim Extraction**: Gemini now extracts clear factual claims without adding qualifiers like "reportedly" or "allegedly" unless they're in the original text
- **Headline Priority**: The system identifies and prioritizes headlines for claim extraction
- **Structured Extraction**: Text is now extracted with better structure preservation
- **Post-Processing**: Additional formatting to improve readability in the editor

## Error Handling

If you encounter issues with text extraction:

1. Ensure your API keys are correctly set
2. Check your network connection
3. Verify that the image is of sufficient quality
4. Try an alternative image if possible
5. If all else fails, manually transcribe the text from the image

## Technical Notes

- For large images, there may be a slight delay while Gemini processes the content
- The system automatically detects social media platforms based on visual and textual cues
- For text-heavy content like news articles, Gemini will prioritize extracting headlines and main body text
- While 'gemini-1.5-flash-latest' is the API endpoint name, this is indeed the Gemini 2.0 Flash model
- Each extracted text is also analyzed to produce a structured claim summary for fact-checking
- Perplexity uses diverse sources including YouTube, social media, and other non-news sources 