import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Bot, User, FileText, Copy, Check, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { Message, Artifact } from '../types';

interface ChatMessageProps {
  msg: Message;
  index: number;
  copiedId: string | null;
  onArtifactClick: (art: Artifact) => void;
  onCopyClick: (text: string, id: string) => void;
}

export const ChatMessage = memo(function ChatMessage({
  msg,
  index,
  copiedId,
  onArtifactClick,
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
        msg.role === "user" ? "bg-theme-primary text-theme-main" : "bg-blue-600 text-white"
      )}>
        {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={cn(
        "max-w-[85%] min-w-0 space-y-3",
        msg.role === "user" ? "text-right items-end" : "text-left items-start"
      )}>
        {msg.role === "ai" && (
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">
              {msg.agentName}
            </span>
            {msg.agentTier && (
              <span className="text-[8px] px-2 py-0.5 bg-blue-500/20 text-blue-500 dark:text-blue-300 rounded-full uppercase font-black tracking-widest border border-blue-500/20">
                {msg.agentTier}
              </span>
            )}
          </div>
        )}
        <div className={cn(
          "p-3 md:p-4 rounded-2xl shadow-sm relative transition-all group-hover:shadow-md overflow-hidden break-words",
          msg.role === "user" 
            ? "glass-card bg-theme-glass text-theme-primary rounded-tr-none border-theme-glass" 
            : "glass-card bg-theme-glass border-theme-glass text-theme-primary rounded-tl-none"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-blue-400 prose-strong:text-inherit prose-pre:bg-theme-glass prose-pre:text-theme-primary prose-code:text-blue-500 dark:prose-code:text-blue-300",
            "dark:prose-invert"
          )}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
          
          {msg.artifacts && msg.artifacts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-theme-glass space-y-3">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-theme-secondary">Artefatos Gerados</p>
              <div className="flex flex-wrap gap-2">
                {msg.artifacts.map((art) => (
                  <button 
                    key={art.id}
                    onClick={() => onArtifactClick(art)}
                    className="flex items-center gap-3 px-4 py-2.5 bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/20 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95 group/art"
                  >
                    <FileText className="w-3.5 h-3.5 group-hover/art:rotate-12 transition-transform" />
                    {art.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {msg.images && msg.images.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {msg.images.map((img, idx) => (
                <div key={idx} className="relative group/img overflow-hidden rounded-xl border border-white/10 shadow-sm">
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
            <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
              <div className="relative group/btn">
                <button 
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob([msg.content], {type: 'text/markdown'});
                    element.href = URL.createObjectURL(file);
                    element.download = `resposta-${msg.agentName?.replace(/\s+/g, '-').toLowerCase() || 'ia'}-${Date.now()}.md`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="p-1.5 bg-theme-glass hover:bg-theme-glass/80 text-theme-secondary rounded-lg transition-colors shadow-sm border border-theme-glass active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block w-32 p-2 bg-theme-main text-theme-primary text-xs rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed text-center border border-theme-glass">
                  <strong className="block text-theme-secondary mb-1">Baixar Markdown</strong>
                  Salva a resposta como um arquivo .md
                </div>
              </div>
              <div className="relative group/btn">
                <button 
                  onClick={() => onCopyClick(msg.content, `msg-${index}`)}
                  className="p-1.5 bg-theme-glass hover:bg-theme-glass/80 text-theme-secondary rounded-lg transition-colors shadow-sm border border-theme-glass active:scale-95"
                >
                  {copiedId === `msg-${index}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block w-32 p-2 bg-theme-main text-theme-primary text-xs rounded-xl shadow-xl z-50 pointer-events-none leading-relaxed text-center border border-theme-glass">
                  <strong className="block text-theme-secondary mb-1">Copiar Resposta</strong>
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
