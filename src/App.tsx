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
import Logo from "./components/Logo";
import { ConfirmationModal } from "./components/ConfirmationModal";
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
  const [customSkills, setCustomSkills] = useState<MarketingSkill[]>([]);
  const [isCustomAgentModalOpen, setIsCustomAgentModalOpen] = useState(false);
  const [editingCustomAgent, setEditingCustomAgent] = useState<MarketingSkill | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<SkillCategory | null>(null);
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
          [...MARKETING_SKILLS, ...customSkills],
          [],
          []
        );

        const aiResponse = result.response;
        setActiveAgentId(null);
        
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
          setActiveTab('workspace');
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
      const model = selectedSkill?.model || "gemini-3.1-pro-preview";
      
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
        setActiveTab('workspace');
      }

      const aiMsg: Omit<Message, 'createdAt'> = { 
        role: "ai", 
        content: aiResponse.replace(artifactRegex, '> *Artefato gerado: $2*'),
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
            <X className="w-5 h-5 text-theme-secondary opacity-40" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">

          {/* Sidebar */}
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

          {/* Global Toggles */}
          <div className="h-px bg-gradient-to-r from-transparent via-theme-glass to-transparent opacity-50" />

          {/* Workflows */}
          <div className="space-y-4">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-theme-secondary/50 px-2 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500/50" />
              Workflows Automatizados
            </h2>
            <div className="space-y-6">
              {Object.entries(
                WORKFLOWS.reduce((acc, wf) => {
                  if (!acc[wf.category]) acc[wf.category] = [];
                  acc[wf.category].push(wf);
                  return acc;
                }, {} as Record<string, Workflow[]>)
              ).map(([category, workflows]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <div className={cn("w-1 h-1 rounded-full", workflows[0].color)} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary/40">{category}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {workflows.map((workflow) => (
                      <motion.button 
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        key={workflow.id}
                        onClick={() => handleStartWorkflow(workflow)}
                        className={cn(
                          "p-3 rounded-xl text-sm font-medium transition-all text-left flex items-center justify-between group border relative overflow-hidden",
                          activeWorkflow?.id === workflow.id
                            ? cn(workflow.color, "border-white/20 text-white shadow-md") 
                            : "bg-theme-glass border-theme-glass text-theme-secondary hover:bg-theme-glass/80 hover:text-theme-primary"
                        )}
                      >
                        <div className="flex flex-col min-w-0 relative z-10">
                          <span className="truncate">{workflow.name}</span>
                          <span className={cn(
                            "text-[11px] opacity-60 truncate font-medium mt-0.5 tracking-tight",
                            activeWorkflow?.id === workflow.id ? "text-white/90" : "text-theme-secondary"
                          )}>{workflow.description}</span>
                        </div>
                        <div className="relative z-10">
                          {activeWorkflow?.id === workflow.id ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-theme-glass to-transparent opacity-50" />

          {/* Framework Selector */}
          <div className="space-y-3">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-theme-secondary/50 px-2">Framework</h2>
            <div className="grid grid-cols-1 gap-1.5">
              {MARKETING_FRAMEWORKS.map((framework) => (
                <motion.button 
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  key={framework.id}
                  onClick={() => setSelectedFramework(selectedFramework === framework.id ? null : framework.id)}
                  className={cn(
                    "p-3 rounded-xl text-sm font-medium transition-all text-left flex items-center justify-between group border",
                    selectedFramework === framework.id 
                      ? "bg-blue-500 border-blue-500 text-white shadow-sm" 
                      : "bg-theme-glass border-theme-glass text-theme-secondary hover:bg-theme-glass/80 hover:text-theme-primary"
                  )}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{framework.name}</span>
                    <span className={cn(
                      "text-[11px] opacity-70 truncate font-medium mt-0.5 tracking-tight",
                      selectedFramework === framework.id ? "text-blue-50" : ""
                    )}>{framework.description}</span>
                  </div>
                  {selectedFramework === framework.id && <Check className="w-3.5 h-3.5" />}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-theme-glass to-transparent opacity-50" />

          {/* Skill Categories */}
          <div className="flex items-center justify-between px-2 mb-3">
            <h2 className="text-[11px] uppercase tracking-wider font-bold text-theme-secondary/50 flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
              Agentes Especialistas
            </h2>
            <button 
              onClick={() => setIsCustomAgentModalOpen(true)}
              className="btn-secondary p-1.5"
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
                <motion.button
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all border",
                    isExpanded 
                      ? "bg-theme-glass border-theme-glass text-theme-primary shadow-sm" 
                      : "bg-transparent border-transparent text-theme-secondary hover:text-theme-primary hover:bg-theme-glass/50 hover:border-theme-glass"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-colors", 
                      isExpanded ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-theme-glass",
                      CATEGORY_TEXT_COLORS[category]
                    )}>
                      {getCategoryIcon(category)}
                    </div>
                    {category}
                  </div>
                  <ChevronRight className={cn("w-3.5 h-3.5 transition-transform opacity-40", isExpanded ? "rotate-90" : "")} />
                </motion.button>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {categorySkills.map((skill) => (
                        <motion.button
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
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden text-sm font-bold border",
                            selectedSkill?.id === skill.id 
                              ? "bg-theme-glass border-theme-glass text-theme-primary shadow-sm" 
                              : "bg-transparent border-transparent hover:bg-theme-glass/50 text-theme-secondary hover:text-theme-primary hover:border-theme-glass"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                            selectedSkill?.id === skill.id ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-theme-glass",
                            CATEGORY_TEXT_COLORS[category]
                          )}>
                            {getCategoryIcon(skill.category)}
                          </div>
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 w-full">
                              <span className="truncate">{skill.name}</span>
                              {skill.isGoogleAI && (
                                <div className="px-1 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20 text-[7px] font-black text-blue-400 uppercase tracking-tighter shrink-0">
                                  Google AI
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] opacity-60 font-medium truncate w-full tracking-tight">{skill.persona}</span>
                          </div>
                          {customSkills.some(s => s.id === skill.id) && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCustomAgent(skill);
                                  setIsCustomAgentModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-theme-glass/80 rounded-lg text-theme-secondary hover:text-theme-primary transition-all"
                                title="Editar Agente"
                              >
                                <PenTool className="w-3 h-3" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomAgent(skill.id);
                                }}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-theme-secondary hover:text-red-500 transition-all"
                                title="Excluir Agente"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          {selectedSkill?.id === skill.id && (
                            <motion.div 
                              layoutId="active-pill"
                              className={cn("absolute left-0 top-0 bottom-0 w-0.5", CATEGORY_COLORS[category])}
                            />
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-theme-glass space-y-4 bg-theme-surface/50">
          <div className="flex items-center gap-3 p-3 bg-theme-glass rounded-2xl border border-theme-glass shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-bold text-theme-primary truncate">{user?.displayName || "Usuário"}</span>
              <span className="text-[10px] font-bold text-theme-secondary opacity-40 truncate">{user?.email}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn-secondary p-2 ml-auto text-rose-500 border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider opacity-40">v2.1.0-PRO</span>
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
        <header className="h-auto min-h-20 py-4 md:py-0 glass-panel z-30 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 mb-4 shrink-0 transition-all duration-500 gap-4 md:gap-0">
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
                  {activeTab === 'chat' ? (selectedSkill ? (selectedSkill.id === 'orchestrator' ? "Orquestrador de Enxame" : selectedSkill.name) : "Marketing Intelligence") : "Gestão de Operações"}
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
                Gestão de Operações
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
                      <p className="text-[11px] text-theme-secondary opacity-60 leading-relaxed">
                        Transforme suas tarefas em rotinas arrastando-as para os blocos de tempo. Isso ajuda a automatizar seu foco e garantir que nada seja esquecido.
                      </p>
                    </div>
                  </motion.div>
                  <TaskBoard />
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
                  className="flex-1 flex flex-col min-h-0 glass-panel overflow-hidden relative p-6 bg-black font-mono text-emerald-500"
                >
                  <div className="flex items-center gap-2 mb-4 border-b border-emerald-500/20 pb-4">
                    <Terminal className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Terminal de Execução do Enxame v2.2</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 text-[11px]">
                    <div className="flex gap-2">
                      <span className="opacity-40">[17:43:52]</span>
                      <span className="text-blue-400">SYS:</span>
                      <span>Orquestrador inicializado com sucesso.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="opacity-40">[17:43:53]</span>
                      <span className="text-purple-400">SWARM:</span>
                      <span>Aguardando diretrizes para processamento paralelo...</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="opacity-40">[17:43:55]</span>
                      <span className="text-emerald-400">BRAIN:</span>
                      <span>Sincronização de memória concluída (42 nós ativos).</span>
                    </div>
                    <div className="animate-pulse">_</div>
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
                  <div className="h-20 border-b border-theme-glass flex items-center justify-between px-8 shrink-0 bg-theme-glass/20">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-theme-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <LayoutDashboard className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-black tracking-tighter uppercase text-sm text-theme-primary">Estúdio de Artefatos</h3>
                        <p className="text-[10px] font-black text-theme-blue uppercase tracking-widest">Workspace de Produção</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {activeArtifact ? (
                      <div className="space-y-8 max-w-3xl mx-auto">
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
                          <button 
                            onClick={() => copyToClipboard(activeArtifact.content, activeArtifact.id)}
                            className="p-4 bg-theme-surface border border-theme-glass rounded-2xl hover:bg-theme-glass transition-all active:scale-90 group/copy shadow-xl"
                          >
                            {copiedId === activeArtifact.id ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-theme-secondary group-hover/copy:text-theme-primary" />}
                          </button>
                        </div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-theme-surface border border-theme-glass rounded-3xl p-8 min-h-[600px] relative overflow-hidden shadow-2xl"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-theme-blue" />
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{activeArtifact.content}</ReactMarkdown>
                          </div>
                        </motion.div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                        <div className="w-24 h-24 bg-theme-glass rounded-[2rem] flex items-center justify-center border border-theme-glass shadow-inner">
                          <FileText className="w-12 h-12 text-theme-secondary opacity-20" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-black text-theme-secondary uppercase tracking-widest text-sm">Nenhum Artefato Ativo</h3>
                          <p className="text-xs font-medium text-theme-secondary opacity-40 max-w-[200px] leading-relaxed">
                            Selecione um artefato no chat para visualizar e editar aqui.
                          </p>
                        </div>
                      </div>
                    )}
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
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20 animate-float">
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase italic text-theme-primary">
                      Pronto para <span className="text-blue-400">Escalar?</span>
                    </h2>
                    <p className="max-w-md text-theme-secondary text-sm font-medium leading-relaxed mb-12 uppercase tracking-widest">
                      Selecione um agente especialista na barra lateral ou comece um novo workflow para ver a mágica acontecer.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {["Como aumentar meu ROI?", "Crie um Design System", "Analise meu anúncio", "Funil de Vendas SaaS"].map((q) => (
                        <button 
                          key={q}
                          onClick={() => setInput(q)}
                          className="px-6 py-3 glass-card text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
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
