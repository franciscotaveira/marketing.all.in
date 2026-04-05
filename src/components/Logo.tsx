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
      <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
        {/* Core Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl rotate-45 opacity-20 blur-md animate-pulse" />
        <div className="absolute inset-0.5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-xl rotate-45 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        
        {/* Inner Dark Core */}
        <div className="absolute inset-1.5 bg-theme-main rounded-lg rotate-45 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
        </div>
        
        {/* Swarm Nodes (Orbiting) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div className="absolute bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
          <div className="absolute bottom-1 -right-1 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" />
        </motion.div>

        {/* Center Dot */}
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,1)]" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
            Aetheris
          </span>
          <span className="text-[8px] font-black tracking-[0.3em] uppercase text-theme-secondary -mt-1">
            Swarm
          </span>
        </div>
      )}
    </div>
  );
}
