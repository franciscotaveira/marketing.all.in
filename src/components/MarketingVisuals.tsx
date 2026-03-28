import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { motion } from 'motion/react';
import { 
  Instagram, Linkedin, Twitter, Facebook, 
  MoreHorizontal, Heart, MessageCircle, Send, Bookmark,
  ArrowDown, Zap, Target, Users, BarChart3,
  Image as ImageIcon, Palette, Type, Layout, Check, FileText,
  Search, Cpu, Network, Activity, Shield, Globe, Database,
  Workflow, Layers, Microscope, Video as VideoIcon, Volume2, 
  ExternalLink, Play, Pause, Download, Copy, CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Artifact, FunnelStep, SocialPlatform, DataPoint } from '../types';
import { cn } from '../lib/utils';

interface VisualProps {
  artifact: Artifact;
}

export const FunnelBuilder: React.FC<{ steps: FunnelStep[] }> = ({ steps }) => {
  return (
    <div className="space-y-8 p-6 md:p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/5">
      <div className="flex items-center gap-3 border-b border-black/5 pb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-black/80">Visualização de Funil Estratégico</h3>
          <p className="text-[9px] font-black text-black/30 uppercase tracking-tighter">Otimização de Conversão Master</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <motion.div 
              initial={{ width: 0, opacity: 0, scale: 0.95 }}
              animate={{ width: `${step.percentage}%`, opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className={cn(
                "h-20 flex items-center justify-between px-4 md:px-8 rounded-[1.5rem] shadow-lg relative group cursor-default transition-all hover:scale-[1.02]",
                step.color || "bg-blue-600"
              )}
              style={{ minWidth: '280px' }}
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm shrink-0">
                  <span className="text-white font-black text-[10px] md:text-xs">{i + 1}</span>
                </div>
                <span className="text-white font-black text-[10px] md:text-sm uppercase tracking-widest truncate max-w-[100px] md:max-w-none">{step.label}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-white font-black text-sm md:text-lg leading-none">{step.value.toLocaleString()}</div>
                <div className="text-white/60 text-[8px] md:text-[9px] uppercase font-black tracking-widest mt-1">{step.percentage}% do Topo</div>
              </div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-[1.5rem] bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            
            {i < steps.length - 1 && (
              <div className="flex flex-col items-center py-2">
                <div className="w-px h-8 bg-gradient-to-b from-black/10 to-transparent" />
                <div className="flex items-center gap-2 px-4 py-1.5 bg-black/5 rounded-full border border-black/5">
                  <ArrowDown className="w-3 h-3 text-black/40" />
                  <div className="text-[9px] font-black text-black/40 uppercase tracking-widest">
                    Conversão: <span className="text-blue-600">{((steps[i+1].value / step.value) * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-px h-8 bg-gradient-to-t from-black/10 to-transparent" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const SocialMediaPreview: React.FC<{ 
  platform: SocialPlatform; 
  content: string; 
  handle?: string;
  image?: string;
}> = ({ platform, content, handle = "SuaMarca", image }) => {
  return (
    <div className="p-6 md:p-10 bg-[#F8F9FA] rounded-[2.5rem] border border-black/5 flex justify-center shadow-inner">
      <div className="w-full max-w-[380px] bg-white border border-black/5 rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] relative">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px] shadow-md">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[2px]">
                <div className="w-full h-full rounded-full bg-black/5 flex items-center justify-center">
                  <Users className="w-4 h-4 text-black/20" />
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs font-black tracking-tight block">{handle}</span>
              <span className="text-[9px] font-black text-black/30 uppercase tracking-widest">Patrocinado</span>
            </div>
          </div>
          <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-black/40" />
          </button>
        </div>

        {/* Image */}
        <div className="aspect-square bg-black/5 flex items-center justify-center relative overflow-hidden group">
          {image ? (
            <img src={image} alt="Post" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
          ) : (
            <div className="text-center p-12 space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <ImageIcon className="w-8 h-8 text-black/10" />
              </div>
              <p className="text-[10px] text-black/20 uppercase font-black tracking-[0.3em]">Visual Preview</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-[10px] font-black uppercase tracking-widest">
              Ver Detalhes
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <Heart className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer text-black/80" />
              <MessageCircle className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer text-black/80" />
              <Send className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer text-black/80" />
            </div>
            <Bookmark className="w-7 h-7 hover:scale-110 transition-transform cursor-pointer text-black/80" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-black text-black/90 tracking-tight">1.234 curtidas</div>
            <div className="text-xs leading-relaxed text-black/70">
              <span className="font-black mr-2 text-black">{handle}</span>
              {content}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {["#marketing", "#swarm", "#ai", "#growth"].map(tag => (
                <span key={tag} className="text-[10px] font-black text-blue-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="pt-2 text-[9px] text-black/20 uppercase font-black tracking-widest border-t border-black/5">
            Há 2 horas • Traduzido por IA
          </div>
        </div>
      </div>
    </div>
  );
};

export const ChartRenderer: React.FC<{ 
  type: "bar" | "line" | "pie"; 
  data: DataPoint[];
  title?: string;
}> = ({ type, data, title }) => {
  const COLORS = ['#2563EB', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="p-6 md:p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/5 h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-black/80">{title || "Análise de Dados"}</h3>
            <p className="text-[9px] font-black text-black/30 uppercase tracking-tighter">Inteligência Preditiva Swarm</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1 bg-black/5 rounded-full text-[9px] font-black uppercase tracking-widest text-black/40">Real-time</div>
        </div>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#00000040', fontWeight: 900 }} 
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#00000040', fontWeight: 900 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', fontSize: '12px', fontWeight: 900, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                cursor={{ fill: '#00000005' }}
              />
              <Bar dataKey="value" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000005" />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#00000040', fontWeight: 900 }}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#00000040', fontWeight: 900 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', fontSize: '12px', fontWeight: 900, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#2563EB" 
                strokeWidth={4} 
                dot={{ r: 6, fill: '#2563EB', strokeWidth: 4, stroke: '#fff' }} 
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={8}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', fontSize: '12px', fontWeight: 900, boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const DesignSystemRenderer: React.FC<{ 
  colors: { name: string; hex: string; variable: string }[];
  typography: { name: string; size: string; weight: string; family: string }[];
  spacing: { name: string; size: string; value: string }[];
}> = ({ colors, typography, spacing }) => {
  return (
    <div className="space-y-8 p-6 md:p-8 bg-white rounded-xl border border-black/5 shadow-sm">
      <div className="flex items-center justify-between border-b border-black/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-black/80">Intelligent Design System</h3>
            <p className="text-[10px] text-black/40 font-bold uppercase tracking-tighter">UI/UX Pro Max Generation</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
          <Check className="w-3 h-3" />
          Validado
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 flex items-center gap-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
          Color Palette
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {colors.map((color, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={i} 
              className="group cursor-pointer"
            >
              <div 
                className="h-20 w-full rounded-xl shadow-inner border border-black/5 mb-2 transition-transform group-hover:scale-105" 
                style={{ backgroundColor: color.hex }}
              />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-tight truncate">{color.name}</p>
                <p className="text-[9px] font-mono text-black/40 uppercase">{color.hex}</p>
                <p className="text-[8px] font-mono text-blue-500 uppercase">{color.variable}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 flex items-center gap-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
          Typography Tokens
        </h4>
        <div className="space-y-3">
          {typography.map((type, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={i} 
              className="flex items-center justify-between p-4 bg-black/5 rounded-xl border border-black/5 group hover:bg-black/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-black/5 shadow-sm">
                  <Type className="w-5 h-5 text-black/40" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight">{type.name}</p>
                  <p className="text-[10px] text-black/40 font-mono uppercase">{type.family} • {type.weight}</p>
                </div>
              </div>
              <p className="text-lg font-bold" style={{ fontSize: type.size, fontWeight: type.weight, fontFamily: type.family }}>
                Aa
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 flex items-center gap-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full" />
          Spacing & Layout
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {spacing.map((space, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/10 p-2 rounded-lg">
                  <Layout className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-tight">{space.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: space.value }} />
                <span className="text-[10px] font-mono text-black/40">{space.size}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ResearchRenderer: React.FC<{ findings: { topic: string; insight: string; confidence: number }[] }> = ({ findings }) => {
  return (
    <div className="space-y-6 p-6 md:p-8 bg-white rounded-xl border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 border-b border-black/5 pb-4">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
          <Microscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-black/80">Relatório de Deep Research</h3>
          <p className="text-[10px] text-black/40 font-bold uppercase tracking-tighter">Inteligência Competitiva IA</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {findings.map((finding, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{finding.topic}</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600" style={{ width: `${finding.confidence}%` }} />
                </div>
                <span className="text-[9px] font-bold text-emerald-600">{finding.confidence}% Confiança</span>
              </div>
            </div>
            <p className="text-sm text-black/70 font-medium leading-relaxed">{finding.insight}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const AutomationRenderer: React.FC<{ workflow: { step: string; action: string; tool: string }[] }> = ({ workflow }) => {
  return (
    <div className="space-y-6 p-6 md:p-8 bg-white rounded-xl border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 border-b border-black/5 pb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
          <Workflow className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-black/80">Fluxo de Automação Autônomo</h3>
          <p className="text-[10px] text-black/40 font-bold uppercase tracking-tighter">AI-Driven Operations</p>
        </div>
      </div>
      <div className="relative space-y-4">
        {workflow.map((step, i) => (
          <div key={i} className="flex items-start gap-4 relative">
            {i < workflow.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-px bg-purple-100" />
            )}
            <div className="w-10 h-10 bg-purple-50 border border-purple-100 rounded-full flex items-center justify-center z-10">
              <span className="text-[10px] font-black text-purple-600">{i + 1}</span>
            </div>
            <div className="flex-1 p-4 bg-purple-50/30 border border-purple-100 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-black uppercase tracking-tight text-purple-900">{step.step}</h4>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-[8px] font-black uppercase tracking-widest">{step.tool}</span>
              </div>
              <p className="text-xs text-purple-800/60 font-medium">{step.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ArchitectureRenderer: React.FC<{ 
  nodes: { id: string; label: string; type: string }[];
  links: { source: string; target: string; label: string }[];
}> = ({ nodes = [], links = [] }) => {
  return (
    <div className="space-y-6 p-6 md:p-8 bg-[#0a0a0a] rounded-xl border border-white/5 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white/80">Arquitetura de Solução LLM</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Sistemas Cognitivos Swarm</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Componentes do Sistema</h4>
          <div className="space-y-2">
            {nodes?.map((node, i) => (
              <div key={i} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  node.type === 'llm' ? 'bg-blue-500' : 
                  node.type === 'db' ? 'bg-purple-500' : 'bg-emerald-500'
                )} />
                <span className="text-xs font-bold text-white/80">{node.label}</span>
                <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-white/20">{node.type}</span>
              </div>
            ))}
            {(!nodes || nodes.length === 0) && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                <span className="text-xs font-medium text-white/40">Nenhum componente definido</span>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Fluxo de Dados</h4>
          <div className="space-y-2">
            {links?.map((link, i) => (
              <div key={i} className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center gap-3">
                <span className="text-[10px] font-bold text-blue-400">{link.source}</span>
                <ArrowDown className="w-3 h-3 text-white/20 -rotate-90" />
                <span className="text-[10px] font-bold text-blue-400">{link.target}</span>
                <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-white/20 italic">{link.label}</span>
              </div>
            ))}
            {(!links || links.length === 0) && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg text-center">
                <span className="text-xs font-medium text-white/40">Nenhum fluxo definido</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoRenderer: React.FC<{ url: string; title: string }> = ({ url, title }) => {
  const [videoSrc, setVideoSrc] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'x-goog-api-key': apiKey,
          },
        });
        
        if (!response.ok) throw new Error("Failed to fetch video");
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setVideoSrc(objectUrl);
      } catch (err) {
        console.error("Error fetching video:", err);
        setError("Erro ao carregar o vídeo.");
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchVideo();
    }
    
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
    };
  }, [url]);

  return (
    <div className="space-y-6 p-6 md:p-8 bg-black rounded-xl border border-white/10 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20">
          <VideoIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-white/80">{title}</h3>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">Veo 3.1 Fast Generation</p>
        </div>
      </div>
      <div className="aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10 relative group flex items-center justify-center">
        {isLoading ? (
          <div className="text-white/50 text-sm font-mono animate-pulse">Carregando vídeo...</div>
        ) : error ? (
          <div className="text-red-400 text-sm font-mono">{error}</div>
        ) : videoSrc ? (
          <>
            <video src={videoSrc} controls className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <a href={videoSrc} download="video.mp4" className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-all block">
                <Download className="w-4 h-4" />
              </a>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export const AudioRenderer: React.FC<{ url: string; title: string }> = ({ url, title }) => {
  return (
    <div className="space-y-6 p-6 md:p-8 bg-white rounded-xl border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 border-b border-black/5 pb-4">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-200">
          <Volume2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest text-black/80">{title}</h3>
          <p className="text-[10px] text-black/40 font-bold uppercase tracking-tighter">Gemini 2.5 TTS Engine</p>
        </div>
      </div>
      <div className="p-4 md:p-6 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200 animate-pulse shrink-0">
          <Volume2 className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 space-y-3 w-full">
          <div className="h-1 bg-amber-200 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 w-1/3 animate-progress" />
          </div>
          <audio src={url} controls className="w-full h-8" />
        </div>
      </div>
    </div>
  );
};

export const N8nWorkflowRenderer: React.FC<{ jsonContent: string, title: string }> = ({ jsonContent, title }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-10 bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6D5A] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6D5A]/20">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white">n8n Workflow JSON</h3>
            <p className="text-[9px] font-black text-[#FF6D5A] uppercase tracking-tighter">{title}</p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-bold uppercase tracking-wider"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copiado!" : "Copiar JSON"}
        </button>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none" />
        <pre className="p-6 bg-black/50 rounded-2xl overflow-x-auto text-xs font-mono text-blue-300 border border-white/5 max-h-[400px] custom-scrollbar">
          {jsonContent}
        </pre>
      </div>
      
      <div className="mt-6 flex items-center gap-2 text-[10px] uppercase font-bold text-white/40 tracking-widest">
        <Database className="w-3 h-3" />
        Cole diretamente no canvas do n8n (Ctrl+V / Cmd+V)
      </div>
    </div>
  );
};

export const ArtifactRenderer: React.FC<VisualProps> = ({ artifact }) => {
  switch (artifact.type) {
    case "visual":
      if (artifact.metadata?.videoUrl) {
        return <VideoRenderer url={artifact.metadata.videoUrl} title={artifact.title} />;
      }
      if (artifact.metadata?.audioUrl) {
        return <AudioRenderer url={artifact.metadata.audioUrl} title={artifact.title} />;
      }
      return (
        <div className="p-6 md:p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/5">
          <img src={artifact.metadata?.imageUrl || artifact.content} alt={artifact.title} className="w-full rounded-2xl shadow-lg" referrerPolicy="no-referrer" />
        </div>
      );
    case "video":
      return <VideoRenderer url={artifact.metadata?.videoUrl || ""} title={artifact.title} />;
    case "design-system":
      return (
        <DesignSystemRenderer 
          colors={artifact.metadata?.colors || []} 
          typography={artifact.metadata?.typography || []}
          spacing={artifact.metadata?.spacing || []}
        />
      );
    case "funnel":
      return <FunnelBuilder steps={artifact.metadata?.funnelSteps || []} />;
    case "social":
      return (
        <SocialMediaPreview 
          platform={artifact.metadata?.socialPlatform || "instagram"} 
          content={artifact.content}
          handle={artifact.metadata?.socialHandle}
          image={artifact.metadata?.socialImage}
        />
      );
    case "data":
      return (
        <ChartRenderer 
          type={artifact.metadata?.chartType || "bar"} 
          data={artifact.metadata?.dataPoints || []}
          title={artifact.title}
        />
      );
    case "research":
      return <ResearchRenderer findings={artifact.metadata?.researchFindings || []} />;
    case "automation":
      return <AutomationRenderer workflow={artifact.metadata?.automationWorkflow || []} />;
    case "architecture":
      return <ArchitectureRenderer nodes={artifact.metadata?.architectureNodes || []} links={artifact.metadata?.architectureLinks || []} />;
    case "n8n":
      return <N8nWorkflowRenderer jsonContent={artifact.content} title={artifact.title} />;
    default:
      return (
        <div className="prose prose-sm max-w-none p-10 bg-white rounded-[2.5rem] border border-black/5 shadow-xl shadow-black/5">
          <div className="flex items-center gap-3 mb-8 border-b border-black/5 pb-6">
            <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-black/40" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-black/80">Documento de Estratégia</h3>
              <p className="text-[9px] font-black text-black/30 uppercase tracking-tighter">Conteúdo Gerado por IA</p>
            </div>
          </div>
          <div className="text-black/70 leading-relaxed font-medium overflow-hidden break-words">
            <div className="prose prose-sm max-w-none prose-headings:font-black prose-headings:tracking-tighter prose-a:text-blue-500 prose-strong:text-inherit prose-pre:bg-black/5 prose-pre:text-black/80 prose-code:text-blue-600">
              <ReactMarkdown>{artifact.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      );
  }
};
