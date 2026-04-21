import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Bot, User, FileText, Copy, Check, Download, FileJson, Image as ImageIcon, Video, Code2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
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
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_5px_15px_rgba(0,0,0,0.3)] transition-all group-hover:scale-105 border",
        msg.role === "user" 
          ? "bg-theme-card border-theme-glass text-theme-primary" 
          : "bg-theme-blue border-white/20 text-white shadow-[0_5px_20px_rgba(59,130,246,0.3)]"
      )}>
        {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>
      <div className={cn(
        "max-w-[85%] min-w-0 space-y-2 flex flex-col",
        msg.role === "user" ? "items-end" : "items-start"
      )}>
        {msg.role === "ai" && (
          <div className="flex items-center gap-2.5 mb-2 px-1">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-theme-blue italic drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              {msg.agentName}
            </span>
            {msg.agentTier && (
              <span className="text-[8px] px-2.5 py-0.5 bg-theme-blue/10 text-theme-blue rounded-full font-black tracking-[0.2em] border border-theme-blue/20 uppercase">
                {msg.agentTier}
              </span>
            )}
          </div>
        )}
        <div className={cn(
          "p-4 md:p-5 rounded-2xl shadow-xl relative transition-all group-hover:shadow-blue-500/5 overflow-hidden break-words border",
          msg.role === "user" 
            ? "bg-theme-card text-theme-primary rounded-tr-none border-theme-glass/60" 
            : "bg-theme-surface border-theme-glass text-theme-primary rounded-tl-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none text-theme-primary",
            "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-theme-primary prose-headings:mt-4 prose-headings:mb-2",
            "prose-p:text-theme-primary prose-p:leading-relaxed prose-p:font-medium prose-p:my-2",
            "prose-a:text-blue-500 dark:prose-a:text-blue-400",
            "prose-strong:text-theme-primary prose-strong:font-bold",
            "prose-blockquote:text-[10px] sm:text-[11px] prose-blockquote:font-normal prose-blockquote:text-theme-secondary/80 prose-blockquote:border-l-4 prose-blockquote:border-theme-glass prose-blockquote:bg-theme-glass/20 prose-blockquote:py-0.5 prose-blockquote:px-2 prose-blockquote:rounded-r-[6px] prose-blockquote:not-italic prose-blockquote:my-1 prose-blockquote:tracking-wide",
            "prose-pre:bg-slate-900 prose-pre:text-gray-100 dark:prose-pre:bg-black/50 dark:prose-pre:border dark:prose-pre:border-white/10 prose-pre:my-2 prose-pre:text-[11px]",
            "prose-code:text-blue-500 dark:prose-code:text-blue-300",
            "prose-li:text-theme-primary prose-li:marker:text-theme-secondary prose-li:my-0.5",
            "prose-ol:text-theme-primary prose-ul:text-theme-primary prose-ol:my-2 prose-ul:my-2",
            "dark:prose-invert"
          )}>
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              components={{
                code(props) {
                  const { children, className, node, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';
                  const isInline = !match;
                  
                  if (!isInline && match) {
                    const content = String(children).replace(/\n$/, '');
                    const isImage = ['image', 'png', 'jpg', 'jpeg', 'gif', 'webp'].includes(language.toLowerCase());
                    const isVideo = ['video', 'mp4', 'webm', 'ogg'].includes(language.toLowerCase());

                    if (isImage) {
                      return (
                        <div className="relative group/code-img my-2 rounded-[6px] overflow-hidden border border-theme-glass shadow-sm">
                          <img src={content} alt="Artefato Visual" className="w-full h-auto object-cover max-h-[250px]" referrerPolicy="no-referrer" />
                          <div className="absolute top-1 right-1 opacity-0 group-hover/code-img:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => {
                              const a = document.createElement('a');
                              a.href = content;
                              a.download = `artefato-${Date.now()}.${language === 'image' ? 'png' : language}`;
                              a.target = "_blank";
                              a.rel = "noreferrer";
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }} className="flex items-center gap-1 btn-secondary bg-black/60 p-1 shadow-sm border border-white/20 hover:bg-black/90 text-white backdrop-blur-md rounded-[4px]">
                              <Download className="w-2.5 h-2.5 text-white" />
                            </button>
                          </div>
                        </div>
                      );
                    }

                    if (isVideo) {
                      return (
                        <div className="relative group/code-vid my-2 rounded-[6px] overflow-hidden border border-theme-glass shadow-sm bg-black/40">
                          <video src={content} controls className="w-full max-h-[250px] object-cover" />
                        </div>
                      );
                    }

                    const getFileIcon = () => {
                      if (language === 'json') return <FileJson className="w-2.5 h-2.5 text-emerald-400" />;
                      if (language === 'txt' || language === 'md' || language === 'markdown') return <FileText className="w-2.5 h-2.5 text-blue-400" />;
                      if (language === 'html' || language === 'jsx' || language === 'tsx') return <Code2 className="w-2.5 h-2.5 text-purple-400" />;
                      return <Code2 className="w-2.5 h-2.5 text-theme-secondary" />;
                    };

                    return (
                      <div className="relative group/code-block rounded-[6px] overflow-hidden border border-theme-glass my-2 shadow-sm bg-black/20">
                        <div className="flex items-center justify-between px-2 py-1 border-b border-theme-glass font-mono text-[8px] text-theme-secondary uppercase tracking-wider font-bold bg-theme-surface/40">
                          <div className="flex items-center gap-1">
                            {getFileIcon()}
                            <span>{language || 'código'}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `artefato-${Date.now()}.${language || 'txt'}`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] hover:bg-theme-glass hover:text-theme-primary transition-all active:scale-95 text-theme-secondary border border-transparent hover:border-theme-glass/50"
                          >
                            <Download className="w-2 h-2" />
                            <span className="hidden sm:inline">Baixar .{language || 'txt'}</span>
                          </button>
                        </div>
                        <pre className="p-2 overflow-x-auto text-[9px] leading-relaxed !bg-transparent !m-0">
                          <code className={className} {...rest}>{children}</code>
                        </pre>
                      </div>
                    );
                  }
                  return <code className={cn("bg-theme-glass/30 px-1 py-0.5 rounded text-blue-400 text-[10px]", className)} {...rest}>{children}</code>;
                }
              }}
            >
              {msg.content.replace(/<thought_process>([\s\S]*?)<\/thought_process>/g, '<details className="my-2 bg-theme-glass/20 border border-theme-glass rounded-lg overflow-hidden group/thought shadow-inner"><summary className="cursor-pointer px-3 py-2 bg-theme-glass/40 text-[10px] font-bold uppercase tracking-widest text-theme-secondary hover:text-theme-blue transition-colors flex items-center gap-2 select-none"><span className="w-3 h-3 flex items-center justify-center rounded-full bg-theme-blue/20 text-theme-blue text-[8px]">🧠</span> Processo de Raciocínio (AI)</summary><div className="p-3 text-[10px] font-mono text-theme-secondary opacity-70 whitespace-pre-wrap leading-relaxed border-t border-theme-glass/50 bg-black/20">$1</div></details>')}
            </ReactMarkdown>
          </div>
          
          {msg.artifacts && msg.artifacts.length > 0 && (
            <div className="mt-2 pt-2 border-t border-theme-glass space-y-1.5">
              <p className="text-[7px] font-black uppercase tracking-[0.2em] text-theme-secondary opacity-50">Artefatos Gerados</p>
              <div className="flex flex-wrap gap-1">
                {msg.artifacts.map((art) => (
                  <button 
                    key={art.id}
                    onClick={() => onArtifactClick(art)}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-theme-blue/5 hover:bg-theme-blue/10 text-theme-blue/90 hover:text-theme-blue rounded-[4px] transition-all border border-theme-blue/10 shadow-sm group/art text-[8px] font-bold tracking-wide uppercase"
                  >
                    <FileText className="w-2.5 h-2.5 group-hover/art:rotate-12 transition-transform" />
                    <span className="truncate max-w-[100px]">{art.title}</span>
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
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
                  className="btn-secondary p-1 rounded-[6px]"
                >
                  <Download className="w-3 h-3" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:block w-auto whitespace-nowrap px-2 py-1 bg-theme-surface border border-theme-glass text-theme-primary text-[8px] rounded-[6px] shadow-xl z-50 leading-none text-center font-bold uppercase tracking-wider">
                  Baixar MD
                </div>
              </div>
              <div className="relative group/btn">
                <button 
                  onClick={() => onCopyClick(msg.content, `msg-${index}`)}
                  className="btn-secondary p-1 rounded-[6px]"
                >
                  {copiedId === `msg-${index}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:block w-auto whitespace-nowrap px-2 py-1 bg-theme-surface border border-theme-glass text-theme-primary text-[8px] rounded-[6px] shadow-xl z-50 leading-none text-center font-bold uppercase tracking-wider">
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
