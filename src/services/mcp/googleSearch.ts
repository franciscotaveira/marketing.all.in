import { gemini } from "../gemini";

export async function googleSearch(query: string) {
  const response = await gemini.generateText(query, "gemini-3-flash-preview", undefined, [{ googleSearch: {} }]);

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  return {
    text: response.text,
    sources: chunks ? chunks.map((c: any) => c.web?.uri || "").filter(Boolean) : []
  };
}
