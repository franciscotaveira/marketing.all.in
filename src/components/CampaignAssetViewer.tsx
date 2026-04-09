import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Type, 
  Layout, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Download,
  Share2,
  Loader2,
  Check,
  Play,
  FileText,
  X,
  Video
} from 'lucide-react';
import { Artifact } from '../types';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface CampaignAssetViewerProps {
  artifact: Artifact;
}

interface Asset {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
}

export function CampaignAssetViewer({ artifact }: CampaignAssetViewerProps) {
  const { metadata } = artifact;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 3000);
  };

  // Mock assets for the gallery if none are provided in metadata
  const assets: Asset[] = metadata?.assets || [
    {
      id: '1',
      type: 'image',
      url: metadata?.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(artifact.title + '1')}/1000/600`,
      title: 'Hero Banner Principal',
      description: metadata?.imagePrompt || 'Cinematic photography of a mother and child in a warm, sunlit room, soft focus, high-end skincare aesthetic, pastel colors, 8k resolution.'
    },
    {
      id: '2',
      type: 'image',
      url: `https://picsum.photos/seed/${encodeURIComponent(artifact.title + '2')}/800/800`,
      title: 'Post Social Media (1:1)',
      description: 'Design para Instagram focando no produto principal com iluminação dramática e tipografia em negrito.'
    },
    {
      id: '3',
      type: 'video',
      url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4',
      thumbnail: `https://picsum.photos/seed/${encodeURIComponent(artifact.title + '3')}/800/450`,
      title: 'Bumper Ad (6s)',
      description: 'Vídeo curto para YouTube Ads com foco em conversão rápida e chamada para ação clara.'
    },
    {
      id: '4',
      type: 'document',
      url: '#',
      title: 'Brandbook Completo.pdf',
      description: 'Diretrizes completas de marca, tom de voz, aplicações visuais e regras de uso de logotipo.'
    },
    {
      id: '5',
      type: 'image',
      url: `https://picsum.photos/seed/${encodeURIComponent(artifact.title + '5')}/600/900`,
      title: 'Stories Promocional (9:16)',
      description: 'Layout vertical otimizado para conversão em Stories e Reels com espaço para interações nativas.'
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-theme-surface border border-theme-glass shadow-2xl min-h-[400px] flex flex-col">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="flex-1 p-12 flex flex-col justify-center relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">
              Campaign Asset Pack
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <h1 className="text-6xl font-black tracking-tighter italic text-theme-primary leading-none mb-6">
            {artifact.title}
          </h1>
          
          <p className="text-xl text-theme-secondary opacity-60 max-w-2xl leading-relaxed font-medium">
            Diretrizes estratégicas e ativos visuais orquestrados pelo Enxame de IA para a Farmácias São Rafael.
          </p>

          <div className="flex items-center gap-4 mt-12">
            <button className="btn-primary px-8 py-4 rounded-2xl text-xs tracking-widest">
              <Download className="w-4 h-4" />
              Exportar Brandbook
            </button>
            <button className="btn-secondary px-8 py-4 rounded-2xl text-xs tracking-widest">
              <Share2 className="w-4 h-4" />
              Compartilhar Handoff
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute right-20 top-20 w-40 h-40 bg-purple-500/5 rounded-full blur-[60px]" />
      </div>

      {/* Assets Gallery */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-theme-surface border border-theme-glass rounded-[2rem] p-10 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-theme-blue" />
            <h3 className="font-black uppercase tracking-widest text-sm text-theme-primary">Galeria de Ativos</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-theme-glass rounded-xl text-[10px] font-bold text-theme-secondary uppercase tracking-wider">
              {assets.length} Itens
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <div 
              key={asset.id}
              onClick={() => setSelectedAsset(asset)}
              className="group cursor-pointer rounded-2xl border border-theme-glass bg-theme-card overflow-hidden relative aspect-square shadow-sm hover:shadow-xl transition-all duration-500"
            >
              {asset.type === 'image' && (
                <img src={asset.url} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              )}
              {asset.type === 'video' && (
                <>
                  <img src={asset.thumbnail} alt={asset.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>
                </>
              )}
              {asset.type === 'document' && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-theme-glass/10 transition-transform duration-700 group-hover:scale-110">
                  <FileText className="w-12 h-12 text-theme-secondary opacity-50 mb-3" />
                  <span className="text-[10px] font-black text-theme-secondary uppercase tracking-widest">Documento</span>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                <div className="flex items-center gap-2 mb-2">
                  {asset.type === 'image' && <ImageIcon className="w-3 h-3 text-blue-400" />}
                  {asset.type === 'video' && <Video className="w-3 h-3 text-purple-400" />}
                  {asset.type === 'document' && <FileText className="w-3 h-3 text-emerald-400" />}
                  <span className="text-[8px] font-black uppercase tracking-widest text-white/70">
                    {asset.type}
                  </span>
                </div>
                <p className="text-sm text-white font-black uppercase tracking-tighter truncate leading-none mb-1">{asset.title}</p>
                <p className="text-[10px] text-white/60 font-medium line-clamp-2 leading-relaxed">{asset.description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Visual Identity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Color Palette */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-surface border border-theme-glass rounded-[2rem] p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-theme-blue/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-theme-blue" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-xs text-theme-primary">Paleta Cromática</h3>
              <p className="text-[10px] text-theme-secondary opacity-40 font-bold uppercase tracking-widest">Identidade Visual</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(metadata?.colors || [
              { name: "Azul São Rafael", hex: "#002B5B", variable: "primary" },
              { name: "Teal Cuidado", hex: "#45B1BF", variable: "secondary" },
              { name: "Rosa Afeto", hex: "#F7CAC9", variable: "accent" },
              { name: "Off White", hex: "#FFF9F0", variable: "bg" }
            ]).map((color: any, i: number) => (
              <div key={i} className="group relative">
                <div 
                  className="h-24 rounded-2xl border border-theme-glass shadow-inner mb-2 transition-transform group-hover:scale-[1.02]"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="px-1">
                  <p className="text-[10px] font-black text-theme-primary uppercase tracking-tight">{color.name}</p>
                  <p className="text-[9px] font-mono text-theme-secondary opacity-60">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-theme-surface border border-theme-glass rounded-[2rem] p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Type className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-black uppercase tracking-widest text-xs text-theme-primary">Tipografia</h3>
              <p className="text-[10px] text-theme-secondary opacity-40 font-bold uppercase tracking-widest">Sistemas de Fontes</p>
            </div>
          </div>

          <div className="space-y-6">
            {(metadata?.typography || [
              { name: "Inter Black", usage: "Headings", size: "72px" },
              { name: "Inter Regular", usage: "Body Copy", size: "16px" }
            ]).map((font: any, i: number) => (
              <div key={i} className="p-5 bg-theme-glass/20 rounded-2xl border border-theme-glass group hover:bg-theme-glass/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-theme-blue uppercase tracking-widest">{font.usage}</span>
                  <Type className="w-3 h-3 text-theme-secondary opacity-40" />
                </div>
                <p className="text-2xl font-black text-theme-primary mb-1 tracking-tighter italic" style={{ fontFamily: font.name }}>
                  {font.name}
                </p>
                <p className="text-[10px] text-theme-secondary opacity-60">
                  Tamanho Sugerido: <span className="text-theme-primary font-bold">{font.size}</span>
                </p>
                <div className="mt-4 pt-4 border-t border-theme-glass/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[11px] text-theme-secondary italic leading-relaxed">
                    "O cuidado que você merece, na farmácia que você confia."
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Content & Strategy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-theme-surface border border-theme-glass rounded-[2rem] p-10 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-theme-blue" />
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-theme-secondary prose-p:opacity-80 prose-headings:text-theme-primary prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-strong:text-theme-blue">
              <ReactMarkdown>{artifact.content}</ReactMarkdown>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          {/* Layout Grids */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-theme-surface border border-theme-glass rounded-[2rem] p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <Layout className="w-5 h-5 text-theme-blue" />
              <h3 className="font-black uppercase tracking-widest text-xs text-theme-primary">Grids & Layout</h3>
            </div>
            <div className="space-y-4">
              {(metadata?.grids || [
                { label: "Social Media", value: "1080x1080 (1:1)" },
                { label: "Stories", value: "1080x1920 (9:16)" },
                { label: "Tabloide Capa", value: "A4 Vertical" },
                { label: "Banner Site", value: "1920x600 (Desktop)" }
              ]).map((grid: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-theme-glass/20 rounded-xl border border-theme-glass/30">
                  <span className="text-[10px] font-bold text-theme-secondary">{grid.label}</span>
                  <span className="text-[10px] font-mono text-theme-blue">{grid.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* AI Prompts Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-theme-surface border border-theme-glass rounded-[2rem] p-8 shadow-xl bg-gradient-to-br from-theme-surface to-blue-500/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-theme-blue" />
              <h3 className="font-black uppercase tracking-widest text-xs text-theme-primary">Geração de Ativos</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-black/20 border border-theme-glass relative group cursor-pointer">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                <p className="text-[9px] text-theme-secondary opacity-60 leading-relaxed line-clamp-3 italic">
                  {metadata?.imagePrompt || "Cinematic photography of a mother and child in a warm, sunlit room, soft focus, high-end skincare aesthetic, pastel colors, 8k..."}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[8px] font-black text-theme-blue uppercase tracking-widest">Prompt Ativo</span>
                  <ArrowRight className="w-3 h-3 text-theme-blue" />
                </div>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || isGenerated}
                className={cn(
                  "w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  isGenerated 
                    ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" 
                    : "bg-theme-blue/10 border border-theme-blue/20 text-theme-blue hover:bg-theme-blue/20"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Processando Lote...
                  </>
                ) : isGenerated ? (
                  <>
                    <Check className="w-3 h-3" />
                    Lote Concluído
                  </>
                ) : (
                  "Gerar Lote de Ativos"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Checklist / Next Steps */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-theme-surface border border-theme-glass rounded-[2rem] p-10 shadow-xl"
      >
        <h3 className="font-black uppercase tracking-widest text-sm text-theme-primary mb-8 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Checklist de Produção
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              title: "Identidade Visual", 
              status: metadata?.colors?.length > 0 ? "Aprovado" : "Pendente", 
              desc: metadata?.colors?.length > 0 ? `${metadata.colors.length} cores definidas.` : "Aguardando definição de cores." 
            },
            { 
              title: "Estrutura de Layout", 
              status: metadata?.grids?.length > 0 ? "Pronto" : "Pendente", 
              desc: metadata?.grids?.length > 0 ? "Grids e proporções definidos." : "Aguardando especificações de grid." 
            },
            { 
              title: "Assets de IA", 
              status: isGenerated ? "Aprovado" : (metadata?.imagePrompt ? "Pronto" : "Aguardando"), 
              desc: isGenerated ? "Imagens em alta resolução geradas." : (metadata?.imagePrompt ? "Prompts de alta fidelidade gerados." : "Aguardando prompts cinematográficos.") 
            }
          ].map((item, i) => (
            <div key={i} className="p-6 bg-theme-glass/20 rounded-2xl border border-theme-glass relative overflow-hidden">
              <div className={cn(
                "absolute top-0 left-0 w-1 h-full",
                item.status === "Aprovado" ? "bg-emerald-500" : item.status === "Pronto" ? "bg-blue-500" : "bg-amber-500"
              )} />
              <h4 className="text-xs font-black uppercase tracking-widest text-theme-primary mb-1">{item.title}</h4>
              <p className="text-[10px] text-theme-secondary opacity-60 mb-3">{item.desc}</p>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                item.status === "Aprovado" ? "bg-emerald-500/10 text-emerald-500" : item.status === "Pronto" ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500"
              )}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedAsset(null)}
          >
            <button 
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              onClick={() => setSelectedAsset(null)}
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl bg-theme-surface border border-theme-glass rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Media Area */}
              <div className="flex-1 bg-black/60 relative flex items-center justify-center min-h-[300px] md:min-h-[500px] p-8">
                {selectedAsset.type === 'image' && (
                  <img src={selectedAsset.url} alt={selectedAsset.title} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" referrerPolicy="no-referrer" />
                )}
                {selectedAsset.type === 'video' && (
                  <video src={selectedAsset.url} controls autoPlay className="max-w-full max-h-full rounded-xl shadow-2xl" />
                )}
                {selectedAsset.type === 'document' && (
                  <div className="text-center">
                    <div className="w-32 h-32 rounded-3xl bg-theme-glass/20 flex items-center justify-center mx-auto mb-6 border border-theme-glass">
                      <FileText className="w-16 h-16 text-theme-secondary opacity-50" />
                    </div>
                    <button className="btn-primary px-8 py-4 rounded-xl text-[11px] tracking-widest uppercase font-black">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Documento
                    </button>
                  </div>
                )}
              </div>

              {/* Details Area */}
              <div className="w-full md:w-96 p-8 flex flex-col bg-theme-surface border-l border-theme-glass overflow-y-auto">
                <div className="flex items-center gap-2 mb-6">
                  <div className={cn(
                    "px-3 py-1.5 border rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5",
                    selectedAsset.type === 'image' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                    selectedAsset.type === 'video' ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                    "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  )}>
                    {selectedAsset.type === 'image' && <ImageIcon className="w-3 h-3" />}
                    {selectedAsset.type === 'video' && <Video className="w-3 h-3" />}
                    {selectedAsset.type === 'document' && <FileText className="w-3 h-3" />}
                    {selectedAsset.type === 'image' ? 'Imagem' : selectedAsset.type === 'video' ? 'Vídeo' : 'Documento'}
                  </div>
                </div>
                
                <h2 className="text-2xl font-black text-theme-primary uppercase tracking-tighter italic mb-4 leading-tight">
                  {selectedAsset.title}
                </h2>
                
                <p className="text-sm text-theme-secondary leading-relaxed mb-8 font-medium">
                  {selectedAsset.description}
                </p>

                <div className="mt-auto space-y-3 pt-8 border-t border-theme-glass/30">
                  <button className="w-full btn-primary py-4 rounded-xl text-[10px] tracking-[0.2em] font-black uppercase flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Original
                  </button>
                  <button className="w-full btn-secondary py-4 rounded-xl text-[10px] tracking-[0.2em] font-black uppercase flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Compartilhar Link
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
