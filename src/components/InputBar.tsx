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
    <div className="p-3 md:p-4 bg-theme-main/40 border-t border-theme-glass relative z-20 backdrop-blur-md">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute -top-12 left-0 flex gap-2 overflow-x-auto pb-2 no-scrollbar max-w-full">
          {selectedSkill && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-theme-blue text-white px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap shadow-[0_5px_15px_rgba(59,130,246,0.3)] border border-white/20"
            >
              {getCategoryIcon(selectedSkill.category)}
              {selectedSkill.name}
              <button onClick={() => setSelectedSkill(null)} className="hover:text-white/70 transition-colors ml-1 p-0.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
          {useSwarmMode && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-theme-purple text-white px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider whitespace-nowrap shadow-[0_5px_15px_rgba(139,92,246,0.3)] border border-white/20"
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
              <img src={img} className="h-full w-full object-cover rounded-xl border border-theme-glass shadow-sm" referrerPolicy="no-referrer" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
        </div>
        
          <div className={cn(
            "group bg-theme-main/60 border border-theme-glass rounded-[20px] p-1.5 transition-all focus-within:border-theme-blue/50 flex flex-col md:flex-row items-end gap-1.5 relative shadow-sm",
            isLoading && "animate-pulse border-theme-blue/30"
          )}>
          
          <AnimatePresence>
            {showCommandMenu && filteredCommands.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-4 w-72 bg-theme-surface border border-theme-glass rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-3 border-b border-theme-glass bg-theme-surface/50">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary">Comandos Disponíveis</span>
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
                        index === selectedCommandIndex ? "bg-blue-500/10 text-blue-500" : "bg-theme-glass text-theme-secondary"
                      )}>
                        <cmd.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-theme-primary leading-none mb-1">{cmd.label}</div>
                        <div className="text-[11px] font-bold text-theme-secondary uppercase tracking-wider">/{cmd.id}</div>
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
            className="flex-1 w-full bg-transparent rounded-[12px] p-2 focus:outline-none transition-all min-h-[36px] max-h-[300px] resize-none font-medium text-xs md:text-[11px] text-theme-primary placeholder:text-theme-secondary/30"
          />
            <div className="flex gap-1.5 pb-1 pr-1 w-full md:w-auto overflow-x-auto no-scrollbar justify-end items-center">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                multiple 
                accept="image/*" 
              />
              <div className="relative">
                <div className="flex items-center btn-secondary px-1 py-0.5 overflow-hidden border-theme-glass bg-theme-glass/10">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-theme-glass/80 hover:text-theme-primary transition-colors"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            
            <div className="relative">
              <div className={cn(
                "flex items-center px-1 py-0.5 overflow-hidden transition-all duration-500 rounded-[12px] border",
                useSwarmMode 
                  ? "bg-theme-purple border-white/20 shadow-[0_8px_25px_rgba(139,92,246,0.5)] text-white" 
                  : "btn-primary shadow-[0_8px_25px_rgba(255,255,255,0.1)]",
                (!input.trim() && selectedImages.length === 0 && !useSwarmMode) && "opacity-20 grayscale border-theme-glass scale-95"
              )}>
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                  className="p-1.5 px-3 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:gap-4 opacity-30 text-center">
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-theme-primary">Gemini 3 Flash Intelligence</p>
          <div className="hidden md:block w-1 h-1 bg-theme-primary rounded-full opacity-20" />
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-theme-primary">Enxame de Marketing v2.1 PRO</p>
        </div>
      </div>
    </div>
  );
}
