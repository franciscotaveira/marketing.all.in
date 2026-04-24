import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Brain, Terminal, LayoutDashboard, HelpCircle, Users, Building2, Sun, Moon, Settings, Plug
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MarketingSkill, Company } from '../types';
import { SwarmSettingsPanel } from './SwarmSettingsPanel';

interface AgentControlsProps {
  selectedSkills: MarketingSkill[];
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
  setIsIntegrationsModalOpen: (value: boolean) => void;
}

export function AgentControls({
  selectedSkills,
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
  connectGoogleDrive,
  setIsIntegrationsModalOpen
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
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-start">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="btn-secondary p-1.5 rounded-[8px] group"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
        </button>
        <div className="flex items-center gap-1.5 bg-theme-surface/50 px-2.5 py-1 rounded-[8px] border border-theme-glass shadow-sm">
          <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-wider text-theme-primary">
            {selectedSkills.length > 0 ? (selectedSkills.length === 1 ? `${selectedSkills[0].name} Pronto` : `${selectedSkills.length} Skills Prontas`) : 'Sistema Ativo'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end">
        <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsBrandContextModalOpen(true)}
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase tracking-widest border border-theme-glass transition-all shadow-sm bg-theme-surface/50 hover:bg-theme-glass text-theme-secondary",
                activeCompanyId && "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
              )}
            >
            <Building2 className="w-2 h-2" />
            <span className="hidden sm:inline pt-[2px]">
              {activeCompanyId ? companies.find(c => c.id === activeCompanyId)?.name || "Empresa Ativa" : "Cia"}
            </span>
          </button>
        </div>

          <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-end">
          <div className="relative">
            <div className={cn(
              "flex items-center border border-theme-glass rounded-[4px] overflow-hidden text-[6px] font-black tracking-widest uppercase transition-all bg-theme-surface/50 hover:bg-theme-glass shadow-sm",
              useSwarmMode && "border-blue-500/30 text-blue-500/90 shadow-[0_0_10px_rgba(59,130,246,0.1)] bg-blue-500/5 hover:bg-blue-500/10"
            )}>
              <button 
                onClick={() => setUseSwarmMode(!useSwarmMode)}
                className="flex items-center gap-1 px-1.5 py-0.5 transition-all"
              >
                <Users className={cn("w-2 h-2", useSwarmMode && "animate-pulse")} />
                <span className="hidden sm:inline pt-[2px]">Swarm</span>
              </button>
              {useSwarmMode && (
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsSwarmSettingsOpen(!isSwarmSettingsOpen);
                  }}
                  className="pr-1 pl-0.5 py-0.5 opacity-60 hover:opacity-100 transition-opacity"
                  title="Configurações do Swarm"
                >
                  <Settings className="w-2 h-2" />
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
            onClick={() => setIsIntegrationsModalOpen(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase tracking-widest border border-theme-glass transition-all shadow-sm bg-theme-surface/50 hover:bg-theme-glass text-theme-secondary"
            title="Conexões Globais (n8n, Supabase)"
          >
            <div className="flex items-center gap-1">
              <Plug className="w-2 h-2" />
              <span className="hidden sm:inline pt-[2px]">Integrações</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={connectGoogleDrive}
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase tracking-widest border border-theme-glass transition-all shadow-sm bg-theme-surface/50 hover:bg-theme-glass text-theme-secondary",
              googleTokens && "border-emerald-500/30 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            )}
            title="Conectar Google Drive"
          >
            <div className="flex items-center gap-1">
              <Globe className={cn("w-2 h-2")} />
              <span className="hidden sm:inline pt-[2px]">{googleTokens ? "Drive " : "Drive"}</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setUseGrounding(!useGrounding)}
            className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[6px] font-black uppercase tracking-widest border border-theme-glass transition-all shadow-sm bg-theme-surface/50 hover:bg-theme-glass text-theme-secondary",
              useGrounding && "border-blue-500/30 text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
            )}
            title="Habilitar Pesquisa na Web"
          >
            <div className="flex items-center gap-1">
              <Globe className={cn("w-2 h-2", useGrounding && "animate-spin-slow")} />
              <span className="hidden sm:inline pt-[2px]">Search</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
