import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        {/* Outer Ring - Dynamic */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-2 border-dashed border-blue-500/20 rounded-full"
        />
        
        {/* Hexagonal Core Container */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-blue-600/20 blur-xl rounded-full animate-pulse" />
          
          {/* Main Shape - Stylized "A" or Synapse */}
          <svg viewBox="0 0 40 40" className="w-full h-full relative z-10">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            
            {/* Synaptic Connections */}
            <motion.path
              d="M20 8 L32 28 L8 28 Z"
              fill="none"
              stroke="url(#logo-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            />
            
            {/* Core Swarm Particles */}
            <circle cx="20" cy="18" r="2.5" fill="currentColor" className="text-blue-500" />
            <circle cx="14" cy="26" r="1.5" fill="currentColor" className="text-purple-500" />
            <circle cx="26" cy="26" r="1.5" fill="currentColor" className="text-blue-400" />
          </svg>

          {/* Orbiting Particles */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </motion.div>
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-bold tracking-tight text-theme-primary">
            Aetheris
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold tracking-widest uppercase text-theme-secondary opacity-40">
              Swarm
            </span>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
}
