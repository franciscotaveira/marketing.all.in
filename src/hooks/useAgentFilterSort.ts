import { useState, useMemo } from 'react';
import { MarketingSkill } from '../types';

export type SortOption = 'category' | 'name' | 'priority';
export type ViewMode = 'list' | 'grid';

export function useAgentFilterSort(
  allSkills: MarketingSkill[], 
  manualAgentPriorities: Record<string, number>
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortOption>('category');

  const filteredAgents = useMemo(() => {
    return allSkills.filter(agent => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'priority') {
        const prioA = manualAgentPriorities[a.id] || 0;
        const prioB = manualAgentPriorities[b.id] || 0;
        return prioB - prioA;
      } else {
        return a.category.localeCompare(b.category);
      }
    });
  }, [allSkills, searchQuery, sortBy, manualAgentPriorities]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    filteredAgents
  };
}
