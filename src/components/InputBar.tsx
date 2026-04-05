import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Loader2, Paperclip, X, Trash2, Mic, 
  ImageIcon, Video, HelpCircle, Users 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { MarketingSkill } from '../types';

interface InputBarProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  selectedSkill: MarketingSkill | null;
  setSelectedSkill: (skill: MarketingSkill | null) => void;
  selectedImages: string[];
  removeImage: (index: number) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSend: (overrideInput?: string | React.MouseEvent | React.KeyboardEvent) => void;
  setMessages: (messages: any[]) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleInputKeyDown: (e: React.KeyboardEvent) => void;
  showCommandMenu: boolean;
  filteredCommands: any[];
  selectedCommandIndex: number;
  getCategoryIcon: (category: string) => React.ReactNode;
  useSwarmMode: boolean;
}

export function InputBar({
  input,
  setInput,
  isLoading,
  selectedSkill,
  setSelectedSkill,
  selectedImages,
  removeImage,
  handleImageUpload,
  handleSend,
  setMessages,
  handlePaste,
  handleInputKeyDown,
  showCommandMenu,
  filteredCommands,
  selectedCommandIndex,
  getCategoryIcon,
  useSwarmMode
}: InputBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveTooltip(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="p-3 md:p-4 bg-theme-main/40 backdrop-blur-3xl border-t border-theme-glass relative z-20">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute -top-12 left-0 flex gap-2 overflow-x-auto pb-3 no-scrollbar max-w-full">
          {selectedSkill && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-lg shadow-blue-500/20"
            >
              {getCategoryIcon(selectedSkill.category)}
              {selectedSkill.name}
              <button onClick={() => setSelectedSkill(null)} className="hover:text-white/70 transition-colors ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
          {useSwarmMode && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-gradient-to-r from-purple-600 to-rose-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-lg shadow-purple-500/20 border border-white/20"
            >
              <Users className="w-3.5 h-3.5" />
              Swarm Ativo
            </motion.div>
          )}
          {selectedImages.map((img, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={idx}
              className="relative group h-10 w-10"
            >
              <img src={img} className="h-full w-full object-cover rounded-xl border-2 border-white/20 shadow-md" referrerPolicy="no-referrer" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
        </div>
        
          <div className={cn(
            "group bg-theme-glass/40 backdrop-blur-3xl rounded-[24px] shadow-2xl border border-theme-glass/50 p-2 transition-all focus-within:shadow-blue-500/10 focus-within:border-blue-500/40 flex flex-col md:flex-row items-end gap-2 relative ring-1 ring-white/5 focus-within:ring-blue-500/20",
            isLoading && "animate-pulse border-blue-500/30"
          )}>
          
          <AnimatePresence>
            {showCommandMenu && filteredCommands.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-4 w-72 bg-theme-main/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-theme-glass/60 overflow-hidden z-50"
              >
                <div className="p-2 border-b border-theme-glass/40 bg-theme-glass/20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-50">Comandos Disponíveis</span>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {filteredCommands.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-theme-glass transition-all ${index === selectedCommandIndex ? 'bg-theme-glass border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                        index === selectedCommandIndex ? "bg-blue-500/20 text-blue-400" : "bg-theme-glass text-theme-secondary"
                      )}>
                        <cmd.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-theme-primary leading-none mb-1">{cmd.label}</div>
                        <div className="text-[10px] font-black text-theme-secondary uppercase tracking-widest opacity-40">/{cmd.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleInputKeyDown}
            placeholder={selectedSkill ? `Pergunte sobre ${selectedSkill.name.toLowerCase()}...` : "Qual é o seu desafio de marketing hoje? (Digite '/' para comandos)"}
            className="flex-1 w-full bg-transparent rounded-2xl p-4 focus:outline-none transition-all min-h-[60px] max-h-[300px] resize-none font-medium text-base md:text-sm text-theme-primary placeholder:text-theme-secondary/30"
          />
            <div className="flex gap-1.5 md:gap-2 pb-1 pr-1 w-full md:w-auto overflow-x-auto custom-scrollbar justify-end">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                multiple 
                accept="image/*" 
              />
              <div className="relative">
                <div className="flex items-center bg-red-500/10 text-red-400 rounded-xl transition-all border border-red-500/20">
                  <button
                    onClick={() => setMessages([])}
                    className="p-2.5 hover:bg-red-500/20 rounded-l-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'limpar_chat' ? null : 'limpar_chat'); }}
                    className="pr-2 pl-1 py-2.5 opacity-50 hover:opacity-100 rounded-r-xl hover:bg-red-500/20"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              <AnimatePresence>
                {activeTooltip === 'limpar_chat' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-theme-main border border-theme-glass text-theme-primary text-xs rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-red-400 mb-1">Limpar Chat</strong>
                    Apaga todo o histórico da conversa atual.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
              <div className="relative">
                <div className="flex items-center bg-theme-glass text-theme-secondary rounded-xl transition-all border border-theme-glass">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 hover:bg-theme-glass/80 hover:text-theme-primary rounded-l-xl active:scale-95"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'anexar' ? null : 'anexar'); }}
                    className="pr-2 pl-1 py-2.5 opacity-50 hover:opacity-100 hover:bg-theme-glass/80 hover:text-theme-primary rounded-r-xl active:scale-95"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              <AnimatePresence>
                {activeTooltip === 'anexar' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-theme-main border border-theme-glass text-theme-primary text-xs rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-theme-secondary mb-1">Anexar Imagem</strong>
                    Adiciona uma imagem como contexto para a IA.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <div className="flex items-center bg-blue-600 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20">
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                  className="p-2.5 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 rounded-l-xl"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'enviar' ? null : 'enviar'); }}
                  className="pr-2 pl-1 py-2.5 opacity-50 hover:opacity-100 rounded-r-xl active:scale-95"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <AnimatePresence>
                {activeTooltip === 'enviar' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-theme-main border border-theme-glass text-theme-primary text-xs rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-blue-400 mb-1">Enviar Mensagem</strong>
                    Envia sua mensagem para o agente.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-6 opacity-20 text-center">
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-theme-primary">Gemini 3 Flash Intelligence</p>
          <div className="hidden md:block w-1 h-1 bg-theme-primary rounded-full" />
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-theme-primary">Enxame de Marketing v2.1 PRO</p>
        </div>
      </div>
    </div>
  );
}
