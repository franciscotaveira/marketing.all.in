/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ArtifactRenderer } from "./components/MarketingVisuals";
import { AgentBrain } from "./components/AgentBrain";
import { AgentControlPanel } from "./components/AgentControlPanel";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ChatMessage } from "./components/ChatMessage";
import { CustomAgentModal } from "./components/CustomAgentModal";
import { InputBar } from "./components/InputBar";
import { AgentControls } from "./components/AgentControls";
import { ChatHistory } from "./components/ChatHistory";
import { MARKETING_SKILLS, MARKETING_FRAMEWORKS, CATEGORY_COLORS, CATEGORY_TEXT_COLORS, CATEGORY_BG_LIGHT_COLORS } from "./constants";
import { MarketingSkill, SkillCategory, BrandProfile, Message, SkillTier, Artifact, BrainMemory } from "./types";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [activeAgents, setActiveAgents] = useState<{id: string, status: 'idle' | 'thinking' | 'using_tool', tool?: string}[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [brandProfiles, setBrandProfiles] = useState<BrandProfile[]>([]);
  const [activeBrandProfileId, setActiveBrandProfileId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<BrandProfile | null>(null);

  const activeBrandProfile = brandProfiles.find(p => p.id === activeBrandProfileId) || {
    id: "",
    name: "",
    audience: "",
    tone: "",
    messaging: "",
    productDetails: "",
    competitors: "",
    dataSources: ""
  };
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [useGrounding, setUseGrounding] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
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

  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageConfig, setImageConfig] = useState({ aspectRatio: "1:1", size: "1K" });
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
        const profiles = await firebaseService.getBrandProfiles();
        if (profiles.data) {
          setBrandProfiles(profiles.data);
          if (profiles.data.length > 0) {
            setActiveBrandProfileId(profiles.data[0].id || null);
          }
        }
        
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
      setBrandProfiles([]);
      setActiveBrandProfileId(null);
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

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerateImage = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setIsGeneratingImage(true);
    try {
      const imageUrl = await gemini.generateImage(input, { 
        aspectRatio: imageConfig.aspectRatio, 
        imageSize: imageConfig.size 
      });
      
      if (imageUrl) {
        const artifact: Artifact = {
          id: Math.random().toString(36).substr(2, 9),
          type: "visual",
          title: `Imagem: ${input.slice(0, 20)}...`,
          content: imageUrl,
          agentName: "Diretor Criativo",
          metadata: { imageUrl }
        };
        setActiveArtifact(artifact);
        setIsWorkspaceOpen(true);
        const aiMsg: Omit<Message, 'createdAt'> = { 
          role: "ai", 
          content: "Aqui está o criativo visual que desenvolvi para sua campanha.",
          agentName: "Diretor Criativo",
          agentTier: SkillTier.CREATIVE,
          artifacts: [artifact]
        };
        setMessages(prev => [...prev, aiMsg as Message]);
        firebaseService.saveMessage("default", aiMsg);
      }
    } catch (error) {
      console.error("Image Gen Error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Erro ao gerar imagem. Verifique se você tem uma chave de API válida para o modelo de imagem." }]);
    } finally {
      setIsLoading(false);
      setIsGeneratingImage(false);
      setInput("");
    }
  };

  const handleGenerateVideo = async () => {
    if (!input.trim() && selectedImages.length === 0 || isLoading) return;
    setIsLoading(true);
    setIsGeneratingVideo(true);
    try {
      const videoUrl = await gemini.generateVideo(input, selectedImages[0]);
      if (videoUrl) {
        const artifact: Artifact = {
          id: Math.random().toString(36).substr(2, 9),
          type: "visual",
          title: `Vídeo: ${input.slice(0, 20)}...`,
          content: "Vídeo gerado com Veo 3.1",
          agentName: "Produtor de Mídia",
          metadata: { videoUrl }
        };
        setActiveArtifact(artifact);
        setIsWorkspaceOpen(true);
        const aiMsg: Omit<Message, 'createdAt'> = { 
          role: "ai", 
          content: "Aqui está o vídeo generativo que criei para sua estratégia.",
          agentName: "Produtor de Mídia",
          agentTier: SkillTier.CREATIVE,
          artifacts: [artifact]
        };
        setMessages(prev => [...prev, aiMsg as Message]);
        firebaseService.saveMessage("default", aiMsg);
      }
    } catch (error) {
      console.error("Video Gen Error:", error);
      setMessages(prev => [...prev, { role: "ai", content: "Erro ao gerar vídeo. Certifique-se de que o modelo Veo está disponível e configurado." }]);
    } finally {
      setIsLoading(false);
      setIsGeneratingVideo(false);
      setInput("");
    }
  };

  const handleTTS = async (text: string) => {
    setIsSpeaking(true);
    try {
      const audioUrl = await gemini.generateSpeech(text);
      if (audioUrl) {
        const artifact: Artifact = {
          id: Math.random().toString(36).substr(2, 9),
          type: "visual",
          title: "Narração de IA",
          content: "Áudio gerado com Gemini 2.5 TTS",
          agentName: "Especialista em Humanização",
          metadata: { audioUrl }
        };
        setActiveArtifact(artifact);
        setIsWorkspaceOpen(true);
      }
    } catch (error) {
      console.error("TTS Error:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const COMMANDS = [
    { id: 'imagem', label: 'Gerar Imagem', icon: ImageIcon, action: () => { handleGenerateImage(); setInput(""); setShowCommandMenu(false); } },
    { id: 'video', label: 'Gerar Vídeo', icon: Video, action: () => { handleGenerateVideo(); setInput(""); setShowCommandMenu(false); } },
    { id: 'pesquisa', label: 'Alternar Pesquisa', icon: Globe, action: () => { setUseGrounding(!useGrounding); setInput(""); setShowCommandMenu(false); } },
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
    setIsLoading(true);

    try {
      const brandContext = activeBrandProfile.name 
        ? `\n\nPerfil da Marca:\n- Nome: ${activeBrandProfile.name}\n- Público: ${activeBrandProfile.audience}\n- Tom: ${activeBrandProfile.tone}\n- Mensagem: ${activeBrandProfile.messaging}\n- Detalhes: ${activeBrandProfile.productDetails}\n- Concorrentes: ${activeBrandProfile.competitors}${activeBrandProfile.dataSources ? `\n\nFONTES DE DADOS E INTEGRAÇÕES:\n${activeBrandProfile.dataSources}` : ''}`
        : "";

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

      const prompt = `Solicitação do Usuário: ${userMessage}${skillContext}${brandContext}${frameworkContext}${brainContext}`;

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

      const systemInstruction = `Você é o Engenheiro de Automação de elite. 
      ${selectedSkill ? `Atualmente, você está assumindo a persona de: ${selectedSkill.persona} (${selectedSkill.name}).` : "Você está atuando como Engenheiro de Automação Geral."}
      
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
        setIsProcessing(true);
        const result = await orchestrateRequest(
          prompt,
          selectedSkill?.id || null,
          false,
          model,
          systemInstruction,
          useGrounding,
          (id, status, tool) => {
            setActiveAgents(prev => {
              const filtered = prev.filter(a => a.id !== id);
              return [...filtered, { id, status, tool }];
            });
          },
          addLog,
          currentImages,
          messages
        );
        setIsProcessing(false);
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

      // Process visual and video artifacts
      for (const artifact of artifacts) {
        if (artifact.type === 'visual' && !artifact.metadata?.imageUrl && !artifact.metadata?.videoUrl) {
          addLog("system", `Gerando imagem para o artefato: ${artifact.title}...`, "action");
          try {
            const imageUrl = await gemini.generateImage(artifact.content, { 
              aspectRatio: imageConfig.aspectRatio, 
              imageSize: imageConfig.size 
            });
            if (imageUrl) {
              artifact.metadata = { ...artifact.metadata, imageUrl };
              artifact.content = imageUrl;
              addLog("system", `Imagem gerada com sucesso.`, "success");
            }
          } catch (err) {
            addLog("system", `Erro ao gerar imagem: ${err}`, "error");
          }
        } else if (artifact.type === 'video' && !artifact.metadata?.videoUrl) {
          addLog("system", `Gerando vídeo para o artefato: ${artifact.title}...`, "action");
          try {
            const videoUrl = await gemini.generateVideo(artifact.content, currentImages[0]);
            if (videoUrl) {
              artifact.metadata = { ...artifact.metadata, videoUrl };
              artifact.content = "Vídeo gerado com sucesso.";
              addLog("system", `Vídeo gerado com sucesso.`, "success");
            }
          } catch (err) {
            addLog("system", `Erro ao gerar vídeo: ${err}`, "error");
          }
        }
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

  const handleSaveBrandProfile = async () => {
    if (!editingProfile) return;
    
    const result = await firebaseService.saveBrandProfile(editingProfile);
    if (result.data) {
      const savedProfile = result.data;
      setBrandProfiles(prev => {
        const exists = prev.find(p => p.id === savedProfile.id);
        if (exists) {
          return prev.map(p => p.id === savedProfile.id ? savedProfile : p);
        }
        return [...prev, savedProfile];
      });
      setActiveBrandProfileId(savedProfile.id || null);
      setEditingProfile(null);
    }
  };

  const handleDeleteBrandProfile = async (id: string) => {
    const result = await firebaseService.deleteBrandProfile(id);
    if (!result.error) {
      setBrandProfiles(prev => prev.filter(p => p.id !== id));
      if (activeBrandProfileId === id) {
        setActiveBrandProfileId(null);
      }
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
        onClick={() => setActiveTooltip(null)}
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
          <AgentControlPanel activeAgents={activeAgents} />
          {/* Global Toggles */}
          <div className="space-y-3">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 px-2">Configurações</h2>
            <div className="space-y-1.5">
              <div className="space-y-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">Configurações de Imagem</p>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    value={imageConfig.aspectRatio}
                    onChange={(e) => setImageConfig(prev => ({ ...prev, aspectRatio: e.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-lg p-1.5 text-[9px] text-white/60 outline-none"
                  >
                    <option value="1:1">1:1 Quadrado</option>
                    <option value="16:9">16:9 Widescreen</option>
                    <option value="9:16">9:16 Retrato</option>
                    <option value="4:3">4:3 Foto</option>
                    <option value="21:9">21:9 Ultra</option>
                  </select>
                  <select 
                    value={imageConfig.size}
                    onChange={(e) => setImageConfig(prev => ({ ...prev, size: e.target.value }))}
                    className="bg-black/40 border border-white/10 rounded-lg p-1.5 text-[9px] text-white/60 outline-none"
                  >
                    <option value="1K">Qualidade 1K</option>
                    <option value="2K">Qualidade 2K</option>
                    <option value="4K">Qualidade 4K</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setIsBrainOpen(true)}
                className="w-full p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/20 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4" />
                  <span>Cérebro Sináptico</span>
                </div>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Framework Selector */}
          <div className="space-y-3">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30 px-2">Framework</h2>
            <div className="grid grid-cols-1 gap-1.5">
              {MARKETING_FRAMEWORKS.map((framework) => (
                <button 
                  key={framework.id}
                  onClick={() => setSelectedFramework(selectedFramework === framework.id ? null : framework.id)}
                  className={cn(
                    "p-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between group border",
                    selectedFramework === framework.id 
                      ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{framework.name}</span>
                    <span className={cn(
                      "text-[8px] opacity-50 truncate font-medium mt-0.5",
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
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-black text-white/30">Agentes Especialistas</h2>
            <button 
              onClick={() => setIsCustomAgentModalOpen(true)}
              className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
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
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all",
                    isExpanded ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center transition-colors", 
                      isExpanded ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-white/5",
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
                            if (window.innerWidth < 768) setIsSidebarOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative overflow-hidden text-sm",
                            selectedSkill?.id === skill.id 
                              ? "bg-white/10 text-white shadow-[0_2px_10px_rgba(255,255,255,0.05)]" 
                              : "hover:bg-white/5 text-white/70 hover:text-white"
                          )}
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center transition-all",
                            selectedSkill?.id === skill.id ? CATEGORY_BG_LIGHT_COLORS[category] : "bg-white/5 group-hover:bg-white/10",
                            CATEGORY_TEXT_COLORS[category]
                          )}>
                            {getCategoryIcon(skill.category)}
                          </div>
                          <div className="flex flex-col items-start min-w-0">
                            <span className="font-medium truncate w-full">{skill.name}</span>
                            <span className="text-[10px] opacity-60 font-medium truncate w-full uppercase tracking-tight">{skill.persona}</span>
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

        <div className="p-4 border-t border-white/5 space-y-3 bg-black/40 backdrop-blur-xl">
          <button 
            onClick={() => setIsBrandModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group shadow-inner"
          >
            <Settings className="w-4 h-4 text-white/40 group-hover:text-white transition-colors group-hover:rotate-90 duration-500" />
            <span className="text-[11px] font-black uppercase tracking-[0.1em]">Configurar Marca</span>
            {activeBrandProfile.name && <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />}
          </button>

          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-black text-white text-[10px] shadow-lg">
              {user?.displayName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] font-black text-white truncate">{user?.displayName || "Usuário"}</span>
              <span className="text-[8px] font-bold text-white/30 truncate">{user?.email}</span>
            </div>
            <div className="relative group/btn ml-auto">
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-rose-500"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-full right-0 mb-2 hidden group-hover/btn:block w-32 p-2 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed text-center border border-white/10">
                <strong className="block text-rose-400 mb-1">Sair</strong>
                Encerrar a sessão atual.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">v2.1.0-PRO-MAX</span>
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
        <header className="min-h-[4rem] py-3 bg-white/70 backdrop-blur-2xl border-b border-black/5 flex flex-col md:flex-row items-start md:items-center justify-between px-4 md:px-6 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)] gap-4 md:gap-0">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-all active:scale-95 group shadow-sm bg-white border border-black/5"
              >
                <Menu className="w-5 h-5 text-black/60 group-hover:text-black" />
              </button>
            )}
            <button
              onClick={() => setIsChatHistoryOpen(true)}
              className="p-2 md:p-2.5 hover:bg-black/5 rounded-xl transition-all active:scale-95 group shadow-sm bg-white border border-black/5 hidden md:block"
            >
              <History className="w-5 h-5 text-black/60 group-hover:text-black" />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/40 mb-1">
                <button 
                  onClick={() => {
                    setSelectedSkill(null);
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
                ) : null}
              </div>
              <h1 className="text-sm font-black uppercase tracking-[0.15em] text-black/80 flex items-center gap-2">
                {selectedSkill ? selectedSkill.name : "Inteligência de Marketing"}
                <button 
                  onClick={() => setMessages([])}
                  className="text-[8px] font-black uppercase tracking-widest text-black/30 hover:text-red-500 transition-colors ml-4"
                >
                  Limpar Conversa
                </button>
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              </h1>
              <p className="text-[10px] text-black/40 font-bold uppercase tracking-tighter">
                {selectedSkill ? selectedSkill.persona : "Selecione uma habilidade para começar"}
              </p>
            </div>
          </div>

          <AgentControls
            selectedSkill={selectedSkill}
            useGrounding={useGrounding}
            setUseGrounding={setUseGrounding}
            setIsBrainOpen={setIsBrainOpen}
            isWorkspaceOpen={isWorkspaceOpen}
            setIsWorkspaceOpen={setIsWorkspaceOpen}
            isTerminalOpen={isTerminalOpen}
            setIsTerminalOpen={setIsTerminalOpen}
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

        {/* Brand Modal */}
        <AnimatePresence>
          {isBrandModalOpen && (
            <motion.div 
              key="brand-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.2)] w-full max-w-2xl overflow-hidden border border-black/5"
              >
                <div className="p-6 md:p-8 border-b border-black/5 flex items-center justify-between bg-black text-white">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                      <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-xs md:text-sm uppercase tracking-widest">
                        {editingProfile ? 'Editar Perfil Estratégico' : 'Perfis de Marca'}
                      </h3>
                      <p className="text-[8px] md:text-[9px] font-black text-white/40 uppercase tracking-tighter">
                        {editingProfile ? 'Contexto para os Agentes' : 'Gerencie suas empresas'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    {editingProfile && (
                      <button 
                        onClick={() => setEditingProfile(null)}
                        className="px-3 py-2 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-[9px] md:text-[10px] font-black uppercase tracking-wider"
                      >
                        Voltar
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setIsBrandModalOpen(false);
                        setEditingProfile(null);
                      }}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>
                </div>
                
                {!editingProfile ? (
                  <div className="p-6 md:p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-black/50">Seus Perfis</h4>
                      <button
                        onClick={() => setEditingProfile({
                          id: "", name: "", audience: "", tone: "", messaging: "", productDetails: "", competitors: "", dataSources: ""
                        })}
                        className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-[10px] font-black uppercase tracking-wider w-full sm:w-auto"
                      >
                        <Plus className="w-3 h-3" />
                        Novo Perfil
                      </button>
                    </div>
                    
                    {brandProfiles.length === 0 ? (
                      <div className="text-center py-12 bg-black/5 rounded-3xl border border-black/5 border-dashed">
                        <Target className="w-12 h-12 text-black/20 mx-auto mb-4" />
                        <p className="text-sm font-medium text-black/40">Nenhum perfil de marca criado ainda.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {brandProfiles.map(profile => (
                          <div 
                            key={profile.id} 
                            className={cn(
                              "p-4 md:p-6 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between group gap-4",
                              activeBrandProfileId === profile.id 
                                ? "bg-blue-50 border-blue-200 shadow-sm" 
                                : "bg-white border-black/5 hover:border-black/10 hover:shadow-md"
                            )}
                          >
                            <div className="flex items-center gap-3 md:gap-4">
                              <div className={cn(
                                "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-base md:text-lg shrink-0",
                                activeBrandProfileId === profile.id ? "bg-blue-600 text-white" : "bg-black/5 text-black/40"
                              )}>
                                {profile.name.charAt(0).toUpperCase() || "B"}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-black truncate">{profile.name || "Perfil sem nome"}</h5>
                                <p className="text-xs text-black/50 line-clamp-1">{profile.audience || "Público não definido"}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity w-full sm:w-auto justify-end">
                              {activeBrandProfileId !== profile.id && (
                                <button
                                  onClick={() => setActiveBrandProfileId(profile.id || null)}
                                  className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-105 transition-transform text-center"
                                >
                                  Selecionar
                                </button>
                              )}
                              {activeBrandProfileId === profile.id && (
                                <span className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1">
                                  <Check className="w-3 h-3" /> Ativo
                                </span>
                              )}
                              <button
                                onClick={() => setEditingProfile(profile)}
                                className="p-2.5 sm:p-2 bg-black/5 hover:bg-black/10 text-black/60 rounded-xl transition-colors shrink-0"
                                title="Editar"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => profile.id && handleDeleteBrandProfile(profile.id)}
                                className="p-2.5 sm:p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors shrink-0"
                                title="Excluir"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="p-6 md:p-10 space-y-6 md:space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Nome da Marca</label>
                          <input 
                            type="text" 
                            value={editingProfile.name}
                            onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                            placeholder="ex: Acme SaaS"
                            className="w-full p-4 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Público-Alvo</label>
                          <input 
                            type="text"
                            value={editingProfile.audience}
                            onChange={(e) => setEditingProfile({...editingProfile, audience: e.target.value})}
                            placeholder="ex: Gerentes de marketing..."
                            className="w-full p-4 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Tom de Voz</label>
                        <input 
                          type="text" 
                          value={editingProfile.tone}
                          onChange={(e) => setEditingProfile({...editingProfile, tone: e.target.value})}
                          placeholder="ex: Profissional, autoritário, mas acessível"
                          className="w-full p-4 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Mensagem Principal</label>
                        <textarea 
                          value={editingProfile.messaging}
                          onChange={(e) => setEditingProfile({...editingProfile, messaging: e.target.value})}
                          placeholder="ex: Ajudamos equipes a automatizar fluxos de marketing..."
                          className="w-full p-4 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium min-h-[100px] resize-none transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Detalhes do Produto/Serviço</label>
                        <textarea 
                          value={editingProfile.productDetails}
                          onChange={(e) => setEditingProfile({...editingProfile, productDetails: e.target.value})}
                          placeholder="Descreva o que você vende, preços, diferenciais..."
                          className="w-full p-4 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium min-h-[100px] resize-none transition-all"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Concorrentes</label>
                        <input 
                          type="text"
                          value={editingProfile.competitors}
                          onChange={(e) => setEditingProfile({...editingProfile, competitors: e.target.value})}
                          placeholder="ex: Empresa A, Empresa B..."
                          className="w-full p-4 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          Fontes de Dados & Integrações (Links, APIs, Documentos)
                        </label>
                        <textarea 
                          value={editingProfile.dataSources || ""}
                          onChange={(e) => setEditingProfile({...editingProfile, dataSources: e.target.value})}
                          placeholder="Cole aqui links do Google Drive, NotebookLM, sites, documentação de API (ex: API do sistema de agendamento), ou qualquer outra fonte de dados que o Enxame deva consultar."
                          className="w-full p-4 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium min-h-[120px] resize-none transition-all font-mono"
                        />
                      </div>
                    </div>
                    <div className="p-6 md:p-8 bg-black/5 border-t border-black/5 flex justify-end gap-3">
                      <button 
                        onClick={handleSaveBrandProfile}
                        className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
                      >
                        Salvar Perfil Estratégico
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
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
                    <p className="text-xl text-black/40 max-w-2xl mx-auto font-medium leading-relaxed">
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
                        className="p-8 bg-white border border-black/5 rounded-[2rem] shadow-sm space-y-5 group transition-all hover:shadow-xl"
                      >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", item.color)}>
                          {item.icon}
                        </div>
                        <h3 className="font-black uppercase tracking-widest text-xs text-black/80">{item.title}</h3>
                        <p className="text-sm text-black/40 leading-relaxed font-medium">
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
                        className="px-6 py-3 bg-white border border-black/5 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm hover:shadow-xl active:scale-95"
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
                  isSpeaking={isSpeaking}
                  copiedId={copiedId}
                  onArtifactClick={handleArtifactClick}
                  onTTSClick={handleTTS}
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
              handleGenerateImage={handleGenerateImage}
              handleGenerateVideo={handleGenerateVideo}
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
                className="absolute bottom-24 left-4 right-4 md:left-8 md:right-auto md:w-96 h-64 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 font-mono overflow-hidden"
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
                      <div key={log.id} className="text-[10px] flex gap-2">
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
                className="absolute md:relative inset-0 md:inset-auto w-full md:w-1/2 border-l border-black/5 bg-[#F8F9FA] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-40"
              >
                <div className="h-20 border-b border-black/5 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black tracking-tighter uppercase text-sm text-black/90">Estúdio de Artefatos</h3>
                      <p className="text-[9px] font-black text-black/30 uppercase tracking-widest">Espaço de Trabalho de Produção</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsWorkspaceOpen(false)}
                    className="p-3 hover:bg-black/5 rounded-2xl transition-all active:scale-90"
                  >
                    <X className="w-6 h-6 text-black/40" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
                  {activeArtifact ? (
                    <div className="space-y-10 max-w-3xl mx-auto">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                              {activeArtifact.type}
                            </span>
                            <span className="text-[9px] font-black text-black/20 uppercase tracking-widest">
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
                            className="p-4 bg-white border border-black/5 rounded-2xl hover:bg-black hover:text-white transition-all shadow-sm active:scale-90 group/copy"
                          >
                            {copiedId === activeArtifact.id ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-black/40 group-hover/copy:text-white" />}
                          </button>
                        </div>
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-black/5 border border-black/5 min-h-[600px] relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                        <ArtifactRenderer artifact={activeArtifact} />
                      </motion.div>
                      
                      <div className="flex items-center justify-center gap-4 py-8 border-t border-black/5">
                        <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.4em]">Fim do Documento • UI/UX Pro Max v2.1</p>
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
