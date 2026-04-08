import React, { useState, useEffect } from 'react';
import { Loader2, Bot } from 'lucide-react';
import { generateImageWithRetry } from '../lib/imageGeneration';

const getCachedLogo = () => {
  try {
    return localStorage.getItem('aetheris_swarm_logo');
  } catch (e) {
    return null;
  }
};

const setCachedLogo = (url: string) => {
  try {
    localStorage.setItem('aetheris_swarm_logo', url);
  } catch (e) {
  }
};

export function AetherisLogo() {
  const [logoUrl, setLogoUrl] = useState<string | null>(getCachedLogo());
  const [isLoading, setIsLoading] = useState(!getCachedLogo());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (logoUrl) return;

    let isMounted = true;

    async function generateLogo() {
      try {
        const prompt = 'A professional and futuristic logo for an AI marketing swarm called "Aetheris Swarm". The logo should feature a central core representing "Aetheris" with a swarm of smaller, interconnected nodes or particles orbiting it, symbolizing "Elite Orchestration". Use a color palette of deep blues, vibrant purples, and emerald greens. The style should be clean, minimalist, and high-tech, suitable for a premium SaaS application. No text in the image, just the icon.';
        
        const url = await generateImageWithRetry(prompt);
        
        if (isMounted) {
          setCachedLogo(url);
          setLogoUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error generating logo:', err);
        if (isMounted) {
          setError('Failed to generate logo');
          setIsLoading(false);
        }
      }
    }

    generateLogo();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-theme-glass rounded-xl border border-theme-glass animate-pulse">
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !logoUrl) {
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-theme-glass rounded-xl border border-theme-glass text-theme-orange">
        <Bot className="w-5 h-5" />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
      <img 
        src={logoUrl} 
        alt="Aetheris Swarm Logo" 
        className="w-10 h-10 rounded-xl border border-theme-glass shadow-lg relative z-10"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
