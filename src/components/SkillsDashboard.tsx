import React, { useState } from 'react';
import { MarketingSkill, SkillCategory } from '../types';
import { AgentIcon } from './AgentIcon';
import { Plus, Edit, Trash2, Power, PowerOff, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SkillsDashboardProps {
  MARKETING_SKILLS: MarketingSkill[];
  customSkills: MarketingSkill[];
  setCustomSkills: React.Dispatch<React.SetStateAction<MarketingSkill[]>>;
  onEditCustomSkill: (skill: MarketingSkill) => void;
  onNewCustomSkill: () => void;
}

export function SkillsDashboard({
  MARKETING_SKILLS,
  customSkills,
  setCustomSkills,
  onEditCustomSkill,
  onNewCustomSkill
}: SkillsDashboardProps) {
  const [disabledSkills, setDisabledSkills] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const handleToggleSkill = (skillId: string) => {
    if (disabledSkills.includes(skillId)) {
      setDisabledSkills(disabledSkills.filter(id => id !== skillId));
    } else {
      setDisabledSkills([...disabledSkills, skillId]);
    }
  };

  const handleDeleteCustomSkill = (skillId: string) => {
    if (confirm("Tem certeza que deseja excluir esta skill?")) {
      setCustomSkills(customSkills.filter(s => s.id !== skillId));
    }
  };

  const allSkills = [...MARKETING_SKILLS, ...customSkills];
  const filteredSkills = allSkills.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-theme-surface w-full overflow-hidden">
      <div className="p-6 border-b border-theme-glass shrink-0 bg-theme-main/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-theme-primary flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-theme-blue" />
              Gestão de Skills
            </h1>
            <p className="text-theme-secondary text-sm mt-1">Gerencie os especialistas de IA disponíveis no seu Enxame de Marketing.</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Buscar skills..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-theme-glass border border-theme-glass rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-theme-blue/50 w-full md:w-64 text-theme-primary"
            />
            <button 
              onClick={onNewCustomSkill}
              className="btn-primary flex items-center gap-2 rounded-xl whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova Skill</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map(skill => {
            const isCustom = customSkills.some(s => s.id === skill.id);
            const isDisabled = disabledSkills.includes(skill.id);

            return (
              <motion.div 
                key={skill.id}
                layoutId={`skill-${skill.id}`}
                className={cn(
                  "p-4 rounded-3xl border transition-all flex flex-col h-full relative group",
                  isDisabled ? "bg-theme-main/20 border-theme-glass/50 opacity-60" : "bg-theme-card border-theme-glass hover:border-theme-blue/30 hover:shadow-lg hover:-translate-y-1"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <AgentIcon agent={skill} size="lg" className={cn("transition-transform group-hover:scale-105", isDisabled && "grayscale")} />
                  <div className="flex items-center gap-2">
                    {isCustom && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md border border-amber-500/20">
                        Custom
                      </span>
                    )}
                    {skill.isGoogleAI && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md border border-blue-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> AI
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-theme-primary mb-1">{skill.name}</h3>
                <p className="text-xs font-bold text-theme-secondary/80 uppercase tracking-widest mb-3">{skill.category}</p>
                <p className="text-sm text-theme-secondary mb-6 flex-1 line-clamp-3">{skill.description}</p>
                
                <div className="mt-auto pt-4 border-t border-theme-glass flex items-center justify-between">
                  {isCustom ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onEditCustomSkill(skill)}
                        className="p-2 hover:bg-theme-blue/10 rounded-xl text-theme-blue transition-colors"
                        title="Editar Skill"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomSkill(skill.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-xl text-rose-500 transition-colors"
                        title="Excluir Skill"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : <div />}

                  <button 
                    onClick={() => handleToggleSkill(skill.id)}
                    className={cn(
                      "p-2 rounded-xl flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-colors",
                      isDisabled ? "bg-theme-glass text-theme-secondary hover:text-theme-primary" : "bg-emerald-500/10 text-emerald-500 hover:bg-rose-500/10 hover:text-rose-500"
                    )}
                  >
                    {isDisabled ? (
                      <>
                        <Power className="w-4 h-4" /> Activar
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4" /> Desactivar
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
        {filteredSkills.length === 0 && (
          <div className="text-center p-12 opacity-50 text-theme-secondary">
            Nenhuma skill encontrada com esse termo.
          </div>
        )}
      </div>
    </div>
  );
}
