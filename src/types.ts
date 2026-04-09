export enum SkillCategory {
  CRO = "Conversion Optimization",
  CONTENT = "Content & Copy",
  SEO = "SEO & Discovery",
  PAID = "Paid & Distribution",
  MEASUREMENT = "Measurement & Testing",
  RETENTION = "Retention",
  GROWTH = "Growth Engineering",
  STRATEGY = "Strategy & Monetization",
  SALES = "Sales & RevOps",
  HUMANIZATION = "Humanization & Empathy",
  AI_ENGINEERING = "AI Engineering & LLMs",
  MEDIA_PRODUCTION = "Generative Media & Creative AI",
  RESEARCH = "Deep Research & Intelligence",
  OPERATIONS = "Operations & Productivity",
}

export enum SkillTier {
  COORDINATION = "1. Estratégia & Coordenação",
  INTELLIGENCE = "2. Inteligência & Pesquisa",
  CREATIVE = "3. Criativo & Conteúdo",
  PERFORMANCE = "4. Performance & Distribuição",
  OPERATIONS = "5. Operações & Mensuração",
}

export interface MarketingSkill {
  id: string;
  name: string;
  category: SkillCategory;
  tier: SkillTier;
  persona: string;
  description: string;
  prompt: string;
  model?: string;
  tools?: string[]; // IDs das ferramentas que este agente pode usar
  isGoogleAI?: boolean; // Se o agente utiliza tecnologias específicas do Google AI
}



export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  context: string;
  website?: string;
  industry?: string;
  targetAudience?: string;
  toneOfVoice?: string;
  brandValues?: string[];
  primaryGoals?: string[];
  createdAt?: any;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agentId: string;
  frameworkId?: string;
  instruction: string;
}

export interface Workflow {
  id: string;
  name: string;
  category: string;
  color: string;
  description: string;
  initialPrompt: string;
  steps: WorkflowStep[];
}

export interface Message {
  role: "user" | "ai";
  content: string;
  agentName?: string;
  agentTier?: SkillTier;
  images?: string[]; // base64 encoded images
  artifacts?: Artifact[];
  dataPoints?: DataPoint[]; // For charts
}

export interface DataPoint {
  name: string;
  value: number;
  label?: string;
  color?: string;
}



export interface Artifact {
  id: string;
  title: string;
  type: "copy" | "plan" | "code" | "data" | "script" | "campaign" | "research" | "automation" | "architecture" | "n8n";
  content: string;
  agentName: string;
  metadata?: {
    chartType?: "bar" | "line" | "pie";
    dataPoints?: DataPoint[];
    campaignTimeline?: { date: string; task: string; status: string }[];
    colors?: { name: string; hex: string; variable: string }[];
    typography?: { name: string; usage: string; size: string }[];
    spacing?: { name: string; size: string; value: string }[];
    researchFindings?: { topic: string; insight: string; confidence: number }[];
    automationWorkflow?: { step: string; action: string; tool: string }[];
    architectureNodes?: { id: string; label: string; type: string }[];
    architectureLinks?: { source: string; target: string; label: string }[];
    videoUrl?: string;
    audioUrl?: string;
    imageUrl?: string;
    groundingMetadata?: any;
    grids?: { label: string; value: string }[];
    imagePrompt?: string;
    assets?: {
      id: string;
      type: 'image' | 'video' | 'document';
      url: string;
      thumbnail?: string;
      title: string;
      description?: string;
    }[];
  };
}

export interface KnowledgeItem {
  id: string;
  agentId: string;
  topic: string;
  content: string;
  confidence: number;
  tags: string[];
  createdAt?: string;
}

export interface BrainNode {
  id: string;
  label: string;
  type: "concept" | "campaign" | "metric" | "agent";
  val: number;
  color?: string;
}

export interface BrainLink {
  source: string;
  target: string;
  strength: number;
}

export interface BrainMemory {
  id: string;
  agentId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  roi?: number;
  embedding?: number[]; // Adicionado para RAG
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  tags?: string[];
  image?: string;
  assignedTo?: string;
  reminderAt?: any;
  dueDate?: any;
  createdAt: any;
  updatedAt?: any;
  routineId?: string; // ID da rotina vinculada
}

export interface Routine {
  id: string;
  title: string;
  frequency: "daily" | "weekly" | "monthly";
  startTime: string;
  endTime: string;
  days: string[];
  agentId?: string; // Agente responsável pela execução automática
  lastExecutedAt?: any; // Timestamp da última execução
  createdAt: any;
  updatedAt?: any;
}

export interface BrandPersona {
  name: string;
  tagline: string;
  toneOfVoice: {
    traits: string[];
    description: string;
  };
  targetAudience: {
    segments: string[];
    description: string;
  };
  differentiation: {
    points: string[];
    description: string;
  };
  values: string[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error" | "task";
  read: boolean;
  createdAt: any;
  metadata?: any;
}
