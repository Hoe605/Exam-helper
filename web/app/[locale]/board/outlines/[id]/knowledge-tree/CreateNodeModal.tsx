'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { nodeService, KnowledgeNode } from '@/services/nodeService';

interface CreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  outlineId: number;
  parentId: number | null;
  parentLevel: number;
  onSuccess: (newNode: KnowledgeNode) => void;
}

export default function CreateNodeModal({ 
  isOpen, 
  onClose, 
  outlineId,
  parentId,
  parentLevel,
  onSuccess 
}: CreateNodeModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      const created = await nodeService.createNode({
        outline_id: outlineId,
        f_node: parentId,
        name, 
        desc,
        level: parentLevel + 1
      });
      
      toast({ title: 'Success', description: 'Knowledge point added.' });
      onSuccess(created);
      setName('');
      setDesc('');
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create node', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-[24px] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-[#F8F9FA] border-b border-[#EDEEEF]">
           <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">
              Add New Knowledge Point
           </div>
           <DialogTitle className="text-2xl font-black text-[#000666] tracking-tighter">
              {parentId ? 'Sub-topic Entry' : 'New Root Module'}
           </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="space-y-2">
             <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#767683]">Node Name</Label>
             <Input 
               id="name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Key Concept..."
               className="rounded-xl border-[#EDEEEF] bg-[#F8F9FA] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-[#000666]"
               required
               autoFocus
             />
           </div>

           <div className="space-y-2">
             <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-[#767683]">Details</Label>
             <Textarea 
               id="desc"
               value={desc}
               onChange={(e) => setDesc(e.target.value)}
               placeholder="Definition or core coverage..."
               rows={4}
               className="rounded-xl border-[#EDEEEF] bg-[#F8F9FA] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-[#767683] resize-none"
             />
           </div>

           <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose}
                className="rounded-xl font-bold uppercase tracking-widest text-[10px] px-6 h-12 text-[#767683] hover:bg-[#F3F4F5]"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-widest text-[10px] px-8 h-12 shadow-xl shadow-indigo-900/10 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Point
              </Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
