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

  async generateText(prompt: string | any[], model: string = MODELS.GENERAL, systemInstruction?: string, tools?: any[]) {
    const response = await this.ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        tools,
      },
    });
    return response;
  }

  async generateComplexResponse(prompt: string, systemInstruction?: string) {
    const response = await this.ai.models.generateContent({
      model: MODELS.COMPLEX,
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      },
    });
    return response;
  }


  async embedContent(text: string) {
    const result = await this.ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: text,
    });
    return result;
  }
}

export const gemini = new GeminiService();
