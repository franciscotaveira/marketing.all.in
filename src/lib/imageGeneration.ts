import { GoogleGenAI } from "@google/genai";

/**
 * Global queue to ensure only one image is generated at a time across the entire app.
 * This is crucial for staying within tight rate limits for image generation models.
 */
class ImageGenerationQueue {
  private queue: (() => Promise<void>)[] = [];
  private isProcessing = false;

  async add<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        await task();
        // Add a mandatory cooldown between successful generations to be safe
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    this.isProcessing = false;
  }
}

const globalQueue = new ImageGenerationQueue();

/**
 * Utility to generate images with retry logic for rate limits (429).
 * Uses a global queue to serialize requests.
 */
export async function generateImageWithRetry(prompt: string, maxRetries = 5): Promise<string> {
  return globalQueue.add(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    let lastError: any;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Exponential backoff with jitter
        if (attempt > 0) {
          const delay = Math.pow(3, attempt) * 2000 + Math.random() * 2000;
          console.log(`Waiting ${Math.round(delay)}ms before retry attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
        });

        if (!response.candidates?.[0]?.content?.parts) {
          throw new Error('Invalid response structure');
        }

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
        
        throw new Error('No image in response');
      } catch (err: any) {
        lastError = err;
        
        const errorMessage = err?.message || String(err);
        if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`Rate limit hit on attempt ${attempt + 1}.`);
          // If we hit a rate limit, we definitely want to continue the loop and retry after backoff
          continue;
        }
        
        // For other errors (e.g. invalid prompt, safety filters), fail immediately
        throw err;
      }
    }

    throw lastError || new Error('Failed to generate image after retries');
  });
}
