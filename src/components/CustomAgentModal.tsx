import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bot, Save, Brain, FileText, Target, Loader2, Sparkles, Download } from 'lucide-react';
import { MarketingSkill, SkillCategory, SkillTier } from '../types';
import { gemini, MODELS } from '../services/gemini';

interface CustomAgentModalProps {
  onClose: () => void;
  onSave: (agent: MarketingSkill) => void;
  initialAgent?: MarketingSkill;
}

export const CustomAgentModal: React.FC<CustomAgentModalProps> = ({ onClose, onSave, initialAgent }) => {
  const [name, setName] = useState(initialAgent?.name || '');
  const [category, setCategory] = useState<SkillCategory>(initialAgent?.category || SkillCategory.CONTENT);
  const [persona, setPersona] = useState(initialAgent?.persona || '');
  const [description, setDescription] = useState(initialAgent?.description || '');
  const [prompt, setPrompt] = useState(initialAgent?.prompt || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingProxy, setIsGeneratingPrompt] = useState(false);
  const [tools, setTools] = useState<string[]>(initialAgent?.tools || []);

  const AVAILABLE_TOOLS = [
    { id: 'analyze_website', name: 'Scrape / Ler Websites', icon: 'Globe' },
    { id: 'search_trends', name: 'Google Trends & Search', icon: 'Search' },
    { id: 'read_database', name: 'Acesso FireStore / BigQuery', icon: 'Database' },
    { id: 'n8n_webhook', name: 'Disparar Fluxo n8n', icon: 'Zap' },
    { id: 'generate_image', name: 'Imagen 3 / Veo (Mídia Gráfica)', icon: 'Image' },
    { id: 'query_analytics', name: 'Ler GA4 e ROI', icon: 'Activity' },
  ];

  const handleGeneratePrompt = async () => {
    if (!name || !description) return;
    setIsGeneratingPrompt(true);
    try {
      const aiPrompt = `Atue como um Engenheiro de Prompts Especialista em IA para CRM e Vendas.
Crie um *System Prompt* detalhado para um agente IA com as seguintes características:
- Nome: ${name}
- Categoria: ${category}
- Persona/Estilo: ${persona || 'Profissional e persuasivo'}
- Descrição da Função: ${description}

O System Prompt gerado deve guiar o modelo a atuar perfeitamente nessa função, definindo tom de voz, regras invioláveis (ex: nunca prometer descontos impossíveis, focar na qualificação da venda), e formato de resposta esperado. Retorne apenas o System Prompt, sem mais nada.`;

      const response = await gemini.generateText(aiPrompt, MODELS.GENERAL);
      const text = response.text || '';
      setPrompt(text);
    } catch (error) {
      console.error('Failed to generate prompt', error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleExport = () => {
    const agentData: MarketingSkill = {
      id: initialAgent?.id || `custom-${Date.now()}`,
      name,
      category,
      tier: initialAgent?.tier || SkillTier.CREATIVE,
      persona,
      description,
      prompt,
      tools: tools.length > 0 ? tools : undefined,
    };
    
    const blob = new Blob([JSON.stringify(agentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agente-${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!name || !persona || !description || !prompt || isSubmitting) return;
    
    setIsSubmitting(true);
    // Simulate a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    const agentData: MarketingSkill = {
      id: initialAgent?.id || `custom-${Date.now()}`,
      name,
      category,
      tier: initialAgent?.tier || SkillTier.CREATIVE,
      persona,
      description,
      prompt,
      tools: tools.length > 0 ? tools : undefined,
    };
    
    onSave(agentData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-theme-main text-theme-primary rounded-3xl overflow-hidden border border-theme-glass shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between p-6 border-b border-theme-glass bg-theme-glass/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-theme-primary">
              {initialAgent ? 'Editar Skill' : 'Criar Skill Personalizada'}
            </h2>
            <p className="text-xs text-blue-400 font-black tracking-widest uppercase italic">
              {initialAgent ? 'Ajuste a persona e capacidades' : 'Defina uma nova especialidade e capacidades'}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-theme-glass hover:bg-theme-glass/80 rounded-xl transition-all active:scale-95 group">
          <span className="sr-only">Close</span>
          <X className="w-6 h-6 text-theme-secondary opacity-50 group-hover:text-theme-primary group-hover:opacity-100" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 flex items-center gap-2">
              <Bot className="w-3 h-3" />
              Nome da Skill
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Copywriter Sênior B2B"
              className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 flex items-center gap-2">
              <Target className="w-3 h-3" />
              Categoria
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-xl px-4 py-3 text-sm text-theme-primary focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none shadow-inner"
              >
                {Object.values(SkillCategory).map((cat) => (
                  <option key={cat} value={cat} className="bg-theme-main text-theme-primary">{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 flex items-center gap-2">
            <Brain className="w-3 h-3" />
            Persona (Estilo & Foco)
          </label>
          <input
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="Ex: Direto, focado em conversão, usa gatilhos mentais"
            className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 flex items-center gap-2">
            <FileText className="w-3 h-3" />
            Descrição Curta
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Especialista em criar copy persuasiva para landing pages"
            className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-inner"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 flex items-center gap-2">
              <Brain className="w-3 h-3" />
              System Prompt (Instruções da Skill)
            </label>
            <button
              onClick={handleGeneratePrompt}
              disabled={isGeneratingProxy || !name || !description}
              className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingProxy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Gerar com IA
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Você é um especialista em... Seu objetivo é... Sempre responda usando o formato..."
            className="w-full h-40 bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none custom-scrollbar shadow-inner"
          />
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            Ferramentas Integradas (Tools)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVAILABLE_TOOLS.map((tool) => (
              <label 
                key={tool.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${tools.includes(tool.id) ? 'bg-blue-500/10 border-blue-500/30' : 'bg-theme-glass/20 border-theme-glass/40 hover:bg-theme-glass/40'}`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${tools.includes(tool.id) ? 'bg-blue-500 border-blue-500' : 'border-theme-secondary/40'}`}>
                  {tools.includes(tool.id) && <X className="w-3 h-3 text-white" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }} />}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden"
                  checked={tools.includes(tool.id)}
                  onChange={(e) => {
                    if (e.target.checked) setTools([...tools, tool.id]);
                    else setTools(tools.filter(t => t !== tool.id));
                  }}
                />
                <span className={`text-[11px] font-bold tracking-wide uppercase ${tools.includes(tool.id) ? 'text-blue-400' : 'text-theme-secondary'}`}>{tool.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-theme-glass bg-theme-glass/20 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 items-center">
        <div>
          <button
            onClick={handleExport}
            className="text-[10px] font-black uppercase tracking-widest text-theme-secondary hover:text-theme-primary flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={!name}
          >
            <Download className="w-4 h-4" />
            Exportar Skill
          </button>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={onClose}
            className="btn-secondary w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !persona || !description || !prompt || isSubmitting}
            className="btn-primary w-full sm:w-auto px-8"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Agente
          </button>
        </div>
      </div>
    </div>
  );
};
