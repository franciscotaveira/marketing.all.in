import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plug, Check, Loader2, Database, Send } from 'lucide-react';
import { cn } from '../lib/utils';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IntegrationsModal({ isOpen, onClose }: IntegrationsModalProps) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  
  const [isSaved, setIsSaved] = useState(false);
  const [testWebhookStatus, setTestWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testSupabaseStatus, setTestSupabaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      setWebhookUrl(localStorage.getItem('n8nWebhookUrl') || '');
      setSupabaseUrl(localStorage.getItem('supabaseUrl') || '');
      setSupabaseKey(localStorage.getItem('supabaseKey') || '');
      setIsSaved(false);
      setTestWebhookStatus('idle');
      setTestSupabaseStatus('idle');
    }
  }, [isOpen]);

  const handleTestWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setTestWebhookStatus('loading');
    try {
      const response = await fetch(webhookUrl.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping', test_connection: true, timestamp: new Date().toISOString() }),
      });
      if (response.ok) {
        setTestWebhookStatus('success');
      } else {
        throw new Error(`Status: ${response.status}. O n8n retornou erro. Verifique a URL e se o nó está ativo.`);
      }
    } catch (e) {
      console.error(e);
      setTestWebhookStatus('error');
      window.alert(`Falha na conexão com o Webhook.\n\nSe estiver usando o n8n:\n1. Verifique se a URL está correta (Production ou Test).\n2. O nó Webhook DEVE ter o método HTTP como "POST".\n3. MUDANÇA IMPORTANTE: Abra as opções do nó Webhook no n8n e HABILITE "Respond with CORS Headers". Sem isso, o navegador bloqueia a requisição de teste.\n\nErro técnico: ${(e as Error).message}`);
    }
    setTimeout(() => {
      setTestWebhookStatus(prev => prev === 'loading' ? 'loading' : 'idle');
    }, 5000);
  };

  const handleTestSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) return;
    setTestSupabaseStatus('loading');
    try {
      // Calls the REST API root which will return openapi spec if authenticated and valid URL
      let cleanUrl = supabaseUrl.trim();
      if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
      const urlWithRest = cleanUrl.endsWith('/rest/v1') ? cleanUrl : `${cleanUrl}/rest/v1/`;

      const response = await fetch(urlWithRest, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey.trim(),
          'Authorization': `Bearer ${supabaseKey.trim()}`
        }
      });
      if (response.ok) setTestSupabaseStatus('success');
      else throw new Error('Status: ' + response.status);
    } catch (e) {
      console.error(e);
      setTestSupabaseStatus('error');
    }
    setTimeout(() => {
      setTestSupabaseStatus(prev => prev === 'loading' ? 'loading' : 'idle');
    }, 3000);
  };

  const handleSave = () => {
    localStorage.setItem('n8nWebhookUrl', webhookUrl.trim());
    localStorage.setItem('supabaseUrl', supabaseUrl.trim());
    localStorage.setItem('supabaseKey', supabaseKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pt-10 sm:pt-0">
      <div 
        className="absolute inset-0 bg-theme-main/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-theme-surface border border-theme-glass rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] m-4"
      >
        <div className="p-6 border-b border-theme-glass bg-theme-glass/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-theme-blue/10 flex items-center justify-center border border-theme-blue/20">
              <Plug className="w-5 h-5 text-theme-blue" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-theme-primary">Workspace Integrations</h2>
              <p className="text-xs font-bold text-theme-secondary opacity-60 uppercase tracking-widest">Conexões Globais</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-theme-glass hover:bg-theme-glass/80 rounded-xl transition-all"
          >
            <X className="w-4 h-4 text-theme-secondary" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* Webhook Settings */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-theme-secondary flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-emerald-500" />
              Automação (n8n / Make)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-theme-primary/60 mb-1.5 block ml-2">Webhook URL Master</label>
                <div className="relative">
                  <input 
                    type="url" 
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    placeholder="https://n8n.suaempresa.com/webhook/..."
                    className="w-full bg-theme-glass/40 border border-theme-glass rounded-xl px-4 py-3 text-xs text-theme-primary focus:outline-none focus:border-theme-blue/50 transition-all font-mono"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={handleTestWebhook}
                      disabled={!webhookUrl.trim() || testWebhookStatus === 'loading'}
                      className={cn(
                        "px-2 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-wider transition-all border",
                        testWebhookStatus === 'success' ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" :
                        testWebhookStatus === 'error' ? "bg-rose-500/20 text-rose-500 border-rose-500/30" :
                        "bg-theme-glass/40 text-theme-secondary border-theme-glass hover:bg-theme-glass hover:text-theme-primary disabled:opacity-50"
                      )}
                    >
                      {testWebhookStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> :
                       testWebhookStatus === 'success' ? '✔ Ok' :
                       testWebhookStatus === 'error' ? 'Falha' : 'Testar'}
                    </button>
                    {webhookUrl && testWebhookStatus === 'idle' && <Check className="w-3.5 h-3.5 text-emerald-500/50" />}
                  </div>
                </div>
                <p className="text-[9px] text-theme-secondary mt-2 ml-2 opacity-60 font-medium">Usado globalmente ao exportar tarefas e processos para seus Workflows da I.A.</p>
              </div>
            </div>
          </div>

          {/* Supabase Settings */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-theme-secondary flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-500" />
              Supabase / Database Público
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-theme-primary/60 mb-1.5 block ml-2">URL do Projeto</label>
                <input 
                  type="url" 
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzxyz.supabase.co"
                  className="w-full bg-theme-glass/40 border border-theme-glass rounded-xl px-4 py-3 text-xs text-theme-primary focus:outline-none focus:border-theme-blue/50 transition-all font-mono mb-3"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5 px-2">
                  <label className="text-[10px] font-bold text-theme-primary/60 block">Anon Key / Service Key</label>
                  <button
                    onClick={handleTestSupabase}
                    disabled={(!supabaseUrl.trim() || !supabaseKey.trim()) || testSupabaseStatus === 'loading'}
                    className={cn(
                      "px-2 py-1 rounded-[6px] text-[9px] font-bold uppercase tracking-wider transition-all border",
                      testSupabaseStatus === 'success' ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                      testSupabaseStatus === 'error' ? "bg-rose-500/20 text-rose-500 border-rose-500/30" :
                      "bg-theme-glass/40 text-theme-secondary border-theme-glass hover:bg-theme-glass hover:text-theme-primary disabled:opacity-50"
                    )}
                  >
                    {testSupabaseStatus === 'loading' ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> :
                     testSupabaseStatus === 'success' ? '✔ Conectado' :
                     testSupabaseStatus === 'error' ? 'Falha na Conexão' : 'Testar Conexão Supabase'}
                  </button>
                </div>
                <input 
                  type="password" 
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  placeholder="eyJhb..."
                  className="w-full bg-theme-glass/40 border border-theme-glass rounded-xl px-4 py-3 text-xs text-theme-primary focus:outline-none focus:border-theme-blue/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        <div className="p-6 border-t border-theme-glass bg-theme-surface/50 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-theme-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-80 border border-white/20"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Salvo!
              </>
            ) : (
              'Salvar Conexões'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
