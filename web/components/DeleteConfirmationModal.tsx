'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle } from 'lucide-react';

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
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="
        bg-white rounded-[32px] p-8 border border-[#EDEEEF]
        shadow-2xl shadow-black/10 overflow-hidden ring-0 max-w-xl
        [&>button:last-child]:hidden
      ">
        {/* Accent stripe at top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500/20 rounded-t-[32px]" />

        <AlertDialogHeader className="flex flex-col items-center text-center gap-6 mt-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-2">
            <AlertDialogTitle className="text-2xl font-black text-[#000666] tracking-tight font-sans">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-[#767683] leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="
          flex-row gap-3 mt-2
          border-none bg-transparent
          p-0 rounded-none
          sm:justify-stretch
        ">
          <AlertDialogCancel
            onClick={onClose}
            className="
              flex-1 rounded-2xl h-14
              font-black uppercase tracking-[0.2em] text-[10px]
              bg-white text-[#767683]
              border border-[#EDEEEF]
              hover:bg-[#F8F9FA] hover:text-[#000666]
              transition-all m-0
            "
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="
              flex-1 rounded-2xl h-14
              font-black uppercase tracking-[0.2em] text-[10px]
              bg-rose-600 hover:bg-rose-700
              text-white
              shadow-lg shadow-rose-900/20
              transition-all m-0 border-none
            "
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
