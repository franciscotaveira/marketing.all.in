import { sendMessageToAgent, getSemanticCache, saveToSemanticCache } from "./chatService";
import { getToolDeclarations } from "./toolService";
import { Message, MarketingSkill, BrainMemory } from "../types";
import { firebaseService } from "../lib/firebaseService";

export interface OrchestrationResult {
  agentId: string;
  response: string;
  cached?: boolean;
}

async function getBrainContext(userMessage: string, agentId: string | null): Promise<string> {
  try {
    const { data: memories } = await firebaseService.getRelevantMemories(userMessage, agentId || undefined);
    if (memories && memories.length > 0) {
      const topMemories = memories.slice(0, 3);
      return `\n\nMEMÓRIAS SINÁPTICAS RECUPERADAS (Contexto do Cérebro):
      ${topMemories.map((m: BrainMemory) => `- [${m.title}]: ${m.content}`).join('\n')}
      
      Use estas memórias para informar sua resposta, manter consistência e acelerar o aprendizado.`;
    }
  } catch (e) {
    console.warn("Brain sync error in orchestrator:", e);
  }
  return "";
}

async function compressContext(content: string, model: string): Promise<string> {
  if (content.length < 2000) return content;
  
  console.log("[Orchestrator] Compressing context to optimize response time...");
  try {
    const summary = await sendMessageToAgent(
      "orchestrator",
      `Resuma os seguintes dados técnicos de forma extremamente concisa, mantendo apenas os fatos, números e seletores essenciais:\n\n${content}`,
      "gemini-3.1-flash-lite-preview", // Use fast model for compression
      "Você é um compressor de contexto. Seu objetivo é reduzir o volume de dados sem perder a essência para otimizar o tempo de resposta de outros agentes."
    );
    return summary;
  } catch (e) {
    console.warn("Compression failed, using original content", e);
    return content;
  }
}

export async function orchestrateRequest(
  userMessage: string,
  selectedAgentId: string | null,
  model: string,
  systemInstruction: string,
  useGrounding: boolean,
  useSwarmMode: boolean,
  onLog: (agentId: string, message: string, type: 'info' | 'action' | 'success' | 'error', isActive?: boolean) => void,
  allSkills: MarketingSkill[],
  images?: string[],
  history?: Message[],
  manualPriorities?: Record<string, number>
): Promise<OrchestrationResult> {
  
  // Intelligent Semantic Cache (Manus & Claude Optimization)
  const isCacheable = !useGrounding && (!images || images.length === 0) && (!history || history.length === 0);
  if (isCacheable) {
    const cachedResponse = await getSemanticCache(`orchestration_${userMessage}_${selectedAgentId}_${useSwarmMode}`);
    if (cachedResponse) {
      try {
        const parsed = JSON.parse(cachedResponse);
        onLog(selectedAgentId || "orchestrator", "⚡ Resultado recuperado do Cache Semântico Inteligente (Manus & Claude Optimization)", "success", false);
        return { ...parsed, cached: true };
      } catch (e) {
        // Fallback if not JSON
      }
    }
  }

  let targetAgentId = selectedAgentId || "orchestrator";
  let finalResponse = "";

  // RAG: Fetch relevant memories
  onLog("orchestrator", "Consultando memórias sinápticas relevantes...", "info", true);
  const brainContext = await getBrainContext(userMessage, selectedAgentId);
  const enrichedMessage = `${userMessage}${brainContext}`;

  if (useSwarmMode) {
    onLog("orchestrator", "Iniciando Modo Swarm (Brainstorming)...", "info", true);
    
    // Planning Phase: Use LLM to prioritize agents and define tasks
    onLog("orchestrator", "Planejando colaboração entre agentes...", "action", true);
    
    const planningPrompt = `
Desafio do Usuário: "${userMessage}"

Agentes Disponíveis:
${allSkills.map(s => `- ${s.id}: ${s.name} (${s.description})`).join("\n")}

Com base no desafio, selecione os 3 melhores agentes para colaborar.
Atribua uma prioridade de 1 a 10 para cada agente selecionado com base na criticidade da sua contribuição para este desafio específico (10 = Crítico/Principal, 1 = Apoio).

Retorne APENAS um JSON no formato:
{
  "selectedAgents": [
    {"id": "agentId1", "priority": 10, "task": "O que este agente deve fazer especificamente"},
    {"id": "agentId2", "priority": 7, "task": "..."},
    {"id": "agentId3", "priority": 5, "task": "..."}
  ],
  "plan": "Breve descrição de como eles vão colaborar",
  "criticality": "high" | "medium" | "low"
}
    `;

    let planning;
    try {
      const planResponse = await sendMessageToAgent(
        "orchestrator",
        planningPrompt,
        model,
        "Você é um Orquestrador de IA. Seu objetivo é planejar a melhor colaboração entre especialistas. Você tem acesso a imagens enviadas pelo usuário para informar seu planejamento.",
        undefined,
        images,
        undefined,
        undefined,
        "application/json"
      );
      planning = JSON.parse(planResponse);
    } catch (e) {
      console.warn("Planning error, falling back to heuristic:", e);
      // Fallback to heuristic
      const lowerMessage = userMessage.toLowerCase();
      const prioritizedIds: string[] = [];
      if (lowerMessage.includes("venda") || lowerMessage.includes("conversão") || lowerMessage.includes("copy")) prioritizedIds.push("copywriter");
      if (lowerMessage.includes("estratégia") || lowerMessage.includes("posicionamento")) prioritizedIds.push("strategist");
      if (lowerMessage.includes("tráfego") || lowerMessage.includes("anúncio")) prioritizedIds.push("media-buyer");
      
      const defaults = ["strategist", "growth-hacker", "copywriter"];
      const selectedIds = [...new Set([...prioritizedIds, ...defaults])].slice(0, 3);
      
      planning = {
        selectedAgents: selectedIds.map((id, idx) => ({
          id,
          priority: 10 - (idx * 2),
          task: "Análise especializada do desafio."
        })),
        plan: "Colaboração paralela para brainstorming de perspectivas.",
        criticality: "medium"
      };
    }

    // Apply manual priorities if provided
    if (manualPriorities) {
      planning.selectedAgents = planning.selectedAgents.map((agent: any) => ({
        ...agent,
        priority: manualPriorities[agent.id] !== undefined ? manualPriorities[agent.id] : agent.priority
      }));
    }

    // Sort agents by priority (highest first)
    const swarmAgents = planning.selectedAgents
      .sort((a: any, b: any) => b.priority - a.priority)
      .map((a: any) => {
        const skill = allSkills.find(s => s.id === a.id) || allSkills[0];
        return { ...skill, swarmTask: a.task, swarmPriority: a.priority };
      });

    onLog("orchestrator", `Plano de Colaboração (Criticidade: ${planning.criticality}): ${planning.plan}`, "success", true);
    onLog("orchestrator", `Agentes priorizados: ${swarmAgents.map(a => `${a.name} (P${a.swarmPriority})`).join(", ")}`, "success", true);

    // Coletar perspectivas em paralelo, mas respeitando a ordem de prioridade nos logs
      const perspectives = await Promise.all(swarmAgents.map(async (agent) => {
        onLog(agent.id, `[P${agent.swarmPriority}] Analisando: ${agent.swarmTask}`, "info", true);
        
        // Get tool declarations for this agent
        const toolDeclarations = getToolDeclarations(agent.tools);

        // Optimization: Compress context if it's too large for the agent
        const optimizedMessage = enrichedMessage.length > 5000 ? await compressContext(enrichedMessage, agent.model || model) : enrichedMessage;

        const perspective = await sendMessageToAgent(
          agent.id,
          optimizedMessage,
          agent.model || model,
          `${agent.prompt}\n\nSua tarefa no Swarm (Prioridade ${agent.swarmPriority}): ${agent.swarmTask}\n\nForneça sua perspectiva especializada sobre este desafio em 1-2 parágrafos.`,
          toolDeclarations,
          images,
          history,
          useGrounding
        );
      onLog(agent.id, `${agent.name} concluiu sua análise prioritária.`, "success", false);
      return `### Perspectiva do ${agent.name} (Prioridade ${agent.swarmPriority}):\n${perspective}\n`;
    }));

    onLog("orchestrator", "Sintetizando as perspectivas em uma solução final...", "action", true);
    
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
    
    onLog("orchestrator", "Brainstorming concluído com sucesso.", "success", false);
    targetAgentId = "orchestrator";

  } else {
    // Modo Individual
    const skill = allSkills.find(s => s.id === targetAgentId) || allSkills[0];
    
    if (useGrounding) {
      onLog(targetAgentId, "Realizando pesquisa em tempo real...", "action", true);
    }
    onLog(targetAgentId, "Processando a solicitação...", "info", true);
    
    const toolDeclarations = getToolDeclarations(skill?.tools);

    finalResponse = await sendMessageToAgent(
      targetAgentId,
      enrichedMessage,
      skill?.model || model,
      systemInstruction,
      toolDeclarations,
      images,
      history,
      useGrounding
    );
    onLog(targetAgentId, "Resposta gerada com sucesso.", "success", false);
  }

  const result = {
    agentId: targetAgentId,
    response: finalResponse
  };

  // Save to intelligent semantic cache
  if (isCacheable && finalResponse) {
    await saveToSemanticCache(`orchestration_${userMessage}_${selectedAgentId}_${useSwarmMode}`, JSON.stringify(result));
  }

  return result;
}
