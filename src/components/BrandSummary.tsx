import React from 'react';
import { motion } from 'motion/react';
import { Building2, Target, Heart, Trophy, Mic } from 'lucide-react';
import { Company } from '../types';
import { cn } from '../lib/utils';

interface BrandSummaryProps {
  company: Company | null;
  className?: string;
}

export const BrandSummary: React.FC<BrandSummaryProps> = ({ company, className }) => {
  if (!company) {
    return (
      <div className={cn("p-6 rounded-3xl border border-theme-glass bg-theme-surface/50 text-center space-y-3", className)}>
        <div className="w-10 h-10 bg-theme-glass rounded-2xl flex items-center justify-center mx-auto opacity-40">
          <Building2 className="w-5 h-5 text-theme-secondary" />
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-theme-secondary">Nenhuma Empresa Ativa</p>
        <p className="text-[11px] text-theme-secondary">Configure o contexto da marca para guiar os agentes.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-6 rounded-3xl border border-theme-glass bg-theme-card/40 space-y-6 relative overflow-hidden group shadow-lg backdrop-blur-sm", className)}
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <Building2 className="w-32 h-32 rotate-12" />
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg border border-blue-400/30">
          <Building2 className="w-7 h-7 text-white" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-lg font-black tracking-tighter text-theme-primary truncate leading-none mb-1">{company.name}</h3>
          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{company.industry}</p>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        {company.toneOfVoice && (
          <div className="space-y-2 p-3 bg-theme-surface/60 border border-theme-glass rounded-xl shadow-inner">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-theme-secondary opacity-60">
              <Mic className="w-3 h-3 text-blue-500" />
              Tom de Voz
            </div>
            <p className="text-[11px] text-theme-primary font-bold leading-relaxed">{company.toneOfVoice}</p>
          </div>
        )}

        {company.brandValues && company.brandValues.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-theme-secondary opacity-60">
              <Heart className="w-3 h-3 text-rose-500" />
              Valores
            </div>
            <div className="flex flex-wrap gap-2">
              {company.brandValues.map((val, i) => (
                <span key={i} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-black text-blue-400 uppercase tracking-widest shadow-sm">
                  {val}
                </span>
              ))}
            </div>
          </div>
        )}

        {company.primaryGoals && company.primaryGoals.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-theme-secondary opacity-60">
              <Trophy className="w-3 h-3 text-amber-500" />
              Objetivos
            </div>
            <div className="flex flex-wrap gap-2">
              {company.primaryGoals.map((goal, i) => (
                <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest shadow-sm">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
