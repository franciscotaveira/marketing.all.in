import { Message } from "../types";
import { gemini } from "./gemini";

export async function sendMessageToAgent(
  agentId: string, 
  message: string, 
  model: string,
  systemInstruction?: string,
  tools?: any[],
  images?: string[],
  history?: Message[],
  useGrounding?: boolean
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

    const config: any = {
      systemInstruction,
      tools: tools || [],
    };

    if (useGrounding) {
      config.tools.push({ googleSearch: {} });
    }

    // Add URL context tool by default to allow reading URLs
    config.tools.push({ urlContext: {} });

    const response = await gemini.generateText(contents, model, systemInstruction, config.tools);
    return response.text || "Sem resposta.";
  }

  // Otherwise, call backend proxy
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ agentId, message, systemInstruction, tools, images, history, useGrounding }),
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: response.statusText };
    }
    throw new Error(`Chat error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.response;
}
