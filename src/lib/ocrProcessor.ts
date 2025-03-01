
import { createWorker } from 'tesseract.js';

export interface OcrResult {
  text: string;
  confidence: number;
}

export const processImageWithOcr = async (imageFile: File): Promise<OcrResult> => {
  try {
    console.log("Starting OCR processing for image:", imageFile.name);
    
    // Create worker with proper options format
    const worker = await createWorker({
      logger: m => console.log(m), // Optional logger
      langPath: 'https://tessdata.projectnaptha.com/4.0.0', // Path to language models
    });
    
    // Load English language data
    await worker.loadLanguage('eng');
    
    // Initialize the OCR engine
    await worker.initialize('eng');
    
    // Convert file to data URL if needed
    const imageUrl = URL.createObjectURL(imageFile);
    
    console.log("Processing image with OCR...");
    
    // Recognize text
    const result = await worker.recognize(imageUrl);
    
    console.log("OCR result:", result.data);
    
    // Terminate worker
    await worker.terminate();
    
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
    
    return {
      text: result.data.text,
      confidence: result.data.confidence,
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to extract text from image');
  }
};
