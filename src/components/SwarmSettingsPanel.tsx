import React from 'react';
import { motion } from 'motion/react';
import { Search, LayoutList, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { MarketingSkill } from '../types';
import { AgentCard } from './AgentCard';
import { useAgentFilterSort } from '../hooks/useAgentFilterSort';

interface SwarmSettingsPanelProps {
  allSkills: MarketingSkill[];
  manualAgentPriorities: Record<string, number>;
  onPriorityChange: (agentId: string, priority: number) => void;
  onClearPriorities: () => void;
}

export function SwarmSettingsPanel({
  allSkills,
  manualAgentPriorities,
  onPriorityChange,
  onClearPriorities
}: SwarmSettingsPanelProps) {
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filteredAgents
  } = useAgentFilterSort(allSkills, manualAgentPriorities);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      onClick={(e) => e.stopPropagation()}
      className="absolute top-full mt-3 right-0 w-[400px] p-4 liquid-glass-panel z-50 shadow-2xl border border-theme-glass overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="font-black uppercase tracking-widest text-theme-blue text-[10px]">Configuração do Swarm</div>
        {Object.keys(manualAgentPriorities).length > 0 && (
          <button 
            onClick={onClearPriorities}
            className="text-[9px] font-black uppercase text-theme-rose hover:underline"
          >
            Resetar
          </button>
        )}
      </div>
      
      <div className="flex flex-col gap-3 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-theme-secondary opacity-50" />
          </div>
          <input
            type="text"
            placeholder="Buscar agente ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-main/50 border border-theme-glass rounded-lg pl-9 pr-3 py-2 text-xs text-theme-primary placeholder-theme-secondary/50 focus:outline-none focus:border-theme-blue focus:ring-1 focus:ring-theme-blue/50 transition-all shadow-inner"
          />
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-theme-main/50 p-1 rounded-lg border border-theme-glass">
            <button
              onClick={() => setSortBy('category')}
              className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all", sortBy === 'category' ? "bg-theme-glass text-theme-primary" : "text-theme-secondary hover:text-theme-primary")}
            >
              Cat
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all", sortBy === 'name' ? "bg-theme-glass text-theme-primary" : "text-theme-secondary hover:text-theme-primary")}
            >
              Nome
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all", sortBy === 'priority' ? "bg-theme-glass text-theme-primary" : "text-theme-secondary hover:text-theme-primary")}
            >
              Prio
            </button>
          </div>
          
          <div className="flex items-center gap-1 bg-theme-main/50 p-1 rounded-lg border border-theme-glass">
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1 rounded transition-all", viewMode === 'list' ? "bg-theme-glass text-theme-primary" : "text-theme-secondary hover:text-theme-primary")}
              title="Lista"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-1 rounded transition-all", viewMode === 'grid' ? "bg-theme-glass text-theme-primary" : "text-theme-secondary hover:text-theme-primary")}
              title="Grade"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      
      <div className={cn(
        "max-h-[300px] overflow-y-auto pr-2 custom-scrollbar",
        viewMode === 'grid' ? "grid grid-cols-2 gap-2" : "space-y-2"
      )}>
        {filteredAgents.length === 0 ? (
          <div className="text-center py-4 text-xs text-theme-secondary opacity-60 col-span-full">Nenhum agente encontrado.</div>
        ) : (
          filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              viewMode={viewMode}
              priority={manualAgentPriorities[agent.id] || 0}
              onPriorityChange={onPriorityChange}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
