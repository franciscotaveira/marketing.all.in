import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Trash2, Search, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { firebaseService } from '../lib/firebaseService';
import { Message, ChatSession } from '../types';

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setCurrentChatId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ChatHistory({ isOpen, onClose, setMessages, setCurrentChatId }: ChatHistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const { data: chats, error } = await firebaseService.getChats();
      
      if (error) {
        console.error("Error loading chat history:", error);
        setSessions([]);
        return;
      }

      if (chats && chats.length > 0) {
        setSessions(chats);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSession = async (session: ChatSession) => {
    const { data: messages, error } = await firebaseService.getMessages(session.id);
    if (!error && messages) {
      setMessages(messages as Message[]);
      setCurrentChatId(session.id);
      onClose();
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await firebaseService.deleteChat(sessionId);
    if (!error) {
      setSessions(sessions.filter(s => s.id !== sessionId));
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-black/5 flex items-center justify-between bg-black/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tighter text-black/90">Histórico de Chats</h2>
                  <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">Suas conversas anteriores</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-black/10 rounded-xl transition-all active:scale-95"
              >
                <X className="w-5 h-5 text-black/60" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-black/5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar nas conversas..."
                  className="w-full pl-10 pr-4 py-3 bg-black/5 border border-transparent rounded-xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <div className="w-8 h-8 border-4 border-black/10 border-t-black rounded-full animate-spin" />
                  <p className="text-xs font-bold text-black/40 uppercase tracking-widest">Carregando histórico...</p>
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4 text-center">
                  <MessageSquare className="w-12 h-12 text-black/10" />
                  <div>
                    <p className="text-sm font-bold text-black/60">Nenhuma conversa encontrada</p>
                    <p className="text-xs text-black/40">Seu histórico de chats aparecerá aqui.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSessions.map((session) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => handleLoadSession(session)}
                      className="group p-4 rounded-2xl border border-black/5 hover:border-blue-500/30 hover:bg-blue-50/50 cursor-pointer transition-all flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-black/90 truncate">{session.title}</h3>
                          <span className="text-[10px] font-bold text-black/40 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.updatedAt || session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-black/60 truncate">Sessão de chat</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir conversa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
