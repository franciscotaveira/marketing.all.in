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
  onDeleteAllChats: () => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  isLoading: boolean;
}

export function SidebarChatHistory({ 
  currentChatId, 
  onSelectChat, 
  onDeleteChat, 
  onDeleteAllChats,
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
          className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold text-theme-secondary/50 hover:text-theme-primary transition-colors"
        >
          <div className="w-1 h-1 rounded-full bg-blue-500/50" />
          Histórico
        </button>
        <div className="flex items-center gap-2">
          <button 
            onClick={onNewChat}
            className="btn-secondary p-1.5"
            title="Novo Chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {sessions.length > 0 && (
            <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-secondary opacity-40 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar conversas..."
                  className="w-full pl-9 pr-8 py-2 bg-theme-glass border border-theme-glass rounded-xl text-sm font-medium text-theme-primary placeholder:text-theme-secondary/40 focus:outline-none focus:border-blue-500/30 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-theme-glass rounded-full text-theme-secondary opacity-40 hover:opacity-100 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar px-1">
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-40">
                  <div className="w-4 h-4 border-2 border-theme-glass border-t-blue-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Sincronizando...</span>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="py-8 text-center opacity-30">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-wider">Nenhum chat encontrado</p>
                </div>
              ) : (
                <>
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                        currentChatId === session.id
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-sm"
                          : "bg-theme-glass border-theme-glass text-theme-secondary hover:bg-theme-glass/80 hover:text-theme-primary"
                      )}
                      onClick={() => onSelectChat(session.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                          currentChatId === session.id ? "bg-blue-500 text-white" : "bg-theme-glass border border-theme-glass"
                        )}>
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-sm font-semibold truncate leading-tight tracking-tight",
                            currentChatId === session.id ? "text-blue-500" : "text-theme-primary"
                          )}>
                            {session.title || "Nova Conversa"}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 opacity-50">
                            <Clock className="w-3 h-3" />
                            <span className="text-[11px] font-medium tracking-tight">
                              {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(session.id);
                          }}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-theme-secondary hover:text-rose-500 transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 opacity-20 hidden md:block" />
                      </div>
                    </motion.div>
                  ))}
                  
                  <div className="pt-4 px-2">
                    <button 
                      onClick={onDeleteAllChats}
                      className="btn-secondary w-full text-rose-500 border-rose-500/20 hover:border-rose-500/40 hover:bg-rose-500/5 group"
                    >
                      <Trash2 className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      Limpar Histórico
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
