import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Volume2, VolumeX, Loader2, Sparkles, Brain } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { cn } from '../lib/utils';

interface LiveConversationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveConversation: React.FC<LiveConversationProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
  const [transcript, setTranscript] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (isOpen && !sessionRef.current) {
      startSession();
    }
    return () => {
      stopSession();
    };
  }, [isOpen]);

  const startSession = async () => {
    setStatus('connecting');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      sessionRef.current = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        callbacks: {
          onopen: () => {
            setStatus('active');
            startAudioCapture();
          },
          onmessage: async (message: any) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setAiResponse(prev => prev + message.serverContent.modelTurn.parts[0].text);
            }
            if (message.serverContent?.interrupted) {
              stopPlayback();
            }
          },
          onerror: (err: any) => {
            console.error("Live API Error:", err);
            setStatus('error');
          },
          onclose: () => {
            setStatus('idle');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: "Você é o núcleo do Enxame de Marketing, um assistente de marketing de elite. Fale de forma profissional, estratégica e inspiradora. Ajude o usuário a orquestrar suas campanhas em tempo real.",
        },
      });
    } catch (error) {
      console.error("Failed to start live session:", error);
      setStatus('error');
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    stopAudioCapture();
    setStatus('idle');
  };

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

      processorRef.current.onaudioprocess = (e) => {
        if (isMuted) return;
        
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };

      sourceRef.current.connect(processorRef.current);
      processorRef.current.connect(audioContextRef.current.destination);
      setIsListening(true);
    } catch (error) {
      console.error("Audio capture error:", error);
    }
  };

  const stopAudioCapture = () => {
    if (processorRef.current) processorRef.current.disconnect();
    if (sourceRef.current) sourceRef.current.disconnect();
    if (audioContextRef.current) audioContextRef.current.close();
    setIsListening(false);
  };

  const playAudio = (base64Data: string) => {
    // Basic audio playback logic (simplified for this environment)
    const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
    audio.play().catch(e => console.error("Playback error:", e));
  };

  const stopPlayback = () => {
    // Logic to stop current audio playback
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 w-full max-w-2xl rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col h-[600px]"
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-rose-600/20 to-blue-600/20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 animate-pulse shrink-0">
              <Mic className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm">Live Swarm Intelligence</h3>
              <div className="flex items-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full animate-ping", 
                  status === 'active' ? "bg-green-500" : "bg-amber-500"
                )} />
                <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-widest">
                  {status === 'connecting' ? 'Conectando...' : status === 'active' ? 'Em tempo real' : 'Aguardando'}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 md:p-3 hover:bg-white/10 rounded-2xl transition-all text-white/40 hover:text-white"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Visualizer Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 space-y-8 md:space-y-12 relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-600/5 to-transparent pointer-events-none" />
          
          <div className="relative">
            {/* Pulsing Circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-rose-500/30"
              />
              <motion.div 
                animate={{ scale: [1, 2, 1], opacity: [0.1, 0.05, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-rose-500/20"
              />
            </div>

            <div className={cn(
              "w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-500 relative z-10",
              status === 'active' ? "bg-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.4)]" : "bg-zinc-800"
            )}>
              {status === 'connecting' ? (
                <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-white animate-spin" />
              ) : (
                <Sparkles className={cn("w-8 h-8 md:w-12 md:h-12 text-white", status === 'active' && "animate-pulse")} />
              )}
            </div>
          </div>

          <div className="text-center space-y-2 md:space-y-4 max-w-md relative z-10">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter">
              {status === 'active' ? "Estou ouvindo..." : "Iniciando Conexão Neural"}
            </h2>
            <p className="text-xs md:text-sm text-white/40 font-medium leading-relaxed">
              Fale naturalmente sobre seus desafios de marketing. A inteligência do enxame responderá instantaneamente com voz humanizada.
            </p>
          </div>

          {/* Transcript Preview */}
          <div className="w-full bg-white/5 rounded-3xl p-4 md:p-6 border border-white/5 min-h-[80px] md:min-h-[100px] flex flex-col items-center justify-center text-center">
            {aiResponse ? (
              <p className="text-xs md:text-sm text-white/80 italic font-medium">"{aiResponse}"</p>
            ) : (
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 md:p-10 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95",
              isMuted ? "bg-zinc-800 text-white/40" : "bg-white/5 text-white hover:bg-white/10"
            )}
          >
            {isMuted ? <MicOff className="w-5 h-5 md:w-6 md:h-6" /> : <Mic className="w-5 h-5 md:w-6 md:h-6" />}
          </button>
          
          <button 
            onClick={onClose}
            className="px-8 py-4 md:px-12 md:py-5 bg-rose-600 text-white rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-rose-900/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto order-last sm:order-none"
          >
            Encerrar Sessão
          </button>

          <button 
            className="w-12 h-12 md:w-16 md:h-16 bg-white/5 text-white rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-95"
          >
            <Volume2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
