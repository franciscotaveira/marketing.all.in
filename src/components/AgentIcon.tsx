import React, { useState, useEffect } from 'react';
import { Loader2, User } from 'lucide-react';
import { MarketingSkill } from '../types';
import { generateImageWithRetry } from '../lib/imageGeneration';

interface AgentIconProps {
  agent: MarketingSkill;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const iconSuggestions: Record<string, string> = {
  'orchestrator': 'a futuristic conductor baton or a glowing central brain core',
  'growth-hacker': 'a sleek rocket ship or a vibrant lightning bolt',
  'strategist': 'a golden crown or a winner podium',
  'researcher': 'a high-tech magnifying glass or digital binoculars',
  'data-scientist': 'a glowing crystal ball or a complex neural network graph',
  'analyst': 'a sharp bar chart or a digital prism',
  'copywriter': 'a classic quill pen or a modern megaphone',
  'creative-director': 'a glowing lightbulb or a director film slate',
  'designer': 'a digital compass or a vibrant color palette',
  'content-strategist': 'a stack of digital books or a content calendar icon',
  'humanizer': 'a glowing heart or a pair of helping hands',
  'media-buyer': 'a high-precision sniper scope or a bullseye target',
  'seo-specialist': 'a web of interconnected nodes or a search lens',
  'cro-expert': 'a laboratory flask or a percentage growth arrow',
  'retention-specialist': 'a golden shield or a magnetic horseshoe',
  'automation-engineer': 'a complex gear system or a high-tech microchip',
  'ai-researcher': 'a digital microscope or a stack of data scrolls',
  'media-producer': 'a professional movie camera or a music waveform',
  'llm-architect': 'a blueprint of a neural network or a digital temple of knowledge',
  'roi-analyst': 'a golden dollar sign or a precision calculator',
  'social-media': 'a vibrant globe or a speech bubble with a heart',
  'sales-script': 'a firm handshake or a golden signature pen',
  'productivity-strategist': 'a sleek hourglass or a master key',
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
  const [iconUrl, setIconUrl] = useState<string | null>(getCachedIcon(agent.id));
  const [isLoading, setIsLoading] = useState(!getCachedIcon(agent.id));
  const [error, setError] = useState(false);

  const dimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    if (iconUrl) return;

    let isMounted = true;

    async function generateIcon() {
      try {
        // Staggered delay to avoid hitting rate limits when many icons load at once
        // Random delay between 0 and 5 seconds
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5000));
        
        if (!isMounted) return;

        const suggestion = iconSuggestions[agent.id] || 'a futuristic AI node';
        
        const prompt = `A minimalist, professional high-tech 3D icon for an AI agent. 
        Agent Name: ${agent.name}. 
        Category: ${agent.category}. 
        Persona: ${agent.persona}. 
        The icon should be ${suggestion}. 
        Style: Glassmorphism, vibrant accent colors (blues, purples, emeralds), dark sleek background, 512px, high quality, centered, no text, no labels.`;

        const url = await generateImageWithRetry(prompt);
        
        if (isMounted) {
          setCachedIcon(agent.id, url);
          setIconUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        console.error(`Error generating icon for ${agent.id}:`, err);
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    }

    generateIcon();
    return () => { isMounted = false; };
  }, [agent.id, agent.name, agent.category, agent.persona, iconUrl]);

  if (isLoading) {
    return (
      <div className={`${dimensions[size]} flex items-center justify-center bg-theme-glass rounded-lg border border-theme-glass animate-pulse ${className}`}>
        <Loader2 className="w-1/2 h-1/2 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !iconUrl) {
    return (
      <div className={`${dimensions[size]} flex items-center justify-center bg-theme-glass rounded-lg border border-theme-glass text-theme-secondary ${className}`}>
        <User className="w-1/2 h-1/2 opacity-40" />
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
