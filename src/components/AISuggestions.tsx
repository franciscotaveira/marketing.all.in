import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Lightbulb, TrendingUp, Zap, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth } from '../firebase';
import { collection, query, onSnapshot, where, limit } from 'firebase/firestore';
import { Task, MarketingSkill } from '../types';
import { orchestrateRequest } from '../services/orchestrator';
import { MARKETING_SKILLS } from '../constants';

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'optimization' | 'insight' | 'action';
  impact: 'high' | 'medium' | 'low';
}

export const AISuggestions: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'tasks'),
      where('status', 'in', ['prospect', 'setup', 'todo', 'in-progress']),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]);
    });
    return () => unsubscribe();
  }, []);

  const generateSuggestions = async () => {
    if (!auth.currentUser || tasks.length === 0) return;
    setIsLoading(true);

    try {
      const prompt = `
        Analise a lista atual do Pipeline de Clientes de uma agência de Automação/SDR e sugira 3 ações estratégicas para fechar negócios ou entregar os bots mais rápido:
        ${tasks.map(t => `- [${t.priority}] ${t.title} (Status: ${t.status}): ${t.description || ''}`).join('\n')}
        
        Responda APENAS um JSON estrito no formato:
        Array<{ title: string, description: string, type: 'optimization' | 'insight' | 'action', impact: 'high' | 'medium' | 'low' }>
      `;

      const result = await orchestrateRequest(
        prompt,
        'productivity-strategist',
        'gemini-3-flash-preview',
        'Você é um estrategista de produtividade que gera sugestões em JSON.',
        false,
        false,
        () => {},
        MARKETING_SKILLS
      );

      const jsonMatch = result.response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setSuggestions(parsed.map((s: any, i: number) => ({ ...s, id: `ai-${Date.now()}-${i}` })));
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-surface border border-theme-glass rounded-[24px] overflow-hidden shadow-sm">
      <div className="p-4 border-b border-theme-glass flex items-center justify-between bg-theme-card/30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20 shadow-sm">
            <Bot className="w-3 h-3" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-primary">Inteligência de Venda</h3>
            <p className="text-[8px] font-bold text-theme-secondary uppercase tracking-wider">Insights sobre Clientes</p>
          </div>
        </div>
        <button 
          onClick={generateSuggestions}
          disabled={isLoading}
          className="btn-secondary p-1.5 disabled:opacity-50 shadow-sm text-[8px] font-bold uppercase"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 " />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gradient-to-b from-theme-glass/5 to-transparent">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="bg-theme-card border border-theme-glass p-3 rounded-xl group cursor-pointer hover:border-theme-secondary/30 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "px-2 py-0.5 rounded-[6px] text-[7px] font-black uppercase tracking-widest border shadow-sm",
                  suggestion.type === 'optimization' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  suggestion.type === 'insight' && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                  suggestion.type === 'action' && "bg-orange-500/10 text-orange-500 border-orange-500/20"
                )}>
                  {suggestion.type}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[7px] font-black uppercase tracking-widest",
                  suggestion.impact === 'high' ? "text-rose-500" : "text-theme-secondary opacity-60"
                )}>
                  <Zap className={cn("w-2 h-2", suggestion.impact === 'high' ? "fill-rose-500/20" : "")} />
                  {suggestion.impact}
                </div>
              </div>
              
              <h4 className="text-xs font-bold mb-1 group-hover:text-blue-500 transition-colors text-theme-primary leading-tight">{suggestion.title}</h4>
              <p className="text-[9px] text-theme-secondary leading-relaxed mb-3 font-medium">{suggestion.description}</p>
              
              <button className="btn-primary w-full py-1.5 text-[8px] font-black uppercase tracking-widest">
                Aplicar
                <ChevronRight className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {suggestions.length === 0 && !isLoading && (
          <div className="bg-theme-card/50 border-2 border-dashed border-theme-glass p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-theme-glass flex items-center justify-center shadow-inner">
              <Lightbulb className="w-5 h-5 text-theme-secondary opacity-30" />
            </div>
            <p className="text-[8px] font-bold text-theme-secondary uppercase tracking-widest leading-relaxed max-w-[150px]">
              Gere insights de conversão baseados nos clientes do seu pipeline.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-theme-glass bg-theme-card/30">
        <div className="bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl flex items-center gap-3 shadow-inner">
          <div className="w-8 h-8 rounded-[10px] bg-blue-600 flex items-center justify-center shadow-md border border-blue-400/30">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">Oportunidades</span>
            <span className="text-xs font-bold text-theme-primary">+3 Leads esta semana</span>
          </div>
        </div>
      </div>
    </div>
  );
};
