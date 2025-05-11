# TruthShield OCR Setup Guide

## Using Tesseract.js for OCR

TruthShield uses Tesseract.js for OCR (Optical Character Recognition), which allows the application to extract text from images. Tesseract.js runs entirely in the browser, so no external API key or service is required.

### 1. How Tesseract.js Works

Tesseract.js is a JavaScript port of the Tesseract OCR engine and works as follows:

- It runs completely client-side in the browser
- No API keys or external services are needed
- The initial load may take a moment as it downloads required resources
- Processing larger or more complex images takes more time
- It supports multiple languages (though English is used by default)

### 2. Improving OCR Results

To get the best results from Tesseract.js, consider these tips:

#### Image Quality:
- Use high-contrast images (dark text on light background)
- Ensure text is clear and not blurry
- Avoid images with complex backgrounds or overlays
- Use PNG or high-quality JPG formats
- Resize very large images to reduce processing time (e.g., under 2000px width/height)

#### Best Practices:
- Wait patiently during processing of larger images.
- For screenshots, capture at a higher resolution if possible, but avoid extremely large files.
- Crop images to include only the relevant text you need to extract.
- Ensure text is properly oriented (horizontal, not skewed).

### 3. Troubleshooting OCR Issues

If you're experiencing problems with the OCR feature, check the following:

#### Poor Text Recognition:
- Text might be too small or blurry.
- The background might be too complex or similar in color to the text.
- The image might be rotated or heavily skewed.
- Text might be in a language other than English (currently, only English is configured).
- The image contains handwritten text (Tesseract.js performs better on printed text).

#### Processing Time:
- Larger images (by dimensions or file size) take significantly longer to process.
- Complex images with many different text regions or noisy backgrounds take longer.
- First-time use may be slower as Tesseract.js loads its resources.
- Low-powered devices may experience longer processing times.

### 4. Debugging Text Extraction Issues

If you can't see the extracted text after OCR processing, or if the text is inaccurate:

- Check if the text area is visible below the image upload area.
- Ensure you've waited for OCR processing to complete (look for the loading indicator to disappear).
- Check the browser console for any error messages:
  1. Press F12 to open developer tools.
  2. Click on the "Console" tab.
  3. Look for messages related to "OCR" or "Tesseract". Errors will be logged here.
- Try refreshing the page and uploading your image again.
- Try a smaller or clearer image with better contrast.
- If the text is partially extracted, try cropping the image to only the most important text region.

Application logs to the browser console can provide clues:
- OCR start and completion events.
- The amount of text extracted and a sample.
- Confidence level of text recognition.
- Any errors that occurred during processing.

### 5. Manual Text Entry

If automatic OCR fails to extract text accurately, you can always:
- Manually type or paste text into the extraction field.
- Edit the automatically extracted text to correct any errors.
- Use the text-based fact-checking option instead of image upload if OCR is consistently poor for your images.

## Still Having Problems?

If you continue to have issues with the OCR functionality:
- Ensure your browser is up-to-date.
- Try a different browser if possible (Chrome or Firefox are recommended).
- Consider using a more powerful device for processing very large or complex images.

For more information about Tesseract.js, visit [the official documentation](https://github.com/naptha/tesseract.js). 