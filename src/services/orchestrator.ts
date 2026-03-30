import { MARKETING_SKILLS } from "../constants";
import { sendMessageToAgent } from "./chatService";
import { Message } from "../types";



export interface OrchestrationResult {
  agentId: string;
  response: string;
}

export async function orchestrateRequest(
  userMessage: string,
  selectedAgentId: string | null,
  model: string,
  systemInstruction: string,
  useGrounding: boolean,
  useSwarmMode: boolean,
  onLog: (agentId: string, message: string, type: 'info' | 'action' | 'success' | 'error') => void,
  images?: string[],
  history?: Message[]
): Promise<OrchestrationResult> {
  
  let targetAgentId = selectedAgentId || "orchestrator";
  let finalResponse = "";

  if (useSwarmMode) {
    onLog("orchestrator", "Iniciando Modo Swarm (Brainstorming)...", "info");
    
    // Selecionar 3 agentes diversos para o brainstorming
    const swarmAgents = [
      MARKETING_SKILLS.find(s => s.id === "strategist") || MARKETING_SKILLS[0],
      MARKETING_SKILLS.find(s => s.id === "growth-hacker") || MARKETING_SKILLS[1],
      MARKETING_SKILLS.find(s => s.id === "copywriter") || MARKETING_SKILLS[2]
    ];

    onLog("orchestrator", `Agentes convocados: ${swarmAgents.map(a => a.name).join(", ")}`, "action");

    // Coletar perspectivas em paralelo
    const perspectives = await Promise.all(swarmAgents.map(async (agent) => {
      onLog(agent.id, `Analisando o desafio sob a perspectiva de ${agent.name}...`, "info");
      const perspective = await sendMessageToAgent(
        agent.id,
        userMessage,
        agent.model || model,
        `${agent.prompt}\n\nForneça sua perspectiva especializada sobre este desafio em 1-2 parágrafos.`,
        undefined,
        images,
        history,
        useGrounding
      );
      onLog(agent.id, `Perspectiva concluída.`, "success");
      return `### Perspectiva do ${agent.name}:\n${perspective}\n`;
    }));

    onLog("orchestrator", "Sintetizando as perspectivas em uma solução final...", "action");
    
    const synthesisPrompt = `
Desafio original do usuário:
"${userMessage}"

Perspectivas dos especialistas:
${perspectives.join("\n")}

Como Orquestrador, sintetize essas visões em uma estratégia única, coesa e acionável. Destaque os melhores pontos de cada um e crie um plano de ação claro.
    `;

    finalResponse = await sendMessageToAgent(
      "orchestrator",
      synthesisPrompt,
      model,
      systemInstruction,
      undefined,
      images,
      history,
      useGrounding
    );
    
    onLog("orchestrator", "Brainstorming concluído com sucesso.", "success");
    targetAgentId = "orchestrator";

  } else {
    // Modo Individual
    const skill = MARKETING_SKILLS.find(s => s.id === targetAgentId) || MARKETING_SKILLS[0];
    
    if (useGrounding) {
      onLog(targetAgentId, "Realizando pesquisa em tempo real...", "action");
    }
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
