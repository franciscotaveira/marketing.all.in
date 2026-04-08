import React from 'react';
import { motion } from 'motion/react';

export function AetherisLogo() {
  return (
    <div className="relative group w-10 h-10">
      <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10 w-10 h-10 rounded-xl bg-theme-surface border border-theme-glass flex items-center justify-center overflow-hidden shadow-lg">
        {/* Futuristic SVG Logo */}
        <svg viewBox="0 0 100 100" className="w-7 h-7">
          <defs>
            <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Orbiting nodes */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50px", originY: "50px" }}
          >
            <circle cx="20" cy="50" r="4" fill="#A855F7" filter="url(#glow)" />
            <circle cx="80" cy="50" r="3" fill="#10B981" filter="url(#glow)" />
            <circle cx="50" cy="20" r="3.5" fill="#3B82F6" filter="url(#glow)" />
            <circle cx="50" cy="80" r="2.5" fill="#8B5CF6" filter="url(#glow)" />
          </motion.g>
          
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            style={{ originX: "50px", originY: "50px" }}
          >
            <circle cx="35" cy="35" r="2" fill="#34D399" opacity="0.6" />
            <circle cx="65" cy="65" r="2.5" fill="#60A5FA" opacity="0.6" />
            <circle cx="35" cy="65" r="1.5" fill="#F472B6" opacity="0.6" />
            <circle cx="65" cy="35" r="2" fill="#A78BFA" opacity="0.6" />
          </motion.g>

          {/* Central Core */}
          <motion.circle 
            cx="50" cy="50" r="12" 
            fill="url(#coreGradient)" 
            filter="url(#glow)"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          {/* Interconnecting lines */}
          <path 
            d="M50 50 L20 50 M50 50 L80 50 M50 50 L50 20 M50 50 L50 80" 
            stroke="white" 
            strokeWidth="0.5" 
            opacity="0.2" 
          />
        </svg>
      </div>
    </div>
  );
}
