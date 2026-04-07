import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = 'danger'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-[#121212] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden relative"
          >
            <div className={cn(
              "absolute top-0 left-0 w-full h-1",
              variant === 'danger' ? "bg-red-500" : variant === 'warning' ? "bg-amber-500" : "bg-blue-500"
            )} />
            
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  variant === 'danger' ? "bg-red-500/10 text-red-500" : variant === 'warning' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/5 rounded-full transition-all text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/60 text-sm leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95",
                  variant === 'danger' ? "bg-red-600 hover:bg-red-500 shadow-red-900/20" : 
                  variant === 'warning' ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20" : 
                  "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20"
                )}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
