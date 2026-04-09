import React from 'react';
import { MarketingSkill, SkillCategory } from '../types';
import { AgentIcon } from './AgentIcon';
import { CATEGORY_BG_LIGHT_COLORS, CATEGORY_TEXT_COLORS } from '../constants';
import { cn } from '../lib/utils';

interface AgentCardProps {
  agent: MarketingSkill;
  viewMode: 'list' | 'grid';
  priority: number;
  onPriorityChange: (agentId: string, priority: number) => void;
}

export function AgentCard({ agent, viewMode, priority, onPriorityChange }: AgentCardProps) {
  return (
    <div 
      className={cn(
        "p-3 rounded-2xl border transition-all relative group",
        CATEGORY_BG_LIGHT_COLORS[agent.category as SkillCategory],
        "border-transparent hover:border-current/10",
        viewMode === 'grid' ? "flex flex-col gap-3" : "space-y-3"
      )}
    >
      <div className={cn("flex items-center justify-between w-full", viewMode === 'grid' && "flex-col items-center justify-center gap-3 text-center")}>
        <div className={cn("flex items-center gap-2", viewMode === 'grid' && "flex-col")}>
          <AgentIcon agent={agent} size={viewMode === 'grid' ? "lg" : "sm"} className={cn(viewMode === 'grid' && "mb-1")} />
          <div className={cn("flex flex-col", viewMode === 'grid' && "items-center")}>
            <span className={cn(
              "font-bold leading-none", 
              viewMode === 'grid' ? "text-[11px] mb-1" : "text-[10px]",
              CATEGORY_TEXT_COLORS[agent.category as SkillCategory]
            )}>
              {agent.name}
            </span>
            {viewMode === 'grid' && (
              <span className="text-[8px] font-black uppercase tracking-widest opacity-50">
                {agent.category}
              </span>
            )}
          </div>
        </div>
        <span className={cn(
          "text-[10px] font-black", 
          CATEGORY_TEXT_COLORS[agent.category as SkillCategory],
          viewMode === 'grid' && "absolute top-3 right-3 bg-black/20 px-1.5 py-0.5 rounded"
        )}>
          {priority > 0 ? `P${priority}` : 'Auto'}
        </span>
      </div>
      
      <div className={cn("w-full", viewMode === 'grid' && "mt-auto pt-2")}>
        <input 
          type="range"
          min="0"
          max="10"
          step="1"
          value={priority}
          onChange={(e) => onPriorityChange(agent.id, parseInt(e.target.value))}
          className={cn(
            "w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/20",
            agent.category === SkillCategory.STRATEGY ? "accent-blue-500" :
            agent.category === SkillCategory.GROWTH ? "accent-emerald-500" :
            agent.category === SkillCategory.PAID ? "accent-rose-500" :
            agent.category === SkillCategory.CONTENT ? "accent-amber-500" :
            agent.category === SkillCategory.SEO ? "accent-indigo-500" :
            agent.category === SkillCategory.CRO ? "accent-orange-500" :
            agent.category === SkillCategory.AI_ENGINEERING ? "accent-cyan-500" :
            "accent-theme-blue"
          )}
        />
        <div className="flex justify-between text-[8px] text-theme-secondary opacity-40 font-black uppercase tracking-tighter mt-1">
          <span>Auto</span>
          <span>Alta</span>
        </div>
      </div>
      
      {/* Custom Tooltip on Hover */}
      <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-theme-card border border-theme-glass rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
        <p className="text-[9px] text-theme-secondary leading-relaxed">{agent.description}</p>
      </div>
    </div>
  );
}
