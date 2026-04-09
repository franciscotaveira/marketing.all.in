import React, { useState, useEffect } from 'react';
import { 
  Loader2, Bot, Rocket, Zap, Target, Compass, Search, Microscope, 
  BarChart3, Database, LineChart, PieChart, PenTool, Type, Palette, 
  Image as ImageIcon, BookOpen, Calendar, Heart, Users, DollarSign, 
  Crosshair, Globe, Link, FlaskConical, TrendingUp, ShieldCheck, 
  Magnet, Settings, Cpu, Terminal, Binary, Video, Music, Box, 
  Share2, Calculator, Coins, MessageSquare, Handshake, FileText, Clock, Key,
  Network, Brain
} from 'lucide-react';
import { MarketingSkill, SkillCategory } from '../types';
import { cn } from '../lib/utils';

interface AgentIconProps {
  agent: MarketingSkill;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getLucideIcon = (id: string, category: SkillCategory) => {
  const iconMap: Record<string, any> = {
    'orchestrator': Network,
    'growth-hacker': Rocket,
    'strategist': Target,
    'researcher': Search,
    'data-scientist': Database,
    'analyst': BarChart3,
    'copywriter': PenTool,
    'creative-director': Palette,
    'designer': ImageIcon,
    'content-strategist': BookOpen,
    'humanizer': Heart,
    'media-buyer': Crosshair,
    'seo-specialist': Globe,
    'cro-expert': FlaskConical,
    'retention-specialist': ShieldCheck,
    'automation-engineer': Settings,
    'ai-researcher': Binary,
    'media-producer': Video,
    'llm-architect': Box,
    'roi-analyst': Calculator,
    'social-media': MessageSquare,
    'sales-script': FileText,
    'productivity-strategist': Clock,
  };

  if (iconMap[id]) return iconMap[id];

  // Fallback by category
  switch (category) {
    case SkillCategory.STRATEGY: return Brain;
    case SkillCategory.GROWTH: return TrendingUp;
    case SkillCategory.CONTENT: return Type;
    case SkillCategory.MEDIA_PRODUCTION: return Palette;
    case SkillCategory.AI_ENGINEERING: return Cpu;
    case SkillCategory.OPERATIONS: return Settings;
    default: return Bot;
  }
};

// Simple cache to avoid re-generating icons
const getCachedIcon = (id: string) => {
  try {
    return localStorage.getItem(`agent_icon_${id}`);
  } catch (e) {
    return null;
  }
};

const setCachedIcon = (id: string, url: string) => {
  try {
    localStorage.setItem(`agent_icon_${id}`, url);
  } catch (e) {
    // LocalStorage might be full
  }
};

export function AgentIcon({ agent, size = 'md', className }: AgentIconProps) {
  const [iconUrl] = useState<string | null>(getCachedIcon(agent.id));

  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const IconComponent = getLucideIcon(agent.id, agent.category);

  if (agent.id === 'orchestrator' && !iconUrl) {
    return (
      <div className={cn(
        dimensions[size],
        "flex items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.15)] overflow-hidden relative group",
        className
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-50 group-hover:opacity-100 transition-opacity" />
        
        <svg viewBox="0 0 24 24" className="w-[65%] h-[65%] text-indigo-400 relative z-10 group-hover:scale-110 transition-transform duration-500" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Central Core */}
          <polygon points="12 6 17.196 9 17.196 15 12 18 6.804 15 6.804 9" className="fill-indigo-500/20 animate-pulse" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="1.5" className="fill-indigo-300" />
          
          {/* Orbiting Swarm Nodes */}
          <circle cx="12" cy="2.5" r="1.5" className="fill-indigo-400" />
          <circle cx="21.5" cy="12" r="1.5" className="fill-indigo-400" />
          <circle cx="12" cy="21.5" r="1.5" className="fill-indigo-400" />
          <circle cx="2.5" cy="12" r="1.5" className="fill-indigo-400" />
          
          {/* Connection Lines */}
          <line x1="12" y1="6" x2="12" y2="2.5" className="opacity-50" strokeDasharray="1 2" />
          <line x1="17.196" y1="12" x2="21.5" y2="12" className="opacity-50" strokeDasharray="1 2" />
          <line x1="12" y1="18" x2="12" y2="21.5" className="opacity-50" strokeDasharray="1 2" />
          <line x1="6.804" y1="12" x2="2.5" y2="12" className="opacity-50" strokeDasharray="1 2" />
          
          {/* Diagonal Nodes */}
          <circle cx="18.5" cy="5.5" r="1" className="fill-indigo-400 opacity-80" />
          <circle cx="18.5" cy="18.5" r="1" className="fill-indigo-400 opacity-80" />
          <circle cx="5.5" cy="18.5" r="1" className="fill-indigo-400 opacity-80" />
          <circle cx="5.5" cy="5.5" r="1" className="fill-indigo-400 opacity-80" />
          
          <line x1="15" y1="9" x2="18.5" y2="5.5" className="opacity-30" />
          <line x1="15" y1="15" x2="18.5" y2="18.5" className="opacity-30" />
          <line x1="9" y1="15" x2="5.5" y2="18.5" className="opacity-30" />
          <line x1="9" y1="9" x2="5.5" y2="5.5" className="opacity-30" />
        </svg>

        {/* Tech pattern background */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="hex" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
              <path d="M4 0L8 2L8 6L4 8L0 6L0 2L4 0Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#hex)" />
          </svg>
        </div>
      </div>
    );
  }

  if (!iconUrl) {
    return (
      <div className={cn(
        dimensions[size],
        "flex items-center justify-center rounded-lg border border-theme-glass shadow-sm overflow-hidden relative group",
        className
      )}>
        <div className="absolute inset-0 bg-theme-orange/5 opacity-50 group-hover:opacity-100 transition-opacity" />
        <IconComponent className="w-1/2 h-1/2 text-theme-orange relative z-10 opacity-60 group-hover:opacity-100 transition-all" />
        
        {/* Subtle tech pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%">
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={iconUrl} 
      alt={agent.name} 
      className={`${dimensions[size]} rounded-lg border border-theme-glass shadow-sm object-cover ${className}`}
      referrerPolicy="no-referrer"
    />
  );
}
