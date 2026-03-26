import React, { useState } from 'react';
import { MARKETING_SKILLS, CATEGORY_COLORS } from '../constants';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SkillCategory } from '../types';

interface AgentStatus {
  id: string;
  status: 'idle' | 'thinking' | 'using_tool';
  tool?: string;
}

interface Props {
  activeAgents: AgentStatus[];
}

export const AgentControlPanel: React.FC<Props> = ({ activeAgents }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const groupedSkills = MARKETING_SKILLS.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof MARKETING_SKILLS>);

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="flex items-center justify-between w-full group"
      >
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 group-hover:text-white/50 transition-colors">Agentes do Enxame</h2>
        {isPanelOpen ? <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/50" />}
      </button>
      
      {isPanelOpen && (
        <div className="space-y-2">
          {Object.entries(groupedSkills).map(([category, skills]) => {
            const isOpen = openCategories[category];
            return (
              <div key={category} className="space-y-1">
                <button 
                  onClick={() => toggleCategory(category)}
                  className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-wider text-white/50 hover:text-white transition-colors py-1"
                >
                  {category}
                  {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {isOpen && (
                  <div className="space-y-1 pl-2">
                    {skills.map(skill => {
                      const status = activeAgents.find(a => a.id === skill.id) || { id: skill.id, status: 'idle' as const };
                      
                      // Status dot color mapping
                      const dotColor = 
                        status.status === 'thinking' ? 'bg-yellow-500' : 
                        status.status === 'using_tool' ? 'bg-blue-500' : 'bg-white/20';

                      return (
                        <div key={skill.id} className="flex items-center justify-between py-1 px-2 hover:bg-white/5 rounded transition-colors gap-2">
                          <span className="text-[11px] text-white/70 truncate min-w-0 flex-1">{skill.name}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} title={status.status} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
