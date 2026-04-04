'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { nodeService, KnowledgeNode } from '@/services/nodeService';

interface EditNodeModalProps {
  node: KnowledgeNode | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedNode: KnowledgeNode) => void;
  onDelete: (nodeId: number) => void;
}


export default function EditNodeModal({ 
  node, 
  isOpen, 
  onClose, 
  onSuccess,
  onDelete
}: EditNodeModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (node) {
      setName(node.name || '');
      setDesc(node.desc || '');
    }
  }, [node, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    if (!node) return;
    e.preventDefault();
    
    setLoading(true);
    try {
      const updated = await nodeService.updateNode(node.id, { name, desc });
      toast({ title: 'Success', description: 'Node updated successfully' });
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update node', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!node) return;
    if (!window.confirm("Are you sure you want to delete this node and all its children?")) return;

    setDeleting(true);
    try {
      await nodeService.deleteNode(node.id);
      toast({ title: 'Deleted', description: 'Node and its sub-structure removed.' });
      onDelete(node.id);
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete node', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-[24px] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-4 bg-[#F8F9FA] border-b border-[#EDEEEF]">
           <div className="flex items-center gap-3 text-[#1A237E] font-black text-[10px] uppercase tracking-[0.2em] opacity-60 mb-2">
              Edit Knowledge Point
           </div>
           <DialogTitle className="text-2xl font-black text-[#000666] tracking-tighter">
              {node ? `Editing: ${node.name}` : 'Edit Node'}
           </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="space-y-2">
             <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-[#767683]">Node Name</Label>
             <Input 
               id="name"
               value={name}
               onChange={(e) => setName(e.target.value)}
               placeholder="Enter node name..."
               className="rounded-xl border-[#EDEEEF] bg-[#F8F9FA] focus:ring-2 focus:ring-[#1A237E]/20 focus:border-[#1A237E] font-bold text-[#000666]"
               required
             />
           </div>

           <div className="space-y-2">
             <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-[#767683]">Description</Label>
             <Textarea 
               id="desc"
               value={desc}
               onChange={(e) => setDesc(e.target.value)}
               placeholder="Enter detailed description..."
               rows={5}
               className="rounded-xl border-[#EDEEEF] bg-[#F8F9FA] focus:ring-2 focus:ring-[#1A237E]/20 focus:border-[#1A237E] font-medium text-[#767683] resize-none"
             />
           </div>

           <DialogFooter className="pt-4 flex justify-between sm:justify-between w-full">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl font-bold uppercase tracking-widest text-[10px] px-4 h-12 text-rose-500 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Node
              </Button>
              
              <div className="flex gap-3">
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
                  disabled={loading || deleting}
                  className="rounded-xl bg-[#1A237E] hover:bg-[#000666] text-white font-bold uppercase tracking-widest text-[10px] px-8 h-12 shadow-xl shadow-indigo-900/10 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
