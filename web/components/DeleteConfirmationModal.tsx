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
import { AlertCircle, HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger'
}: DeleteConfirmationModalProps) {
  const isDanger = variant === 'danger';
  const isPrimary = variant === 'primary';
  const isSuccess = variant === 'success';

  const Icon = isDanger ? AlertCircle : (isPrimary ? HelpCircle : Info);
  const colorClass = isDanger ? 'rose' : (isPrimary ? 'indigo' : 'emerald');

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="
        bg-white rounded-[32px] p-8 border border-[#EDEEEF]
        shadow-2xl shadow-black/10 overflow-hidden ring-0 max-w-xl
        [&>button:last-child]:hidden
      ">
        {/* Accent stripe at top */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1.5 rounded-t-[32px]",
          isDanger && "bg-rose-500/20",
          isPrimary && "bg-indigo-500/20",
          isSuccess && "bg-emerald-500/20"
        )} />

        <AlertDialogHeader className="flex flex-col items-center text-center gap-6 mt-4">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center shrink-0",
            isDanger && "bg-rose-5 text-rose-500",
            isPrimary && "bg-indigo-5 text-indigo-500",
            isSuccess && "bg-emerald-5 text-emerald-500"
          )}>
            <Icon className="w-10 h-10" />
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
            className={cn(
              "flex-1 rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all m-0 border-none",
              isDanger && "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-900/20",
              isPrimary && "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-900/20",
              isSuccess && "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/20"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
