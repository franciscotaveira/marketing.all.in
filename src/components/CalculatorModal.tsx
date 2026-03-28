import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, X } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  calcData: { investment: number; revenue: number };
  setCalcData: React.Dispatch<React.SetStateAction<{ investment: number; revenue: number }>>;
}

export function CalculatorModal({ isOpen, onClose, calcData, setCalcData }: CalculatorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 md:p-6"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-black tracking-tighter uppercase text-xl text-black/90">Calculadora ROI</h3>
                  <p className="text-[10px] font-black text-black/30 uppercase tracking-widest">Projeção de Retorno</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">Investimento Total</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/20">R$</span>
                    <input 
                      type="number" 
                      value={calcData.investment}
                      onChange={(e) => setCalcData(prev => ({ ...prev, investment: Number(e.target.value) }))}
                      className="w-full p-4 pl-10 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-black transition-all" 
                      placeholder="0,00" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">Receita</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-black/20">R$</span>
                    <input 
                      type="number" 
                      value={calcData.revenue}
                      onChange={(e) => setCalcData(prev => ({ ...prev, revenue: Number(e.target.value) }))}
                      className="w-full p-4 pl-10 bg-black/5 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500/20 outline-none text-sm font-black transition-all" 
                      placeholder="0,00" 
                    />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center space-y-2">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Retorno sobre Investimento (ROI)</p>
                <p className="text-5xl font-black text-blue-900 tracking-tighter">
                  {calcData.investment > 0 
                    ? (((calcData.revenue - calcData.investment) / calcData.investment) * 100).toFixed(1)
                    : "0.0"}%
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-3 py-1 bg-blue-900/10 rounded-full">
                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-tighter">
                      Lucro: R$ {(calcData.revenue - calcData.investment).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-black/5 border-t border-black/5 flex justify-center">
              <button 
                onClick={onClose}
                className="w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                Fechar Calculadora
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
