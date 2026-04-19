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
                "btn-secondary gap-1.5 px-3 py-1.5 rounded-full text-[9px]",
                activeCompanyId && "bg-blue-500/10 text-blue-500 border-blue-500/20"
              )}
            >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline pt-[2px]">
              {activeCompanyId ? companies.find(c => c.id === activeCompanyId)?.name || "Empresa Ativa" : "Selecionar Empresa"}
            </span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
          <div className="relative">
            <div className={cn(
              "chip overflow-hidden",
              useSwarmMode && "chip-active"
            )}>
              <button 
                onClick={() => setUseSwarmMode(!useSwarmMode)}
                className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 transition-all text-[#64748b] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:text-[#f8fafc]"
              >
                <Users className={cn("w-3.5 h-3.5", useSwarmMode && "animate-pulse")} />
                <span className="hidden sm:inline pt-[2px]">Swarm</span>
              </button>
              {useSwarmMode && (
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsSwarmSettingsOpen(!isSwarmSettingsOpen);
                  }}
                  className="pr-2.5 pl-1 py-1.5 opacity-60 hover:opacity-100 transition-opacity"
                  title="Configurações do Swarm"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <AnimatePresence>
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
          <button 
            onClick={connectGoogleDrive}
            className={cn(
              "chip overflow-hidden pl-2.5 pr-2.5 py-1.5 transition-all text-[#64748b] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:text-[#f8fafc]",
              googleTokens && "chip-active text-emerald-600 dark:text-emerald-400"
            )}
            title="Conectar Google Drive"
          >
            <div className="flex items-center gap-1.5">
              <Globe className={cn("w-3.5 h-3.5", googleTokens && "text-emerald-500")} />
              <span className="hidden sm:inline pt-[2px]">{googleTokens ? "Drive Ativo" : "Drive"}</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setUseGrounding(!useGrounding)}
            className={cn(
              "chip overflow-hidden pl-2.5 pr-2.5 py-1.5 transition-all text-[#64748b] hover:text-[#0f172a] dark:text-[#94a3b8] dark:hover:text-[#f8fafc]",
              useGrounding && "chip-active"
            )}
            title="Habilitar Pesquisa na Web"
          >
            <div className="flex items-center gap-1.5">
              <Globe className={cn("w-3.5 h-3.5", useGrounding && "animate-spin-slow")} />
              <span className="hidden sm:inline pt-[2px]">Pesquisa</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
