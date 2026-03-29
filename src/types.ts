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
}

export enum SkillTier {
  COORDINATION = "Coordenação",
  INTELLIGENCE = "Inteligência",
  CREATIVE = "Criativo",
  PERFORMANCE = "Performance",
  OPERATIONS = "Operações",
}

export interface MarketingSkill {
  id: string;
  name: string;
  category: SkillCategory;
  tier: SkillTier;
  persona: string;
  description: string;
  prompt: string;
  model?: string; // Adicionado
}

export interface BrandProfile {
  id: string;
  name: string;
  audience: string;
  tone: string;
  messaging: string;
  productDetails: string;
  competitors: string;
  dataSources?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
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

export interface FunnelStep {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export type SocialPlatform = "instagram" | "linkedin" | "tiktok" | "facebook" | "twitter";

export interface Artifact {
  id: string;
  title: string;
  type: "copy" | "plan" | "code" | "data" | "script" | "visual" | "video" | "campaign" | "funnel" | "social" | "design-system" | "research" | "automation" | "architecture" | "n8n";
  content: string;
  agentName: string;
  metadata?: {
    funnelSteps?: FunnelStep[];
    socialPlatform?: SocialPlatform;
    socialHandle?: string;
    socialImage?: string;
    chartType?: "bar" | "line" | "pie";
    dataPoints?: DataPoint[];
    campaignTimeline?: { date: string; task: string; status: string }[];
    colors?: { name: string; hex: string; variable: string }[];
    typography?: { name: string; size: string; weight: string; family: string }[];
    spacing?: { name: string; size: string; value: string }[];
    researchFindings?: { topic: string; insight: string; confidence: number }[];
    automationWorkflow?: { step: string; action: string; tool: string }[];
    architectureNodes?: { id: string; label: string; type: string }[];
    architectureLinks?: { source: string; target: string; label: string }[];
    videoUrl?: string;
    audioUrl?: string;
    imageUrl?: string;
    groundingMetadata?: any;
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
