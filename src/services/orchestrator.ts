import { MARKETING_SKILLS } from "../constants";
import { sendMessageToAgent } from "./chatService";
import { googleSearch } from "./mcp/googleSearch";
import { getAnalyticsData } from "./mcp/googleAnalytics";
import { getMetaAdsPerformance } from "./mcp/metaAds";
import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface OrchestrationResult {
  agentId: string;
  response: string;
}

export async function orchestrateRequest(
  userMessage: string,
  selectedAgentId: string | null,
  isSwarmMode: boolean,
  model: string,
  systemInstruction: string,
  useGrounding: boolean,
  onAgentStatus: (id: string, status: 'idle' | 'thinking' | 'using_tool', tool?: string) => void,
  onLog: (agentId: string, message: string, type: 'info' | 'action' | 'success' | 'error') => void,
  images?: string[],
  history?: Message[]
): Promise<OrchestrationResult> {
  
  let targetAgentId = selectedAgentId || "orchestrator";
  
  // 1. Modo Swarm: Decomposição e Delegação
  if (isSwarmMode) {
    onLog("swarm_orchestrator", "Analisando a mensagem para delegar tarefas...", "info");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analise a mensagem e identifique quais agentes de marketing devem colaborar.
      Agentes disponíveis: ${MARKETING_SKILLS.map(s => `${s.id}: ${s.description}`).join(", ")}.
      Retorne APENAS uma lista de IDs dos agentes separados por vírgula.
      Mensagem: ${userMessage}`,
    });
    
    const agentIds = response.text?.trim().split(",").map(id => id.trim()) || [];
    onLog("swarm_orchestrator", `Agentes selecionados para a tarefa: ${agentIds.join(", ")}`, "action");
    
    // Chamar agentes em paralelo
    const agentResponses = await Promise.all(
      agentIds.map(async (id) => {
        const skill = MARKETING_SKILLS.find(s => s.id === id);
        if (!skill) return null;
        onAgentStatus(id, 'thinking');
        onLog(id, "Iniciando processamento da tarefa...", "info");
        const resp = await sendMessageToAgent(id, userMessage, skill.model || model, systemInstruction, undefined, images, history, useGrounding);
        onLog(id, "Tarefa concluída com sucesso.", "success");
        onAgentStatus(id, 'idle');
        return { id, resp };
      })
    );

    // Sintetizar respostas
    onLog("swarm_orchestrator", "Sintetizando as respostas dos agentes...", "info");
    const synthesis = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Sintetize as respostas dos agentes abaixo em uma resposta final coesa para o usuário.
      ${agentResponses.filter(Boolean).map(r => `Agente ${r?.id}: ${r?.resp}`).join("\n\n")}`,
    });

    onLog("swarm_orchestrator", "Síntese concluída.", "success");

    return {
      agentId: "swarm_orchestrator",
      response: synthesis.text || "Erro na síntese do swarm."
    };
  }

  // 2. Modo Individual
  const skill = MARKETING_SKILLS.find(s => s.id === targetAgentId) || MARKETING_SKILLS[0];
  
  let finalResponse = "";

  if (useGrounding) {
    onLog(targetAgentId, "Realizando pesquisa em tempo real...", "action");
    // We can still do the manual googleSearch if we want, or just let Gemini handle it via tools.
    // Since we added googleSearch to tools in sendMessageToAgent, we can just call sendMessageToAgent directly.
    // But wait, the previous code explicitly called `googleSearch` from mcp. Let's keep the old behavior for explicit grounding if needed, OR we can just pass it to the agent.
    // Actually, the user's request says "Use gemini-3-flash-preview (with googleSearch tool)".
    // So we should just let the agent handle it. Let's change this to use sendMessageToAgent.
    onLog(targetAgentId, "Processando a solicitação com Grounding...", "info");
    finalResponse = await sendMessageToAgent(
      targetAgentId,
      userMessage,
      skill?.model || model,
      systemInstruction,
      undefined,
      images,
      history,
      useGrounding
    );
    onLog(targetAgentId, "Resposta gerada com sucesso.", "success");
  } else {
    onLog(targetAgentId, "Processando a solicitação...", "info");
    finalResponse = await sendMessageToAgent(
      targetAgentId,
      userMessage,
      skill?.model || model,
      systemInstruction,
      undefined,
      images,
      history,
      useGrounding
    );
    onLog(targetAgentId, "Resposta gerada com sucesso.", "success");
  }

  return {
    agentId: targetAgentId,
    response: finalResponse
  };
}
