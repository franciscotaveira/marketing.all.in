import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, Brain, Terminal, LayoutDashboard, HelpCircle, Users, Building2, Sun, Moon, Settings, Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MarketingSkill, Company } from '../types';

interface AgentControlsProps {
  selectedSkill: MarketingSkill | null;
  useGrounding: boolean;
  setUseGrounding: (value: boolean) => void;
  useSwarmMode: boolean;
  setUseSwarmMode: (value: boolean) => void;
  setIsBrainOpen: (value: boolean) => void;
  isWorkspaceOpen: boolean;
  setIsWorkspaceOpen: (value: boolean) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (value: boolean) => void;
  activeCompanyId: string | null;
  companies: Company[];
  setIsBrandContextModalOpen: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  manualAgentPriorities: Record<string, number>;
  setManualAgentPriorities: (value: Record<string, number>) => void;
  allSkills: MarketingSkill[];
}

export function AgentControls({
  selectedSkill,
  useGrounding,
  setUseGrounding,
  useSwarmMode,
  setUseSwarmMode,
  setIsBrainOpen,
  isWorkspaceOpen,
  setIsWorkspaceOpen,
  isTerminalOpen,
  setIsTerminalOpen,
  activeCompanyId,
  companies,
  setIsBrandContextModalOpen,
  isDarkMode,
  setIsDarkMode,
  manualAgentPriorities,
  setManualAgentPriorities,
  allSkills
}: AgentControlsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isSwarmSettingsOpen, setIsSwarmSettingsOpen] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState("");

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

  const filteredAgents = allSkills.filter(agent => 
    agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
    agent.category.toLowerCase().includes(agentSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-3 rounded-xl bg-theme-glass border border-theme-glass text-theme-secondary hover:text-theme-primary hover:bg-theme-glass/80 transition-all active:scale-95 shadow-inner group"
        >
          {isDarkMode ? <Sun className="w-5 h-5 group-hover:text-theme-blue" /> : <Moon className="w-5 h-5 text-theme-blue" />}
        </button>
        <div className="flex items-center gap-2 bg-theme-glass px-4 py-2 rounded-full border border-theme-glass shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]">
          <div className="w-2 h-2 rounded-full bg-theme-emerald animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-theme-primary">
            {selectedSkill ? `${selectedSkill.name} Pronto` : 'Sistema Ativo'}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsBrandContextModalOpen(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-xl text-[10px] font-black uppercase tracking-widest border active:scale-95",
              activeCompanyId 
                ? "bg-theme-blue/20 text-theme-blue border-theme-blue/40 hover:bg-theme-blue/30 shadow-blue-500/20" 
                : "bg-theme-glass text-theme-secondary border-theme-glass hover:bg-theme-glass/80 hover:text-theme-primary shadow-inner"
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
              "flex items-center rounded-xl transition-all shadow-xl border overflow-hidden active:scale-95",
              useSwarmMode 
                ? "bg-gradient-to-br from-theme-purple to-theme-rose text-white shadow-purple-500/40 border-white/20" 
                : "bg-theme-glass text-theme-secondary border-theme-glass hover:bg-theme-glass/80 hover:text-theme-primary shadow-inner"
            )}>
              <button 
                onClick={() => setUseSwarmMode(!useSwarmMode)}
                className="flex items-center gap-2 pl-4 pr-2 py-2.5 text-[10px] font-black uppercase tracking-widest"
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
                className="pr-3 pl-1 py-2.5 opacity-70 hover:opacity-100 transition-opacity"
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
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-full mt-3 right-0 w-80 p-4 liquid-glass-panel z-50 shadow-2xl border border-theme-glass overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-black uppercase tracking-widest text-theme-blue text-[10px]">Priorização do Swarm</div>
                    {Object.keys(manualAgentPriorities).length > 0 && (
                      <button 
                        onClick={clearManualPriorities}
                        className="text-[9px] font-black uppercase text-theme-rose hover:underline"
                      >
                        Resetar
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-4 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-3.5 w-3.5 text-theme-secondary opacity-50" />
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar agente ou categoria..."
                      value={agentSearchQuery}
                      onChange={(e) => setAgentSearchQuery(e.target.value)}
                      className="w-full bg-theme-main/50 border border-theme-glass rounded-lg pl-9 pr-3 py-2 text-xs text-theme-primary placeholder-theme-secondary/50 focus:outline-none focus:border-theme-blue focus:ring-1 focus:ring-theme-blue/50 transition-all shadow-inner"
                    />
                  </div>
                  
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-[10px] text-theme-secondary opacity-60 leading-relaxed italic">
                      Defina a prioridade manual dos agentes ou deixe o Orquestrador decidir automaticamente com base na criticidade da tarefa.
                    </p>
                    
                    {filteredAgents.length === 0 ? (
                      <div className="text-center py-4 text-xs text-theme-secondary opacity-60">Nenhum agente encontrado.</div>
                    ) : (
                      filteredAgents.map(agent => (
                        <div key={agent.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-theme-primary">{agent.name}</span>
                            <span className="text-[10px] font-black text-theme-blue">
                              {manualAgentPriorities[agent.id] !== undefined ? `P${manualAgentPriorities[agent.id]}` : 'Auto'}
                            </span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="10"
                            step="1"
                            value={manualAgentPriorities[agent.id] || 0}
                            onChange={(e) => handlePriorityChange(agent.id, parseInt(e.target.value))}
                            className="w-full h-1 bg-theme-glass rounded-lg appearance-none cursor-pointer accent-theme-blue"
                          />
                          <div className="flex justify-between text-[8px] text-theme-secondary opacity-40 font-black uppercase tracking-tighter">
                            <span>Auto/Baixa</span>
                            <span>Alta</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className={cn(
              "flex items-center rounded-xl transition-all shadow-xl border overflow-hidden active:scale-95",
              useGrounding 
                ? "bg-gradient-to-br from-theme-emerald to-theme-blue text-white shadow-emerald-500/40 border-white/20" 
                : "bg-theme-glass text-theme-secondary border-theme-glass hover:bg-theme-glass/80 hover:text-theme-primary shadow-inner"
            )}>
              <button 
                onClick={() => setUseGrounding(!useGrounding)}
                className="flex items-center gap-2 pl-4 pr-2 py-2.5 text-[10px] font-black uppercase tracking-widest"
              >
                <Globe className={cn("w-4 h-4", useGrounding && "animate-spin-slow")} />
                <span className="hidden sm:inline">Pesquisa</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'pesquisa' ? null : 'pesquisa'); }}
                className="pr-3 pl-1 py-2.5 opacity-70 hover:opacity-100 transition-opacity"
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

        <div className="hidden md:block w-px h-8 bg-theme-glass mx-2" />

        <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end">
          <div className="relative">
            <div className="flex items-center rounded-xl transition-all hover:bg-theme-glass/80 text-theme-primary bg-theme-glass border border-theme-glass shadow-sm active:scale-95">
              <button 
                onClick={() => setIsBrainOpen(true)}
                className="p-3 relative group"
              >
                <Brain className="w-5 h-5 group-hover:text-theme-blue transition-all" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-theme-blue rounded-full border-2 border-theme-main shadow-[0_0_10px_rgba(59,130,246,1)]" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'cerebro' ? null : 'cerebro'); }}
                className="pr-3 pl-1 py-3 opacity-70 hover:opacity-100 transition-opacity"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'cerebro' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-3 right-0 w-64 p-4 liquid-glass-panel text-xs text-theme-secondary z-50 shadow-2xl border border-theme-glass"
                >
                  <div className="font-black uppercase tracking-widest text-theme-blue mb-2 text-[10px]">Cérebro Sináptico</div>
                  Gerencia a base de conhecimento e aprendizado contínuo do Enxame.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <div className={cn(
              "flex items-center rounded-xl transition-all shadow-xl border overflow-hidden active:scale-95",
              isTerminalOpen 
                ? "bg-theme-blue text-white border-theme-blue shadow-blue-500/30" 
                : "bg-theme-glass hover:bg-theme-glass/80 text-theme-secondary border-theme-glass hover:text-theme-primary shadow-inner"
            )}>
              <button 
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className="p-3"
              >
                <Terminal className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'terminal' ? null : 'terminal'); }}
                className="pr-3 pl-1 py-3 opacity-50 hover:opacity-100 transition-opacity"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'terminal' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-3 right-0 w-64 p-4 liquid-glass-panel text-xs text-theme-secondary z-50 shadow-2xl border border-theme-glass"
                >
                  <div className="font-black uppercase tracking-widest text-theme-secondary mb-2 text-[10px]">Terminal de Execução</div>
                  Acompanhe o raciocínio e as ações dos agentes em tempo real.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative">
            <div className={cn(
              "flex items-center rounded-xl transition-all shadow-xl border overflow-hidden active:scale-95",
              isWorkspaceOpen 
                ? "bg-theme-blue text-white border-theme-blue shadow-blue-500/30" 
                : "bg-theme-glass hover:bg-theme-glass/80 text-theme-secondary border-theme-glass hover:text-theme-primary shadow-inner"
            )}>
              <button 
                onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
                className="p-3"
              >
                <LayoutDashboard className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'workspace' ? null : 'workspace'); }}
                className="pr-3 pl-1 py-3 opacity-50 hover:opacity-100 transition-opacity"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <AnimatePresence>
              {activeTooltip === 'workspace' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute top-full mt-3 right-0 w-64 p-4 liquid-glass-panel text-xs text-theme-secondary z-50 shadow-2xl border border-theme-glass"
                >
                  <div className="font-black uppercase tracking-widest text-theme-secondary mb-2 text-[10px]">Workspace</div>
                  Abre o espaço de trabalho com os artefatos gerados.
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
