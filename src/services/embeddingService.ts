import { gemini } from "./gemini";

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await gemini.embedContent(text);

  if (!result.embeddings || result.embeddings.length === 0) {
    throw new Error("Failed to generate embedding");
  }

  return result.embeddings[0].values;
}

// Função utilitária para similaridade de cosseno
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
