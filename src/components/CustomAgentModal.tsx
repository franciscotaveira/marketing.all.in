import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Bot, Save, Brain, FileText, Target } from 'lucide-react';
import { MarketingSkill, SkillCategory, SkillTier } from '../types';

interface CustomAgentModalProps {
  onClose: () => void;
  onSave: (agent: MarketingSkill) => void;
}

export const CustomAgentModal: React.FC<CustomAgentModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SkillCategory>(SkillCategory.CONTENT);
  const [persona, setPersona] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');

  const handleSave = () => {
    if (!name || !persona || !description || !prompt) return;
    
    const newAgent: MarketingSkill = {
      id: `custom-${Date.now()}`,
      name,
      category,
      tier: SkillTier.CREATIVE, // Default tier
      persona,
      description,
      prompt,
    };
    
    onSave(newAgent);
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Criar Agente Personalizado</h2>
            <p className="text-xs text-white/50 font-medium tracking-widest uppercase">Defina uma nova persona e habilidades</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
          <span className="sr-only">Close</span>
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Bot className="w-3 h-3" />
              Nome do Agente
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Copywriter Sênior B2B"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
              <Target className="w-3 h-3" />
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SkillCategory)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none"
            >
              {Object.values(SkillCategory).map((cat) => (
                <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <Brain className="w-3 h-3" />
            Persona (Estilo & Foco)
          </label>
          <input
            type="text"
            value={persona}
            onChange={(e) => setPersona(e.target.value)}
            placeholder="Ex: Direto, focado em conversão, usa gatilhos mentais"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <FileText className="w-3 h-3" />
            Descrição Curta
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Especialista em criar copy persuasiva para landing pages"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <Brain className="w-3 h-3" />
            System Prompt (Instruções do Agente)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Você é um especialista em... Seu objetivo é... Sempre responda usando o formato..."
            className="w-full h-40 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none custom-scrollbar"
          />
        </div>
      </div>

      <div className="p-6 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-white/70 hover:text-white hover:bg-white/5 transition-all text-center"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={!name || !persona || !description || !prompt}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:shadow-none"
        >
          <Save className="w-4 h-4" />
          Salvar Agente
        </button>
      </div>
    </div>
  );
};
