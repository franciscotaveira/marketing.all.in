/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useMemo } from "react";

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
  BookOpen,
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
  Info,
  CheckCircle2,
  Building2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { AgentBrain } from "./components/AgentBrain";
import { AISuggestions } from "./components/AISuggestions";
import TaskBoard from "./components/TaskBoard";
import RoutinePlanner from "./components/RoutinePlanner";
import NotificationCenter from "./components/NotificationCenter";

import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChatMessage } from "./components/ChatMessage";
import { CustomAgentModal } from "./components/CustomAgentModal";
import { InputBar } from "./components/InputBar";
import { AgentControls } from "./components/AgentControls";
import { SidebarChatHistory } from "./components/SidebarChatHistory";
import { BrandContextModal } from "./components/BrandContextModal";
import { CampaignAssetViewer } from "./components/CampaignAssetViewer";
import { BrandSummary } from "./components/BrandSummary";
import Logo from "./components/Logo";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { AgentIcon } from "./components/AgentIcon";
import { MARKETING_SKILLS, MARKETING_FRAMEWORKS, CATEGORY_COLORS, CATEGORY_TEXT_COLORS, CATEGORY_BG_LIGHT_COLORS, WORKFLOWS } from "./constants";
import { MarketingSkill, SkillCategory, Message, SkillTier, Artifact, BrainMemory, Company, Workflow, ChatSession } from "./types";
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
  const [selectedSkill, setSelectedSkill] = useState<MarketingSkill | null>(() => {
    return MARKETING_SKILLS.find(s => s.id === 'orchestrator') || null;
  });
  const [expandedCategory, setExpandedCategory] = useState<SkillCategory | null>(SkillCategory.STRATEGY);
  const [customSkills, setCustomSkills] = useState<MarketingSkill[]>([]);
  const [isCustomAgentModalOpen, setIsCustomAgentModalOpen] = useState(false);
  const [editingCustomAgent, setEditingCustomAgent] = useState<MarketingSkill | null>(null);
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [useGrounding, setUseGrounding] = useState(false);
  const [useSwarmMode, setUseSwarmMode] = useState(true);
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('companies');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(() => {
    return localStorage.getItem('active_company_id') || null;
  });
  const [manualAgentPriorities, setManualAgentPriorities] = useState<Record<string, number>>({});
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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // CLI Commands State
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandFilter, setCommandFilter] = useState("");
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const allArtifacts = useMemo(() => {
    const artifacts: Artifact[] = [];
    // Robust regex to catch variations in artifact format
    const artifactRegex = /```artifact\s*:\s*([a-zA-Z0-9_-]+)\s*:\s*([^\n]+?)\s*\n?([\s\S]*?)```/g;

    messages.forEach(msg => {
      // First, use pre-parsed artifacts if they exist
      if (msg.artifacts && msg.artifacts.length > 0) {
        msg.artifacts.forEach(art => {
          if (!artifacts.find(a => a.id === art.id)) {
            artifacts.push(art);
          }
        });
      }

      // Then, try to extract from content in case they weren't pre-parsed or format changed slightly
      let match;
      if (!msg.content) return;
      // Reset regex index for each message
      artifactRegex.lastIndex = 0;
      while ((match = artifactRegex.exec(msg.content)) !== null) {
        const type = match[1].trim();
        const title = match[2].trim();
        let content = match[3].trim();
        let metadata = undefined;

        // Extract metadata if present
        if (type !== 'n8n') {
          try {
            // Look for JSON block anywhere in the content
            const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonBlockMatch) {
              const cleanedJson = jsonBlockMatch[1].trim();
              const parsed = JSON.parse(cleanedJson);
              metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
              // Only remove the JSON block from content if it's at the end or start
              content = content.replace(jsonBlockMatch[0], '').trim();
            } else {
              // Fallback: try to find anything that looks like a JSON object at the end
              const lastBraceIndex = content.lastIndexOf('}');
              const firstBraceIndex = content.lastIndexOf('{', lastBraceIndex);
              if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
                const potentialJson = content.substring(firstBraceIndex, lastBraceIndex + 1);
                try {
                  const parsed = JSON.parse(potentialJson);
                  metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
                  content = content.substring(0, firstBraceIndex).trim();
                } catch (e) {}
              }
            }
          } catch (e) {}
        }
        
        // Avoid duplicates by title and type if id is not available
        if (!artifacts.find(a => a.title === title && a.type === type)) {
          artifacts.push({
            id: `extracted-${title.replace(/\s+/g, '-').toLowerCase()}-${type}`,
            type: type as any,
            title,
            content,
            metadata,
            agentName: msg.agentName || "Assistente"
          });
        }
      }
    });

    return artifacts.reverse();
  }, [messages]);

  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'operations' | 'brain' | 'terminal' | 'workspace'>('chat');
  const [googleTokens, setGoogleTokens] = useState<any>(() => {
    const saved = localStorage.getItem('google_drive_tokens');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        setGoogleTokens(event.data.tokens);
        localStorage.setItem('google_drive_tokens', JSON.stringify(event.data.tokens));
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const connectGoogleDrive = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.open(url, 'google_auth_popup', 'width=600,height=700');
    } catch (error) {
      console.error("Failed to get Google Auth URL", error);
    }
  };

  const extractFolderId = (url: string) => {
    const match = url.match(/folders\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const processDriveFolder = async (url: string) => {
    const folderId = extractFolderId(url);
    if (!folderId) {
      setMessages(prev => [...prev, { role: "ai", content: "❌ Link do Google Drive inválido. Certifique-se de que é um link de pasta.", agentName: "Sistema" } as Message]);
      return;
    }

    if (!googleTokens) {
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Você precisa conectar sua conta do Google primeiro.", agentName: "Sistema" } as Message]);
      connectGoogleDrive();
      return;
    }

    setIsLoading(true);
    setMessages(prev => [...prev, { role: "ai", content: "📂 Lendo arquivos da pasta do Google Drive...", agentName: "Sistema" } as Message]);

    try {
      const response = await fetch('/api/drive/read-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, tokens: googleTokens })
      });

      if (!response.ok) throw new Error("Failed to read folder");

      const { files } = await response.json();
      
      let combinedContent = `CONTEÚDO DA PASTA DO DRIVE:\n\n`;
      files.forEach((f: any) => {
        combinedContent += `--- ARQUIVO: ${f.name} ---\n${f.content}\n\n`;
      });

      setMessages(prev => [...prev, { 
        role: "ai", 
        content: `✅ Sucesso! Li ${files.length} arquivos da pasta.\n\nAgora posso responder perguntas sobre esse conteúdo.`,
        agentName: "Sistema"
      } as Message]);

      // Add to brain or context
      const brainMemory: Omit<BrainMemory, 'id' | 'createdAt'> = {
        agentId: "drive-reader",
        title: `Pasta Drive: ${folderId}`,
        content: combinedContent,
        tags: ["google-drive", "folder-import"],
      };
      await firebaseService.saveMemory(brainMemory);

    } catch (error) {
      console.error("Drive processing error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "❌ Erro ao ler a pasta do Google Drive. Verifique as permissões.", agentName: "Sistema" } as Message]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArtifactClick = (art: Artifact) => {
    setActiveArtifact(art);
    setActiveTab('workspace');
  };

  const handleStartWorkflow = (workflow: Workflow) => {
    if (activeWorkflow?.id === workflow.id) {
      setActiveWorkflow(null);
      activeWorkflowRef.current = null;
      setWorkflowStepIndex(0);
      return;
    }
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
      const allSkills = [...MARKETING_SKILLS, ...customSkills];
      const agent = allSkills.find(s => s.id === step.agentId) || allSkills[0];
      
      setMessages(prev => [...prev, {
        role: "ai",
        content: `⏳ **Executando Etapa ${i + 1}/${workflow.steps.length}: ${step.name}**\nAgente: ${agent.name}...`,
        agentName: "Orquestrador de Workflow"
      }]);

      const prompt = `Você está executando a etapa ${i + 1} de um workflow automatizado.\n\nInstrução da Etapa: ${step.instruction}\n\nContexto Acumulado:\n${currentContext}`;
      
      const systemInstruction = `Você é ${agent.persona} (${agent.name}). 
      Sua tarefa é cumprir a instrução da etapa atual do workflow com base no contexto fornecido.
      Gere a saída de forma clara e profissional. 
      
      IMPORTANTE: Você DEVE gerar um artefato técnico para documentar seu trabalho usando EXATAMENTE este formato:
      \`\`\`artifact : tipo : título
      conteúdo detalhado aqui
      
      \`\`\`json
      { \"metadata\": { ... } }
      \`\`\`
      \`\`\`
      
      Tipos válidos: 'campaign', 'architecture', 'research', 'content'.
      Certifique-se de incluir os metadados solicitados na instrução da etapa (cores, tipografia, grids, etc) no bloco JSON dentro do artefato.
      
      IMPORTANTE: Use espaços antes e depois dos dois pontos ( : ) no cabeçalho do artefato para garantir a compatibilidade.`;

      try {
        const result = await orchestrateRequest(
          prompt,
          agent.id,
          agent.model,
          systemInstruction,
          false,
          false,
          addLog,
          [...MARKETING_SKILLS, ...customSkills],
          [],
          []
        );

        const aiResponse = result.response;
        setActiveAgentId(null);
        
        const artifacts: Artifact[] = [];
        // Use the same robust regex as the memo
        const artifactRegex = /```artifact\s*:\s*([a-zA-Z0-9_-]+)\s*:\s*([^\n]+?)\s*\n?([\s\S]*?)```/g;
        let match;
        while ((match = artifactRegex.exec(aiResponse)) !== null) {
          const type = match[1].trim();
          const title = match[2].trim();
          let content = match[3].trim();
          let metadata = undefined;
          
          if (type !== 'n8n') {
            try {
              // Look for JSON block anywhere in the content
              const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
              if (jsonBlockMatch) {
                const cleanedJson = jsonBlockMatch[1].trim();
                const parsed = JSON.parse(cleanedJson);
                metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
                content = content.replace(jsonBlockMatch[0], '').trim();
              } else {
                // Fallback: try to find anything that looks like a JSON object at the end
                const lastBraceIndex = content.lastIndexOf('}');
                const firstBraceIndex = content.lastIndexOf('{', lastBraceIndex);
                if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
                  const potentialJson = content.substring(firstBraceIndex, lastBraceIndex + 1);
                  try {
                    const parsed = JSON.parse(potentialJson);
                    metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
                    content = content.substring(0, firstBraceIndex).trim();
                  } catch (e) {}
                }
              }
            } catch (e) {}
          }

          artifacts.push({
            id: `art-${Math.random().toString(36).substr(2, 9)}`,
            type: type as any,
            title,
            content,
            agentName: agent.name,
            metadata
          });
        }

        if (artifacts.length > 0) {
          addLog('workflow', `[Workflow] ${artifacts.length} artefato(s) extraído(s) com sucesso.`, 'success');
          setActiveArtifact(artifacts[0]);
          setActiveTab('workspace');
        } else {
          addLog('workflow', `[Workflow] Nenhum artefato detectado na resposta do agente.`, 'info');
          // Fallback: if the response is long but no artifact block, create a generic one
          if (aiResponse.length > 500) {
            const fallbackArt: Artifact = {
              id: `art-fallback-${Math.random().toString(36).substr(2, 9)}`,
              type: 'campaign',
              title: `Relatório: ${step.name}`,
              content: aiResponse,
              agentName: agent.name
            };
            artifacts.push(fallbackArt);
            setActiveArtifact(fallbackArt);
            setActiveTab('workspace');
            addLog('workflow', `[Workflow] Criado artefato de fallback a partir da resposta.`, 'info');
          }
        }

        // Replace artifacts in the response text for cleaner chat display
        const formattedResponse = aiResponse.replace(artifactRegex, (match, type, title) => {
          return `\n\n> 📦 **Artefato Gerado:** ${title.trim()} (${type.trim()})\n> *Disponível no Workspace*\n\n`;
        });

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
        setActiveAgentId(null);
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

  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; type: 'single' | 'all'; chatId?: string }>({
    isOpen: false,
    type: 'single'
  });
  const [lastVisibleDoc, setLastVisibleDoc] = useState<any>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs]);

  useEffect(() => {
    if (user) {
      loadChatSessions();
    }
  }, [user]);

  const loadChatSessions = async () => {
    if (!user) return;
    setIsHistoryLoading(true);
    try {
      const { data, error } = await firebaseService.getChats();
      if (!error && data) {
        setChatSessions(data);
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSelectChat = async (chatId: string) => {
    if (!user) return;
    setCurrentChatId(chatId);
    setIsLoading(true);
    setLastVisibleDoc(null);
    setHasMoreMessages(false);
    try {
      const { data, lastVisible, error } = await firebaseService.getMessages(chatId);
      if (!error && data) {
        setMessages(data as Message[]);
        setLastVisibleDoc(lastVisible);
        setHasMoreMessages(data.length === 20);
        
        // Scroll to bottom after loading initial messages
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
        }, 100);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!user || !currentChatId || !lastVisibleDoc || isPaginationLoading || !hasMoreMessages) return;
    
    setIsPaginationLoading(true);
    const scrollHeightBefore = chatContainerRef.current?.scrollHeight || 0;
    
    try {
      const { data, lastVisible, error } = await firebaseService.getMessages(currentChatId, lastVisibleDoc);
      if (!error && data && data.length > 0) {
        setMessages(prev => [...data, ...prev]);
        setLastVisibleDoc(lastVisible);
        setHasMoreMessages(data.length === 20);
        
        // Maintain scroll position
        setTimeout(() => {
          if (chatContainerRef.current) {
            const scrollHeightAfter = chatContainerRef.current.scrollHeight;
            chatContainerRef.current.scrollTop = scrollHeightAfter - scrollHeightBefore;
          }
        }, 0);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsPaginationLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollTop === 0 && hasMoreMessages && !isPaginationLoading) {
      loadMoreMessages();
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user) return;
    setDeleteConfirm({ isOpen: true, type: 'single', chatId });
  };

  const confirmDeleteChat = async () => {
    if (!user || !deleteConfirm.chatId) return;
    const chatId = deleteConfirm.chatId;
    try {
      const { error } = await firebaseService.deleteChat(chatId);
      if (!error) {
        setChatSessions(prev => prev.filter(s => s.id !== chatId));
        if (currentChatId === chatId) {
          setCurrentChatId(null);
          setMessages([]);
          setLastVisibleDoc(null);
          setHasMoreMessages(false);
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleDeleteAllChats = async () => {
    if (!user) return;
    setDeleteConfirm({ isOpen: true, type: 'all' });
  };

  const confirmDeleteAllChats = async () => {
    if (!user) return;
    setIsHistoryLoading(true);
    try {
      const { error } = await firebaseService.deleteAllChats();
      if (!error) {
        setChatSessions([]);
        setCurrentChatId(null);
        setMessages([]);
        setLastVisibleDoc(null);
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Error deleting all chats:", error);
    } finally {
      setIsHistoryLoading(false);
    }
  };
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

        // Load custom agents
        const agents = await firebaseService.getCustomAgents();
        if (agents.data) setCustomSkills(agents.data);
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

  const handleSaveCustomAgent = async (agent: MarketingSkill) => {
    if (editingCustomAgent) {
      const { id, ...agentData } = agent;
      await firebaseService.updateCustomAgent(id, agentData);
      setCustomSkills(prev => prev.map(s => s.id === id ? agent : s));
      setEditingCustomAgent(null);
    } else {
      const result = await firebaseService.saveCustomAgent(agent);
      if (result.data) {
        setCustomSkills(prev => [result.data as MarketingSkill, ...prev]);
      }
    }
  };

  const handleDeleteCustomAgent = async (agentId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agente?')) {
      await firebaseService.deleteCustomAgent(agentId);
      setCustomSkills(prev => prev.filter(s => s.id !== agentId));
    }
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
    { id: 'workspace', label: 'Abrir Workspace', icon: LayoutDashboard, action: () => { setActiveTab('workspace'); setInput(""); setShowCommandMenu(false); } },
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

  const addLog = (agentId: string, message: string, type: 'info' | 'action' | 'success' | 'error' = 'info', isActive?: boolean) => {
    setAgentLogs(prev => [...prev, { id: Math.random().toString(36).substring(7), timestamp: new Date(), agentId, message, type }]);
    if (isActive !== undefined) {
      if (isActive) setActiveAgentId(agentId);
      else if (activeAgentId === agentId) setActiveAgentId(null);
    }
  };

  const handleSend = async (overrideInput?: string | React.MouseEvent | React.KeyboardEvent) => {
    const userMessage = typeof overrideInput === 'string' ? overrideInput : input;
    if (!userMessage.trim() && selectedImages.length === 0 || isLoading) return;

    const isOverride = typeof overrideInput === 'string';

    // Detect Google Drive Folder Link
    if (userMessage.includes('drive.google.com/drive/folders/')) {
      processDriveFolder(userMessage);
      if (!isOverride) setInput("");
      return;
    }

    const currentImages = [...selectedImages];
    if (!isOverride) setInput("");
    setSelectedImages([]);
    const userMsg: Omit<Message, 'createdAt'> = { role: "user", content: userMessage, images: currentImages };
    setMessages(prev => [...prev, userMsg as Message]);
    
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

      const prompt = `Solicitação do Usuário: ${userMessage}${skillContext}${frameworkContext}`;

      const activeCompany = companies.find(c => c.id === activeCompanyId);
      const brandContextText = activeCompany ? `\n\nCONTEXTO DA MARCA ATIVA (${activeCompany.name}):\n${activeCompany.context}\n\n` : "";

      const systemInstruction = `Você é o Engenheiro de Automação de elite. 
      ${selectedSkill ? `Atualmente, você está assumindo a persona de: ${selectedSkill.persona} (${selectedSkill.name}).` : "Você está atuando como Engenheiro de Automação Geral."}
      
      ${brandContextText}
      
      IMPORTANTE SOBRE ARTEFATOS:
      Durante a fase de ideação, planejamento e construção da estratégia, NÃO gere artefatos automaticamente. Converse com o usuário, apresente as ideias e refine o conteúdo primeiro.
      APENAS QUANDO O USUÁRIO PEDIR EXPLICITAMENTE para "gerar artefatos", "criar os arquivos", "finalizar" ou quando a estratégia estiver totalmente consolidada e pronta para entrega, você DEVE extrair os materiais táticos/práticos como um 'Artefato' usando blocos de código com a linguagem 'artifact' no formato exato:
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
      7. FONTES DE DADOS E INTEGRAÇÕES: Se o usuário fornecer documentação de API, chaves ou links (ex: sistema de agendamento do salão), você deve agir como se tivesse acesso a esses dados para gerar estratégias hiper-personalizadas, ou gerar scripts (Artefatos do tipo 'code' ou 'automation') para que o usuário possa implementar a integração.
      8. ANÁLISE VISUAL: Você possui capacidades multimodais avançadas e pode ver imagens enviadas pelo usuário. Ao receber uma imagem, analise-a detalhadamente para fornecer insights estratégicos, identificar problemas de UX/UI, sugerir melhorias de conversão em peças criativas ou extrair informações relevantes para o contexto de marketing e automação.`;

      let aiResponse: string;
      const model = selectedSkill?.model || "gemini-3-flash-preview";
      
      try {
        // Create a new chat if it doesn't exist
        let chatId = currentChatId;
        if (!chatId) {
          const chatTitle = userMessage.slice(0, 40) + (userMessage.length > 40 ? "..." : "");
          const { data: newChat, error: chatError } = await firebaseService.createChat(chatTitle);
          if (chatError || !newChat) throw new Error("Failed to create chat session");
          chatId = newChat.id;
          setCurrentChatId(chatId);
          loadChatSessions(); // Refresh history
        }

        // Save user message to the correct chat
        await firebaseService.saveMessage(chatId, userMsg);

        const result = await orchestrateRequest(
          prompt,
          selectedSkill?.id || null,
          model,
          systemInstruction,
          useGrounding,
          useSwarmMode,
          addLog,
          [...MARKETING_SKILLS, ...customSkills],
          currentImages,
          messages,
          manualAgentPriorities
        );

        aiResponse = result.response;
      } catch (error) {
        console.error("Chat error:", error);
        aiResponse = "Sinto muito, ocorreu um erro ao gerar a resposta.";
      } finally {
        setActiveAgentId(null);
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
      const artifactRegex = /```artifact\s*:\s*([a-zA-Z0-9_-]+)\s*:\s*([^\n]+?)\s*\n?([\s\S]*?)```/g;
      let match;
      while ((match = artifactRegex.exec(aiResponse)) !== null) {
        const type = match[1].trim();
        const title = match[2].trim();
        let content = match[3].trim();
        let metadata = undefined;
        
        if (type !== 'n8n') {
          try {
            // Look for JSON block anywhere in the content
            const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonBlockMatch) {
              const cleanedJson = jsonBlockMatch[1].trim();
              const parsed = JSON.parse(cleanedJson);
              metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
              content = content.replace(jsonBlockMatch[0], '').trim();
            } else {
              // Fallback: try to find anything that looks like a JSON object at the end
              const lastBraceIndex = content.lastIndexOf('}');
              const firstBraceIndex = content.lastIndexOf('{', lastBraceIndex);
              if (firstBraceIndex !== -1 && lastBraceIndex !== -1) {
                const potentialJson = content.substring(firstBraceIndex, lastBraceIndex + 1);
                try {
                  const parsed = JSON.parse(potentialJson);
                  metadata = parsed.metadata !== undefined ? parsed.metadata : parsed;
                  content = content.substring(0, firstBraceIndex).trim();
                } catch (e) {}
              }
            }
          } catch (e) {}
        }

        artifacts.push({
          id: `art-${Math.random().toString(36).substr(2, 9)}`,
          type: type as any,
          title,
          content,
          agentName: selectedSkill?.name || "Assistente Geral",
          metadata
        });
      }

      if (artifacts.length > 0) {
        setActiveArtifact(artifacts[0]);
        setActiveTab('workspace');
      }

      const formattedResponse = aiResponse.replace(artifactRegex, (match, type, title) => {
        return `\n\n> 📦 **Artefato Gerado:** ${title.trim()} (${type.trim()})\n> *Disponível no Workspace*\n\n`;
      });

      const aiMsg: Omit<Message, 'createdAt'> = { 
        role: "ai", 
        content: formattedResponse,
        agentName: selectedSkill?.persona || "Assistente Geral",
        agentTier: selectedSkill?.tier,
        artifacts: artifacts.length > 0 ? artifacts : undefined
      };

      setMessages(prev => [...prev, aiMsg as Message]);
      if (currentChatId) {
        firebaseService.saveMessage(currentChatId, aiMsg);
        firebaseService.updateChat(currentChatId, { updatedAt: new Date().toISOString() });
      }
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
          <Logo className="scale-150 mb-8" showText={false} />
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
            Aetheris <span className="text-blue-500">Swarm</span>
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
            className="btn-primary w-full py-5 text-xs tracking-[0.2em]"
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
        className="flex h-screen text-theme-primary font-sans overflow-hidden p-4 gap-4 bg-theme-main"
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
            className="md:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 300 : 0, 
          opacity: isSidebarOpen ? 1 : 0,
          marginRight: isSidebarOpen ? 16 : 0
        }}
        className={cn(
          "bg-theme-surface border border-theme-glass flex flex-col overflow-hidden z-40 shadow-sm shrink-0 transition-all duration-500 rounded-3xl",
          "absolute md:relative left-0 top-0 bottom-0",
          !isSidebarOpen && "pointer-events-none"
        )}
      >
        <div className="p-6 border-b border-theme-glass flex items-center justify-between bg-theme-surface/50">
          <Logo />
          <button onClick={() => setIsSidebarOpen(false)} className="btn-secondary p-2 md:hidden">
            <X className="w-5 h-5 text-theme-secondary" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-10">
          <BrandSummary company={companies.find(c => c.id === activeCompanyId) || null} />

          {/* Chat History Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <History className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <h2 className="text-[11px] uppercase tracking-wider font-bold text-theme-primary/80">Histórico de Inteligência</h2>
            </div>
            <SidebarChatHistory 
              currentChatId={currentChatId}
              onSelectChat={handleSelectChat}
              onDeleteChat={handleDeleteChat}
              onDeleteAllChats={handleDeleteAllChats}
              onNewChat={() => {
                setCurrentChatId(null);
                setMessages([]);
                setLastVisibleDoc(null);
                setHasMoreMessages(false);
              }}
              sessions={chatSessions}
              isLoading={isHistoryLoading}
            />
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-theme-glass to-transparent opacity-30" />

          {/* Workflows Section */}
          <div className="space-y-4 bg-theme-card/30 p-5 rounded-[32px] border border-amber-500/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/0 via-amber-500/40 to-amber-500/0" />
            
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-sm">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <h2 className="text-[11px] uppercase tracking-widest font-black text-theme-primary">Workflows</h2>
            </div>
            
            <div className="space-y-6 relative">
              {/* Vertical Connector Line */}
              <div className="absolute left-[13px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-500/40 via-amber-500/10 to-transparent" />

              {Object.entries(
                WORKFLOWS.reduce((acc, wf) => {
                  if (!acc[wf.category]) acc[wf.category] = [];
                  acc[wf.category].push(wf);
                  return acc;
                }, {} as Record<string, Workflow[]>)
              ).map(([category, workflows]) => (
                <div key={category} className="space-y-3 relative pl-6">
                  <div className="absolute left-[-17px] top-1.5 w-2 h-2 rounded-full bg-amber-500 border-2 border-theme-main z-10 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-amber-500/60 whitespace-nowrap">{category}</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent" />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2">
                    {workflows.map((workflow) => (
                      <motion.button 
                        whileHover={{ x: 4, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        key={workflow.id}
                        onClick={() => handleStartWorkflow(workflow)}
                        className={cn(
                          "p-4 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between group border relative overflow-hidden shadow-sm",
                          activeWorkflow?.id === workflow.id
                            ? cn(workflow.color, "border-white/30 text-white shadow-lg") 
                            : "bg-theme-card/40 border-theme-glass text-theme-secondary hover:bg-theme-glass hover:text-theme-primary hover:border-amber-500/30"
                        )}
                      >
                        <div className="flex flex-col min-w-0 relative z-10 justify-center">
                          <span className="truncate font-black uppercase tracking-tighter text-xs leading-none">{workflow.name}</span>
                          <span className={cn(
                            "text-[9px] opacity-60 truncate font-bold mt-1.5 tracking-[0.15em] uppercase leading-none",
                            activeWorkflow?.id === workflow.id ? "text-white/90" : "text-theme-secondary"
                          )}>{workflow.description}</span>
                        </div>
                        <div className="relative z-10 ml-3 shrink-0">
                          {activeWorkflow?.id === workflow.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-theme-glass/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-theme-glass to-transparent opacity-30" />

          {/* Framework Section */}
          <div className="space-y-4 bg-emerald-500/5 p-5 rounded-[32px] border border-emerald-500/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
            
            <div className="flex items-center gap-2 px-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                <BookOpen className="w-4 h-4 text-emerald-500" />
              </div>
              <h2 className="text-[11px] uppercase tracking-widest font-black text-theme-primary">Frameworks</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-2.5">
              {MARKETING_FRAMEWORKS.map((framework) => (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={framework.id}
                  onClick={() => setSelectedFramework(selectedFramework === framework.id ? null : framework.id)}
                  className={cn(
                    "p-4 rounded-2xl text-sm font-bold transition-all text-left flex items-center justify-between group border shadow-sm",
                    selectedFramework === framework.id 
                      ? "bg-emerald-600 border-emerald-400 text-white shadow-lg" 
                      : "bg-theme-card/60 border-theme-glass text-theme-secondary hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30"
                  )}
                >
                  <div className="flex flex-col min-w-0 justify-center">
                    <span className="truncate font-black uppercase tracking-tighter text-xs leading-none">{framework.name}</span>
                    <span className={cn(
                      "text-[9px] opacity-60 truncate font-bold mt-1.5 tracking-[0.15em] uppercase leading-none",
                      selectedFramework === framework.id ? "text-emerald-50" : "text-theme-secondary"
                    )}>{framework.description}</span>
                  </div>
                  {selectedFramework === framework.id ? (
                    <Check className="w-4 h-4 ml-3 shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-theme-glass to-transparent opacity-30" />

          {/* Specialist Agents Group */}
          <div className="space-y-4 bg-purple-500/5 p-5 rounded-[32px] border border-purple-500/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500/0 via-purple-500/40 to-purple-500/0" />
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-sm">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <h2 className="text-[11px] uppercase tracking-widest font-black text-theme-primary">Agentes</h2>
              </div>
              <button 
                onClick={() => setIsCustomAgentModalOpen(true)}
                className="w-8 h-8 flex items-center justify-center bg-theme-glass border border-theme-glass hover:border-purple-500/40 rounded-xl shadow-sm transition-all active:scale-95"
                title="Criar Agente Personalizado"
              >
                <Plus className="w-4 h-4 text-purple-400" />
              </button>
            </div>
            
            <div className="space-y-2.5">
              {Object.values(SkillCategory).map((category) => {
                const isExpanded = expandedCategory === category;
                const allSkills = [...MARKETING_SKILLS, ...customSkills];
                const categorySkills = allSkills.filter(s => s.category === category);
                
                if (categorySkills.length === 0) return null;

                return (
                  <div key={category} className="space-y-2">
                    <motion.button
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setExpandedCategory(isExpanded ? null : category)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border shadow-md leading-none",
                        isExpanded 
                          ? "bg-theme-glass border-theme-secondary/40 text-theme-primary shadow-lg" 
                          : "bg-theme-card border-theme-glass text-theme-secondary hover:text-theme-primary hover:bg-theme-glass hover:border-theme-secondary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-7 h-7 rounded-xl flex items-center justify-center transition-all shadow-sm border border-theme-glass/20", 
                          isExpanded ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-theme-glass",
                          CATEGORY_TEXT_COLORS[category]
                        )}>
                          {getCategoryIcon(category)}
                        </div>
                        <span className="truncate">{category}</span>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 transition-transform opacity-40", isExpanded ? "rotate-90" : "")} />
                    </motion.button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="space-y-2 overflow-hidden pl-3 pr-1 py-1"
                        >
                          {categorySkills.map((skill) => (
                            <motion.div
                              whileHover={{ x: 4 }}
                              whileTap={{ scale: 0.98 }}
                              key={skill.id}
                              onClick={() => {
                                setSelectedSkill(skill);
                                setActiveWorkflow(null);
                                activeWorkflowRef.current = null;
                                setWorkflowStepIndex(-1);
                                if (window.innerWidth < 768) setIsSidebarOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden text-[10px] font-black uppercase tracking-tighter border shadow-sm leading-none cursor-pointer",
                                selectedSkill?.id === skill.id 
                                  ? "bg-theme-glass border-theme-secondary/40 text-theme-primary shadow-md" 
                                  : "bg-theme-card/60 border-theme-glass text-theme-secondary hover:bg-theme-glass hover:text-theme-primary hover:border-theme-secondary/30"
                              )}
                            >
                              <div className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all overflow-hidden shrink-0 shadow-sm border border-theme-glass/20",
                                selectedSkill?.id === skill.id ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-theme-glass",
                                CATEGORY_TEXT_COLORS[category]
                              )}>
                                <AgentIcon agent={skill} size="sm" className="w-full h-full" />
                              </div>
                              <div className="flex flex-col items-start min-w-0 flex-1 justify-center">
                                <div className="flex items-center gap-1.5 w-full">
                                  <span className="truncate leading-none">{skill.name}</span>
                                  {skill.isGoogleAI && (
                                    <div className="px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-400 uppercase tracking-widest shrink-0 shadow-sm">
                                      AI
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const blob = new Blob([JSON.stringify(skill, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `agente-${skill.name.toLowerCase().replace(/\s+/g, '-')}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="p-1.5 hover:bg-theme-glass/80 rounded-lg text-theme-secondary hover:text-theme-primary transition-all shadow-sm"
                                  title="Exportar Agente"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                                {customSkills.some(s => s.id === skill.id) && (
                                  <>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingCustomAgent(skill);
                                        setIsCustomAgentModalOpen(true);
                                      }}
                                      className="p-1.5 hover:bg-theme-glass/80 rounded-lg text-theme-secondary hover:text-theme-primary transition-all shadow-sm"
                                    >
                                      <PenTool className="w-3 h-3" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteCustomAgent(skill.id);
                                      }}
                                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-theme-secondary hover:text-red-500 transition-all shadow-sm"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-theme-glass space-y-4 bg-theme-surface/50">
          <div className="flex items-center gap-3 p-3 bg-theme-glass rounded-2xl border border-theme-glass shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-theme-primary truncate">{user?.displayName || "Usuário"}</span>
              <span className="text-[10px] font-bold text-theme-secondary truncate">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn-secondary p-2 ml-auto text-rose-500 border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider">v2.1.0-PRO</span>
            <div className="flex gap-1.5">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-75" />
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-150" />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-auto min-h-20 py-4 md:py-0 glass-panel z-30 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 mb-4 shrink-0 transition-all duration-500 gap-4 md:gap-0 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-theme-blue/30 to-transparent" />
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="btn-secondary p-3 group"
                >
                  <Menu className="w-5 h-5 text-theme-secondary group-hover:text-theme-primary" />
                </button>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-theme-secondary mb-0.5">
                  <span className="hover:text-theme-primary transition-colors cursor-pointer">Dashboard</span>
                  <ChevronRight className="w-2.5 h-2.5 opacity-50" />
                  <span className="text-blue-400/80">{activeTab === 'chat' ? "Chat Intelligence" : "Operations"}</span>
                </div>
                <h1 className="text-sm font-bold tracking-tight flex items-center gap-2.5 text-theme-primary">
                  {activeTab === 'chat' ? (selectedSkill ? (selectedSkill.id === 'orchestrator' ? "Orquestrador de Enxame" : selectedSkill.name) : "Marketing Intelligence") : "CRM & Pipelines"}
                  {selectedSkill?.id === 'orchestrator' && (
                    <div className="flex items-center gap-1.5 ml-1">
                      <div className="px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-tighter">Swarm Active</div>
                    </div>
                  )}
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                </h1>
              </div>
            </div>
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden p-1 glass-card gap-1 border border-theme-glass/40 bg-theme-glass/30 shadow-lg">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-tight transition-all border border-transparent",
                  activeTab === 'chat' ? "bg-theme-blue/15 text-theme-primary border-theme-blue/30 shadow-md" : "text-theme-secondary hover:text-theme-primary"
                )}
              >
                Chat
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('operations')}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-tight transition-all border border-transparent",
                  activeTab === 'operations' ? "bg-theme-blue/15 text-theme-primary border-theme-blue/30 shadow-md" : "text-theme-secondary hover:text-theme-primary"
                )}
              >
                Ops
              </motion.button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto justify-center md:justify-end pb-2 md:pb-0">
            <div className="hidden md:flex p-1 gap-2 shrink-0">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('chat')}
                className={cn(
                  "chip",
                  activeTab === 'chat' && "chip-active"
                )}
              >
                Chat
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('operations')}
                className={cn(
                  "chip",
                  activeTab === 'operations' && "chip-active"
                )}
              >
                CRM & Pipelines
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('brain')}
                className={cn(
                  "chip",
                  activeTab === 'brain' && "chip-active"
                )}
              >
                Cérebro Sináptico
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('terminal')}
                className={cn(
                  "chip",
                  activeTab === 'terminal' && "chip-active"
                )}
              >
                Terminal
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab('workspace')}
                className={cn(
                  "chip",
                  activeTab === 'workspace' && "chip-active"
                )}
              >
                Workspace
              </motion.button>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-theme-glass mx-2 shrink-0" />
            <div className="shrink-0">
              <NotificationCenter />
            </div>
            <div className="h-8 w-[1px] bg-theme-glass mx-2 shrink-0" />
            <div className="shrink-0 flex items-center">
              <AgentControls
                selectedSkill={selectedSkill}
                useGrounding={useGrounding}
                setUseGrounding={setUseGrounding}
                useSwarmMode={useSwarmMode}
                setUseSwarmMode={setUseSwarmMode}
                activeCompanyId={activeCompanyId}
                companies={companies}
                setIsBrandContextModalOpen={setIsBrandContextModalOpen}
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
                manualAgentPriorities={manualAgentPriorities}
                setManualAgentPriorities={setManualAgentPriorities}
                allSkills={[...MARKETING_SKILLS, ...customSkills]}
                googleTokens={googleTokens}
                connectGoogleDrive={connectGoogleDrive}
              />
            </div>
          </div>
        </header>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Central Workspace */}
          <div className="flex-1 flex flex-col min-w-0 gap-4">
            <AnimatePresence mode="wait">
              {activeTab === 'operations' ? (
                <motion.div 
                  key="operations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-theme-blue/5 border border-theme-blue/20 rounded-2xl flex items-center gap-4 mb-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-theme-blue/10 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 text-theme-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black uppercase tracking-widest text-theme-blue mb-1">Dica de Operações</h4>
                      <p className="text-[11px] text-theme-secondary leading-relaxed">
                        Transforme suas tarefas em rotinas arrastando-as para os blocos de tempo. Isso ajuda a automatizar seu foco e garantir que nada seja esquecido.
                      </p>
                    </div>
                  </motion.div>
                  <TaskBoard allSkills={[...MARKETING_SKILLS, ...customSkills]} />
                  <RoutinePlanner />
                </motion.div>
              ) : activeTab === 'brain' ? (
                <motion.div 
                  key="brain"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col min-h-0 glass-panel overflow-hidden relative"
                >
                  <AgentBrain 
                    agent={selectedSkill} 
                    onClose={() => setActiveTab('chat')} 
                    isDarkMode={isDarkMode}
                    isIntegrated={true}
                  />
                </motion.div>
              ) : activeTab === 'terminal' ? (
                <motion.div 
                  key="terminal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col min-h-0 glass-panel overflow-hidden relative p-8 bg-[#050505] font-mono text-theme-emerald border border-theme-emerald/20 shadow-[inset_0_0_100px_rgba(16,185,129,0.05)]"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
                  <div className="flex items-center gap-3 mb-6 border-b border-theme-emerald/20 pb-6 relative z-10">
                    <Terminal className="w-6 h-6 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    <span className="text-xs font-black uppercase tracking-[0.4em]">Terminal de Execução do Enxame v2.2</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 text-[11px] relative z-10">
                    <div className="flex gap-3">
                      <span className="opacity-30 font-bold">17:43:52</span>
                      <span className="text-theme-blue font-black uppercase tracking-tighter">[SYS]</span>
                      <span className="opacity-80">Orquestrador inicializado com sucesso.</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="opacity-30 font-bold">17:43:53</span>
                      <span className="text-theme-purple font-black uppercase tracking-tighter">[SWARM]</span>
                      <span className="opacity-80">Aguardando diretrizes para processamento paralelo...</span>
                    </div>
                    <div className="flex gap-3">
                      <span className="opacity-30 font-bold">17:43:55</span>
                      <span className="text-theme-emerald font-black uppercase tracking-tighter">[BRAIN]</span>
                      <span className="opacity-80">Sincronização de memória concluída (42 nós ativos).</span>
                    </div>
                    <div className="animate-pulse text-theme-emerald/60">_</div>
                  </div>
                </motion.div>
              ) : activeTab === 'workspace' ? (
                <motion.div 
                  key="workspace"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col min-h-0 glass-panel overflow-hidden relative"
                >
                  <div className="h-20 border-b border-theme-glass flex items-center justify-between px-8 shrink-0 bg-theme-main/40 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-theme-blue rounded-2xl flex items-center justify-center shadow-[0_10px_25px_rgba(59,130,246,0.3)] border border-white/20">
                        <LayoutDashboard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black tracking-tighter uppercase text-base text-theme-primary italic">Estúdio de Artefatos</h3>
                        <p className="text-[9px] font-black text-theme-blue uppercase tracking-[0.3em] opacity-60">Workspace de Produção v2.2</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex min-h-0">
                    {/* Artifacts Sidebar */}
                    <div className="w-64 border-r border-theme-glass overflow-y-auto custom-scrollbar p-4 space-y-4 bg-theme-glass/5">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-2">Recentes</h4>
                      <div className="space-y-2">
                        {allArtifacts.length > 0 ? (
                          allArtifacts.map((art) => (
                            <button
                              key={art.id}
                              onClick={() => setActiveArtifact(art)}
                              className={cn(
                                "w-full p-3 rounded-xl text-left transition-all border group",
                                activeArtifact?.id === art.id 
                                  ? "bg-theme-blue/10 border-theme-blue/30 text-theme-blue" 
                                  : "bg-theme-glass border-theme-glass text-theme-secondary hover:bg-theme-glass/80"
                              )}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <FileText className="w-3 h-3 opacity-40" />
                                <span className="text-[8px] font-black uppercase tracking-widest">{art.type}</span>
                              </div>
                              <p className="text-[11px] font-bold truncate">{art.title}</p>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center space-y-2 opacity-20">
                            <FileText className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                              Nenhum artefato técnico nesta conversa
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                      {activeArtifact ? (
                        <div className="max-w-5xl mx-auto">
                          {activeArtifact.type === 'campaign' || activeArtifact.type === 'architecture' ? (
                            <CampaignAssetViewer artifact={activeArtifact} />
                          ) : (
                            <div className="space-y-8">
                              <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-theme-blue/20 text-theme-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-theme-blue/20">
                                      {activeArtifact.type}
                                    </span>
                                    <span className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">
                                      Gerado por {activeArtifact.agentName}
                                    </span>
                                  </div>
                                  <h2 className="text-4xl font-black tracking-tighter leading-tight italic text-theme-primary">
                                    {activeArtifact.title}
                                  </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => copyToClipboard(activeArtifact.content, activeArtifact.id)}
                                    className="p-4 bg-theme-surface border border-theme-glass rounded-2xl hover:bg-theme-glass transition-all active:scale-90 group/copy shadow-xl"
                                  >
                                    {copiedId === activeArtifact.id ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-theme-secondary group-hover/copy:text-theme-primary" />}
                                  </button>
                                </div>
                              </div>
                              
                              <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative"
                              >
                                <div className="bg-theme-surface border border-theme-glass rounded-3xl p-8 min-h-[600px] relative overflow-hidden shadow-2xl">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-theme-blue" />
                                  <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{activeArtifact.content}</ReactMarkdown>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                          <div className="w-24 h-24 bg-theme-glass rounded-[2rem] flex items-center justify-center border border-theme-glass shadow-inner">
                            <FileText className="w-12 h-12 text-theme-secondary opacity-20" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-black text-theme-secondary uppercase tracking-widest text-sm">Nenhum Artefato Ativo</h3>
                            <p className="text-xs font-medium text-theme-secondary opacity-40 max-w-[200px] leading-relaxed">
                              Selecione um artefato no chat ou na lista ao lado para visualizar.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col min-h-0 glass-panel overflow-hidden relative"
                >
                  {/* Active Agent Indicator */}
                  <AnimatePresence>
                    {activeAgentId && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                      >
                        <div className="bg-blue-600/90 backdrop-blur-md border border-blue-400/30 rounded-full px-4 py-2 flex items-center gap-3 shadow-[0_0_30px_rgba(37,99,235,0.4)]">
                          <div className="relative">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping absolute inset-0" />
                            <div className="w-2 h-2 bg-white rounded-full relative" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                            {activeAgentId === 'orchestrator' ? 'Orquestrador' : 
                             ([...MARKETING_SKILLS, ...customSkills].find(s => s.id === activeAgentId)?.name || activeAgentId)} está falando...
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {messages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-theme-blue to-theme-purple rounded-[2.5rem] flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(59,130,246,0.3)] animate-float border border-white/20">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-5xl font-black tracking-tighter mb-6 uppercase italic text-theme-primary drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                      Pronto para <span className="text-theme-blue">Escalar?</span>
                    </h2>
                    <p className="max-w-md text-theme-secondary text-[10px] font-black leading-relaxed mb-14 uppercase tracking-[0.4em] opacity-60">
                      Selecione um agente especialista na barra lateral ou comece um novo workflow para ver a mágica acontecer.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      {["Como aumentar meu ROI?", "Crie um Design System", "Analise meu anúncio", "Funil de Vendas SaaS"].map((q) => (
                        <button 
                          key={q}
                          onClick={() => setInput(q)}
                          className="px-8 py-4 bg-theme-card border border-theme-glass text-[10px] font-black uppercase tracking-widest hover:bg-theme-blue hover:text-white hover:border-theme-blue transition-all active:scale-95 shadow-xl rounded-2xl"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
                  >
                    {isPaginationLoading && (
                      <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-2 border-theme-glass border-t-theme-blue rounded-full animate-spin" />
                      </div>
                    )}
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
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center animate-pulse">
                          <Bot className="w-4 h-4 text-white/60" />
                        </div>
                        <div className="glass-card p-4 w-24 flex justify-center items-center gap-1">
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
                
                {/* Input Area */}
                <div className="relative p-4 border-t border-theme-glass bg-theme-main/20 backdrop-blur-xl">
                  {messages.length > 0 && !isLoading && (
                    <div className="absolute bottom-full right-4 mb-4 z-40">
                      <button
                        onClick={() => handleSend("A estratégia está consolidada. Por favor, gere os artefatos finais (arquivos, scripts, copies) usando o formato de artefato apropriado.")}
                        className="btn-primary shadow-lg flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Gerar Artefatos Finais
                      </button>
                    </div>
                  )}
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
                    useSwarmMode={useSwarmMode}
                  />
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Right Panel: AI Suggestions */}
          <aside className="w-80 glass-panel flex flex-col shrink-0 overflow-hidden hidden xl:flex">
            <AISuggestions />
          </aside>
        </div>

        {/* Workspace Panel Overlay removed and integrated into tabs */}
      </main>
        <BrandContextModal
          isOpen={isBrandContextModalOpen}
          onClose={() => setIsBrandContextModalOpen(false)}
          companies={companies}
          setCompanies={setCompanies}
          activeCompanyId={activeCompanyId}
          setActiveCompanyId={setActiveCompanyId}
        />

        <AnimatePresence>
          {isCustomAgentModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-2xl max-h-[90vh]"
              >
                <CustomAgentModal 
                  onClose={() => {
                    setIsCustomAgentModalOpen(false);
                    setEditingCustomAgent(null);
                  }} 
                  onSave={handleSaveCustomAgent}
                  initialAgent={editingCustomAgent || undefined}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm(prev => ({ ...prev, isOpen: false }))}
        onConfirm={deleteConfirm.type === 'single' ? confirmDeleteChat : confirmDeleteAllChats}
        title={deleteConfirm.type === 'single' ? "Excluir Conversa" : "Excluir Todo o Histórico"}
        message={deleteConfirm.type === 'single' 
          ? "Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita." 
          : "ATENÇÃO: Isso excluirá TODO o seu histórico de conversas permanentemente. Esta ação é irreversível. Continuar?"}
        confirmText="Excluir"
        variant="danger"
      />
    </div>
    </ErrorBoundary>
  );
}
