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

  async generateText(prompt: string, model: string = MODELS.GENERAL, systemInstruction?: string, tools?: any[]) {
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

  async generateImage(prompt: string, config: { aspectRatio?: string; imageSize?: string } = {}) {
    const response = await this.ai.models.generateContent({
      model: MODELS.IMAGE_GEN,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio || "1:1",
          imageSize: config.imageSize || "1K",
        },
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  }

  async generateVideo(prompt: string, imageBase64?: string, aspectRatio: "16:9" | "9:16" = "16:9") {
    let operation = await this.ai.models.generateVideos({
      model: MODELS.VIDEO_GEN,
      prompt,
      image: imageBase64 ? {
        imageBytes: imageBase64.split(',')[1],
        mimeType: imageBase64.split(',')[0].split(':')[1].split(';')[0],
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio,
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await this.ai.operations.getVideosOperation({ operation });
    }

    return operation.response?.generatedVideos?.[0]?.video?.uri;
  }

  async generateSpeech(text: string, voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr' = 'Zephyr') {
    const response = await this.ai.models.generateContent({
      model: MODELS.TTS,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/mp3;base64,${base64Audio}`;
    }
    return null;
  }

  async transcribeAudio(audioBase64: string) {
    const response = await this.ai.models.generateContent({
      model: MODELS.GENERAL,
      contents: [
        { text: "Transcreva este áudio exatamente como falado." },
        {
          inlineData: {
            data: audioBase64.split(',')[1],
            mimeType: audioBase64.split(',')[0].split(':')[1].split(';')[0],
          }
        }
      ],
    });
    return response.text;
  }
}

export const gemini = new GeminiService();
