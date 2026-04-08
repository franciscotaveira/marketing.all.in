import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AetherisLogo } from './AetherisLogo';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <AetherisLogo />
      
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
