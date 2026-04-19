import React, { useState, useEffect, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { motion, AnimatePresence } from "motion/react";
import { 
  Brain, 
  Zap, 
  Database, 
  Search, 
  Plus, 
  Save, 
  X, 
  ChevronRight, 
  Activity,
  Network,
  Cpu,
  FileText,
  Share2,
  Trash2,
  Maximize2,
  Video,
  Microscope,
  Library
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { BrainNode, BrainLink, BrainMemory, MarketingSkill } from "../types";
import { firebaseService } from "../lib/firebaseService";
import { cn } from "../lib/utils";
import { ABSORBED_SKILLS } from "../constants";

interface AgentBrainProps {
  agent: MarketingSkill | null;
  onClose: () => void;
  isDarkMode?: boolean;
  isIntegrated?: boolean;
}

export function AgentBrain({ agent, onClose, isDarkMode = true, isIntegrated }: AgentBrainProps) {
  const [view, setView] = useState<"graph" | "vault" | "neural" | "skills" | "analytics">("graph");
  const [memories, setMemories] = useState<BrainMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<BrainMemory | null>(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "", roi: "" });
  const [graphData, setGraphData] = useState<{ nodes: BrainNode[], links: BrainLink[] }>({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [neuralPulse, setNeuralPulse] = useState(0);

  // New states
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [vaultFilter, setVaultFilter] = useState("");
  const [vaultSort, setVaultSort] = useState<"date" | "roi">("date");
  const [enabledSkills, setEnabledSkills] = useState<Record<string, boolean>>({});
  const [autoPilotActive, setAutoPilotActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (autoPilotActive) {
      interval = setInterval(async () => {
        const newInsight: Omit<BrainMemory, "id" | "createdAt" | "updatedAt"> = {
          title: `Insight Autônomo: ${new Date().toLocaleTimeString()}`,
          content: `Análise em background concluída.\n\n Identificamos uma queda de **12% no engajamento** em posts de fundo cinza, mas as conversões do webhook do n8n cresceram.\n\nSugestão: Aumentar orçamento na pauta de testes A/B.`,
          tags: ["auto-pilot", "growth", "background-task", "insight"],
          type: "insight",
          source: "Background Thread / Auto Pilot",
          roi: Math.floor(Math.random() * 30) + 5
        };
        await firebaseService.saveMemory(newInsight as any);
      }, 15000);
    }
    return () => clearInterval(interval);
  }, [autoPilotActive]);

  const graphRef = useRef<any>(null);

  const roiData = React.useMemo(() => {
    const historicalRoi = memories
      .filter((m) => typeof m.roi === 'number' && !isNaN(m.roi))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((m) => ({ v: m.roi }));
    return historicalRoi.length > 2 ? historicalRoi : [{v: 12}, {v: 18}, {v: 15}, {v: 24.5}];
  }, [memories]);

  const updateHighlight = (node: any, links: any[]) => {
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();
    if (node) {
      newHighlightNodes.add(node);
      links.forEach(link => {
        if (link.source.id === node.id || link.target.id === node.id) {
          newHighlightLinks.add(link);
          newHighlightNodes.add(link.source);
          newHighlightNodes.add(link.target);
        }
      });
    }
    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  const analyzePatterns = () => {
    // Simple pattern: highlight nodes that share the same tag
    const tagCounts: Record<string, number> = {};
    graphData.nodes.forEach(node => {
      if (node.type === "metric") {
        tagCounts[node.id] = (tagCounts[node.id] || 0) + 1;
      }
    });

    const commonTags = Object.keys(tagCounts).filter(tag => tagCounts[tag] > 1);
    
    const newHighlightNodes = new Set();
    const newHighlightLinks = new Set();

    graphData.nodes.forEach(node => {
      if (commonTags.includes(node.id)) {
        newHighlightNodes.add(node);
      }
    });

    setHighlightNodes(newHighlightNodes);
    setHighlightLinks(newHighlightLinks);
  };

  useEffect(() => {
    let interval: any;
    if (autoPilotActive) {
      interval = setInterval(async () => {
        // Mock Auto-Pilot generating insights
        const newInsight: Omit<BrainMemory, "id" | "createdAt" | "updatedAt"> = {
          title: `Insight Autônomo: ${new Date().toLocaleTimeString()}`,
          content: `Análise em background concluída.\n\n Identificamos uma queda de **12% no engajamento** em posts de fundo cinza, mas as conversões do webhook do n8n cresceram.\n\nSugestão: Aumentar orçamento na pauta de testes A/B.`,
          tags: ["auto-pilot", "growth", "background-task", "insight"],
          type: "insight",
          source: "Background Thread / Auto Pilot",
          roi: Math.floor(Math.random() * 30) + 5
        };
        await firebaseService.saveMemory(newInsight as any); // cast for simplicity, triggering listener
      }, 15000); // 15 seconds for testing
    }
    return () => clearInterval(interval);
  }, [autoPilotActive]);

  useEffect(() => {
    loadMemories();
    const interval = setInterval(() => {
      setNeuralPulse(prev => (prev + 1) % 100);
    }, 2000);
    return () => clearInterval(interval);
  }, [agent]);

  const injectN8nExperiences = async () => {
    setIsSyncing(true);
    const experiences = [
      {
        title: "[God-Tier] Arquitetura de Worker Nodes (Redis/Postgres)",
        content: "Para escalar o n8n horizontalmente, NUNCA use o modo regular em produção de alto volume. Configure `EXECUTIONS_MODE=queue`, conecte ao Redis (`QUEUE_BULL_REDIS_HOST`) e suba múltiplos containers de Worker. Para evitar travamentos no banco, sempre defina `EXECUTIONS_DATA_PRUNE=true` e `EXECUTIONS_DATA_MAX_AGE=168` (7 dias).",
        tags: ["infraestrutura", "devops", "escalabilidade", "redis"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 10
      },
      {
        title: "[God-Tier] Tratamento de Erros e Resiliência (Error Trigger)",
        content: "Fluxos amadores param quando uma API falha. Fluxos Enterprise usam o nó 'Error Trigger' em um workflow separado. Quando qualquer fluxo falha, o Error Trigger captura o erro, envia um alerta detalhado (com o ID da execução e o nome do nó que falhou) para o Slack/Discord e tenta uma rota de fallback ou re-enfileira a mensagem no RabbitMQ.",
        tags: ["resiliencia", "tratamento-de-erros", "slack", "webhook"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 9
      },
      {
        title: "[God-Tier] Processamento em Lote (Split in Batches)",
        content: "Ao processar milhares de registros (ex: sincronizar banco com CRM), o n8n pode estourar a memória (OOM). A solução definitiva é usar o nó 'Split in Batches' (ou Loop) com tamanho de lote de 50-100. Adicione um nó 'Wait' de 1 segundo entre os lotes para respeitar o Rate Limit das APIs externas (HTTP 429 Too Many Requests).",
        tags: ["performance", "rate-limit", "lote", "crm"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 9
      },
      {
        title: "[God-Tier] RAG Complexo e Agentes Autônomos no n8n",
        content: "Para criar um Agente de IA no n8n, use o nó 'AI Agent' conectado a um 'Window Buffer Memory' (para lembrar o contexto) e ferramentas (Tools) como 'Wikipedia', 'Calculator' ou 'HTTP Request'. Para RAG, conecte um 'Vector Store' (Pinecone/Qdrant) alimentado por um 'Document Loader' e um 'Text Splitter' (chunk size 1000, overlap 200).",
        tags: ["ia", "rag", "langchain", "agentes", "memoria"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 10
      },
      {
        title: "[God-Tier] Web Scraping Dinâmico com Puppeteer",
        content: "Quando APIs não estão disponíveis e o site usa React/Vue (SPA), requisições HTTP normais falham. A solução é usar o n8n para chamar um serviço externo do Puppeteer/Playwright (via HTTP Request) ou usar um Custom Node de browserless.io para renderizar o JavaScript, esperar o seletor aparecer e extrair o HTML final.",
        tags: ["scraping", "puppeteer", "automacao-web", "spa"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 8
      },
      {
        title: "[God-Tier] Manipulação de Dados Binários (Files/Streams)",
        content: "NUNCA carregue arquivos grandes (vídeos, PDFs pesados) diretamente na memória do n8n. Use a flag `BINARY_DATA_MODE=filesystem` no seu `.env` para que o n8n grave os arquivos no disco em vez de mantê-los na RAM. Para processar arquivos gigantes, use streams e o nó 'Read Binary File' configurado para ler em chunks.",
        tags: ["arquivos", "binario", "memoria", "performance"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 10
      },
      {
        title: "[God-Tier] Segurança de Webhooks (HMAC & IP Whitelisting)",
        content: "Webhooks abertos são uma falha de segurança crítica. Sempre valide a assinatura HMAC do payload recebido (ex: Stripe, Shopify) usando um nó de Crypto antes de processar os dados. Em ambientes Enterprise, configure o proxy reverso (Nginx/Traefik) para aceitar requisições no endpoint do webhook apenas de IPs conhecidos (IP Whitelisting).",
        tags: ["seguranca", "webhook", "hmac", "proxy"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 10
      },
      {
        title: "[God-Tier] CI/CD de Workflows (Promoção de Ambientes)",
        content: "Não edite fluxos em produção. Tenha instâncias separadas (Dev, Staging, Prod). Use a API pública do n8n (`/api/v1/workflows`) ou a CLI (`n8n export`) em um pipeline do GitHub Actions para exportar o JSON do fluxo de Dev, substituir os IDs de credenciais (usando variáveis de ambiente) e importar na instância de Produção automaticamente.",
        tags: ["ci-cd", "github-actions", "deploy", "api"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 9
      },
      {
        title: "[God-Tier] Sub-Workflows como Microserviços (Execute Workflow)",
        content: "Workflows gigantes (monolitos) são impossíveis de dar manutenção. Quebre a lógica em dezenas de sub-workflows menores e chame-os usando o nó 'Execute Workflow'. Isso permite reaproveitamento de código (ex: um fluxo único só para enviar emails, chamado por vários outros fluxos) e isolamento de falhas.",
        tags: ["arquitetura", "microservicos", "dry", "manutencao"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 9
      },
      {
        title: "[God-Tier] High-Performance Webhooks (Respond to Webhook)",
        content: "Se o seu n8n recebe um Webhook do Stripe ou Shopify e demora para processar, a API externa vai dar Timeout e reenviar o evento, causando duplicação. A regra de ouro é: coloque um nó 'Respond to Webhook' LOGO APÓS o gatilho para retornar HTTP 200 OK imediatamente. O n8n continuará processando o resto do fluxo de forma assíncrona em background.",
        tags: ["webhooks", "performance", "timeout", "assincrono"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 10
      },
      {
        title: "[God-Tier] Human-in-the-Loop (HITL) com Nó Wait",
        content: "Aprovações manuais não precisam quebrar a automação. Use o nó 'Wait' configurado para 'On Webhook Call'. Envie uma mensagem no Slack com botões (Aprovar/Rejeitar) que apontam para a URL desse Webhook de retomada. O n8n pausará a execução (sem consumir CPU) e só continuará quando o humano clicar no botão.",
        tags: ["hitL", "aprovacao", "slack", "wait-node"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 9
      },
      {
        title: "[God-Tier] Exponential Backoff & Retry Logic",
        content: "APIs falham. Não use apenas 'Retry on Fail' nas configurações do nó, pois isso repete imediatamente. Construa uma malha de repetição real: Use um nó 'Loop' conectado a um nó 'Wait' dinâmico (ex: `{{ $runIndex * 5 }} seconds`). Se a API falhar, ele espera 5s, depois 10s, depois 15s (Exponential Backoff) antes de desistir.",
        tags: ["resiliencia", "retry", "backoff", "apis"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 10
      },
      {
        title: "[God-Tier] Enterprise Secrets Management",
        content: "Em bancos e empresas Fortune 500, você não salva senhas no n8n. Em vez de usar as 'Credentials' nativas, faça uma chamada HTTP autenticada (via IAM role) para o AWS Secrets Manager ou HashiCorp Vault no início do fluxo. Injete a chave em memória apenas durante aquela execução e limpe os dados em seguida.",
        tags: ["seguranca", "secrets", "aws", "vault", "compliance"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 10
      },
      {
        title: "[God-Tier] Automated Workflow Testing (Mock Data)",
        content: "Para testar fluxos complexos sem disparar ações reais, crie um fluxo 'Test Runner'. Ele usa um nó 'Code' para gerar payloads JSON falsos (Mock Data) e chama o seu fluxo principal via 'Execute Workflow'. O fluxo principal deve ter um IF checando uma variável `isTest=true` para pular nós que enviam emails ou cobram cartões.",
        tags: ["qa", "testes", "ci-cd", "mock"],
        agentId: "automation-engineer",
        type: "insight" as const,
        importance: 8
      }
    ];

    for (const exp of experiences) {
      await firebaseService.saveMemory(exp);
    }
    
    await loadMemories();
    setIsSyncing(false);
  };

  const loadMemories = async () => {
    setIsSyncing(true);
    const { data } = await firebaseService.getMemories(agent?.id);
    if (data) {
      setMemories(data);
      generateGraph(data);
    }
    setTimeout(() => setIsSyncing(false), 800);
  };

  const generateGraph = (mems: BrainMemory[]) => {
    const nodes: BrainNode[] = [
      { id: "core", label: agent?.name || "Cérebro Central", type: "agent", val: 20, color: "#3b82f6" }
    ];
    const links: BrainLink[] = [];

    // Add concepts from memories
    mems.forEach(m => {
      nodes.push({ id: m.id, label: m.title, type: "concept", val: 10, color: "#f97316" });
      links.push({ source: "core", target: m.id, strength: 1 });

      // Link tags
      m.tags.forEach(tag => {
        if (!nodes.find(n => n.id === tag)) {
          nodes.push({ id: tag, label: `#${tag}`, type: "metric", val: 5, color: "#10b981" });
        }
        links.push({ source: m.id, target: tag, strength: 0.5 });
      });
    });

    setGraphData({ nodes, links });
  };

  const handleEditNote = (memory: BrainMemory) => {
    setNewNote({
      title: memory.title,
      content: memory.content,
      tags: memory.tags.join(", "),
      roi: memory.roi?.toString() || ""
    });
    setEditingMemoryId(memory.id);
    setIsNewNoteOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    if(!window.confirm("Você tem certeza que deseja excluir esta memória?")) return;
    try {
      // Optimistic visual update
      setMemories(prev => prev.filter(m => m.id !== id));
      setSelectedMemory(null);
      await firebaseService.deleteMemory(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.title || !newNote.content) return;
    
    const parsedRoi = newNote.roi ? parseFloat(newNote.roi) : undefined;
    const memory = {
      agentId: agent?.id || "general",
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(",").map(t => t.trim()).filter(t => t),
      ...(parsedRoi && !isNaN(parsedRoi) ? { roi: parsedRoi } : {})
    };

    if (editingMemoryId) {
      await firebaseService.updateMemory(editingMemoryId, memory);
    } else {
      await firebaseService.saveMemory(memory);
    }

    setNewNote({ title: "", content: "", tags: "", roi: "" });
    setIsNewNoteOpen(false);
    setEditingMemoryId(null);
    loadMemories();
  };

  const handleObsidianSync = () => {
    if (!selectedMemory) return;
    const content = `---
agent: ${agent?.name || "Global"}
tags: ${selectedMemory.tags.join(", ")}
date: ${new Date(selectedMemory.createdAt).toISOString()}
---

# ${selectedMemory.title}

${selectedMemory.content}`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedMemory.title.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={isIntegrated ? { opacity: 0, y: 10 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={isIntegrated ? { opacity: 0, y: -10 } : { opacity: 0, scale: 0.95 }}
      className={cn(
        "liquid-glass-panel overflow-hidden flex flex-col",
        isIntegrated ? "w-full h-full" : "fixed inset-4 z-50"
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-theme-glass flex flex-col md:flex-row items-start md:items-center justify-between bg-theme-glass/20 gap-4 md:gap-0 shadow-2xl">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-theme-blue rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-theme-glass">
              <Brain className="w-8 h-8 text-white relative z-10" />
              <motion.div 
                animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0.6, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/20"
              />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-theme-primary flex items-center gap-2 italic uppercase">
                Cérebro <span className="text-theme-blue">Sináptico</span>
                {isSyncing && <Activity className="w-5 h-5 text-theme-blue animate-pulse" />}
              </h2>
              <p className="text-[9px] uppercase tracking-[0.4em] text-theme-secondary font-black opacity-60">
                {agent?.name || "Global"} • Sincronizado v2.2
              </p>
            </div>
          </div>
          {!isIntegrated && (
            <button onClick={onClose} className="p-2 hover:bg-theme-glass rounded-full transition-all md:hidden shrink-0">
              <X className="w-6 h-6 text-theme-secondary hover:text-theme-primary" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <button 
            onClick={() => setIsNewNoteOpen(true)}
            className="btn-primary shrink-0"
          >
            <Plus className="w-4 h-4" /> Nova Memória
          </button>
          <div className="flex p-1 gap-2 shrink-0">
            <button 
              onClick={() => setView("graph")}
              className={cn(
                "chip",
                view === "graph" ? "chip-active" : "hover:bg-theme-glass"
              )}
            >
              <Network className="w-4 h-4" /> Grafo
            </button>
            <button 
              onClick={() => setView("vault")}
              className={cn(
                "chip",
                view === "vault" ? "chip-active" : "hover:bg-theme-glass"
              )}
            >
              <Database className="w-4 h-4" /> Vault
            </button>
            <button 
              onClick={() => setView("neural")}
              className={cn(
                "chip",
                view === "neural" ? "chip-active" : "hover:bg-theme-glass"
              )}
            >
              <Cpu className="w-4 h-4" /> Neural
            </button>
            <button 
              onClick={() => setView("skills")}
              className={cn(
                "chip",
                view === "skills" ? "chip-active" : "hover:bg-theme-glass"
              )}
            >
              <Library className="w-4 h-4" /> Skills
            </button>
            <button 
              onClick={() => setView("analytics")}
              className={cn(
                "chip",
                view === "analytics" ? "chip-active" : "hover:bg-theme-glass"
              )}
            >
              <Activity className="w-4 h-4" /> Analytics
            </button>
            <button 
              onClick={() => setAutoPilotActive(!autoPilotActive)}
              className={cn(
                "chip border transition-all",
                autoPilotActive ? "bg-theme-emerald/20 text-theme-emerald border-theme-emerald/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse" : "hover:bg-theme-glass"
              )}
            >
              <Zap className="w-4 h-4" /> {autoPilotActive ? "AutoPilot: ON" : "AutoPilot: OFF"}
            </button>
          </div>
          {!isIntegrated && (
            <button onClick={onClose} className="p-2 hover:bg-theme-glass rounded-full transition-all hidden md:block shrink-0 group">
              <X className="w-7 h-7 text-theme-secondary opacity-40 group-hover:text-theme-primary group-hover:rotate-90 transition-all" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Memories List */}
        <div className="hidden md:flex w-80 border-r border-theme-glass bg-theme-glass/10 flex-col shrink-0 shadow-2xl">
          <div className="p-6 border-b border-theme-glass bg-theme-glass/10">
            <button 
              onClick={() => setIsNewNoteOpen(true)}
              className="btn-primary w-full"
            >
              <Plus className="w-4 h-4" /> Nova Memória
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {memories.map(memory => (
              <button
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                className={cn(
                  "w-full p-5 rounded-2xl text-left transition-all border group shadow-xl relative overflow-hidden",
                  selectedMemory?.id === memory.id 
                    ? "bg-theme-blue/30 border-theme-blue/60 shadow-blue-500/20" 
                    : "bg-theme-glass border-theme-glass hover:border-theme-glass/80 hover:bg-theme-glass/20 shadow-inner"
                )}
              >
                <h3 className="text-sm font-black text-theme-primary truncate group-hover:text-theme-blue transition-all uppercase tracking-tight italic">{memory.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {memory.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-2.5 py-1 bg-theme-blue/10 rounded-full text-theme-blue font-black uppercase tracking-wider border border-theme-blue/20 shadow-[0_2px_10px_rgba(59,130,246,0.1)]">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-[9px] text-theme-secondary font-black uppercase tracking-widest opacity-40">
                    {new Date(memory.createdAt).toLocaleDateString()}
                  </p>
                  <ChevronRight className={cn("w-3 h-3 transition-all", selectedMemory?.id === memory.id ? "text-theme-blue translate-x-0" : "text-theme-secondary opacity-10 -translate-x-2 group-hover:translate-x-0 group-hover:text-theme-secondary/40")} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Viewport */}
        <div className="flex-1 relative bg-theme-glass/5">
          {view === "graph" && (
            <div className="w-full h-full">
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="label"
                nodeColor={(n: any) => highlightNodes.has(n) ? (isDarkMode ? "#ffffff" : "#000000") : n.color}
                nodeVal={(n: any) => highlightNodes.has(n) ? n.val * 1.5 : n.val}
                linkColor={(l: any) => highlightLinks.has(l) ? (isDarkMode ? "#ffffff" : "#000000") : (isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)")}
                linkWidth={(l: any) => highlightLinks.has(l) ? 2 : l.strength}
                backgroundColor="transparent"
                onNodeHover={(node: any) => updateHighlight(node, graphData.links)}
                onNodeClick={(node: any) => {
                  const mem = memories.find(m => m.id === node.id);
                  if (mem) setSelectedMemory(mem);
                }}
              />
              <div className="absolute bottom-8 right-8 p-6 bg-theme-card/80 backdrop-blur-2xl border border-theme-glass rounded-3xl flex flex-col gap-6 shadow-2xl">
                <button 
                  onClick={analyzePatterns}
                  className="btn-primary"
                >
                  Analisar Padrões Neurais
                </button>
                <div className="flex items-center gap-6 text-[9px] uppercase font-black tracking-[0.25em] text-theme-secondary">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-theme-blue shadow-[0_0_15px_rgba(59,130,246,0.8)]" /> Agente
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-theme-orange shadow-[0_0_15px_rgba(249,115,22,0.8)]" /> Insight
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-theme-emerald shadow-[0_0_15px_rgba(16,185,129,0.8)]" /> Métrica
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "vault" && (
            <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto w-full space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-theme-primary italic">Cofre de <span className="text-theme-blue">Memórias</span></h2>
                  {agent?.id === "automation-engineer" && (
                    <button
                      onClick={injectN8nExperiences}
                      disabled={isSyncing}
                      className="btn-primary"
                    >
                      <Database className="w-4 h-4" />
                      Injetar Experiências (n8n)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 bg-theme-main p-4 rounded-2xl border border-theme-glass shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                  <Search className="w-5 h-5 text-theme-secondary opacity-40" />
                  <input 
                    type="text"
                    placeholder="Filtrar por tags ou título..."
                    className="flex-1 bg-transparent text-sm text-theme-primary placeholder:text-theme-secondary/30 focus:outline-none font-bold tracking-tight"
                    value={vaultFilter}
                    onChange={e => setVaultFilter(e.target.value)}
                  />
                  <select 
                    className="bg-theme-glass px-4 py-2 rounded-xl text-[10px] text-theme-primary uppercase font-black tracking-widest focus:outline-none border border-theme-glass cursor-pointer hover:bg-theme-glass/80 transition-all shadow-lg"
                    value={vaultSort}
                    onChange={e => setVaultSort(e.target.value as "date" | "roi")}
                  >
                    <option value="date" className="bg-theme-main">Data</option>
                    <option value="roi" className="bg-theme-main">ROI</option>
                  </select>
                </div>
                
                <div className="space-y-6">
                  {memories
                    .filter(m => m.title.toLowerCase().includes(vaultFilter.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(vaultFilter.toLowerCase())))
                    .sort((a, b) => vaultSort === "date" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : (b.roi || 0) - (a.roi || 0))
                    .map(memory => (
                      <button
                        key={memory.id}
                        onClick={() => setSelectedMemory(memory)}
                        className={cn(
                          "w-full p-8 rounded-3xl text-left transition-all border group shadow-2xl relative overflow-hidden",
                          selectedMemory?.id === memory.id 
                            ? "bg-theme-blue/30 border-theme-blue/60 shadow-theme-blue/30" 
                            : "bg-theme-glass border-theme-glass hover:border-theme-glass/80 hover:bg-theme-glass/20 shadow-inner"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-black text-theme-primary group-hover:text-theme-blue transition-all uppercase tracking-tight italic">{memory.title}</h3>
                          {memory.roi && <span className="text-[10px] font-black text-theme-emerald bg-theme-emerald/20 px-3 py-1.5 rounded-xl border border-theme-emerald/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]">ROI: {memory.roi}%</span>}
                        </div>
                        <div className="flex flex-wrap gap-2.5 mt-6">
                          {memory.tags.map(tag => (
                            <span key={tag} className="text-[9px] px-3 py-1.5 bg-theme-blue/10 rounded-full text-theme-blue font-black uppercase tracking-wider border border-theme-blue/20">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                </div>
                {selectedMemory && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 p-10 bg-theme-card backdrop-blur-3xl border border-theme-glass rounded-[2.5rem] space-y-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-3xl font-black text-theme-primary italic uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{selectedMemory.title}</h3>
                        {selectedMemory.roi && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-theme-emerald bg-theme-emerald/20 px-3 py-1.5 rounded-xl border border-theme-emerald/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                              ROI: {selectedMemory.roi}%
                            </span>
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => setSelectedMemory(null)} 
                        className="p-3 hover:bg-theme-glass rounded-full text-theme-secondary opacity-40 hover:text-theme-primary transition-all border border-transparent hover:border-theme-glass"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    <div className={cn(
                      "prose max-w-none prose-lg overflow-hidden break-words prose-pre:bg-theme-glass/10 prose-pre:border prose-pre:border-theme-glass prose-pre:text-theme-primary prose-code:text-theme-blue font-medium leading-relaxed text-theme-secondary",
                      isDarkMode ? "prose-invert" : ""
                    )}>
                      <ReactMarkdown>{selectedMemory.content}</ReactMarkdown>
                    </div>
                    <div className="flex justify-between items-center pt-6 border-t border-theme-glass">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditNote(selectedMemory)}
                          className="btn-secondary"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteNote(selectedMemory.id)}
                          className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          Excluir
                        </button>
                      </div>
                      <button 
                        onClick={handleObsidianSync}
                        className="btn-secondary"
                      >
                        <FileText className="w-4 h-4" /> Exportar para Obsidian
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {view === "neural" && (
            <div className="w-full h-full flex items-center justify-center bg-theme-glass/10">
              <div className="relative w-96 h-96">
                {/* Neural Pulse Visualization */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-blue-500/20 rounded-full border-dashed"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 border border-orange-500/10 rounded-full"
                />
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <Zap className={cn("w-24 h-24 text-theme-blue mx-auto transition-all duration-300 drop-shadow-[0_0_35px_rgba(59,130,246,0.9)]", neuralPulse > 50 ? "scale-110" : "scale-100")} />
                      <motion.div 
                        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.2 - (neuralPulse / 100), repeat: Infinity }}
                        className="absolute inset-0 bg-theme-blue rounded-full blur-[60px]"
                      />
                    </div>
                    <div className="space-y-3">
                      <p className="text-[11px] uppercase tracking-[0.5em] font-black text-theme-blue drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">Carga de Processamento</p>
                      <p className="text-7xl font-black text-theme-primary font-mono tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">{neuralPulse}%</p>
                    </div>
                    <div className="w-64 h-3 bg-theme-main rounded-full overflow-hidden mx-auto border border-theme-glass shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)]">
                      <motion.div 
                        animate={{ width: `${neuralPulse}%` }}
                        className="h-full bg-gradient-to-r from-theme-blue via-blue-400 to-theme-blue shadow-[0_0_30px_#3b82f6] relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                      </motion.div>
                    </div>
                    <p className="text-[11px] text-theme-secondary font-black uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed italic">
                      {neuralPulse > 70 ? "ALERTA: Otimizando conexões neurais críticas..." : "SISTEMA OPERANDO EM CAPACIDADE NOMINAL ESTÁVEL."}
                    </p>
                  </div>
                </div>

                {/* Dynamic Neurons */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      x: [0, Math.cos(i * 18) * (140 + neuralPulse), 0], 
                      y: [0, Math.sin(i * 18) * (140 + neuralPulse), 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.5, 0.5]
                    }}
                    transition={{ 
                      duration: 3 - (neuralPulse / 100), 
                      repeat: Infinity,
                      delay: i * 0.12
                    }}
                    className="absolute top-1/2 left-1/2 w-2.5 h-2.5 bg-blue-400 rounded-full shadow-[0_0_12px_#60a5fa]"
                  />
                ))}
              </div>
            </div>
          )}

          {view === "skills" && (
            <div className="w-full h-full p-12 overflow-y-auto custom-scrollbar bg-transparent">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-theme-primary italic">Repositório de <span className="text-theme-blue">Habilidades</span></h2>
                  <p className="text-theme-blue font-black text-[10px] uppercase tracking-[0.4em]">Inteligência Coletiva do Enxame</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {ABSORBED_SKILLS.map((group, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="liquid-glass-card p-8 group relative overflow-hidden bg-theme-glass/20 border border-theme-glass"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-theme-blue/5 blur-3xl -mr-16 -mt-16 group-hover:bg-theme-blue/10 transition-all" />
                      
                      <div className="flex items-center gap-5 mb-8 relative z-10">
                        <div className="w-16 h-16 bg-theme-blue/20 rounded-2xl flex items-center justify-center group-hover:bg-theme-blue transition-all shadow-xl border border-theme-glass relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {group.icon === "Cpu" && <Cpu className="w-8 h-8 text-theme-blue group-hover:text-white relative z-10" />}
                          {group.icon === "Video" && <Video className="w-8 h-8 text-theme-blue group-hover:text-white relative z-10" />}
                          {group.icon === "Microscope" && <Microscope className="w-8 h-8 text-theme-blue group-hover:text-white relative z-10" />}
                          {group.icon === "Network" && <Network className="w-8 h-8 text-theme-blue group-hover:text-white relative z-10" />}
                        </div>
                        <h3 className="text-3xl font-black text-theme-primary italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{group.source}</h3>
                      </div>
                      <ul className="space-y-5 relative z-10">
                        {group.skills.map((skill, sIdx) => (
                          <li key={sIdx} className="flex items-center justify-between text-sm text-theme-secondary opacity-50 group-hover:text-theme-primary group-hover:opacity-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-2.5 h-2.5 bg-theme-blue rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]" />
                              <span className="font-black uppercase tracking-tight">{skill}</span>
                            </div>
                            <button 
                              onClick={() => setEnabledSkills(prev => ({ ...prev, [skill]: !prev[skill] }))}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl border active:scale-95",
                                enabledSkills[skill] !== false 
                                  ? "bg-theme-blue text-white border-white/30 shadow-[0_5px_15px_rgba(37,99,235,0.4)]" 
                                  : "bg-theme-glass text-theme-secondary opacity-40 border-theme-glass hover:bg-theme-glass/80 hover:opacity-60 shadow-inner"
                              )}
                            >
                              {enabledSkills[skill] !== false ? "Ativo" : "Inativo"}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {view === "analytics" && (
            <div className="w-full h-full p-12 overflow-y-auto custom-scrollbar bg-transparent">
              <div className="max-w-5xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl font-black uppercase tracking-tighter text-theme-primary italic">Workspace de <span className="text-theme-blue">Métricas</span></h2>
                  <p className="text-theme-blue font-black text-[10px] uppercase tracking-[0.4em]">Integração via API (Analytics, Meta, n8n)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-10 liquid-glass-card relative overflow-hidden group bg-theme-glass/20 border border-theme-glass flex flex-col justify-between"
                  >
                    <div>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-theme-emerald shadow-[0_0_25px_rgba(16,185,129,0.9)]" />
                      <h3 className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.3em] mb-6">ROI Consolidado</h3>
                      <p className="text-6xl font-black text-theme-emerald tracking-tighter italic">+24.5%</p>
                    </div>
                    <div className="mt-8 h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={roiData}>
                          <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-10 liquid-glass-card relative overflow-hidden group bg-theme-glass/20 border border-theme-glass flex flex-col justify-between"
                  >
                    <div>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-theme-blue shadow-[0_0_25px_rgba(59,130,246,0.9)]" />
                      <h3 className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.3em] mb-6">Taxa de Conversão</h3>
                      <p className="text-6xl font-black text-theme-blue tracking-tighter italic">3.8%</p>
                    </div>
                    <div className="mt-8 h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{v:2.1}, {v:2.5}, {v:3.0}, {v:3.8}]}>
                          <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-10 liquid-glass-card relative overflow-hidden group bg-theme-glass/20 border border-theme-glass flex flex-col justify-between"
                  >
                    <div>
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-theme-orange shadow-[0_0_25px_rgba(249,115,22,0.9)]" />
                      <h3 className="text-[11px] font-black text-theme-secondary uppercase tracking-[0.3em] mb-6">CPA Otimizado</h3>
                      <p className="text-6xl font-black text-theme-orange tracking-tighter italic drop-shadow-[0_0_20px_rgba(251,146,60,0.5)]">$12.40</p>
                    </div>
                    <div className="mt-8 h-24 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[{v:22}, {v:18}, {v:15}, {v:12.4}]}>
                          <Area type="monotone" dataKey="v" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          )}

          {/* New Note Modal */}
          <AnimatePresence>
            {isNewNoteOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-20 bg-theme-main/80 backdrop-blur-2xl flex items-center justify-center p-8"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="liquid-glass-panel p-10 w-full max-w-2xl space-y-8 shadow-[0_50px_150px_rgba(0,0,0,0.9)]"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-theme-primary flex items-center gap-4 italic uppercase">
                      {editingMemoryId ? <FileText className="w-8 h-8 text-theme-blue" /> : <Plus className="w-8 h-8 text-theme-blue" />}
                      {editingMemoryId ? 'Editar Memória' : 'Nova Memória'} <span className="text-theme-blue">Sináptica</span>
                    </h3>
                    <button onClick={() => {
                        setIsNewNoteOpen(false);
                        setEditingMemoryId(null);
                        setNewNote({ title: "", content: "", tags: "", roi: "" });
                      }} className="p-3 hover:bg-theme-glass rounded-full text-theme-secondary opacity-30 hover:opacity-100 transition-all">
                      <X className="w-7 h-7" />
                    </button>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-theme-secondary ml-4">Título do Insight</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Padrão de Conversão Meta Ads Q1"
                        className="w-full bg-theme-glass border border-theme-glass rounded-2xl p-5 text-theme-primary focus:outline-none focus:border-theme-blue/50 transition-all font-bold shadow-inner text-lg"
                        value={newNote.title}
                        onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-theme-secondary ml-4">Conteúdo Estratégico</label>
                      <textarea 
                        placeholder="Descreva o insight técnico aqui (Markdown suportado)..."
                        className="w-full bg-theme-glass border border-theme-glass rounded-2xl p-6 text-theme-primary h-64 focus:outline-none focus:border-theme-blue/50 transition-all resize-none font-medium text-base shadow-inner leading-relaxed"
                        value={newNote.content}
                        onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-theme-secondary opacity-40 ml-4">Tags de Indexação</label>
                        <input 
                          type="text" 
                          placeholder="roi, meta, conversion, strategy"
                          className="w-full bg-theme-glass border border-theme-glass rounded-2xl p-5 text-theme-primary text-sm focus:outline-none focus:border-theme-blue/50 transition-all font-mono shadow-inner"
                          value={newNote.tags}
                          onChange={e => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase tracking-[0.3em] text-theme-secondary opacity-40 ml-4">ROI Estimado (%)</label>
                        <input 
                          type="number" 
                          placeholder="Ex: 24.5"
                          step="0.1"
                          className="w-full bg-theme-glass border border-theme-glass rounded-2xl p-5 text-theme-primary text-sm focus:outline-none focus:border-theme-blue/50 transition-all font-mono shadow-inner"
                          value={newNote.roi}
                          onChange={e => setNewNote(prev => ({ ...prev, roi: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-6 pt-6">
                    <button 
                      onClick={() => setIsNewNoteOpen(false)}
                      className="px-8 py-4 text-theme-secondary opacity-40 hover:opacity-100 text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveNote}
                      className="px-10 py-4 bg-theme-blue hover:opacity-90 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_15px_35px_rgba(37,99,235,0.4)] transition-all active:scale-95 border border-white/20"
                    >
                      <Save className="w-5 h-5" /> Gravar no Cérebro
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
