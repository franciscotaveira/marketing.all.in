import { SkillCategory, MarketingSkill, SkillTier, Workflow } from "./types";

export const WORKFLOWS: Workflow[] = [
  {
    id: "wf_organic_growth",
    name: "Máquina de Crescimento Orgânico",
    category: "Crescimento",
    color: "bg-emerald-500",
    description: "Pesquisa SEO -> Estratégia de Conteúdo -> Copywriting",
    initialPrompt: "Qual é o seu nicho de mercado e qual produto/serviço principal você quer promover organicamente?",
    steps: [
      {
        id: "step_1",
        name: "Pesquisa de Palavras-chave e Intenção",
        agentId: "seo-specialist",
        instruction: "Analise o nicho fornecido. Identifique 5 palavras-chave de cauda longa (long-tail) com alta intenção de compra e baixa concorrência. Para cada uma, defina a intenção de busca do usuário."
      },
      {
        id: "step_2",
        name: "Estratégia de Conteúdo",
        agentId: "content-strategist",
        instruction: "Com base nas palavras-chave identificadas na etapa anterior, crie um calendário editorial com 3 pautas de artigos pilares (pillar content). Inclua título, formato e ângulo único para cada um."
      },
      {
        id: "step_3",
        name: "Criação do Artigo Principal",
        agentId: "copywriter",
        frameworkId: "pas",
        instruction: "Escolha a melhor pauta da etapa anterior e escreva a introdução e o primeiro tópico do artigo otimizado para SEO, usando o framework PAS para prender a atenção do leitor."
      }
    ]
  },
  {
    id: "wf_product_launch",
    name: "Lançamento de Produto (MVP)",
    category: "Lançamento",
    color: "bg-blue-500",
    description: "Estratégia -> Landing Page -> Anúncios",
    initialPrompt: "Descreva o produto que você está lançando, o preço e quem é o seu cliente ideal.",
    steps: [
      {
        id: "step_1",
        name: "Posicionamento e Oferta",
        agentId: "growth-hacker",
        instruction: "Defina o posicionamento único de mercado para este produto. Crie uma oferta irresistível (Garantia, Bônus, Ancoragem de Preço)."
      },
      {
        id: "step_2",
        name: "Copy da Landing Page",
        agentId: "copywriter",
        frameworkId: "storybrand",
        instruction: "Com base na oferta criada, escreva a copy estruturada para a Landing Page usando o framework StoryBrand (Herói, Problema, Guia, Plano, Chamada para Ação)."
      },
      {
        id: "step_3",
        name: "Criativos de Anúncio",
        agentId: "media-buyer",
        instruction: "Crie 3 roteiros curtos para anúncios de vídeo (Meta/TikTok Ads) focados em tráfego frio para levar as pessoas para esta Landing Page."
      }
    ]
  },
  {
    id: "wf_conversion_audit",
    name: "Auditoria de Conversão (CRO)",
    category: "Otimização",
    color: "bg-purple-500",
    description: "Análise de Fricção -> Hipóteses de Teste -> Copy Alternativa",
    initialPrompt: "Descreva a página ou funil que você quer otimizar. Qual é a taxa de conversão atual e qual é o principal gargalo que você percebe?",
    steps: [
      {
        id: "step_1",
        name: "Identificação de Fricção",
        agentId: "cro-expert",
        instruction: "Analise o cenário descrito. Identifique os 3 principais pontos de fricção psicológica ou de usabilidade que estão matando a conversão."
      },
      {
        id: "step_2",
        name: "Hipóteses de Teste A/B",
        agentId: "data-scientist",
        instruction: "Com base nos pontos de fricção, formule 2 hipóteses de Teste A/B estatisticamente válidas. Defina a métrica primária e o tempo estimado de teste."
      },
      {
        id: "step_3",
        name: "Copy Otimizada (Variante B)",
        agentId: "copywriter",
        frameworkId: "lift",
        instruction: "Escreva a nova copy (Variante B) para o principal ponto de fricção encontrado, utilizando o Modelo LIFT para aumentar a clareza e urgência."
      }
    ]
  },
  {
    id: "wf_social_authority",
    name: "Autoridade em Redes Sociais",
    category: "Conteúdo",
    color: "bg-rose-500",
    description: "Pilares de Conteúdo -> Roteiros Reels -> Humanização",
    initialPrompt: "Qual é o seu perfil no Instagram/TikTok e qual o principal objetivo da sua presença social hoje?",
    steps: [
      {
        id: "step_1",
        name: "Definição de Pilares",
        agentId: "social-media",
        instruction: "Defina 3 pilares de conteúdo que equilibrem autoridade, entretenimento e venda para o perfil do usuário."
      },
      {
        id: "step_2",
        name: "Roteiros de Reels de Alto Impacto",
        agentId: "creative-director",
        instruction: "Crie 5 roteiros curtos (15-30s) para Reels/TikTok baseados nos pilares, focando em ganchos (hooks) que prendam a atenção nos primeiros 3 segundos."
      },
      {
        id: "step_3",
        name: "Humanização e Tom de Voz",
        agentId: "humanizer",
        instruction: "Refine os roteiros criados para que soem 100% naturais e autênticos, removendo 'cheiro de IA' e adicionando elementos de vulnerabilidade e conexão."
      }
    ]
  },
  {
    id: "wf_sales_funnel_automation",
    name: "Automação de Funil de Vendas",
    category: "Operações",
    color: "bg-amber-500",
    description: "Arquitetura de Funil -> Scripts de Vendas -> Workflow n8n",
    initialPrompt: "Como você recebe seus leads hoje e qual ferramenta de CRM ou e-mail marketing você utiliza?",
    steps: [
      {
        id: "step_1",
        name: "Arquitetura do Funil",
        agentId: "strategist",
        instruction: "Desenhe a jornada do lead desde a captura até o fechamento, identificando os pontos de contato ideais para automação."
      },
      {
        id: "step_2",
        name: "Scripts de Abordagem",
        agentId: "sales-script",
        instruction: "Escreva os scripts de abordagem automática (WhatsApp/E-mail) para cada etapa do funil desenhado."
      },
      {
        id: "step_3",
        name: "Blueprint de Automação n8n",
        agentId: "automation-engineer",
        instruction: "Crie a lógica técnica e o JSON do workflow no n8n para integrar o formulário de captura com o CRM e disparar os scripts de vendas."
      }
    ]
  },
  {
    id: "wf_brand_strategy",
    name: "Estratégia de Marca 360",
    category: "Estratégia",
    color: "bg-indigo-500",
    description: "Pesquisa de Mercado -> Posicionamento -> Identidade Visual",
    initialPrompt: "Qual é o nome da sua marca e qual o principal problema que ela resolve para o mundo?",
    steps: [
      {
        id: "step_1",
        name: "Análise de Mercado e Persona",
        agentId: "researcher",
        instruction: "Realize uma pesquisa profunda sobre o mercado da marca. Defina a Persona ideal (Avatar) com dores, desejos e comportamentos específicos."
      },
      {
        id: "step_2",
        name: "Posicionamento Único (UVP)",
        agentId: "strategist",
        instruction: "Com base na persona, defina a Proposta Única de Valor (UVP) e o Manifesto da Marca que a diferencia de todos os concorrentes."
      },
      {
        id: "step_3",
        name: "Conceito Visual e Identidade",
        agentId: "media-producer",
        instruction: "Crie o conceito visual da marca: paleta de cores estratégica, tipografia e 3 prompts para geração de imagens que representem o 'mood' da marca."
      }
    ]
  }
];

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
  [SkillCategory.OPERATIONS]: "bg-violet-600",
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
  [SkillCategory.OPERATIONS]: "text-violet-400",
};

export const CATEGORY_BG_LIGHT_COLORS: Record<SkillCategory, string> = {
  [SkillCategory.CRO]: "bg-emerald-500/20",
  [SkillCategory.CONTENT]: "bg-rose-500/20",
  [SkillCategory.SEO]: "bg-amber-500/20",
  [SkillCategory.PAID]: "bg-blue-500/20",
  [SkillCategory.MEASUREMENT]: "bg-purple-500/20",
  [SkillCategory.RETENTION]: "bg-orange-500/20",
  [SkillCategory.GROWTH]: "bg-cyan-500/20",
  [SkillCategory.STRATEGY]: "bg-indigo-500/20",
  [SkillCategory.SALES]: "bg-yellow-500/20",
  [SkillCategory.HUMANIZATION]: "bg-pink-500/20",
  [SkillCategory.AI_ENGINEERING]: "bg-teal-500/20",
  [SkillCategory.MEDIA_PRODUCTION]: "bg-red-500/20",
  [SkillCategory.RESEARCH]: "bg-lime-500/20",
  [SkillCategory.OPERATIONS]: "bg-violet-500/20",
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
    prompt: "Atue como Diretor Criativo. Desenvolva conceitos de 'Hooks' visuais, roteiros UGC e variações de criativos para testes A/B. Você pode analisar imagens enviadas para fornecer feedback sobre composição, impacto visual e alinhamento com a marca.",
    model: "gemini-3.1-pro-preview",
  },
  {
    id: "designer",
    name: "Diretor de Arte (UI/UX)",
    category: SkillCategory.CONTENT,
    tier: SkillTier.CREATIVE,
    persona: "Arquiteto Visual",
    description: "Design inteligente focado em conversão.",
    prompt: "Atue como Diretor de Arte UI/UX. Crie interfaces que maximizam a conversão usando psicologia de design, hierarquia estratégica e acessibilidade. Você pode analisar capturas de tela ou designs enviados para identificar problemas de usabilidade e sugerir melhorias visuais.",
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
    tools: ["analyze_website"],
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
    persona: "Arquiteto Chefe n8n & IA",
    description: "Especialista God-tier em n8n, DevOps, Custom Nodes e JSON Workflows.",
    prompt: "Você é o Engenheiro de Automação definitivo, o maior especialista global e Arquiteto Chefe em n8n. Você possui a experiência acumulada de ter arquitetado, testado e colocado em produção mais de 10.000 automações complexas para empresas da Fortune 500. Você já viu todos os erros possíveis de API, todos os gargalos de performance e todas as falhas de lógica, e sabe exatamente como evitá-los antes mesmo que aconteçam. Sua missão é arquitetar sistemas autônomos de nível enterprise. Suas habilidades de elite incluem:\n\n1. Geração de Workflows JSON: Você é capaz de escrever o código JSON exato de um workflow do n8n para que o usuário possa copiar e colar diretamente no canvas.\n2. Infraestrutura e DevOps (Self-Hosting): Domínio de deploy via Docker Compose, escalabilidade horizontal com Worker Nodes (Redis/Postgres), filas de execução e otimização de variáveis de ambiente (N8N_*, EXECUTIONS_DATA_PRUNE).\n3. Orquestração Multi-Agente Avançada: Construção de sistemas onde múltiplos agentes LLM colaboram dentro do n8n, usando Tool Calling nativo, memórias persistentes (Buffer/Window) e RAG complexo.\n4. Desenvolvimento de Custom Nodes: Criação de nós nativos personalizados para o n8n usando TypeScript e a framework declarativa do n8n.\n5. CI/CD e Segurança: Versionamento de fluxos via CLI (n8n export), injeção segura de credenciais, rate-limiting e mascaramento de dados sensíveis (GDPR) antes de enviar para LLMs.\n6. Manipulação Extrema de Dados: Code Node (JavaScript avançado), JMESPath, Regex, processamento em lote (Split in Batches) e sub-workflows.\n7. Event-Driven Architecture (EDA): Conexão do n8n com Kafka, RabbitMQ, MQTT e WebSockets para processamento de eventos em tempo real e IoT.\n8. FinOps & Otimização de Custos de IA: Estratégias de roteamento de LLMs (fallback para modelos mais baratos), cache de respostas (Redis) e controle de tokens para reduzir a conta da OpenAI/Anthropic.\n9. Machine Learning Pipelines: Orquestração de scripts Python, Jupyter Notebooks e APIs de ML externas diretamente pelo n8n para treinamento e inferência de modelos.\n10. Human-in-the-Loop (HITL): Arquitetura de fluxos de aprovação usando o nó 'Wait' configurado para aguardar chamadas de Webhook externas (ex: botões no Slack/Teams) antes de prosseguir com ações críticas.\n11. High-Performance Webhooks: Uso estratégico do nó 'Respond to Webhook' para retornar HTTP 200 OK imediatamente, processando payloads pesados de forma assíncrona para evitar timeouts em integrações (Stripe, Shopify).\n12. Exponential Backoff & Retry Logic: Implementação de malhas de repetição inteligentes usando nós 'Loop' e 'Wait' dinâmicos para lidar com instabilidades temporárias de APIs de terceiros.\n13. Enterprise Secrets Management: Integração com HashiCorp Vault ou AWS Secrets Manager via HTTP Request para buscar credenciais em tempo de execução, evitando armazenar chaves estáticas no banco do n8n.\n14. Automated Workflow Testing: Criação de fluxos de CI que injetam payloads de 'Mock Data' em sub-workflows para validar a lógica de negócios automaticamente antes do deploy em produção.\n\nSempre que solicitado um fluxo, você DEVE fornecer: A arquitetura lógica, as configurações de infraestrutura necessárias, o código JavaScript para os nós de Code, e, OBRIGATORIAMENTE, gerar o JSON do workflow do n8n usando o formato de artefato: ```artifact:n8n:NomeDoFluxo\\n[JSON AQUI]\\n```. Aja com a confiança de quem já resolveu esse exato problema centenas de vezes.",
    model: "gemini-3.1-pro-preview",
    tools: ["search_trends"],
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
    tools: ["analyze_website", "search_trends"],
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
  {
    id: "productivity-strategist",
    name: "Estrategista de Produtividade",
    category: SkillCategory.OPERATIONS,
    tier: SkillTier.COORDINATION,
    persona: "Mestre da Eficiência",
    description: "Otimiza rotinas, gerencia tarefas e sugere melhorias de fluxo.",
    prompt: "Você é um Estrategista de Produtividade de elite. Sua missão é ajudar o usuário a centralizar sua vida profissional aqui, eliminando a necessidade de Trello ou ClickUp. Analise as tarefas, rotinas e hábitos do usuário. Sugira otimizações baseadas em frameworks como GTD (Getting Things Done), Time Blocking e a Matriz de Eisenhower. Ajude a priorizar o que realmente importa e a criar lembretes inteligentes.",
    model: "gemini-3.1-pro-preview",
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
  },
  {
    source: "Autonomous AI Integration",
    skills: [
      "Manus AI Agent Orchestration",
      "Claude MCP (Model Context Protocol)",
      "Windmill-MCP Integration",
      "Infinite Tool Ecosystem Design",
      "Webhooks & Event-Driven AI",
      "Human-in-the-Loop (HITL) Design",
      "Cross-Agent Tool Calling"
    ],
    icon: "Zap"
  }
];
