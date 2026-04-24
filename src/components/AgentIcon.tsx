import React, { useState } from 'react';
import { 
  FlaskConical, Type, Globe, Crosshair, BarChart3, ShieldCheck, 
  Rocket, Brain, DollarSign, Heart, Cpu, Palette, Microscope, 
  Settings, Bot, Network, Wrench, Search, LineChart, Code2, PenTool,
  Wand2, MessageSquare, Megaphone, Magnet, RefreshCw, Zap,
  Camera, Database, Calculator, PhoneCall, Share2, FileSignature
} from 'lucide-react';
import { MarketingSkill, SkillCategory } from '../types';
import { cn } from '../lib/utils';

interface AgentIconProps {
  agent: MarketingSkill;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Simple cache to avoid re-generating icons if they have URL
const getCachedIcon = (id: string) => {
  try {
    return localStorage.getItem(`agent_icon_${id}`);
  } catch (e) {
    return null;
  }
};

const getSkillDesign = (id: string, category: SkillCategory) => {
  // Base configuration based on category
  let config: any = {};
  switch (category) {
    case SkillCategory.CRO:
      config = { icon: FlaskConical, color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]', text: 'text-emerald-400', pattern: 'dots' }; break;
    case SkillCategory.CONTENT:
      config = { icon: Type, color: 'violet', gradient: 'from-violet-500/20 to-fuchsia-500/20', border: 'border-violet-500/30', shadow: 'shadow-[0_0_15px_rgba(139,92,246,0.15)]', text: 'text-violet-400', pattern: 'lines' }; break;
    case SkillCategory.SEO:
      config = { icon: Globe, color: 'sky', gradient: 'from-sky-500/20 to-blue-500/20', border: 'border-sky-500/30', shadow: 'shadow-[0_0_15px_rgba(14,165,233,0.15)]', text: 'text-sky-400', pattern: 'grid' }; break;
    case SkillCategory.PAID:
      config = { icon: Crosshair, color: 'rose', gradient: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]', text: 'text-rose-400', pattern: 'cross' }; break;
    case SkillCategory.MEASUREMENT:
      config = { icon: BarChart3, color: 'amber', gradient: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]', text: 'text-amber-400', pattern: 'dots' }; break;
    case SkillCategory.RETENTION:
      config = { icon: ShieldCheck, color: 'teal', gradient: 'from-teal-500/20 to-emerald-500/20', border: 'border-teal-500/30', shadow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]', text: 'text-teal-400', pattern: 'hex' }; break;
    case SkillCategory.GROWTH:
      config = { icon: Rocket, color: 'blue', gradient: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]', text: 'text-blue-400', pattern: 'lines' }; break;
    case SkillCategory.STRATEGY:
      config = { icon: Brain, color: 'fuchsia', gradient: 'from-fuchsia-500/20 to-purple-500/20', border: 'border-fuchsia-500/30', shadow: 'shadow-[0_0_15px_rgba(217,70,239,0.15)]', text: 'text-fuchsia-400', pattern: 'grid' }; break;
    case SkillCategory.SALES:
      config = { icon: DollarSign, color: 'green', gradient: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.15)]', text: 'text-green-400', pattern: 'dots' }; break;
    case SkillCategory.HUMANIZATION:
      config = { icon: Heart, color: 'pink', gradient: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/30', shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]', text: 'text-pink-400', pattern: 'cross' }; break;
    case SkillCategory.AI_ENGINEERING:
      config = { icon: Cpu, color: 'cyan', gradient: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', shadow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]', text: 'text-cyan-400', pattern: 'hex' }; break;
    case SkillCategory.MEDIA_PRODUCTION:
      config = { icon: Palette, color: 'purple', gradient: 'from-purple-500/20 to-fuchsia-500/20', border: 'border-purple-500/30', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]', text: 'text-purple-400', pattern: 'grid' }; break;
    case SkillCategory.RESEARCH:
      config = { icon: Microscope, color: 'indigo', gradient: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/30', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]', text: 'text-indigo-400', pattern: 'lines' }; break;
    case SkillCategory.OPERATIONS:
      config = { icon: Settings, color: 'slate', gradient: 'from-slate-500/20 to-gray-500/20', border: 'border-slate-500/30', shadow: 'shadow-[0_0_15px_rgba(100,116,139,0.15)]', text: 'text-slate-400', pattern: 'dots' }; break;
    default:
      config = { icon: Bot, color: 'orange', gradient: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]', text: 'text-orange-400', pattern: 'hex' };
  }

  // Override icons based on specific ID
  switch (id) {
    case 'meta-architect': config.icon = Wrench; break;
    case 'orchestrator': config.icon = Network; break;
    case 'growth-hacker': config.icon = Rocket; break;
    case 'strategist': config.icon = Brain; break;
    case 'researcher': config.icon = Search; break;
    case 'data-scientist': config.icon = LineChart; break;
    case 'analyst': config.icon = BarChart3; break;
    case 'copywriter': config.icon = PenTool; break;
    case 'creative-director': config.icon = Palette; break;
    case 'designer': config.icon = Wand2; break;
    case 'content-strategist': config.icon = Type; break;
    case 'humanizer': config.icon = Heart; break;
    case 'media-buyer': config.icon = Megaphone; break;
    case 'seo-specialist': config.icon = Globe; break;
    case 'cro-expert': config.icon = FlaskConical; break;
    case 'retention-specialist': config.icon = Magnet; break;
    case 'automation-engineer': config.icon = Zap; break;
    case 'ai-researcher': config.icon = Microscope; break;
    case 'media-producer': config.icon = Camera; break;
    case 'llm-architect': config.icon = Database; break;
    case 'roi-analyst': config.icon = Calculator; break;
    case 'whatsapp-analyst': config.icon = PhoneCall; break;
    case 'social-media': config.icon = Share2; break;
    case 'sales-script': config.icon = FileSignature; break;
  }

  return config;
};

const renderPattern = (type: string) => {
  switch (type) {
    case 'hex':
      return (
        <pattern id="pattern-hex" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
          <path d="M6 0L12 3.5L12 10.5L6 14L0 10.5L0 3.5L6 0Z" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
      );
    case 'dots':
      return (
        <pattern id="pattern-dots" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.5" />
        </pattern>
      );
    case 'lines':
      return (
        <pattern id="pattern-lines" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M-2 10L10 -2 M6 14L14 6" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6"/>
        </pattern>
      );
    case 'cross':
      return (
        <pattern id="pattern-cross" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M5 2V8 M2 5H8" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
        </pattern>
      );
    default:
      return (
        <pattern id="pattern-grid" width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.5"/>
        </pattern>
      );
  }
};

export function AgentIcon({ agent, size = 'md', className }: AgentIconProps) {
  const [iconUrl] = useState<string | null>(getCachedIcon(agent.id));

  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const IconDim = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (iconUrl) {
    return (
      <img 
        src={iconUrl} 
        alt={agent.name} 
        className={`${dimensions[size]} rounded-lg border border-theme-glass shadow-sm object-cover ${className}`}
        referrerPolicy="no-referrer"
        title={`${agent.name}\n\n${agent.description}`}
      />
    );
  }

  const design = getSkillDesign(agent.id, agent.category);
  const IconCmp = design.icon;

  return (
    <div 
      className={cn(
        dimensions[size],
        "flex items-center justify-center rounded-lg border bg-theme-glass/10 overflow-hidden relative group transition-all duration-300",
        design.border,
        design.shadow,
        className
      )}
      title={`${agent.name}\n\n${agent.description}`}
    >
      {/* Background Gradient */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-100 transition-opacity duration-500",
        design.gradient
      )} />
      
      {/* Dynamic Pattern */}
      <div className={cn("absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay", design.text)}>
        <svg width="100%" height="100%">
          <defs>
            {renderPattern(design.pattern)}
          </defs>
          <rect width="100%" height="100%" fill={`url(#pattern-${design.pattern})`} />
        </svg>
      </div>

      {/* Specialty Inner Glow */}
      <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity blur-md", `bg-${design.color}-500`)} />

      {/* Main Icon */}
      <IconCmp className={cn(
        IconDim[size],
        "relative z-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300",
        design.text
      )} />
      
      {/* Orchestrator special elements overlay */}
      {agent.id === 'orchestrator' && (
        <svg viewBox="0 0 24 24" className={cn("absolute inset-0 w-full h-full pointer-events-none group-hover:rotate-90 transition-transform duration-[2s] opacity-30", design.text)} fill="none">
           <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
           <circle cx="12" cy="4" r="1.5" fill="currentColor" />
           <circle cx="20" cy="12" r="1.5" fill="currentColor" />
           <circle cx="12" cy="20" r="1.5" fill="currentColor" />
           <circle cx="4" cy="12" r="1.5" fill="currentColor" />
        </svg>
      )}

      {/* AI Engineering special elements overlay */}
      {agent.category === SkillCategory.AI_ENGINEERING && (
        <svg viewBox="0 0 24 24" className={cn("absolute inset-0 w-full h-full pointer-events-none scale-150 opacity-20", design.text)} fill="none">
           <path d="M4 4h16v16H4zM8 4v16M16 4v16M4 8h16M4 16h16" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2"/>
        </svg>
      )}
    </div>
  );
}
