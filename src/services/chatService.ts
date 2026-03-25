import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function sendMessageToAgent(
  agentId: string, 
  message: string, 
  model: string,
  systemInstruction?: string,
  tools?: any[],
  images?: string[],
  history?: Message[]
) {
  // If model is Gemini, use SDK
  if (model.startsWith("gemini")) {
    const contents: any[] = [];
    
    if (history && history.length > 0) {
      history.forEach(msg => {
        const role = msg.role === 'ai' ? 'model' : 'user';
        const parts: any[] = [{ text: msg.content }];
        if (msg.images && msg.images.length > 0) {
          msg.images.forEach(img => {
            const [mimeTypePart, base64Part] = img.split(',');
            const mimeType = mimeTypePart.match(/:(.*?);/)?.[1] || 'image/jpeg';
            parts.push({
              inlineData: {
                data: base64Part,
                mimeType: mimeType
              }
            });
          });
        }
        contents.push({ role, parts });
      });
    }

    const currentParts: any[] = [{ text: message }];
    
    if (images && images.length > 0) {
      images.forEach(img => {
        const [mimeTypePart, base64Part] = img.split(',');
        const mimeType = mimeTypePart.match(/:(.*?);/)?.[1] || 'image/jpeg';
        currentParts.push({
          inlineData: {
            data: base64Part,
            mimeType: mimeType
          }
        });
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction,
        tools,
      },
    });
    return response.text || "Sem resposta.";
  }

  // Otherwise, call backend proxy
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agentId, message, systemInstruction, tools, images, history }),
  });

  if (!response.ok) {
    throw new Error(`Chat error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.response;
}
