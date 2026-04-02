import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Trash2, Clock, ChevronRight, History, Search, X, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { firebaseService } from '../lib/firebaseService';
import { Message, ChatSession } from '../types';

interface SidebarChatHistoryProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  isLoading: boolean;
}

export function SidebarChatHistory({ 
  currentChatId, 
  onSelectChat, 
  onDeleteChat, 
  onNewChat,
  sessions,
  isLoading 
}: SidebarChatHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-black text-theme-primary hover:text-theme-blue transition-colors"
        >
          <History className={cn("w-3.5 h-3.5 transition-transform", isExpanded ? "rotate-0" : "-rotate-90")} />
          Histórico
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={onNewChat}
            className="p-1.5 bg-theme-blue/10 border border-theme-blue/20 rounded-lg text-theme-blue hover:bg-theme-blue/20 transition-all active:scale-90"
            title="Novo Chat"
          >
            <Plus className="w-3 h-3" />
          </button>
          {sessions.length > 0 && (
            <span className="text-[10px] font-black text-theme-blue bg-theme-blue/10 px-1.5 py-0.5 rounded-full">
              {sessions.length}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-3 overflow-hidden"
          >
            {/* Search */}
            <div className="px-2">
              <div className="relative group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-theme-secondary opacity-30 group-focus-within:text-theme-blue transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar conversas..."
                  className="w-full pl-8 pr-8 py-2 bg-theme-glass border border-theme-glass rounded-xl text-[10px] font-bold uppercase tracking-widest text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-theme-blue/30 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-theme-glass rounded-full text-theme-secondary opacity-30 hover:opacity-100 transition-all"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar px-1">
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-40">
                  <div className="w-4 h-4 border-2 border-theme-glass border-t-theme-blue rounded-full animate-spin" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Sincronizando...</span>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="py-8 text-center opacity-30">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-[8px] font-black uppercase tracking-widest">Nenhum chat encontrado</p>
                </div>
              ) : (
                filteredSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "group relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                      currentChatId === session.id
                        ? "bg-theme-blue/10 border-theme-blue/30 text-theme-blue shadow-lg shadow-blue-500/5"
                        : "bg-theme-glass border-theme-glass text-theme-secondary hover:bg-theme-glass/80 hover:text-theme-primary"
                    )}
                    onClick={() => onSelectChat(session.id)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        currentChatId === session.id ? "bg-theme-blue text-white" : "bg-theme-glass border border-theme-glass"
                      )}>
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black uppercase tracking-widest truncate leading-tight">
                          {session.title || "Nova Conversa"}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 opacity-40">
                          <Clock className="w-2.5 h-2.5" />
                          <span className="text-[8px] font-bold font-mono">
                            {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(session.id);
                        }}
                        className="p-1.5 hover:bg-theme-rose/10 rounded-lg text-theme-secondary hover:text-theme-rose transition-all"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <ChevronRight className="w-3 h-3 opacity-20" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
