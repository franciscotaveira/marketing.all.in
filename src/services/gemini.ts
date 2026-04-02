import { GoogleGenAI, Modality, ThinkingLevel, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY!;

export const MODELS = {
  GENERAL: "gemini-3-flash-preview",
  COMPLEX: "gemini-3.1-pro-preview",
  FAST: "gemini-3.1-flash-lite-preview",
  IMAGE_GEN: "gemini-3.1-flash-image-preview",
  IMAGE_STUDIO: "gemini-3-pro-image-preview",
  VIDEO_GEN: "veo-3.1-fast-generate-preview",
  TTS: "gemini-2.5-flash-preview-tts",
  LIVE: "gemini-2.5-flash-native-audio-preview-12-2025",
};

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey });
  }

  private async withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError: any;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        // Check if it's a rate limit error (429)
        const isRateLimit = error?.message?.includes('429') || 
                           error?.status === 429 || 
                           error?.error?.code === 429 ||
                           error?.message?.includes('RESOURCE_EXHAUSTED');
        
        if (isRateLimit && i < maxRetries - 1) {
          const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
          console.warn(`Rate limit hit (429). Retrying in ${Math.round(delay)}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  async generateText(prompt: string | any[], model: string = MODELS.GENERAL, systemInstruction?: string, tools?: any[], responseMimeType?: string) {
    return this.withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          tools,
          responseMimeType,
        },
      });
      return response;
    });
  }

  async generateComplexResponse(prompt: string, systemInstruction?: string) {
    return this.withRetry(async () => {
      const response = await this.ai.models.generateContent({
        model: MODELS.COMPLEX,
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        },
      });
      return response;
    });
  }


  async embedContent(text: string) {
    return this.withRetry(async () => {
      const result = await this.ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
      });
      return result;
    });
  }
}

export const gemini = new GeminiService();
