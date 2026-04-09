import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Brain, Terminal, LayoutDashboard, HelpCircle, Users, Building2, Sun, Moon, Settings
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MarketingSkill, Company } from '../types';
import { SwarmSettingsPanel } from './SwarmSettingsPanel';

interface AgentControlsProps {
  selectedSkill: MarketingSkill | null;
  useGrounding: boolean;
  setUseGrounding: (value: boolean) => void;
  useSwarmMode: boolean;
  setUseSwarmMode: (value: boolean) => void;
  activeCompanyId: string | null;
  companies: Company[];
  setIsBrandContextModalOpen: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  manualAgentPriorities: Record<string, number>;
  setManualAgentPriorities: (value: Record<string, number>) => void;
  allSkills: MarketingSkill[];
  googleTokens?: any;
  connectGoogleDrive?: () => void;
}

export function AgentControls({
  selectedSkill,
  useGrounding,
  setUseGrounding,
  useSwarmMode,
  setUseSwarmMode,
  activeCompanyId,
  companies,
  setIsBrandContextModalOpen,
  isDarkMode,
  setIsDarkMode,
  manualAgentPriorities,
  setManualAgentPriorities,
  allSkills,
  googleTokens,
  connectGoogleDrive
}: AgentControlsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isSwarmSettingsOpen, setIsSwarmSettingsOpen] = useState(false);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveTooltip(null);
      setIsSwarmSettingsOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handlePriorityChange = (agentId: string, priority: number) => {
    setManualAgentPriorities({
      ...manualAgentPriorities,
      [agentId]: priority
    });
  };

  const clearManualPriorities = () => {
    setManualAgentPriorities({});
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="btn-secondary p-2.5 group"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-blue-500" />}
        </button>
        <div className="flex items-center gap-2 bg-theme-surface px-3 py-1.5 rounded-full border border-theme-glass shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-theme-primary">
            {selectedSkill ? `${selectedSkill.name} Pronto` : 'Sistema Ativo'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
        <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsBrandContextModalOpen(true)}
              className={cn(
                "btn-secondary gap-2 px-4 py-2",
                activeCompanyId && "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}
            >
            <Building2 className="w-4 h-4" />
            <span className="hidden sm:inline">
              {activeCompanyId ? companies.find(c => c.id === activeCompanyId)?.name || "Empresa Ativa" : "Selecionar Empresa"}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
          <div className="relative">
            <div className={cn(
              "chip overflow-hidden p-0",
              useSwarmMode && "chip-active"
            )}>
              <button 
                onClick={() => setUseSwarmMode(!useSwarmMode)}
                className="flex items-center gap-2 pl-4 pr-2 py-2"
              >
                <Users className={cn("w-4 h-4", useSwarmMode && "animate-pulse")} />
                <span className="hidden sm:inline">Swarm</span>
              </button>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  if (useSwarmMode) {
                    setIsSwarmSettingsOpen(!isSwarmSettingsOpen);
                    setActiveTooltip(null);
                  } else {
                    setActiveTooltip(activeTooltip === 'swarm' ? null : 'swarm'); 
                  }
                }}
                className="pr-3 pl-1 py-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                {useSwarmMode ? <Settings className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'swarm' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-3 right-0 w-64 p-4 liquid-glass-panel text-xs text-theme-secondary z-50 shadow-2xl border border-theme-glass"
                >
                  <div className="font-black uppercase tracking-widest text-theme-blue mb-2 text-[10px]">Modo Swarm</div>
                  Ativa múltiplos agentes especialistas para trabalhar em paralelo no seu objetivo.
                </motion.div>
              )}
              {isSwarmSettingsOpen && useSwarmMode && (
                <SwarmSettingsPanel
                  allSkills={allSkills}
                  manualAgentPriorities={manualAgentPriorities}
                  onPriorityChange={handlePriorityChange}
                  onClearPriorities={clearManualPriorities}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className={cn(
              "chip overflow-hidden p-0",
              googleTokens && "chip-active"
            )}>
              <button 
                onClick={connectGoogleDrive}
                className="flex items-center gap-2 pl-4 pr-2 py-2"
              >
                <Globe className={cn("w-4 h-4", googleTokens && "text-emerald-500")} />
                <span className="hidden sm:inline">{googleTokens ? "Drive Ativo" : "Drive"}</span>
              </button>
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveTooltip(activeTooltip === 'drive' ? null : 'drive'); 
                }}
                className="pr-3 pl-1 py-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'drive' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-3 right-0 w-64 p-4 liquid-glass-panel text-xs text-theme-secondary z-50 shadow-2xl border border-theme-glass"
                >
                  <div className="font-black uppercase tracking-widest text-theme-blue mb-2 text-[10px]">Google Drive</div>
                  Conecte sua conta para que os agentes possam ler documentos e pastas diretamente.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className={cn(
              "chip overflow-hidden p-0",
              useGrounding && "chip-active"
            )}>
              <button 
                onClick={() => setUseGrounding(!useGrounding)}
                className="flex items-center gap-2 pl-4 pr-2 py-2"
              >
                <Globe className={cn("w-4 h-4", useGrounding && "animate-spin-slow")} />
                <span className="hidden sm:inline">Pesquisa</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'pesquisa' ? null : 'pesquisa'); }}
                className="pr-3 pl-1 py-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'pesquisa' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-3 right-0 w-64 p-4 liquid-glass-panel text-xs text-theme-secondary z-50 shadow-2xl border border-theme-glass"
                >
                  <div className="font-black uppercase tracking-widest text-theme-blue mb-2 text-[10px]">Pesquisa em Tempo Real</div>
                  Conecta a IA à internet para buscar dados e referências atualizadas.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
