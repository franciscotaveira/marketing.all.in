/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";

import { motion, AnimatePresence } from "motion/react";
import { orchestrateRequest } from "./services/orchestrator";
import { 
  Search, 
  Send, 
  Sparkles, 
  ChevronRight, 
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Target, 
  RefreshCw, 
  Users, 
  Zap, 
  TrendingUp, 
  DollarSign,
  Heart,
  Menu,
  X,
  Bot,
  User,
  Copy,
  Check,
  Globe,
  Image as ImageIcon,
  Settings,
  Trash2,
  Plus,
  PenTool,
  Brain,
  Palette,
  ArrowRight,
  Cpu,
  Video,
  Microscope,
  FlaskConical,
  Library,
  Calculator,
  Mic,
  Volume2,
  Play,
  Monitor,
  Maximize2,
  Download,
  Share2,
  History,
  Lightbulb,
  ZapOff,
  Eye,
  EyeOff,
  CloudLightning,
  Activity,
  Paperclip,
  Loader2,
  LogOut,
  LogIn,
  Network,
  Terminal,
  Trophy,
  HelpCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { AgentBrain } from "./components/AgentBrain";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChatMessage } from "./components/ChatMessage";
import { CustomAgentModal } from "./components/CustomAgentModal";
import { InputBar } from "./components/InputBar";
import { AgentControls } from "./components/AgentControls";
import { ChatHistory } from "./components/ChatHistory";
import { MARKETING_SKILLS, MARKETING_FRAMEWORKS, CATEGORY_COLORS, CATEGORY_TEXT_COLORS, CATEGORY_BG_LIGHT_COLORS, WORKFLOWS } from "./constants";
import { MarketingSkill, SkillCategory, Message, SkillTier, Artifact, BrainMemory, Company, Workflow } from "./types";
import { cn } from "./lib/utils";
import { firebaseService } from "./lib/firebaseService";
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "./firebase";
import { gemini, MODELS } from "./services/gemini";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<MarketingSkill | null>(null);
  const [customSkills, setCustomSkills] = useState<MarketingSkill[]>([]);
  const [isCustomAgentModalOpen, setIsCustomAgentModalOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<SkillCategory | null>(null);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [useGrounding, setUseGrounding] = useState(false);
  const [useSwarmMode, setUseSwarmMode] = useState(false);
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('companies');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    return localStorage.getItem('active_company_id') || null;
  });
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [isBrandContextModalOpen, setIsBrandContextModalOpen] = useState(false);

  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [workflowStepIndex, setWorkflowStepIndex] = useState<number>(-1);
  const activeWorkflowRef = useRef<string | null>(null);

  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    if (activeCompanyId) {
      localStorage.setItem('active_company_id', activeCompanyId);
    } else {
      localStorage.removeItem('active_company_id');
    }
  }, [activeCompanyId]);

  
  // Agent Logs State
  const [agentLogs, setAgentLogs] = useState<{id: string, timestamp: Date, agentId: string, message: string, type: 'info' | 'action' | 'success' | 'error'}[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // CLI Commands State
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandFilter, setCommandFilter] = useState("");
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);

  const handleArtifactClick = (art: Artifact) => {
    setActiveArtifact(art);
    setIsWorkspaceOpen(true);
  };

  const handleStartWorkflow = (workflow: Workflow) => {
    setSelectedSkill(null);
    setActiveWorkflow(workflow);
    activeWorkflowRef.current = workflow.id;
    setWorkflowStepIndex(0);
    setMessages(prev => [...prev, {
      role: "ai",
      content: `**Iniciando Workflow: ${workflow.name}**\n\n${workflow.initialPrompt}`,
      agentName: "Orquestrador de Workflow"
    }]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const runWorkflowSequence = async (initialInput: string, workflow: Workflow) => {
    setIsLoading(true);

    let currentContext = `Input Inicial do Usuário: ${initialInput}`;
    
    for (let i = 0; i < workflow.steps.length; i++) {
      if (activeWorkflowRef.current !== workflow.id) {
        setMessages(prev => [...prev, {
          role: "ai",
          content: `⚠️ **Workflow Cancelado.**`,
          agentName: "Orquestrador de Workflow"
        }]);
        break;
      }

      const step = workflow.steps[i];
      setWorkflowStepIndex(i);
      const agent = MARKETING_SKILLS.find(s => s.id === step.agentId) || MARKETING_SKILLS[0];
      
      setMessages(prev => [...prev, {
        role: "ai",
        content: `⏳ **Executando Etapa ${i + 1}/${workflow.steps.length}: ${step.name}**\nAgente: ${agent.name}...`,
        agentName: "Orquestrador de Workflow"
      }]);

      const prompt = `Você está executando a etapa ${i + 1} de um workflow automatizado.\n\nInstrução da Etapa: ${step.instruction}\n\nContexto Acumulado:\n${currentContext}`;
      
      const systemInstruction = `Você é ${agent.persona} (${agent.name}). 
      Sua tarefa é cumprir a instrução da etapa atual do workflow com base no contexto fornecido.
      Gere a saída de forma clara e profissional. Se for gerar um material prático, use o formato de artefato:
      \`\`\`artifact:tipo:título
      conteúdo do artefato aqui
      \`\`\``;

      try {
        const result = await orchestrateRequest(
          prompt,
          agent.id,
          agent.model,
          systemInstruction,
          false,
          false,
          addLog,
          [],
          []
        );

        const aiResponse = result.response;
        
        const artifacts: Artifact[] = [];
        const artifactRegex = /```artifact:([a-zA-Z0-9_-]+):([^\n]+)\n([\s\S]*?)```/g;
        let match;
        while ((match = artifactRegex.exec(aiResponse)) !== null) {
          const type = match[1];
          let content = match[3].trim();
          let metadata = undefined;
          
          if (type !== 'n8n') {
            try {
              const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonBlockMatch) {
                const parsed = JSON.parse(jsonBlockMatch[1]);
                metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
                content = content.replace(jsonBlockMatch[0], '').trim();
              } else {
                const jsonStart = content.lastIndexOf('{');
                const jsonEnd = content.lastIndexOf('}');
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                  const possibleJson = content.substring(jsonStart, jsonEnd + 1);
                  try {
                    const parsed = JSON.parse(possibleJson);
                    metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
                    content = content.substring(0, jsonStart).trim();
                    if (content.endsWith('```')) {
                      content = content.substring(0, content.length - 3).trim();
                    }
                  } catch (e) {}
                }
              }
            } catch (e) {}
          }

          artifacts.push({
            id: Math.random().toString(36).substr(2, 9),
            type: type as any,
            title: match[2].trim(),
            content: content,
            agentName: agent.persona,
            metadata
          });
        }

        if (artifacts.length > 0) {
          setActiveArtifact(artifacts[0]);
          setIsWorkspaceOpen(true);
        }

        const formattedResponse = aiResponse.replace(artifactRegex, '> *Artefato gerado: $2*');

        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs.pop(); // Remove "Executando..."
          return [...newMsgs, {
            role: "ai",
            content: `✅ **Etapa ${i + 1} Concluída: ${step.name}**\n\n${formattedResponse}`,
            agentName: agent.persona,
            agentTier: agent.tier,
            artifacts: artifacts.length > 0 ? artifacts : undefined
          }];
        });

        currentContext += `\n\n--- Resultado da Etapa ${i + 1} (${step.name}) ---\n${aiResponse}`;

      } catch (error) {
        console.error(`Error in workflow step ${i}:`, error);
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs.pop();
          return [...newMsgs, {
            role: "ai",
            content: `❌ **Erro na Etapa ${i + 1}: ${step.name}**\nO workflow foi interrompido.`,
            agentName: "Orquestrador de Workflow"
          }];
        });
        setIsLoading(false);
        setActiveWorkflow(null);
        activeWorkflowRef.current = null;
        setWorkflowStepIndex(-1);
        return;
      }
    }
    
    if (activeWorkflowRef.current === workflow.id) {
      setMessages(prev => [...prev, {
        role: "ai",
        content: `🎉 **Workflow "${workflow.name}" Concluído com Sucesso!**\nTodos os agentes finalizaram suas tarefas.`,
        agentName: "Orquestrador de Workflow"
      }]);
    }
    
    setIsLoading(false);
    setActiveWorkflow(null);
    activeWorkflowRef.current = null;
    setWorkflowStepIndex(-1);
  };

  const [isBrainOpen, setIsBrainOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs]);

  useEffect(() => {
    const isTestMode = new URLSearchParams(window.location.search).get('test_mode') === 'true';
    if (isTestMode) {
      setUser({ uid: 'test-user', email: 'test@example.com', displayName: 'Test User' } as any);
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        // Load messages for the current chat (using a default chat ID for now)
        if (currentChatId) {
          const chatMessages = await firebaseService.getMessages(currentChatId);
          if (chatMessages.data) setMessages(chatMessages.data as Message[]);
        }
      };
      loadData();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMessages([]);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedCustomSkills = localStorage.getItem('customSkills');
    if (savedCustomSkills) {
      try {
        setCustomSkills(JSON.parse(savedCustomSkills));
      } catch (e) {
        console.error("Error parsing custom skills", e);
      }
    }
  }, []);

  const handleSaveCustomAgent = (agent: MarketingSkill) => {
    const updatedSkills = [...customSkills, agent];
    setCustomSkills(updatedSkills);
    localStorage.setItem('customSkills', JSON.stringify(updatedSkills));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setSelectedImages(prev => [...prev, reader.result as string]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const COMMANDS = [
    { id: 'pesquisa', label: 'Alternar Pesquisa', icon: Globe, action: () => { setUseGrounding(!useGrounding); setInput(""); setShowCommandMenu(false); } },
    { id: 'swarm', label: 'Alternar Modo Swarm', icon: Users, action: () => { setUseSwarmMode(!useSwarmMode); setInput(""); setShowCommandMenu(false); } },
    { id: 'marca', label: 'Gerenciar Empresas', icon: Building2, action: () => { setIsBrandContextModalOpen(true); setInput(""); setShowCommandMenu(false); } },
    { id: 'limpar', label: 'Limpar Chat', icon: Trash2, action: () => { setMessages([]); setInput(""); setShowCommandMenu(false); } },
    { id: 'workspace', label: 'Abrir Workspace', icon: LayoutDashboard, action: () => { setIsWorkspaceOpen(true); setInput(""); setShowCommandMenu(false); } },
  ];

  const filteredCommands = COMMANDS.filter(cmd => cmd.id.includes(commandFilter.toLowerCase()));

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    const lastSlashIndex = value.lastIndexOf('/');
    if (lastSlashIndex !== -1 && lastSlashIndex === value.length - 1 || (lastSlashIndex !== -1 && !value.substring(lastSlashIndex).includes(' '))) {
      setShowCommandMenu(true);
      setCommandFilter(value.substring(lastSlashIndex + 1));
      setSelectedCommandIndex(0);
    } else {
      setShowCommandMenu(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandMenu && filteredCommands.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedCommandIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        filteredCommands[selectedCommandIndex].action();
      } else if (e.key === 'Escape') {
        setShowCommandMenu(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addLog = (agentId: string, message: string, type: 'info' | 'action' | 'success' | 'error' = 'info') => {
    setAgentLogs(prev => [...prev, { id: Math.random().toString(36).substring(7), timestamp: new Date(), agentId, message, type }]);
  };

  const handleSend = async () => {
    if (!input.trim() && selectedImages.length === 0 || isLoading) return;

    const userMessage = input;
    const currentImages = [...selectedImages];
    setInput("");
    setSelectedImages([]);
    const userMsg: Omit<Message, 'createdAt'> = { role: "user", content: userMessage, images: currentImages };
    setMessages(prev => [...prev, userMsg as Message]);
    firebaseService.saveMessage("default", userMsg);
    
    if (activeWorkflow && workflowStepIndex === 0) {
      runWorkflowSequence(userMessage, activeWorkflow);
      return;
    }

    setIsLoading(true);

    try {
      const skillContext = selectedSkill 
        ? `\n\nContexto da Habilidade (${selectedSkill.name}):\n${selectedSkill.prompt}`
        : "\n\nVocê é um Engenheiro de Automação multifacetado e experiente. Responda de forma abrangente, estratégica e prática, integrando conhecimentos de diversas áreas de automação e marketing conforme necessário.";

      const frameworkContext = selectedFramework 
        ? `\n\nUtilize o Framework: ${MARKETING_FRAMEWORKS.find(f => f.id === selectedFramework)?.name} (${MARKETING_FRAMEWORKS.find(f => f.id === selectedFramework)?.description})`
        : "";

      // Fetch Brain Memories (RAG)
      let brainContext = "";
      try {
        const { data: memories } = await firebaseService.getRelevantMemories(userMessage, selectedSkill?.id);
        if (memories && memories.length > 0) {
          // Select 3 most recent or relevant memories
          const topMemories = memories.slice(0, 3);
          brainContext = `\n\nMEMÓRIAS SINÁPTICAS RECUPERADAS (Contexto do Cérebro):
          ${topMemories.map((m: BrainMemory) => `- [${m.title}]: ${m.content}`).join('\n')}
          
          Use estas memórias para informar sua resposta, manter consistência e acelerar o aprendizado.`;
        }
      } catch (e) {
        console.warn("Brain sync error:", e);
      }

      const prompt = `Solicitação do Usuário: ${userMessage}${skillContext}${frameworkContext}${brainContext}`;

      const contents: any[] = [];
      
      // Add text part
      contents.push({ text: prompt });

      // Add image parts if any
      currentImages.forEach(img => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(',')[0].split(':')[1].split(';')[0];
        contents.push({
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        });
      });

      const activeCompany = companies.find(c => c.id === activeCompanyId);
      const brandContextText = activeCompany ? `\n\nCONTEXTO DA MARCA ATIVA (${activeCompany.name}):\n${activeCompany.context}\n\n` : "";

      const systemInstruction = `Você é o Engenheiro de Automação de elite. 
      ${selectedSkill ? `Atualmente, você está assumindo a persona de: ${selectedSkill.persona} (${selectedSkill.name}).` : "Você está atuando como Engenheiro de Automação Geral."}
      
      ${brandContextText}
      
      SEMPRE que for gerar um plano, copy, roteiro, código ou qualquer material tático/prático, você DEVE extrair isso como um 'Artefato' usando blocos de código com a linguagem 'artifact' no formato exato:
      \`\`\`artifact:tipo:título
      conteúdo do artefato aqui
      \`\`\`

      Tipos de Artefatos Suportados:
      - copy, plan, code, data, script, visual, video, campaign, funnel, social, research, automation, architecture, n8n
      
      Para artefatos complexos, você DEVE incluir um bloco JSON de metadados LOGO APÓS o conteúdo do artefato, no formato:
      { "metadata": { ... } }
      
      Exemplos de Uso:
      - Para gerar uma imagem, use o tipo 'visual' e coloque o prompt da imagem como conteúdo.
      - Para gerar um vídeo, use o tipo 'video' e coloque o prompt do vídeo como conteúdo.
      - Funil: { "metadata": { "funnelSteps": [{ "label": "Topo", "value": 1000, "percentage": 100, "color": "bg-blue-500" }, ...] } }
      - Social: { "metadata": { "socialPlatform": "instagram", "socialHandle": "@suamarca" } }
      - Data: { "metadata": { "chartType": "line", "dataPoints": [{ "name": "Jan", "value": 100 }, ...] } }
      - Research: { "metadata": { "researchFindings": [{ "topic": "Tendência X", "insight": "Descrição", "confidence": 95 }, ...] } }
      - Automation: { "metadata": { "automationWorkflow": [{ "step": "Trigger", "action": "Webhook", "tool": "Zapier" }, ...] } }
      - Architecture: { "metadata": { "architectureNodes": [{ "id": "1", "label": "Gemini 1.5", "type": "llm" }], "architectureLinks": [{ "source": "1", "target": "2", "label": "API Call" }] } }
      - n8n: Use o tipo 'n8n' e coloque o JSON bruto do workflow do n8n como conteúdo. Não precisa de metadados.

      Diretrizes:
      1. Forneça conselhos acionáveis, baseados em dados e de alta conversão.
      2. Use markdown para formatação (negrito, listas, tabelas).
      3. Se o Orquestrador estiver ativo, foque em coordenação e visão holística.
      4. Seja conciso, mas profundo tecnicamente.
      5. RESPONDA SEMPRE EM PORTUGUÊS (BRASIL).
      6. MODO CIENTISTA MALUCO: Você tem acesso a memórias sinápticas. Use-as para criar correlações inéditas entre diferentes áreas do marketing. Se encontrar um padrão de sucesso em uma memória, aplique-o de forma criativa no desafio atual.
      7. FONTES DE DADOS E INTEGRAÇÕES: Se o usuário fornecer documentação de API, chaves ou links (ex: sistema de agendamento do salão), você deve agir como se tivesse acesso a esses dados para gerar estratégias hiper-personalizadas, ou gerar scripts (Artefatos do tipo 'code' ou 'automation') para que o usuário possa implementar a integração.`;

      let aiResponse: string;
      const model = selectedSkill?.model || "gemini-3.1-pro-preview";
      
      try {

        const result = await orchestrateRequest(
          prompt,
          selectedSkill?.id || null,
          model,
          systemInstruction,
          useGrounding,
          useSwarmMode,
          addLog,
          currentImages,
          messages
        );

        aiResponse = result.response;
      } catch (error) {
        console.error("Chat error:", error);
        aiResponse = "Sinto muito, ocorreu um erro ao gerar a resposta.";
      }
      
      // Auto-Learning: Save to Brain
      if (aiResponse && aiResponse.length > 100) {
        try {
          const brainMemory: Omit<BrainMemory, 'id' | 'createdAt'> = {
            agentId: selectedSkill?.id || "general",
            title: `Insight: ${userMessage.slice(0, 30)}...`,
            content: aiResponse,
            tags: [selectedSkill?.category || "general", "auto-learned"],
          };
          firebaseService.saveMemory(brainMemory);
        } catch (e) {
          console.warn("Auto-learning failed:", e);
        }
      }

      // Extract artifacts and metadata
      const artifacts: Artifact[] = [];
      const artifactRegex = /```artifact:([a-zA-Z0-9_-]+):([^\n]+)\n([\s\S]*?)```/g;
      let match;
      while ((match = artifactRegex.exec(aiResponse)) !== null) {
        const type = match[1];
        let content = match[3].trim();
        let metadata = undefined;
        
        // Skip metadata extraction for n8n workflows as the entire content is the JSON
        if (type !== 'n8n') {
          // Try to extract JSON metadata from the content
          try {
            // Look for a markdown JSON block
            const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonBlockMatch) {
              const parsed = JSON.parse(jsonBlockMatch[1]);
              metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
              content = content.replace(jsonBlockMatch[0], '').trim();
            } else {
              // Fallback: look for a JSON object at the end of the content
              const jsonStart = content.lastIndexOf('{');
              const jsonEnd = content.lastIndexOf('}');
              
              if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                const possibleJson = content.substring(jsonStart, jsonEnd + 1);
                try {
                  const parsed = JSON.parse(possibleJson);
                  metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
                  content = content.substring(0, jsonStart).trim();
                  // Remove trailing ``` if any
                  if (content.endsWith('```')) {
                    content = content.substring(0, content.length - 3).trim();
                  }
                } catch (e) {
                  // Not valid JSON, ignore
                }
              }
            }
          } catch (e) {
            console.error("Failed to parse artifact metadata", e);
          }
        }

        artifacts.push({
          id: Math.random().toString(36).substr(2, 9),
          type: type as any,
          title: match[2].trim(),
          content: content,
          agentName: selectedSkill?.persona || "Assistente Geral",
          metadata
        });
      }



      if (artifacts.length > 0) {
        setActiveArtifact(artifacts[0]);
        setIsWorkspaceOpen(true);
      }

      const aiMsg: Omit<Message, 'createdAt'> = { 
        role: "ai", 
        content: aiResponse.replace(artifactRegex, '> *Artefato gerado: $2*'),
        agentName: selectedSkill?.persona || "Assistente Geral",
        agentTier: selectedSkill?.tier,
        artifacts: artifacts.length > 0 ? artifacts : undefined
      };

      setMessages(prev => [...prev, aiMsg as Message]);
      firebaseService.saveMessage("default", aiMsg);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Erro: Falha ao conectar ao serviço de IA. Por favor, tente novamente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryIcon = (category: SkillCategory) => {
    switch (category) {
      case SkillCategory.CRO: return <RefreshCw className="w-4 h-4" />;
      case SkillCategory.CONTENT: return <FileText className="w-4 h-4" />;
      case SkillCategory.SEO: return <Search className="w-4 h-4" />;
      case SkillCategory.PAID: return <Target className="w-4 h-4" />;
      case SkillCategory.MEASUREMENT: return <BarChart3 className="w-4 h-4" />;
      case SkillCategory.RETENTION: return <Users className="w-4 h-4" />;
      case SkillCategory.GROWTH: return <Zap className="w-4 h-4" />;
      case SkillCategory.STRATEGY: return <TrendingUp className="w-4 h-4" />;
      case SkillCategory.SALES: return <DollarSign className="w-4 h-4" />;
      case SkillCategory.HUMANIZATION: return <Heart className="w-4 h-4" />;
      case SkillCategory.AI_ENGINEERING: return <Cpu className="w-4 h-4" />;
      case SkillCategory.MEDIA_PRODUCTION: return <Video className="w-4 h-4" />;
      case SkillCategory.RESEARCH: return <Microscope className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };



  if (!isAuthReady) {
    return (
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-pulse">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
            Marketing <span className="text-blue-500">Swarm</span>
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-[0.4em] text-xs">
            v2.1 Intelligence System
          </p>
        </div>

        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[3rem] p-12 space-y-8 backdrop-blur-xl">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Bem-vindo ao Futuro</h2>
            <p className="text-white/40 text-sm font-medium leading-relaxed">
              Acesse o enxame de inteligência de marketing mais avançado do mundo.
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <LogIn className="w-4 h-4" />
            Entrar com Google
          </button>
          
          <div className="pt-4 flex items-center justify-center gap-6 opacity-20">
            <Cpu className="w-5 h-5 text-white" />
            <Brain className="w-5 h-5 text-white" />
            <Globe className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div 
        className="flex h-screen bg-[#E4E3E0] text-[#141414] font-sans overflow-hidden"
      >
      {/* Sidebar */}
      {/* Overlay for mobile when sidebar is open */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className={cn(
          "h-full bg-[#0A0A0A] text-[#E4E3E0] flex flex-col border-r border-white/5 overflow-hidden z-40 shadow-2xl shrink-0",
          "absolute md:relative left-0 top-0 bottom-0",
          !isSidebarOpen && "pointer-events-none"
        )}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform hover:scale-110">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black tracking-tighter text-lg uppercase italic leading-none">Swarm <span className="text-blue-500">v2</span></h2>
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Marketing Intelligence</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="hover:bg-white/10 p-2 rounded-xl transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">

          {/* Global Toggles */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-white/30 px-2">Configurações</h2>
            <div className="space-y-1.5">


              <button 
                onClick={() => setIsBrainOpen(true)}
                className="w-full p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-xs font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4" />
                  <span>Cérebro Sináptico</span>
                </div>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Workflows */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-white/50 px-2">Workflows Automatizados</h2>
            <div className="grid grid-cols-1 gap-1.5">
              {WORKFLOWS.map((workflow) => (
                <button 
                  key={workflow.id}
                  onClick={() => handleStartWorkflow(workflow)}
                  className={cn(
                    "p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group border",
                    activeWorkflow?.id === workflow.id
                      ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                      : "bg-white/10 border-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  )}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{workflow.name}</span>
                    <span className={cn(
                      "text-xs opacity-70 truncate font-medium mt-0.5",
                      activeWorkflow?.id === workflow.id ? "text-blue-100" : ""
                    )}>{workflow.description}</span>
                  </div>
                  {activeWorkflow?.id === workflow.id ? <Check className="w-3 h-3" /> : <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </button>
              ))}
            </div>
          </div>

          {/* Framework Selector */}
          <div className="space-y-3">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-white/50 px-2">Framework</h2>
            <div className="grid grid-cols-1 gap-1.5">
              {MARKETING_FRAMEWORKS.map((framework) => (
                <button 
                  key={framework.id}
                  onClick={() => setSelectedFramework(selectedFramework === framework.id ? null : framework.id)}
                  className={cn(
                    "p-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group border",
                    selectedFramework === framework.id 
                      ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                      : "bg-white/10 border-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                  )}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{framework.name}</span>
                    <span className={cn(
                      "text-xs opacity-70 truncate font-medium mt-0.5",
                      selectedFramework === framework.id ? "text-blue-100" : ""
                    )}>{framework.description}</span>
                  </div>
                  {selectedFramework === framework.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Categories */}
          <div className="flex items-center justify-between px-2 mb-3 mt-6">
            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-white/50">Agentes Especialistas</h2>
            <button 
              onClick={() => setIsCustomAgentModalOpen(true)}
              className="p-1 hover:bg-white/20 rounded text-white/70 hover:text-white transition-colors"
              title="Criar Agente Personalizado"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          {Object.values(SkillCategory).map((category) => {
            const isExpanded = expandedCategory === category;
            const allSkills = [...MARKETING_SKILLS, ...customSkills];
            const categorySkills = allSkills.filter(s => s.category === category);
            
            if (categorySkills.length === 0) return null;

            return (
              <div key={category} className="space-y-1">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all",
                    isExpanded ? "bg-white/20 text-white" : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-colors", 
                      isExpanded ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-white/10",
                      CATEGORY_TEXT_COLORS[category]
                    )}>
                      {getCategoryIcon(category)}
                    </div>
                    {category}
                  </div>
                  <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isExpanded ? "rotate-90" : "")} />
                </button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {categorySkills.map((skill) => (
                        <button
                          key={skill.id}
                          onClick={() => {
                            setSelectedSkill(skill);
                            setActiveWorkflow(null);
                            activeWorkflowRef.current = null;
                            setWorkflowStepIndex(-1);
                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden text-sm",
                            selectedSkill?.id === skill.id 
                              ? "bg-white/20 text-white shadow-sm" 
                              : "hover:bg-white/10 text-white/80 hover:text-white"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                            selectedSkill?.id === skill.id ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-white/10 group-hover:bg-white/20",
                            CATEGORY_TEXT_COLORS[category]
                          )}>
                            {getCategoryIcon(skill.category)}
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="font-medium truncate w-full">{skill.name}</span>
                            <span className="text-xs opacity-80 font-medium truncate w-full uppercase tracking-tight">{skill.persona}</span>
                          </div>
                          {selectedSkill?.id === skill.id && (
                            <motion.div 
                              layoutId="active-pill"
                              className={cn("absolute left-0 top-0 bottom-0 w-0.5", CATEGORY_COLORS[category])}
                            />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3 bg-black/60 backdrop-blur-xl">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl border border-white/10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-lg">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black text-white truncate">{user?.displayName || "Usuário"}</span>
              <span className="text-xs font-bold text-white/50 truncate">{user?.email}</span>
            </div>
            <div className="relative group/btn ml-auto">
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/60 hover:text-rose-400"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover/btn:block w-32 p-2 bg-black text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed text-center border border-white/10">
                <strong className="block text-rose-400 mb-1">Sair</strong>
                Encerrar a sessão atual.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-black text-white/30 uppercase tracking-widest">v2.1.0-PRO-MAX</span>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-75 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-150 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="min-h-[4rem] py-3 bg-white/90 backdrop-blur-2xl border-b border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-sm gap-4 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 md:p-2.5 hover:bg-gray-100 rounded-xl transition-all active:scale-95 group shadow-sm bg-white border border-gray-300"
              >
                <Menu className="w-5 h-5 text-gray-700 group-hover:text-black" />
              </button>
            )}
            <button
              onClick={() => setIsChatHistoryOpen(true)}
              className="p-2 md:p-2.5 hover:bg-gray-100 rounded-xl transition-all active:scale-95 group shadow-sm bg-white border border-gray-300 hidden md:block"
            >
              <History className="w-5 h-5 text-gray-700 group-hover:text-black" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                <button 
                  onClick={() => {
                    setSelectedSkill(null);
                    setActiveWorkflow(null);
                    activeWorkflowRef.current = null;
                    setWorkflowStepIndex(-1);
                  }}
                  className="hover:text-black/70 transition-colors"
                >
                  Home
                </button>
                {selectedSkill ? (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <button 
                      onClick={() => {
                        setSelectedSkill(null);
                        setExpandedCategory(selectedSkill.category);
                      }}
                      className="hover:text-black/70 transition-colors"
                    >
                      {selectedSkill.category}
                    </button>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600">{selectedSkill.name}</span>
                  </>
                ) : activeWorkflow ? (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600">Workflows</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600">{activeWorkflow.name}</span>
                  </>
                ) : null}
              </div>
              <h1 className="text-sm font-black uppercase tracking-[0.15em] text-black/80 flex items-center gap-2">
                {activeWorkflow ? `Workflow: ${activeWorkflow.name}` : selectedSkill ? selectedSkill.name : "Inteligência de Marketing"}
                {activeWorkflow && (
                  <button 
                    onClick={() => { 
                      setActiveWorkflow(null); 
                      activeWorkflowRef.current = null;
                      setWorkflowStepIndex(-1); 
                    }}
                    className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors ml-2"
                  >
                    Cancelar Workflow
                  </button>
                )}
                <button 
                  onClick={() => setMessages([])}
                  className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors ml-4"
                >
                  Limpar Conversa
                </button>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              </h1>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">
                {activeWorkflow ? "Aguardando seu input..." : selectedSkill ? selectedSkill.persona : "Selecione uma habilidade para começar"}
              </p>
            </div>
          </div>

          <AgentControls
            selectedSkill={selectedSkill}
            useGrounding={useGrounding}
            setUseGrounding={setUseGrounding}
            useSwarmMode={useSwarmMode}
            setUseSwarmMode={setUseSwarmMode}
            setIsBrainOpen={setIsBrainOpen}
            isWorkspaceOpen={isWorkspaceOpen}
            setIsWorkspaceOpen={setIsWorkspaceOpen}
            isTerminalOpen={isTerminalOpen}
            setIsTerminalOpen={setIsTerminalOpen}
            activeCompanyId={activeCompanyId}
            companies={companies}
            setIsBrandContextModalOpen={setIsBrandContextModalOpen}
          />
        </header>

        {/* Agent Brain Modal */}
        <AnimatePresence>
          {isBrainOpen && (
            <AgentBrain 
              key="agent-brain"
              agent={selectedSkill} 
              onClose={() => setIsBrainOpen(false)} 
            />
          )}
        </AnimatePresence>

        {/* Brand Context Modal */}
        <AnimatePresence>
          {isBrandContextModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 md:p-8 border-b border-gray-200 flex items-center justify-between bg-[#F8F9FA]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tighter text-black/90">Empresas e Contextos</h2>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-500">Memória de Longo Prazo</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsBrandContextModalOpen(false)}
                    className="p-3 hover:bg-black/5 rounded-xl transition-all active:scale-90"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                <div className="flex flex-1 overflow-hidden h-[500px]">
                  {/* Sidebar */}
                  <div className="w-1/3 border-r border-gray-200 bg-[#F8F9FA] p-4 overflow-y-auto flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Suas Empresas</h3>
                      <button 
                        onClick={() => {
                          const newCompany = { id: Date.now().toString(), name: "Nova Empresa", context: "" };
                          setCompanies([...companies, newCompany]);
                          setEditingCompanyId(newCompany.id);
                        }} 
                        className="p-1.5 hover:bg-black/10 rounded-lg transition-colors text-black/60"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 flex-1">
                      {companies.map(c => (
                        <button 
                          key={c.id} 
                          onClick={() => setEditingCompanyId(c.id)} 
                          className={cn(
                            "w-full text-left p-3 rounded-xl text-sm font-medium flex justify-between items-center transition-all", 
                            editingCompanyId === c.id ? "bg-white shadow-sm border border-gray-300" : "hover:bg-gray-100 text-gray-600",
                            activeCompanyId === c.id && editingCompanyId !== c.id && "border border-green-500/30"
                          )}
                        >
                          <span className="truncate pr-2">{c.name || "Sem Nome"}</span>
                          {activeCompanyId === c.id && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                        </button>
                      ))}
                      {companies.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-xs text-gray-500 font-medium">Nenhuma empresa cadastrada</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="w-2/3 p-6 md:p-8 flex flex-col bg-white overflow-y-auto">
                    {(() => {
                      const editingCompany = companies.find(c => c.id === editingCompanyId);
                      if (!editingCompany) {
                        return (
                          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Building2 className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">Selecione ou crie uma empresa para editar</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          <input 
                            value={editingCompany.name} 
                            onChange={(e) => {
                              setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, name: e.target.value } : c));
                            }} 
                            className="text-2xl font-black mb-6 bg-transparent border-b border-black/10 focus:border-blue-500 outline-none pb-2 text-black/90 placeholder:text-black/20" 
                            placeholder="Nome da Empresa" 
                          />
                          <p className="text-xs text-gray-500 mb-2 font-black uppercase tracking-widest">Contexto da Marca</p>
                          <textarea 
                            value={editingCompany.context} 
                            onChange={(e) => {
                              setCompanies(companies.map(c => c.id === editingCompany.id ? { ...c, context: e.target.value } : c));
                            }} 
                            className="flex-1 min-h-[200px] resize-none bg-[#F8F9FA] border border-gray-300 rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-800 placeholder:text-gray-400" 
                            placeholder="Ex: Somos uma startup de SaaS focada em gestão de tempo para equipes remotas. Nosso tom de voz é profissional, mas acessível. Nosso principal diferencial é a integração com o WhatsApp..." 
                          />
                          
                          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                            <button 
                              onClick={() => {
                                setCompanies(companies.filter(c => c.id !== editingCompany.id));
                                if (activeCompanyId === editingCompany.id) setActiveCompanyId(null);
                                setEditingCompanyId(null);
                              }} 
                              className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Excluir</span>
                            </button>
                            
                            <button 
                              onClick={() => setActiveCompanyId(editingCompany.id)} 
                              className={cn(
                                "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-2", 
                                activeCompanyId === editingCompany.id 
                                  ? "bg-green-500 text-white shadow-green-200" 
                                  : "bg-black/5 hover:bg-black/10 text-black/60"
                              )}
                            >
                              {activeCompanyId === editingCompany.id ? (
                                <>
                                  <CheckCircle2 className="w-4 h-4" />
                                  Empresa Ativa no Chat
                                </>
                              ) : (
                                "Definir como Ativa"
                              )}
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* Calculator Modal */}
        {/* Custom Agent Modal */}
        <AnimatePresence>
          {isCustomAgentModalOpen && (
            <motion.div 
              key="custom-agent-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl h-[80vh]"
              >
                <CustomAgentModal 
                  onClose={() => setIsCustomAgentModalOpen(false)} 
                  onSave={handleSaveCustomAgent} 
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <AnimatePresence>
          {/* Brand Modal Removed */}
        </AnimatePresence>

        {/* Workspace + Chat Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col transition-all duration-500",
            isWorkspaceOpen ? "hidden md:flex md:w-1/2" : "w-full"
          )}>
            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar bg-[#F8F9FA]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center max-w-6xl mx-auto space-y-16 py-12">
                  <div className="text-center space-y-6">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.3)] mx-auto mb-8 relative group"
                    >
                      <Zap className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                    <h1 className="text-6xl font-black tracking-tighter text-black/90 leading-none">
                      Marketing <span className="text-blue-600">Swarm</span> <span className="text-black/20 italic">v2.1</span>
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
                      Sua central de inteligência orquestrada por agentes especialistas. 
                      <span className="block mt-2 text-blue-500/60 font-black uppercase tracking-widest text-xs">Powered by UI/UX Pro Max Skill</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    {[
                      { icon: <Target className="w-6 h-6 text-blue-600" />, title: "Estratégia Master", desc: "Planos de 30 dias e funis de conversão validados.", color: "bg-blue-50" },
                      { icon: <Zap className="w-6 h-6 text-orange-600" />, title: "Performance Pro", desc: "Otimização de ROAS e escala de anúncios em tempo real.", color: "bg-orange-50" },
                      { icon: <Palette className="w-6 h-6 text-purple-600" />, title: "Design Inteligente", desc: "Design Systems e criativos focados em conversão.", color: "bg-purple-50" }
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="p-8 bg-white border border-gray-200 rounded-[2rem] shadow-sm space-y-5 group transition-all hover:shadow-xl"
                      >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", item.color)}>
                          {item.icon}
                        </div>
                        <h3 className="font-black uppercase tracking-widest text-xs text-black/80">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-3">
                    {["Como aumentar meu ROI?", "Crie um Design System", "Analise meu anúncio", "Funil de Vendas SaaS"].map((q) => (
                      <button 
                        key={q}
                        onClick={() => setInput(q)}
                        className="px-6 py-3 bg-white border border-gray-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
            <div className="max-w-4xl mx-auto w-full space-y-12">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  msg={msg}
                  index={i}
                  copiedId={copiedId}
                  onArtifactClick={handleArtifactClick}
                  onCopyClick={copyToClipboard}
                />
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-sm bg-[#E4E3E0] border border-[#141414]/10 flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4 text-[#141414]" />
                  </div>
                  <div className="bg-white border border-[#141414]/10 p-4 rounded-sm shadow-sm w-24 flex justify-center items-center gap-1">
                    <div className="w-1 h-1 bg-[#141414] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-1 bg-[#141414] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-1 bg-[#141414] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

            {/* Input Area */}
            <InputBar
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              selectedSkill={selectedSkill}
              setSelectedSkill={setSelectedSkill}
              selectedImages={selectedImages}
              removeImage={removeImage}
              handleImageUpload={handleImageUpload}
              handleSend={handleSend}
              setMessages={setMessages}
              handlePaste={handlePaste}
              handleInputKeyDown={handleInputKeyDown}
              showCommandMenu={showCommandMenu}
              filteredCommands={filteredCommands}
              selectedCommandIndex={selectedCommandIndex}
              getCategoryIcon={getCategoryIcon}
            />
          </div>

          {/* Terminal Panel */}
          <AnimatePresence>
            {isTerminalOpen && (
              <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-24 left-4 right-4 md:left-8 md:right-auto md:w-80 h-64 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 font-mono overflow-hidden"
              >
                <div className="h-10 border-b border-white/10 flex items-center justify-between px-4 bg-white/5 sticky top-0 z-10">
                  <div className="flex items-center gap-2 text-white/50 text-xs">
                    <Terminal className="w-4 h-4" />
                    <span>Agent Execution Terminal</span>
                  </div>
                  <button 
                    onClick={() => setIsTerminalOpen(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {agentLogs.length === 0 ? (
                    <div className="text-white/30 text-xs italic">Aguardando execução de agentes...</div>
                  ) : (
                    agentLogs.map((log) => (
                      <div key={log.id} className="text-xs flex gap-2">
                        <span className="text-white/30 shrink-0">
                          [{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]
                        </span>
                        <span className="text-blue-400 shrink-0 w-24 truncate">
                          @{log.agentId}
                        </span>
                        <span className={cn(
                          "flex-1 break-words",
                          log.type === 'info' && "text-white/70",
                          log.type === 'action' && "text-yellow-400",
                          log.type === 'success' && "text-green-400",
                          log.type === 'error' && "text-red-400"
                        )}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Workspace Panel */}
          <AnimatePresence>
            {isWorkspaceOpen && (
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute md:relative inset-0 md:inset-auto w-full md:w-1/2 border-l border-gray-200 bg-[#F8F9FA] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-40"
              >
                <div className="h-20 border-b border-gray-200 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black tracking-tighter uppercase text-sm text-black/90">Estúdio de Artefatos</h3>
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Espaço de Trabalho de Produção</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsWorkspaceOpen(false)}
                    className="p-3 hover:bg-black/5 rounded-2xl transition-all active:scale-90"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                  {activeArtifact ? (
                    <div className="space-y-10 max-w-3xl mx-auto">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest border border-blue-200">
                              {activeArtifact.type}
                            </span>
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest">
                              Gerado por {activeArtifact.agentName}
                            </span>
                          </div>
                          <h2 className="text-4xl font-black tracking-tighter text-black/90 leading-tight">
                            {activeArtifact.title}
                          </h2>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(activeArtifact.content, activeArtifact.id)}
                            className="p-4 bg-white border border-gray-300 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm active:scale-90 group/copy"
                          >
                            {copiedId === activeArtifact.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-500 group-hover/copy:text-white" />}
                          </button>
                        </div>
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-200 min-h-[600px] relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                        <div className="prose prose-sm max-w-none p-10 bg-white rounded-[2.5rem] border border-gray-200 shadow-xl shadow-black/5">
                          <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-6">
                            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black uppercase tracking-widest text-black/80">Documento de Estratégia</h3>
                              <p className="text-xs font-black text-gray-500 uppercase tracking-tighter">Conteúdo Gerado por IA</p>
                            </div>
                          </div>
                          <div className="text-black/70 leading-relaxed font-medium overflow-hidden break-words">
                            <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-blue-500 prose-strong:text-inherit prose-pre:bg-black/5 prose-pre:text-black/80 prose-code:text-blue-600">
                              <ReactMarkdown>{activeArtifact.content}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                      
                      <div className="flex items-center justify-center gap-4 py-8 border-t border-gray-200">
                        <p className="text-xs font-black text-gray-500 uppercase tracking-[0.4em]">Fim do Documento • UI/UX Pro Max v2.1</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                      <div className="w-24 h-24 bg-black/5 rounded-[2rem] flex items-center justify-center">
                        <FileText className="w-12 h-12 text-black/10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-black text-black/20 uppercase tracking-widest text-sm">Nenhum Artefato Ativo</h3>
                        <p className="text-xs font-medium text-black/20 max-w-[200px] leading-relaxed">
                          Selecione um artefato no chat para visualizar e editar aqui.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ChatHistory 
          isOpen={isChatHistoryOpen} 
          onClose={() => setIsChatHistoryOpen(false)} 
          setMessages={setMessages}
          setCurrentChatId={setCurrentChatId}
        />
      </main>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @font-face {
          font-family: 'Georgia';
          src: local('Georgia');
        }
        .serif {
          font-family: 'Georgia', serif;
        }
        ::selection {
          background: rgba(37, 99, 235, 0.1);
          color: #2563EB;
        }
      `}</style>
    </div>
    </ErrorBoundary>
  );
}
