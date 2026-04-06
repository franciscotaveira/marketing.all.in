import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Lightbulb, TrendingUp, Zap, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
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
      where('status', '!=', 'done'),
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
        Analise estas tarefas pendentes do usuário e sugira 3 otimizações ou ações prioritárias:
        ${tasks.map(t => `- [${t.priority}] ${t.title}: ${t.description || ''}`).join('\n')}
        
        Responda APENAS um JSON no formato:
        Array<{ title: string, description: string, type: 'optimization' | 'insight' | 'action', impact: 'high' | 'medium' | 'low' }>
      `;

      const result = await orchestrateRequest(
        prompt,
        'productivity-strategist',
        'gemini-3.1-pro-preview',
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
    <div className="flex flex-col h-full bg-theme-surface border border-theme-glass rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-theme-glass flex items-center justify-between bg-theme-surface/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-theme-primary">Sugestões de IA</h3>
            <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-wider opacity-60">Otimização em Tempo Real</p>
          </div>
        </div>
        <button 
          onClick={generateSuggestions}
          disabled={isLoading}
          className="btn-secondary p-2 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
              className="bg-theme-glass border border-theme-glass p-4 rounded-2xl group cursor-pointer hover:bg-theme-glass/80 transition-all shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                  suggestion.type === 'optimization' && "bg-blue-500/10 text-blue-500",
                  suggestion.type === 'insight' && "bg-purple-500/10 text-purple-500",
                  suggestion.type === 'action' && "bg-orange-500/10 text-orange-500"
                )}>
                  {suggestion.type}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider",
                  suggestion.impact === 'high' ? "text-rose-500" : "text-theme-secondary opacity-60"
                )}>
                  <Zap className="w-2.5 h-2.5" />
                  {suggestion.impact} impact
                </div>
              </div>
              
              <h4 className="text-sm font-bold mb-1 group-hover:text-blue-500 transition-colors text-theme-primary">{suggestion.title}</h4>
              <p className="text-[11px] text-theme-secondary leading-relaxed mb-3">{suggestion.description}</p>
              
              <button className="btn-secondary w-full py-2">
                Aplicar Sugestão
                <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {suggestions.length === 0 && !isLoading && (
          <div className="glass-card p-6 border-dashed border-theme-glass flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-theme-glass flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-theme-secondary opacity-40" />
            </div>
            <p className="text-[10px] font-bold text-theme-secondary uppercase tracking-widest leading-relaxed">
              Clique no ícone de atualizar para gerar sugestões baseadas nas suas tarefas atuais.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-theme-glass bg-theme-surface/50">
        <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-2xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Produtividade</span>
            <span className="text-xs font-bold text-theme-primary">+24% esta semana</span>
          </div>
        </div>
      </div>
    </div>
  );
};
