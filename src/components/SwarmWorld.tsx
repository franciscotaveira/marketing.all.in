import React, { memo } from 'react';
import { motion } from "motion/react";
import { Bot, Brain, FileText, Search, Megaphone, BarChart3, Users, Target, DollarSign } from "lucide-react";
import { cn } from "../lib/utils";
import { MARKETING_SKILLS } from "../constants";
import { KnowledgeGraph } from './KnowledgeGraph';
import { KnowledgeItem } from '../types';
import { TestKnowledgeBase } from './TestKnowledgeBase';

interface Agent {
  id: string;
  name: string;
  status: "idle" | "thinking" | "orchestrating" | "swarming";
  role: string;
  icon?: React.ReactNode;
}
const AGENT_CONFIG = {
  "1": { role: "Content & Copy", icon: <FileText className="w-4 h-4" /> },
  "2": { role: "SEO & Discovery", icon: <Search className="w-4 h-4" /> },
  "3": { role: "Paid & Distribution", icon: <Megaphone className="w-4 h-4" /> },
  "4": { role: "Measurement & Testing", icon: <BarChart3 className="w-4 h-4" /> },
  "5": { role: "Sales & RevOps", icon: <DollarSign className="w-4 h-4" /> },
  "6": { role: "Copy Chief", icon: <FileText className="w-4 h-4" /> },
  "7": { role: "Visual Design", icon: <Users className="w-4 h-4" /> },
  "8": { role: "Data Science", icon: <Target className="w-4 h-4" /> },
  "9": { role: "Brand Strategy", icon: <Brain className="w-4 h-4" /> },
};

export function SwarmWorld({ agents, knowledgeBase }: { 
  agents: (Agent & { role: string })[], 
  knowledgeBase: KnowledgeItem[]
}) {
  const latestInsights = knowledgeBase.slice(-5).reverse();

  return (
    <div className="relative w-full h-[700px] bg-black rounded-2xl border border-white/10 p-4 md:p-6 flex flex-col md:grid md:grid-cols-4 gap-6 overflow-hidden md:overflow-y-auto custom-scrollbar">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black" />

      {/* Left Column: Swarm (3/4 width) */}
      <div className="md:col-span-3 flex flex-col gap-6 z-10 shrink-0">
        <div className="flex justify-end">
          <TestKnowledgeBase />
        </div>
        {/* Orchestrator & Agents (Tree) */}
        <div className="flex flex-col items-center z-10">
          <motion.div 
            className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex flex-col items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.5)] border-4 border-blue-400/30"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Brain className="w-6 h-6 md:w-8 md:h-8 text-white mb-1" />
            <span className="text-[6px] md:text-[8px] font-bold text-white uppercase tracking-widest">Orquestrador</span>
          </motion.div>
          <div className="w-px h-6 bg-blue-500/50" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6">
          {agents.map((agent) => {
            const config = AGENT_CONFIG[agent.id as keyof typeof AGENT_CONFIG] || { role: "Especialista", icon: <Bot /> };
            return (
              <motion.div
                key={agent.id}
                className={cn(
                  "flex flex-col items-center p-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm transition-colors",
                  agent.status === "thinking" ? "border-amber-500/50 bg-amber-500/10" : ""
                )}
              >
                <div className="flex items-center gap-2 mb-1 text-white/40">
                  {config.icon}
                  <span className="text-[8px] font-bold uppercase tracking-widest text-center">{config.role}</span>
                </div>
                <span className="text-[10px] font-bold text-white/90 mb-2 text-center">{agent.name}</span>
                <div className="flex flex-wrap gap-1 justify-center">
                  {MARKETING_SKILLS
                    .filter(s => s.category.toLowerCase().includes(config.role.toLowerCase().split(' ')[0].toLowerCase()) || s.name.toLowerCase().includes(config.role.toLowerCase().split(' ')[0].toLowerCase()))
                    .slice(0, 2)
                    .map(s => (
                      <span key={s.id} className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded text-white/60 truncate max-w-[60px]">
                        {s.name.split(' ')[0]}
                      </span>
                    ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Intelligence Hub (1/4 width) */}
      <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-4 flex flex-col gap-4 z-10 shrink-0">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Hub de Inteligência</h3>
        
        {/* Knowledge Map */}
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 h-[300px]">
          <h4 className="text-[8px] font-bold uppercase text-white/30 mb-2">Mapa de Conhecimento</h4>
          <KnowledgeGraph knowledgeBase={knowledgeBase} />
        </div>

        {/* Insight Feed */}
        <div className="flex flex-col gap-2">
          <h4 className="text-[8px] font-bold uppercase text-white/30">Insights Recentes</h4>
          {latestInsights.map(insight => (
            <motion.div 
              key={insight.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 rounded-lg p-2 border border-white/5 text-[10px] text-white/70"
            >
              <div className="flex justify-between mb-1">
                <span className="font-bold text-blue-400">{insight.topic}</span>
                <span className="opacity-50">{(insight.confidence * 100).toFixed(0)}%</span>
              </div>
              <p className="line-clamp-2">{insight.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
