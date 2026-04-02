import { Message } from "../types";
import { gemini } from "./gemini";

// Intelligent Cache System
const CACHE_PREFIX = "agent_cache_";
const CACHE_EXPIRATION = 1000 * 60 * 60; // 1 hour

function getCacheKey(agentId: string, message: string, systemInstruction?: string, history?: Message[]) {
  const data = JSON.stringify({ agentId, message, systemInstruction, history: history?.slice(-3) });
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `${CACHE_PREFIX}${hash}`;
}

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
  // Check Cache first (only for non-grounding and non-image requests for simplicity)
  const isCacheable = !useGrounding && (!images || images.length === 0);
  const cacheKey = getCacheKey(agentId, message, systemInstruction, history);

  if (isCacheable) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const { response, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRATION) {
          console.log(`[Cache Hit] Agent: ${agentId}`);
          return response;
        }
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }
  }

  let finalResponse = "";

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
    finalResponse = response.text || "Sem resposta.";
  } else {
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
    finalResponse = data.response;
  }

  // Save to Cache
  if (isCacheable && finalResponse) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        response: finalResponse,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn("Failed to save to cache", e);
    }
  }

  return finalResponse;
}
