import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Plus, Trash2, Save, Globe, Target, Users, Briefcase, Loader2 } from 'lucide-react';
import { Company } from '../types';
import { cn } from '../lib/utils';

interface BrandContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string | null) => void;
}

export const BrandContextModal: React.FC<BrandContextModalProps> = ({
  isOpen,
  onClose,
  companies,
  setCompanies,
  activeCompanyId,
  setActiveCompanyId
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    website: '',
    industry: '',
    targetAudience: '',
    context: ''
  });

  const handleSave = async () => {
    if (!formData.name || !formData.context || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate a small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 600));

    if (editingId) {
      setCompanies(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } as Company : c));
      setEditingId(null);
    } else {
      const newCompany: Company = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name!,
        website: formData.website || '',
        industry: formData.industry || '',
        targetAudience: formData.targetAudience || '',
        context: formData.context!,
        createdAt: new Date().toISOString()
      };
      setCompanies(prev => [...prev, newCompany]);
      if (!activeCompanyId) setActiveCompanyId(newCompany.id);
    }

    setFormData({ name: '', website: '', industry: '', targetAudience: '', context: '' });
    setIsAdding(false);
    setIsSubmitting(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompanies(prev => prev.filter(c => c.id !== id));
    if (activeCompanyId === id) setActiveCompanyId(null);
  };

  const startEdit = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(company);
    setEditingId(company.id);
    setIsAdding(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-theme-surface border border-theme-glass rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 border-b border-theme-glass flex items-center justify-between bg-theme-surface/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-theme-primary">Contexto de Marca</h2>
                  <p className="text-[11px] text-blue-500 font-bold tracking-wider uppercase opacity-60">Gerencie suas empresas e personas</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="btn-secondary p-2.5"
              >
                <X className="w-5 h-5 text-theme-secondary opacity-40 group-hover:text-theme-primary group-hover:opacity-100" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isAdding ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 flex items-center gap-2">
                        <Briefcase className="w-3 h-3" />
                        Nome da Empresa
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: Marketing Swarm Pro"
                        className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 flex items-center gap-2">
                        <Globe className="w-3 h-3" />
                        Website
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://exemplo.com"
                        className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 flex items-center gap-2">
                        <Target className="w-3 h-3" />
                        Indústria / Nicho
                      </label>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                        placeholder="Ex: SaaS B2B, E-commerce"
                        className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 flex items-center gap-2">
                        <Users className="w-3 h-3" />
                        Público-Alvo
                      </label>
                      <input
                        type="text"
                        value={formData.targetAudience}
                        onChange={e => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                        placeholder="Ex: CMOs de empresas de tecnologia"
                        className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 flex items-center gap-2">
                      <Briefcase className="w-3 h-3" />
                      Contexto & Proposta de Valor
                    </label>
                    <textarea
                      value={formData.context}
                      onChange={e => setFormData(prev => ({ ...prev, context: e.target.value }))}
                      placeholder="Descreva a empresa, seus produtos, tom de voz e diferenciais..."
                      className="w-full h-40 bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-sm text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-blue-500/50 transition-all resize-none custom-scrollbar font-medium"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => { setIsAdding(false); setEditingId(null); }}
                      className="btn-secondary px-6 py-2.5"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSubmitting}
                      className="btn-primary px-6 py-2.5"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {editingId ? 'Atualizar Empresa' : 'Salvar Empresa'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setIsAdding(true)}
                    className="w-full p-8 border-2 border-dashed border-theme-glass rounded-3xl flex flex-col items-center justify-center gap-3 text-theme-secondary opacity-40 hover:opacity-100 hover:border-blue-500/50 hover:bg-theme-glass/50 transition-all group shadow-sm"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-theme-glass flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm border border-theme-glass">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider">Adicionar Nova Empresa</span>
                  </button>

                  <div className="grid grid-cols-1 gap-3">
                    {companies.map(company => (
                      <div
                        key={company.id}
                        onClick={() => setActiveCompanyId(company.id)}
                        className={cn(
                          "p-6 rounded-3xl border transition-all cursor-pointer group relative overflow-hidden",
                          activeCompanyId === company.id
                            ? "bg-blue-500/5 border-blue-500/20 shadow-sm"
                            : "bg-theme-surface border-theme-glass hover:border-theme-glass/80"
                        )}
                      >
                        <div className="flex items-start justify-between relative z-10">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all",
                              activeCompanyId === company.id ? "bg-blue-500 text-white" : "bg-theme-glass text-theme-secondary opacity-40"
                            )}>
                              <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-theme-primary tracking-tight">{company.name}</h3>
                              <p className="text-[11px] text-theme-secondary opacity-40 font-bold uppercase tracking-wider">
                                {company.industry || 'Indústria não definida'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => startEdit(company, e)}
                              className="btn-secondary p-2 text-blue-500 border-blue-500/20 hover:border-blue-500/40"
                            >
                              <Briefcase className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(company.id, e)}
                              className="btn-secondary p-2 text-rose-500 border-rose-500/20 hover:border-rose-500/40"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {activeCompanyId === company.id && (
                          <div className="absolute top-0 right-0 p-4">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
