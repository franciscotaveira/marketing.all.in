import { useState, useEffect, useRef } from "react";
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
import { BrainNode, BrainLink, BrainMemory, MarketingSkill } from "../types";
import { firebaseService } from "../lib/firebaseService";
import { cn } from "../lib/utils";
import { ABSORBED_SKILLS } from "../constants";

interface AgentBrainProps {
  agent: MarketingSkill | null;
  onClose: () => void;
}

export function AgentBrain({ agent, onClose }: AgentBrainProps) {
  const [view, setView] = useState<"graph" | "vault" | "neural" | "skills" | "analytics">("graph");
  const [memories, setMemories] = useState<BrainMemory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<BrainMemory | null>(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });
  const [graphData, setGraphData] = useState<{ nodes: BrainNode[], links: BrainLink[] }>({ nodes: [], links: [] });
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [neuralPulse, setNeuralPulse] = useState(0);

  // New states
  const [vaultFilter, setVaultFilter] = useState("");
  const [vaultSort, setVaultSort] = useState<"date" | "roi">("date");
  const [enabledSkills, setEnabledSkills] = useState<Record<string, boolean>>({});

  const graphRef = useRef<any>(null);

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

  const handleSaveNote = async () => {
    if (!newNote.title || !newNote.content) return;
    
    const memory: Omit<BrainMemory, 'id' | 'createdAt'> = {
      agentId: agent?.id || "general",
      title: newNote.title,
      content: newNote.content,
      tags: newNote.tags.split(",").map(t => t.trim()).filter(t => t),
    };

    await firebaseService.saveMemory(memory);
    setNewNote({ title: "", content: "", tags: "" });
    setIsNewNoteOpen(false);
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-4 z-50 bg-[#141414] border border-[#E4E3E0]/20 rounded-xl shadow-2xl overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#E4E3E0]/10 flex flex-col md:flex-row items-start md:items-center justify-between bg-black/40 gap-4 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0">
              <Brain className="w-6 h-6 text-white relative z-10" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Cérebro Sináptico: {agent?.name || "Global"}
                {isSyncing && <Activity className="w-4 h-4 text-blue-400 animate-pulse" />}
              </h2>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 font-mono">
                Sincronizado com Obsidian & Firebase v2.1
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all md:hidden shrink-0">
            <X className="w-5 h-5 text-white/50 hover:text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar pb-2 md:pb-0">
          <button 
            onClick={() => setIsNewNoteOpen(true)}
            className="md:hidden px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[10px] font-bold uppercase flex items-center gap-2 shrink-0"
          >
            <Plus className="w-3 h-3" /> Nova Memória
          </button>
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 min-w-max">
            <button 
              onClick={() => setView("graph")}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all flex items-center gap-2",
                view === "graph" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
              )}
            >
              <Network className="w-3 h-3" /> Grafo
            </button>
            <button 
              onClick={() => setView("vault")}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all flex items-center gap-2",
                view === "vault" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
              )}
            >
              <Database className="w-3 h-3" /> Vault
            </button>
            <button 
              onClick={() => setView("neural")}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all flex items-center gap-2",
                view === "neural" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
              )}
            >
              <Cpu className="w-3 h-3" /> Neural
            </button>
            <button 
              onClick={() => setView("skills")}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all flex items-center gap-2",
                view === "skills" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
              )}
            >
              <Library className="w-3 h-3" /> Skills
            </button>
            <button 
              onClick={() => setView("analytics")}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] uppercase font-bold transition-all flex items-center gap-2",
                view === "analytics" ? "bg-blue-600 text-white" : "text-white/50 hover:text-white"
              )}
            >
              <Activity className="w-3 h-3" /> Analytics
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all hidden md:block shrink-0">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Memories List */}
        <div className="hidden md:flex w-80 border-r border-[#E4E3E0]/10 bg-black/20 flex-col shrink-0">
          <div className="p-4 border-b border-[#E4E3E0]/10">
            <button 
              onClick={() => setIsNewNoteOpen(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Nova Memória
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {memories.map(memory => (
              <button
                key={memory.id}
                onClick={() => setSelectedMemory(memory)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-all border group",
                  selectedMemory?.id === memory.id 
                    ? "bg-blue-600/20 border-blue-600/50" 
                    : "bg-white/5 border-transparent hover:border-white/10"
                )}
              >
                <h3 className="text-sm font-bold text-white truncate">{memory.title}</h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {memory.tags.map(tag => (
                    <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-white/10 rounded text-blue-300 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-white/40 mt-2 font-mono">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Viewport */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          {view === "graph" && (
            <div className="w-full h-full">
              <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeLabel="label"
                nodeColor={(n: any) => highlightNodes.has(n) ? "#ffffff" : n.color}
                nodeVal={(n: any) => highlightNodes.has(n) ? n.val * 1.5 : n.val}
                linkColor={(l: any) => highlightLinks.has(l) ? "#ffffff" : "rgba(255,255,255,0.1)"}
                linkWidth={(l: any) => highlightLinks.has(l) ? 2 : l.strength}
                backgroundColor="#0a0a0a"
                onNodeHover={(node: any) => updateHighlight(node, graphData.links)}
                onNodeClick={(node: any) => {
                  const mem = memories.find(m => m.id === node.id);
                  if (mem) setSelectedMemory(mem);
                }}
              />
              <div className="absolute bottom-4 right-4 p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex gap-2">
                <button 
                  onClick={analyzePatterns}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold uppercase"
                >
                  Analisar Padrões
                </button>
                <div className="flex items-center gap-4 text-[10px] uppercase font-mono tracking-widest text-white/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" /> Agente
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500" /> Insight
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Métrica
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "vault" && (
            <div className="w-full h-full flex flex-col p-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto w-full space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Cofre de Memórias</h2>
                  {agent?.id === "automation-engineer" && (
                    <button
                      onClick={injectN8nExperiences}
                      disabled={isSyncing}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Database className="w-4 h-4" />
                      Injetar Experiências (n8n)
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4 bg-black/40 p-2 rounded-lg border border-white/10">
                  <input 
                    type="text"
                    placeholder="Filtrar por tags ou título..."
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
                    value={vaultFilter}
                    onChange={e => setVaultFilter(e.target.value)}
                  />
                  <select 
                    className="bg-transparent text-[10px] text-white/50 uppercase font-bold focus:outline-none"
                    value={vaultSort}
                    onChange={e => setVaultSort(e.target.value as "date" | "roi")}
                  >
                    <option value="date">Data</option>
                    <option value="roi">ROI</option>
                  </select>
                </div>
                
                <div className="space-y-4">
                  {memories
                    .filter(m => m.title.toLowerCase().includes(vaultFilter.toLowerCase()) || m.tags.some(t => t.toLowerCase().includes(vaultFilter.toLowerCase())))
                    .sort((a, b) => vaultSort === "date" ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : (b.roi || 0) - (a.roi || 0))
                    .map(memory => (
                      <button
                        key={memory.id}
                        onClick={() => setSelectedMemory(memory)}
                        className={cn(
                          "w-full p-4 rounded-xl text-left transition-all border group",
                          selectedMemory?.id === memory.id 
                            ? "bg-blue-600/20 border-blue-600/50" 
                            : "bg-white/5 border-transparent hover:border-white/10"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-white">{memory.title}</h3>
                          {memory.roi && <span className="text-xs font-mono text-emerald-400">ROI: {memory.roi}%</span>}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.tags.map(tag => (
                            <span key={tag} className="text-[8px] px-1.5 py-0.5 bg-white/10 rounded text-blue-300 font-mono">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                </div>
                {selectedMemory && (
                  <div className="mt-8 p-6 bg-black/40 border border-white/10 rounded-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-white">{selectedMemory.title}</h3>
                      <button onClick={() => setSelectedMemory(null)} className="text-white/50 hover:text-white">Fechar</button>
                    </div>
                    <div className="prose prose-invert max-w-none prose-sm overflow-hidden break-words prose-pre:bg-white/10 prose-pre:text-white prose-code:text-blue-300">
                      <ReactMarkdown>{selectedMemory.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {view === "neural" && (
            <div className="w-full h-full flex items-center justify-center bg-black">
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
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Zap className={cn("w-16 h-16 text-blue-500 mx-auto transition-all duration-300", neuralPulse > 50 ? "scale-110" : "scale-100")} />
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1 - (neuralPulse / 100), repeat: Infinity }}
                        className="absolute inset-0 bg-blue-500 rounded-full blur-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] font-mono text-blue-400">Carga de Processamento</p>
                      <p className="text-4xl font-bold text-white font-mono">{neuralPulse}%</p>
                    </div>
                    <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
                      <motion.div 
                        animate={{ width: `${neuralPulse}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                      />
                    </div>
                    <p className="text-[9px] text-white/40 font-mono max-w-[200px] mx-auto">
                      {neuralPulse > 70 ? "Alta atividade: Otimizando conexões..." : "Sistema operando em capacidade nominal."}
                    </p>
                  </div>
                </div>

                {/* Dynamic Neurons */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      x: [0, Math.cos(i * 30) * (100 + neuralPulse), 0], 
                      y: [0, Math.sin(i * 30) * (100 + neuralPulse), 0],
                      opacity: [0, 1, 0],
                      scale: [0.5, 1.5, 0.5]
                    }}
                    transition={{ 
                      duration: 2 - (neuralPulse / 100), 
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          )}

          {view === "skills" && (
            <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Repositório de Habilidades Absorvidas</h2>
                  <p className="text-blue-400 font-mono text-xs uppercase tracking-[0.3em]">Inteligência Coletiva do Enxame</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ABSORBED_SKILLS.map((group, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-blue-500/50 transition-all group"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          {group.icon === "Cpu" && <Cpu className="w-6 h-6 text-blue-400 group-hover:text-white" />}
                          {group.icon === "Video" && <Video className="w-6 h-6 text-blue-400 group-hover:text-white" />}
                          {group.icon === "Microscope" && <Microscope className="w-6 h-6 text-blue-400 group-hover:text-white" />}
                          {group.icon === "Network" && <Network className="w-6 h-6 text-blue-400 group-hover:text-white" />}
                        </div>
                        <h3 className="text-xl font-bold text-white">{group.source}</h3>
                      </div>
                      <ul className="space-y-3">
                        {group.skills.map((skill, sIdx) => (
                          <li key={sIdx} className="flex items-center justify-between text-sm text-white/60 group-hover:text-white/80 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                              {skill}
                            </div>
                            <button 
                              onClick={() => setEnabledSkills(prev => ({ ...prev, [skill]: !prev[skill] }))}
                              className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", enabledSkills[skill] !== false ? "bg-blue-600 text-white" : "bg-white/10 text-white/40")}
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
            <div className="w-full h-full p-8 overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Previsão de Performance</h2>
                  <p className="text-blue-400 font-mono text-xs uppercase tracking-[0.3em]">Análise Preditiva de ROI</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-2">ROI Projetado</h3>
                    <p className="text-4xl font-black text-emerald-400">+24.5%</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-2">Conversão Estimada</h3>
                    <p className="text-4xl font-black text-blue-400">3.8%</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                    <h3 className="text-sm font-bold text-white mb-2">Custo por Aquisição</h3>
                    <p className="text-4xl font-black text-orange-400">$12.40</p>
                  </div>
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
                className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
              >
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 w-full max-w-2xl space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-blue-500" /> Nova Memória Sináptica
                    </h3>
                    <button onClick={() => setIsNewNoteOpen(false)} className="text-white/40 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Título da Insight (ex: Padrão de Conversão Meta Ads)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-all font-bold"
                      value={newNote.title}
                      onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea 
                      placeholder="Conteúdo (Markdown suportado)..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-64 focus:outline-none focus:border-blue-500 transition-all resize-none font-mono text-sm"
                      value={newNote.content}
                      onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    />
                    <input 
                      type="text" 
                      placeholder="Tags (separadas por vírgula: roi, meta, conversion)"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
                      value={newNote.tags}
                      onChange={e => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setIsNewNoteOpen(false)}
                      className="px-6 py-2 text-white/60 hover:text-white text-xs font-bold uppercase"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveNote}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> Gravar no Cérebro
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
