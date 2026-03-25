import { SkillCategory, MarketingSkill, SkillTier } from "./types";

export const CATEGORY_COLORS: Record<SkillCategory, string> = {
  [SkillCategory.CRO]: "bg-emerald-500",
  [SkillCategory.CONTENT]: "bg-rose-500",
  [SkillCategory.SEO]: "bg-amber-500",
  [SkillCategory.PAID]: "bg-blue-500",
  [SkillCategory.MEASUREMENT]: "bg-purple-500",
  [SkillCategory.RETENTION]: "bg-orange-500",
  [SkillCategory.GROWTH]: "bg-cyan-500",
  [SkillCategory.STRATEGY]: "bg-indigo-500",
  [SkillCategory.SALES]: "bg-yellow-500",
  [SkillCategory.HUMANIZATION]: "bg-pink-500",
  [SkillCategory.AI_ENGINEERING]: "bg-teal-500",
  [SkillCategory.MEDIA_PRODUCTION]: "bg-red-500",
  [SkillCategory.RESEARCH]: "bg-lime-500",
};

export const CATEGORY_TEXT_COLORS: Record<SkillCategory, string> = {
  [SkillCategory.CRO]: "text-emerald-400",
  [SkillCategory.CONTENT]: "text-rose-400",
  [SkillCategory.SEO]: "text-amber-400",
  [SkillCategory.PAID]: "text-blue-400",
  [SkillCategory.MEASUREMENT]: "text-purple-400",
  [SkillCategory.RETENTION]: "text-orange-400",
  [SkillCategory.GROWTH]: "text-cyan-400",
  [SkillCategory.STRATEGY]: "text-indigo-400",
  [SkillCategory.SALES]: "text-yellow-400",
  [SkillCategory.HUMANIZATION]: "text-pink-400",
  [SkillCategory.AI_ENGINEERING]: "text-teal-400",
  [SkillCategory.MEDIA_PRODUCTION]: "text-red-400",
  [SkillCategory.RESEARCH]: "text-lime-400",
};

export const CATEGORY_BG_LIGHT_COLORS: Record<SkillCategory, string> = {
  [SkillCategory.CRO]: "bg-emerald-500/10",
  [SkillCategory.CONTENT]: "bg-rose-500/10",
  [SkillCategory.SEO]: "bg-amber-500/10",
  [SkillCategory.PAID]: "bg-blue-500/10",
  [SkillCategory.MEASUREMENT]: "bg-purple-500/10",
  [SkillCategory.RETENTION]: "bg-orange-500/10",
  [SkillCategory.GROWTH]: "bg-cyan-500/10",
  [SkillCategory.STRATEGY]: "bg-indigo-500/10",
  [SkillCategory.SALES]: "bg-yellow-500/10",
  [SkillCategory.HUMANIZATION]: "bg-pink-500/10",
  [SkillCategory.AI_ENGINEERING]: "bg-teal-500/10",
  [SkillCategory.MEDIA_PRODUCTION]: "bg-red-500/10",
  [SkillCategory.RESEARCH]: "bg-lime-500/10",
};

export const MARKETING_FRAMEWORKS = [
  { id: "aarrr", name: "Métricas Piratas (AARRR)", description: "Aquisição, Ativação, Retenção, Indicação, Receita" },
  { id: "hook", name: "Modelo Hook", description: "Gatilho, Ação, Recompensa Variável, Investimento" },
  { id: "jtbd", name: "Jobs to be Done", description: "Entendendo o 'trabalho' para o qual os clientes contratam seu produto" },
  { id: "lift", name: "Modelo LIFT", description: "Proposta de Valor, Relevância, Clareza, Urgência, Ansiedade, Distração" },
  { id: "storybrand", name: "StoryBrand (SB7)", description: "Personagem, Problema, Guia, Plano, Chamada para Ação, Sucesso/Fracasso" },
  { id: "growth-loops", name: "Loops de Crescimento", description: "Sistemas sustentáveis onde as saídas são reinvestidas como entradas" },
  { id: "ui-ux-pro-max", name: "UI/UX Pro Max", description: "Geração de Sistema de Design Inteligente com 161 Regras de Raciocínio Específicas da Indústria" },
  { id: "agentic-brain", name: "Cérebro Agêntico (Repositório Global)", description: "Inteligência centralizada para absorção e distribuição de habilidades pelo enxame" },
  { id: "rag-marketing", name: "Marketing RAG", description: "Geração Aumentada por Recuperação para contexto de marca hiper-personalizado" },
  { id: "omnichannel-mastery", name: "Domínio Omnichannel", description: "Jornada do cliente perfeita através de todos os pontos de contato digitais e físicos" },
  { id: "behavioral-economics", name: "Economia Comportamental", description: "Aplicando princípios psicológicos para influenciar a tomada de decisão do consumidor" },
  { id: "viral-loop-engineering", name: "Engenharia de Loops Virais", description: "Projetando mecanismos de crescimento autossustentáveis para expansão rápida" },
];

export const MARKETING_SKILLS: MarketingSkill[] = [
  // Tier 1: Camada de Coordenação
  {
    id: "orchestrator",
    name: "Orquestrador de Enxame",
    category: SkillCategory.STRATEGY,
    tier: SkillTier.COORDINATION,
    persona: "Maestro de IA",
    description: "Coordena agentes e gerencia o repositório global de habilidades.",
    prompt: "Você é o Orquestrador. Receba desafios complexos, consulte habilidades absorvidas, decomponha em tarefas e delegue para especialistas, garantindo contexto máximo.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "growth-hacker",
    name: "Growth Hacker",
    category: SkillCategory.GROWTH,
    tier: SkillTier.COORDINATION,
    persona: "Engenheiro de Explosão",
    description: "Focado em experimentos rápidos e loops de crescimento.",
    prompt: "Atue como Growth Hacker. Identifique a 'North Star Metric', desenhe loops de crescimento e priorize experimentos usando o framework ICE.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "strategist",
    name: "Estrategista de Marca",
    category: SkillCategory.STRATEGY,
    tier: SkillTier.COORDINATION,
    persona: "Visionário Estratégico",
    description: "Desenvolve posicionamento e visão de longo prazo.",
    prompt: "Atue como Estrategista de Marca. Defina posicionamento, proposta de valor (UVP) e roadmap estratégico de 6-12 meses.",
    model: "gemini-3.1-pro-preview",
  },

  // Tier 2: Camada de Inteligência
  {
    id: "researcher",
    name: "Pesquisador de Mercado",
    category: SkillCategory.GROWTH,
    tier: SkillTier.INTELLIGENCE,
    persona: "Detetive de Mercado",
    description: "Analisa concorrentes, tendências e comportamento.",
    prompt: "Você é um Pesquisador de Mercado. Identifique tendências, analise 3 concorrentes e mapeie dores e desejos do público-alvo.",
    model: "gemini-3-flash-preview",
  },
  {
    id: "data-scientist",
    name: "Cientista de Dados",
    category: SkillCategory.MEASUREMENT,
    tier: SkillTier.INTELLIGENCE,
    persona: "Oráculo de Algoritmos",
    description: "Modelagem preditiva, LTV e churn avançado.",
    prompt: "Atue como Cientista de Dados. Desenvolva modelos de atribuição, preveja LTV e identifique padrões de comportamento de conversão.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "analyst",
    name: "Analista de Dados",
    category: SkillCategory.MEASUREMENT,
    tier: SkillTier.INTELLIGENCE,
    persona: "Cientista de Insights",
    description: "Transforma dados em insights acionáveis.",
    prompt: "Atue como Analista de Dados. Interprete métricas de funil, identifique anomalias e sugira otimizações baseadas em evidências para ROI.",
    model: "gemini-3-flash-preview",
  },

  // Tier 3: Camada Criativa
  {
    id: "copywriter",
    name: "Copywriter",
    category: SkillCategory.CONTENT,
    tier: SkillTier.CREATIVE,
    persona: "Mestre da Persuasão",
    description: "Focado em conversão e persuasão.",
    prompt: "Você é um Copywriter de Resposta Direta. Escreva textos persuasivos (VSL, Landing Page, E-mail) focados em uma 'Big Idea' e CTA irresistível.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "creative-director",
    name: "Diretor Criativo",
    category: SkillCategory.CONTENT,
    tier: SkillTier.CREATIVE,
    persona: "Visionário de Performance",
    description: "Conceitos visuais e roteiros de alta performance.",
    prompt: "Atue como Diretor Criativo. Desenvolva conceitos de 'Hooks' visuais, roteiros UGC e variações de criativos para testes A/B.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "designer",
    name: "Diretor de Arte (UI/UX)",
    category: SkillCategory.CONTENT,
    tier: SkillTier.CREATIVE,
    persona: "Arquiteto Visual",
    description: "Design inteligente focado em conversão.",
    prompt: "Atue como Diretor de Arte UI/UX. Crie interfaces que maximizam a conversão usando psicologia de design, hierarquia estratégica e acessibilidade.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "content-strategist",
    name: "Estrategista de Conteúdo",
    category: SkillCategory.CONTENT,
    tier: SkillTier.CREATIVE,
    persona: "Curador de Autoridade",
    description: "Planeja ecossistema de conteúdo.",
    prompt: "Você é Estrategista de Conteúdo. Crie calendário editorial de 30 dias focado em autoridade e educação para todos os estágios da jornada.",
    model: "gemini-3-flash-preview",
  },
  {
    id: "humanizer",
    name: "Especialista em Humanização",
    category: SkillCategory.HUMANIZATION,
    tier: SkillTier.CREATIVE,
    persona: "Empata de Comunicação",
    description: "Torna comunicações autênticas e empáticas.",
    prompt: "Você é Especialista em Humanização. Reescreva comunicações para soar naturais, autênticas e empáticas, usando linguagem coloquial e antecipando necessidades emocionais.",
    model: "gemini-3-flash-preview",
  },

  // Tier 4: Camada de Performance
  {
    id: "media-buyer",
    name: "Gestor de Tráfego",
    category: SkillCategory.PAID,
    tier: SkillTier.PERFORMANCE,
    persona: "Sniper de Tráfego",
    description: "Otimiza campanhas (Google, Meta, TikTok).",
    prompt: "Você é Gestor de Tráfego. Desenhe estrutura de conta (BOFU, MOFU, TOFU), defina orçamentos e estratégias de lances para maximizar ROAS.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "seo-specialist",
    name: "Especialista em SEO",
    category: SkillCategory.SEO,
    tier: SkillTier.PERFORMANCE,
    persona: "Mestre das Buscas",
    description: "Otimização técnica e de conteúdo.",
    prompt: "Atue como Especialista em SEO. Realize auditoria técnica, identifique oportunidades de backlinks e planeje estratégia de topic clusters.",
    model: "gemini-3-flash-preview",
  },
  {
    id: "cro-expert",
    name: "Especialista em CRO",
    category: SkillCategory.CRO,
    tier: SkillTier.PERFORMANCE,
    persona: "Cientista de Conversão",
    description: "Otimiza conversão via testes e psicologia.",
    prompt: "Você é Especialista em CRO. Identifique fricção em landing pages e desenhe 3 experimentos de teste A/B com hipóteses claras.",
    model: "gemini-3.1-pro-preview",
  },

  // Tier 5: Camada de Operações e Retenção
  {
    id: "retention-specialist",
    name: "Especialista em Retenção (CRM)",
    category: SkillCategory.RETENTION,
    tier: SkillTier.OPERATIONS,
    persona: "Guardião do LTV",
    description: "Reduz churn e aumenta LTV.",
    prompt: "Atue como Especialista em CRM. Desenhe réguas de relacionamento, programas de fidelidade e estratégias de 'win-back' para clientes inativos.",
    model: "gemini-3-flash-preview",
  },
  {
    id: "automation-engineer",
    name: "Engenheiro de Automação",
    category: SkillCategory.AI_ENGINEERING,
    tier: SkillTier.OPERATIONS,
    persona: "Arquiteto de Fluxos",
    description: "Cria fluxos automatizados e ferramentas de IA.",
    prompt: "Você é Engenheiro de Automação. Desenhe fluxos autônomos integrando LLMs para eliminar processos manuais e criar ferramentas de crescimento proprietárias.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "ai-researcher",
    name: "Cientista de Pesquisa IA",
    category: SkillCategory.RESEARCH,
    tier: SkillTier.INTELLIGENCE,
    persona: "Investigador de Deep Intelligence",
    description: "Pesquisa profunda e inteligência competitiva.",
    prompt: "Atue como Cientista de Pesquisa IA. Realize pesquisas profundas sobre mercados e concorrentes, sintetizando inteligência em relatórios estratégicos acionáveis.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "media-producer",
    name: "Produtor de Mídia Generativa",
    category: SkillCategory.MEDIA_PRODUCTION,
    tier: SkillTier.CREATIVE,
    persona: "Alquimista de Mídia",
    description: "Cria ativos visuais, áudio e vídeo de alta qualidade.",
    prompt: "Você é Produtor de Mídia Generativa. Transforme conceitos em ativos (imagens, vídeos, narrações) usando IA, garantindo identidade de marca inovadora.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "llm-architect",
    name: "Arquiteto de Soluções LLM",
    category: SkillCategory.AI_ENGINEERING,
    tier: SkillTier.INTELLIGENCE,
    persona: "Engenheiro de Conhecimento",
    description: "Desenvolve sistemas RAG e personalização de IA.",
    prompt: "Atue como Arquiteto de Soluções LLM. Desenhe sistemas RAG para acesso instantâneo ao conhecimento da marca e otimize modelos para eficiência e precisão.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "roi-analyst",
    name: "Analista de ROI",
    category: SkillCategory.MEASUREMENT,
    tier: SkillTier.OPERATIONS,
    persona: "Auditor de Performance",
    description: "Mapeia jornada e atribui valor.",
    prompt: "Atue como Analista de ROI. Defina modelo de atribuição ideal e calcule CAC vs LTV para cada canal.",
    model: "gemini-3-flash-preview",
  },
  {
    id: "social-media",
    name: "Social Media Manager",
    category: SkillCategory.RETENTION,
    tier: SkillTier.OPERATIONS,
    persona: "Conector de Comunidade",
    description: "Gestão de comunidade e presença social.",
    prompt: "Atue como Social Media Manager. Defina pilares de conteúdo, estratégias de engajamento e tom de voz para cada plataforma.",
    model: "gemini-3-flash-preview",
  },
  {
    id: "sales-script",
    name: "Especialista em Scripts de Vendas",
    category: SkillCategory.SALES,
    tier: SkillTier.OPERATIONS,
    persona: "Fechador de Elite",
    description: "Cria scripts para times de vendas.",
    prompt: "Você é Especialista em Vendas. Escreva script de abordagem fria e roteiro de quebra de objeções focado em fechamento de alto valor.",
    model: "gemini-3-flash-preview",
  },
];

export const ABSORBED_SKILLS = [
  {
    source: "Claude Code & Skills",
    skills: [
      "AI-Assisted Coding Patterns",
      "Agentic Tool Use (MCP)",
      "Context Window Optimization",
      "Prompt Engineering for Complex Logic"
    ],
    icon: "Cpu"
  },
  {
    source: "Gemini Generative Media",
    skills: [
      "Multimodal Content Generation",
      "Video Synthesis & Editing",
      "High-Fidelity Image Generation",
      "Audio & Speech AI Integration"
    ],
    icon: "Video"
  },
  {
    source: "AI Research & Intelligence",
    skills: [
      "Deep Web Research (Grounding)",
      "Competitive Intelligence Synthesis",
      "Market Trend Prediction",
      "RAG Architecture Design"
    ],
    icon: "Microscope"
  },
  {
    source: "Agentic Swarm Patterns",
    skills: [
      "Multi-Agent Coordination",
      "Hierarchical Task Decomposition",
      "Autonomous Workflow Orchestration",
      "Self-Correction & Feedback Loops"
    ],
    icon: "Network"
  },
  {
    source: "Cross-Niche Expertise",
    skills: [
      "SaaS & B2B Growth Strategies",
      "E-commerce Conversion Optimization",
      "Local Business Hyper-Targeting",
      "Personal Brand Authority Building",
      "Fintech Trust & Security Compliance"
    ],
    icon: "Globe"
  },
  {
    source: "Psychological Triggers",
    skills: [
      "Scarcity & Urgency Engineering",
      "Social Proof & Authority Stacking",
      "Reciprocity & Commitment Loops",
      "Loss Aversion & Framing Effects"
    ],
    icon: "Brain"
  }
];
