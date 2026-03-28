import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Loader2, Paperclip, X, Trash2, Mic, 
  ImageIcon, Video, HelpCircle 
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
  handleSend: () => void;
  handleGenerateImage: () => void;
  handleGenerateVideo: () => void;
  setIsLiveMode: (value: boolean) => void;
  setMessages: (messages: any[]) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  handleInputKeyDown: (e: React.KeyboardEvent) => void;
  showCommandMenu: boolean;
  filteredCommands: any[];
  selectedCommandIndex: number;
  getCategoryIcon: (category: string) => React.ReactNode;
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
  handleGenerateImage,
  handleGenerateVideo,
  setIsLiveMode,
  setMessages,
  handlePaste,
  handleInputKeyDown,
  showCommandMenu,
  filteredCommands,
  selectedCommandIndex,
  getCategoryIcon
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
    <div className="p-4 md:p-8 bg-white/80 backdrop-blur-3xl border-t border-black/5 relative z-20">
      <div className="max-w-4xl mx-auto relative">
        <div className="absolute -top-12 left-0 flex gap-2 overflow-x-auto pb-3 no-scrollbar max-w-full">
          {selectedSkill && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2.5 bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap shadow-lg shadow-blue-200"
            >
              {getCategoryIcon(selectedSkill.category)}
              {selectedSkill.name}
              <button onClick={() => setSelectedSkill(null)} className="hover:text-white/70 transition-colors ml-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
          {selectedImages.map((img, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={idx}
              className="relative group h-10 w-10"
            >
              <img src={img} className="h-full w-full object-cover rounded-xl border-2 border-white shadow-md" referrerPolicy="no-referrer" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </motion.div>
          ))}
        </div>
        
        <div className="group bg-white rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-black/5 p-2 transition-all focus-within:shadow-[0_20px_60px_rgba(0,0,0,0.12)] focus-within:border-blue-500/20 flex flex-col md:flex-row items-end gap-2 relative">
          
          <AnimatePresence>
            {showCommandMenu && filteredCommands.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-50"
              >
                {filteredCommands.map((cmd, index) => (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-black/5 transition-colors ${index === selectedCommandIndex ? 'bg-black/5' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
                      <cmd.icon className="w-4 h-4 text-black/70" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-black/80">{cmd.label}</div>
                      <div className="text-[10px] font-medium text-black/40 uppercase tracking-wider">/{cmd.id}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={handlePaste}
            onKeyDown={handleInputKeyDown}
            placeholder={selectedSkill ? `Pergunte sobre ${selectedSkill.name.toLowerCase()}...` : "Qual é o seu desafio de marketing hoje? (Digite '/' para comandos)"}
            className="flex-1 w-full bg-transparent rounded-[2rem] p-5 focus:outline-none transition-all min-h-[80px] max-h-[300px] resize-none font-medium text-black/70 placeholder:text-black/20"
          />
            <div className="flex gap-1.5 md:gap-2 pb-2 pr-2 w-full md:w-auto overflow-x-auto custom-scrollbar justify-end">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                multiple 
                accept="image/*" 
              />
              <div className="relative">
                <div className="flex items-center bg-red-50 text-red-500 rounded-2xl transition-all">
                  <button
                    onClick={() => setMessages([])}
                    className="p-3 md:p-4 hover:bg-red-100 rounded-l-2xl"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'limpar_chat' ? null : 'limpar_chat'); }}
                    className="pr-2 pl-1 py-3 md:pr-3 md:py-4 opacity-50 hover:opacity-100 rounded-r-2xl hover:bg-red-100"
                  >
                    <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              <AnimatePresence>
                {activeTooltip === 'limpar_chat' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-red-400 mb-1">Limpar Chat</strong>
                    Apaga todo o histórico da conversa atual.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
              <div className="relative">
                <div className="flex items-center bg-black/5 text-black/40 rounded-2xl transition-all">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 md:p-4 hover:bg-black/10 hover:text-black rounded-l-2xl active:scale-90"
                  >
                    <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'anexar' ? null : 'anexar'); }}
                    className="pr-2 pl-1 py-3 md:pr-3 md:py-4 opacity-50 hover:opacity-100 hover:bg-black/10 hover:text-black rounded-r-2xl"
                  >
                    <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                </div>
              <AnimatePresence>
                {activeTooltip === 'anexar' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-gray-400 mb-1">Anexar Imagem</strong>
                    Adiciona uma imagem como contexto para a IA.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <div className="flex items-center bg-white border border-black/5 text-black/40 rounded-2xl transition-all shadow-sm hover:shadow-md group">
                <button
                  onClick={handleGenerateImage}
                  disabled={!input.trim() || isLoading}
                  className="p-3 md:p-4 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 rounded-l-2xl"
                >
                  <ImageIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:text-blue-600 transition-colors" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'gerar_imagem' ? null : 'gerar_imagem'); }}
                  className="pr-2 pl-1 py-3 md:pr-3 md:py-4 opacity-50 hover:opacity-100 rounded-r-2xl"
                >
                  <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
              <AnimatePresence>
                {activeTooltip === 'gerar_imagem' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-blue-400 mb-1">Gerar Imagem</strong>
                    Cria uma imagem baseada no seu texto.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <div className="flex items-center bg-white border border-black/5 text-black/40 rounded-2xl transition-all shadow-sm hover:shadow-md group">
                <button
                  onClick={handleGenerateVideo}
                  disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                  className="p-3 md:p-4 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 rounded-l-2xl"
                >
                  <Video className="w-4 h-4 md:w-5 md:h-5 group-hover:text-indigo-600 transition-colors" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'gerar_video' ? null : 'gerar_video'); }}
                  className="pr-2 pl-1 py-3 md:pr-3 md:py-4 opacity-50 hover:opacity-100 rounded-r-2xl"
                >
                  <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
              <AnimatePresence>
                {activeTooltip === 'gerar_video' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-indigo-400 mb-1">Gerar Vídeo</strong>
                    Cria vídeos curtos usando o modelo Veo.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <div className="flex items-center bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl transition-all shadow-sm hover:shadow-md group">
                <button
                  onClick={() => setIsLiveMode(true)}
                  className="p-3 md:p-4 hover:scale-105 active:scale-95 rounded-l-2xl"
                >
                  <Mic className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'voz' ? null : 'voz'); }}
                  className="pr-2 pl-1 py-3 md:pr-3 md:py-4 opacity-50 hover:opacity-100 rounded-r-2xl"
                >
                  <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
              <AnimatePresence>
                {activeTooltip === 'voz' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-rose-400 mb-1">Conversa em Tempo Real</strong>
                    Ativa o modo de voz para conversar com o agente ao vivo.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <div className="flex items-center bg-blue-600 text-white rounded-2xl transition-all shadow-lg shadow-blue-200">
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                  className="p-3 md:p-4 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 rounded-l-2xl"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === 'enviar' ? null : 'enviar'); }}
                  className="pr-2 pl-1 py-3 md:pr-3 md:py-4 opacity-50 hover:opacity-100 rounded-r-2xl"
                >
                  <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                </button>
              </div>
              <AnimatePresence>
                {activeTooltip === 'enviar' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 leading-relaxed text-center"
                  >
                    <strong className="block text-blue-400 mb-1">Enviar Mensagem</strong>
                    Envia sua mensagem para o agente.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">Gemini 3 Flash Intelligence</p>
          <div className="w-1 h-1 bg-black rounded-full" />
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">Enxame de Marketing v2.1 PRO</p>
        </div>
      </div>
    </div>
  );
}
