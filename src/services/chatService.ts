import { Message } from "../types";
import { gemini } from "./gemini";
import { executeToolCall } from "./toolService";

// Intelligent Cache System
const CACHE_PREFIX = "agent_cache_v2_";
const CACHE_EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours
const SIMILARITY_THRESHOLD = 0.98; // Very high similarity for semantic cache

export async function getSemanticCache(message: string): Promise<string | null> {
  try {
    const cacheIndex = localStorage.getItem(`${CACHE_PREFIX}index`);
    if (!cacheIndex) return null;

    const index: { key: string; embedding: number[]; timestamp: number }[] = JSON.parse(cacheIndex);
    
    // Clean up expired entries
    const now = Date.now();
    const validIndex = index.filter(item => now - item.timestamp < CACHE_EXPIRATION);
    if (validIndex.length !== index.length) {
      localStorage.setItem(`${CACHE_PREFIX}index`, JSON.stringify(validIndex));
    }

    if (validIndex.length === 0) return null;

    // Get embedding for current message
    const { embeddings } = await gemini.embedContent(message);
    const currentEmbedding = embeddings[0].values;

    // Find most similar
    let bestMatch = null;
    let maxSimilarity = -1;

    for (const item of validIndex) {
      const similarity = cosineSimilarity(currentEmbedding, item.embedding);
      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatch = item;
      }
    }

    if (bestMatch && maxSimilarity >= SIMILARITY_THRESHOLD) {
      console.log(`[Semantic Cache Hit] Similarity: ${(maxSimilarity * 100).toFixed(2)}%`);
      return localStorage.getItem(bestMatch.key);
    }
  } catch (e) {
    console.warn("Semantic cache error:", e);
  }
  return null;
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    mA += vecA[i] * vecA[i];
    mB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(mA) * Math.sqrt(mB));
}

export async function saveToSemanticCache(message: string, response: string) {
  try {
    const { embeddings } = await gemini.embedContent(message);
    const embedding = embeddings[0].values;
    const key = `${CACHE_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    localStorage.setItem(key, response);

    const cacheIndex = localStorage.getItem(`${CACHE_PREFIX}index`);
    const index = cacheIndex ? JSON.parse(cacheIndex) : [];
    index.push({ key, embedding, timestamp: Date.now() });
    
    // Limit index size to 50 entries to avoid localStorage bloat
    if (index.length > 50) {
      const removed = index.shift();
      localStorage.removeItem(removed.key);
    }

    localStorage.setItem(`${CACHE_PREFIX}index`, JSON.stringify(index));
  } catch (e) {
    console.warn("Failed to save to semantic cache:", e);
  }
}

export async function sendMessageToAgent(
  agentId: string, 
  message: string, 
  model: string,
  systemInstruction?: string,
  tools?: any[],
  images?: string[],
  history?: Message[],
  useGrounding?: boolean,
  responseMimeType?: string
) {
  // Check Cache first
  const isCacheable = !useGrounding && (!images || images.length === 0) && !responseMimeType && (!history || history.length === 0);
  
  if (isCacheable) {
    const cachedResponse = await getSemanticCache(message);
    if (cachedResponse) return cachedResponse;
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

    const cotDirective = `

CHAIN OF THOUGHT E FEW-SHOT LEARNING:
Antes de responder, você deve OBRIGATORIAMENTE criar um bloco <thought_process> e raciocinar passo-a-passo e metodicamente sobre o contexto, a persona, restrições da sua skill e o modelo da solução pedida. Isso garante ausência de alucinações e foco no output perfeito. Depois do bloco, comece sua resposta final.

Exemplo de formato esperado:
<thought_process>
1. O usuário pediu X.
2. A persona é Y, então o tom deve ser Z.
3. Precisarei das informações A e B. Vou focar em gerar uma solução prática para o contexto W.
</thought_process>

Olá! Aqui está a estratégia detalhada para o que você pediu...
[resto da resposta do agente]`;
    const enhancedSystemInstruction = systemInstruction ? systemInstruction + cotDirective : cotDirective;

    const config: any = {
      systemInstruction: enhancedSystemInstruction,
      tools: tools || [],
    };

    if (useGrounding) {
      config.tools.push({ googleSearch: {} });
    }

    // Add URL context tool by default to allow reading URLs
    config.tools.push({ urlContext: {} });

    const response = await gemini.client.models.generateContent({
      model: model || "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: enhancedSystemInstruction,
        tools: config.tools,
        responseMimeType: responseMimeType as any,
      }
    });

    // Handle Function Calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      const functionResponses = [];
      for (const call of response.functionCalls) {
        const toolResult = await executeToolCall(call.name, call.args);
        functionResponses.push({
          name: call.name,
          response: toolResult,
          id: call.id
        });
      }

      // Send back function results to the model
      const secondResponse = await gemini.client.models.generateContent({
        model: model || "gemini-3-flash-preview",
        contents: [
          ...contents,
          response.candidates?.[0]?.content as any,
          {
            role: "user",
            parts: functionResponses.map(res => ({
              functionResponse: {
                name: res.name,
                response: res.response,
                id: res.id
              }
            }))
          }
        ],
        config: {
          systemInstruction,
          tools: config.tools,
        }
      });

      finalResponse = secondResponse.text || "Erro ao processar resposta da ferramenta.";
    } else {
      finalResponse = response.text || "Sem resposta.";
    }
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
    await saveToSemanticCache(message, finalResponse);
  }

  return finalResponse;
}
