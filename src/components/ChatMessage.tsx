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
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md transition-all group-hover:scale-105 border",
        msg.role === "user" 
          ? "bg-theme-card border-theme-glass text-theme-primary" 
          : "bg-blue-600 border-blue-400/30 text-white"
      )}>
        {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={cn(
        "max-w-[85%] min-w-0 space-y-2 flex flex-col",
        msg.role === "user" ? "items-end" : "items-start"
      )}>
        {msg.role === "ai" && (
          <div className="flex items-center gap-2.5 mb-1 px-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-500">
              {msg.agentName}
            </span>
            {msg.agentTier && (
              <span className="text-[9px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-black tracking-widest border border-blue-500/20 uppercase">
                {msg.agentTier}
              </span>
            )}
          </div>
        )}
        <div className={cn(
          "p-5 rounded-2xl shadow-sm relative transition-all group-hover:shadow-lg overflow-hidden break-words border",
          msg.role === "user" 
            ? "bg-theme-card text-theme-primary rounded-tr-none border-theme-glass/60" 
            : "bg-theme-surface border-theme-glass text-theme-primary rounded-tl-none shadow-inner"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none",
            "text-theme-primary",
            "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-theme-primary",
            "prose-p:text-theme-primary prose-p:leading-relaxed prose-p:font-medium",
            "prose-a:text-blue-500 dark:prose-a:text-blue-400",
            "prose-strong:text-theme-primary prose-strong:font-bold",
            "prose-blockquote:text-theme-secondary prose-blockquote:border-l-4 prose-blockquote:border-theme-glass prose-blockquote:bg-theme-glass/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic",
            "prose-pre:bg-slate-900 prose-pre:text-gray-100 dark:prose-pre:bg-black/50 dark:prose-pre:border dark:prose-pre:border-white/10",
            "prose-code:text-blue-500 dark:prose-code:text-blue-300",
            "prose-li:text-theme-primary prose-li:marker:text-theme-secondary",
            "prose-ol:text-theme-primary prose-ul:text-theme-primary",
            "dark:prose-invert"
          )}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
          
          {msg.artifacts && msg.artifacts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-theme-glass space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary">Artefatos Gerados</p>
              <div className="flex flex-wrap gap-2">
                {msg.artifacts.map((art) => (
                  <button 
                    key={art.id}
                    onClick={() => onArtifactClick(art)}
                    className="btn-primary px-4 py-2 text-[11px] group/art"
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
                <div key={idx} className="relative group/img overflow-hidden rounded-xl border border-theme-glass shadow-sm">
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
                  className="btn-secondary p-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block w-32 p-2.5 bg-theme-surface border border-theme-glass text-theme-primary text-[11px] rounded-xl shadow-xl z-50 leading-relaxed text-center font-bold uppercase tracking-wider">
                  Baixar MD
                </div>
              </div>
              <div className="relative group/btn">
                <button 
                  onClick={() => onCopyClick(msg.content, `msg-${index}`)}
                  className="btn-secondary p-1.5"
                >
                  {copiedId === `msg-${index}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/btn:block w-32 p-2.5 bg-theme-surface border border-theme-glass text-theme-primary text-[11px] rounded-xl shadow-xl z-50 leading-relaxed text-center font-bold uppercase tracking-wider">
                  Copiar
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
