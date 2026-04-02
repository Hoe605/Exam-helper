'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Delete Now",
  cancelText = "Cancel"
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
          >
            {/* Top Pattern Decor */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-rose-500/20" />
            
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500">
                <AlertCircle className="w-10 h-10" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-[#000666] tracking-tight">
                  {title}
                </h3>
                <p className="text-sm font-medium text-[#767683] leading-relaxed">
                  {description}
                </p>
              </div>

              <div className="flex w-full gap-3 mt-2">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-[10px] border-[#EDEEEF] hover:bg-slate-50 transition-all"
                >
                  {cancelText}
                </Button>
                <Button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-[10px] bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-900/20 transition-all"
                >
                  {confirmText}
                </Button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-50 text-[#767683] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
