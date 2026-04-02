import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Lightbulb, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'insight' | 'action';
  impact: 'high' | 'medium' | 'low';
}

const SUGGESTIONS: Suggestion[] = [
  {
    id: '1',
    title: 'Otimização de Rotina',
    description: 'Você costuma ser mais produtivo entre 9h e 11h. Que tal mover suas tarefas complexas para esse horário?',
    type: 'optimization',
    impact: 'high'
  },
  {
    id: '2',
    title: 'Insight de Campanha',
    description: 'O engajamento no Instagram subiu 15% após o último post. Recomendamos manter o tom de voz atual.',
    type: 'insight',
    impact: 'medium'
  },
  {
    id: '3',
    title: 'Ação Recomendada',
    description: 'Existem 3 tarefas atrasadas que dependem de você. Deseja que eu as reorganize na sua agenda?',
    type: 'action',
    impact: 'high'
  }
];

export const AISuggestions: React.FC = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-theme-glass flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-theme-purple/20 flex items-center justify-center text-theme-purple">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-theme-primary">Sugestões de IA</h3>
          <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest">Otimização em Tempo Real</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {SUGGESTIONS.map((suggestion, index) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4 group cursor-pointer hover:bg-white/5 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={cn(
                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                suggestion.type === 'optimization' && "bg-theme-blue/20 text-theme-blue",
                suggestion.type === 'insight' && "bg-theme-purple/20 text-theme-purple",
                suggestion.type === 'action' && "bg-theme-orange/20 text-theme-orange"
              )}>
                {suggestion.type}
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest",
                suggestion.impact === 'high' ? "text-theme-rose" : "text-theme-secondary"
              )}>
                <Zap className="w-2 h-2" />
                {suggestion.impact} impact
              </div>
            </div>
            
            <h4 className="text-xs font-black mb-1 group-hover:text-theme-blue transition-colors text-theme-primary">{suggestion.title}</h4>
            <p className="text-[11px] text-theme-secondary leading-relaxed mb-3">{suggestion.description}</p>
            
            <button className="w-full py-2 rounded-lg bg-theme-glass hover:bg-theme-glass/80 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-theme-primary">
              Aplicar Sugestão
              <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        ))}

        <div className="glass-card p-6 border-dashed border-theme-glass flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-theme-glass flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-theme-secondary opacity-40" />
          </div>
          <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest leading-relaxed">
            Novas sugestões aparecerão conforme você utiliza a plataforma.
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-theme-glass">
        <div className="glass-card p-3 bg-theme-blue/10 border-theme-blue/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-theme-blue flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-theme-blue">Produtividade</span>
            <span className="text-xs font-black text-theme-primary">+24% esta semana</span>
          </div>
        </div>
      </div>
    </div>
  );
};
