import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Bot, User, FileText, Volume2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Message, Artifact } from '../types';

interface ChatMessageProps {
  msg: Message;
  index: number;
  isSpeaking: boolean;
  copiedId: string | null;
  onArtifactClick: (art: Artifact) => void;
  onTTSClick: (text: string) => void;
  onCopyClick: (text: string, id: string) => void;
}

export const ChatMessage = memo(function ChatMessage({
  msg,
  index,
  isSpeaking,
  copiedId,
  onArtifactClick,
  onTTSClick,
  onCopyClick
}: ChatMessageProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 md:gap-6 group",
        msg.role === "user" ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg transition-transform group-hover:scale-110",
        msg.role === "user" ? "bg-black text-white" : "bg-white text-black border border-black/5"
      )}>
        {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={cn(
        "max-w-[85%] min-w-0 space-y-3",
        msg.role === "user" ? "text-right items-end" : "text-left items-start"
      )}>
        {msg.role === "ai" && (
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">
              {msg.agentName}
            </span>
            {msg.agentTier && (
              <span className="text-[8px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full uppercase font-black tracking-widest border border-blue-100">
                {msg.agentTier}
              </span>
            )}
          </div>
        )}
        <div className={cn(
          "p-4 md:p-6 rounded-[2rem] shadow-sm relative transition-all group-hover:shadow-md overflow-hidden break-words",
          msg.role === "user" 
            ? "bg-black text-white rounded-tr-none" 
            : "bg-white border border-black/5 text-black/80 rounded-tl-none"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-blue-500 prose-strong:text-inherit prose-pre:bg-black/5 prose-pre:text-black/80 prose-code:text-blue-600",
            msg.role === "user" ? "prose-invert prose-pre:bg-white/10 prose-pre:text-white prose-code:text-blue-300" : ""
          )}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
          
          {msg.artifacts && msg.artifacts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-black/5 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-black/30">Artefatos Gerados</p>
              <div className="flex flex-wrap gap-2">
                {msg.artifacts.map((art) => (
                  <button 
                    key={art.id}
                    onClick={() => onArtifactClick(art)}
                    className="flex items-center gap-3 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 group/art"
                  >
                    <FileText className="w-3.5 h-3.5 group-hover/art:rotate-12 transition-transform" />
                    {art.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {msg.images && msg.images.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {msg.images.map((img, idx) => (
                <div key={idx} className="relative group/img overflow-hidden rounded-2xl border border-black/5 shadow-md">
                  <img 
                    src={img} 
                    alt="Context" 
                    className="w-40 h-40 object-cover transition-transform duration-500 group-hover/img:scale-110" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          )}
          
          {msg.role === "ai" && (
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <div className="relative group/btn">
                <button 
                  onClick={() => onTTSClick(msg.content)}
                  className={cn(
                    "p-2 hover:bg-black/5 rounded-xl active:scale-90 transition-all",
                    isSpeaking ? "text-amber-600 animate-pulse" : "text-black/20 hover:text-amber-600"
                  )}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block w-32 p-2 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed text-center">
                  <strong className="block text-amber-400 mb-1">Ouvir Resposta</strong>
                  Lê o texto em voz alta.
                </div>
              </div>
              <div className="relative group/btn">
                <button 
                  onClick={() => onCopyClick(msg.content, `msg-${index}`)}
                  className="p-2 hover:bg-black/5 rounded-xl active:scale-90 transition-all"
                >
                  {copiedId === `msg-${index}` ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-black/20" />}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block w-32 p-2 bg-black text-white text-[10px] rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed text-center">
                  <strong className="block text-gray-400 mb-1">Copiar Resposta</strong>
                  Copia o texto para a área de transferência.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
