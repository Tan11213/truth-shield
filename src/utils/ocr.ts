import { createWorker } from 'tesseract.js';

/**
 * Extract text from an image using OCR
 * @param file The image file to process
 * @returns Extracted text from the image
 */
export const extractTextFromImage = async (file: File): Promise<string> => {
  try {
    const worker = await createWorker('eng');
    
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image. Please try again or enter text manually.');
  }
}; 