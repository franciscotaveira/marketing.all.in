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
