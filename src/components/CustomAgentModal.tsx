import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bot, Save, Brain, FileText, Target, Loader2 } from 'lucide-react';
import { MarketingSkill, SkillCategory, SkillTier } from '../types';

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
              {initialAgent ? 'Editar Agente' : 'Criar Agente Personalizado'}
            </h2>
            <p className="text-xs text-blue-400 font-black tracking-widest uppercase italic">
              {initialAgent ? 'Ajuste a persona e habilidades' : 'Defina uma nova persona e habilidades'}
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
              Nome do Agente
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
          <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 flex items-center gap-2">
            <Brain className="w-3 h-3" />
            System Prompt (Instruções do Agente)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Você é um especialista em... Seu objetivo é... Sempre responda usando o formato..."
            className="w-full h-40 bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none custom-scrollbar shadow-inner"
          />
        </div>
      </div>

      <div className="p-6 border-t border-theme-glass bg-theme-glass/20 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
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
  );
};
