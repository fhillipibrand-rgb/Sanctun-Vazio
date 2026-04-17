import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Paperclip, FileText, Image as ImageIcon, Download, Trash2, Loader2, AlertCircle, Plus, AlignLeft, CheckSquare, Square, CheckCircle2, Circle } from "lucide-react";
import GlassCard from "./GlassCard";
import { Task } from "../../pages/Tasks";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface Attachment {
  name: string;
  url: string;
  path: string;
  type: string;
}

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  isMock?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function TaskDetailsModal({ task, onClose, onUpdate, isMock }: TaskDetailsModalProps) {
  const { user } = useAuth();
  const [description, setDescription] = useState(task.description || "");
  const [attachments, setAttachments] = useState<Attachment[]>(task.attachments || []);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    // Para simplificar a experiência do usuário, delegamos a função de save pro pai (Tasks.tsx)
    // O pai vai decidir se lida mock data ou supabase real
    await onUpdate(task.id, { description, attachments, subtasks });
    setIsSaving(false);
    onClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { id: `sub-${Date.now()}`, title: newSubtaskTitle.trim(), is_completed: false }]);
    setNewSubtaskTitle("");
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(s => s.id === id ? { ...s, is_completed: !s.is_completed } : s));
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.id !== id));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("O arquivo excede o limite máximo de 10MB.");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    if (isMock) {
      // Mock File Upload (Fake)
      setTimeout(() => {
        const newAtt: Attachment = {
          name: file.name,
          url: URL.createObjectURL(file), // Local blob
          path: `mock/${file.name}`,
          type: file.type
        };
        setAttachments(prev => [...prev, newAtt]);
        setIsUploading(false);
      }, 1000);
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id || 'anon'}/${task.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("task_attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("task_attachments")
        .getPublicUrl(filePath);

      const newAtt: Attachment = {
        name: file.name,
        url: publicUrl,
        path: filePath,
        type: file.type
      };

      setAttachments(prev => [...prev, newAtt]);
    } catch (err: any) {
      console.error(err);
      setUploadError("Erro ao fazer upload do arquivo. O bucket 'task_attachments' existe e é público?");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = async (path: string, url: string) => {
    if (!isMock) {
       // Opcional: remover arquivo físico do storage 
       // Se o bucket "task_attachments" existir e o user tiver permissões, deleta.
       supabase.storage.from("task_attachments").remove([path]).catch(console.error);
    }
    setAttachments(prev => prev.filter(att => att.path !== path));
  };

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon size={20} className="text-blue-400" />;
    return <FileText size={20} className="text-orange-400" />;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm shadow-2xl"
        onClick={onClose}
      >
        <motion.div 
          initial={{ y: 50, scale: 0.95, opacity: 0 }} 
          animate={{ y: 0, scale: 1, opacity: 1 }} 
          exit={{ y: 20, scale: 0.95, opacity: 0 }} 
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl relative"
        >
          <GlassCard className="h-full max-h-[90vh] flex flex-col p-0 border border-primary/20 overflow-hidden shadow-2xl shadow-primary/10">
            {/* Header */}
            <div className="p-6 md:p-8 flex items-start justify-between gap-4 border-b border-[var(--glass-border)] bg-surface/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
               <div>
                 <p className="editorial-label text-[10px] text-primary mb-2 opacity-80 uppercase tracking-widest flex items-center gap-2">
                    Visualização de Tarefa {isMock && "- MODO DEMO"}
                 </p>
                 <h2 className="text-2xl md:text-3xl font-bold font-serif leading-tight">{task.title}</h2>
               </div>
               <button 
                 onClick={onClose}
                 className="p-2 rounded-full bg-on-surface/5 hover:bg-on-surface/10 hover:text-red-400 transition-colors"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
               {/* Description Section */}
               <div className="space-y-3">
                 <label className="text-sm font-bold opacity-70 flex items-center gap-2 uppercase tracking-widest editorial-label">
                   <AlignLeft size={14} /> Notas Internas
                 </label>
                 <textarea
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   placeholder="Adicione informações detalhadas sobre o que precisa ser feito..."
                   className="w-full min-h-[150px] bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-2xl p-4 outline-none focus:border-primary/50 focus:bg-on-surface/[0.05] transition-all resize-y"
                 />
               </div>

               {/* Subtasks Section */}
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <label className="text-sm font-bold opacity-70 flex items-center gap-2 uppercase tracking-widest editorial-label">
                     <CheckSquare size={14} /> Subtarefas ({subtasks.filter(s => s.is_completed).length}/{subtasks.length})
                   </label>
                 </div>
                 
                 <div className="space-y-2">
                   {subtasks.map((sub) => (
                     <div key={sub.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${sub.is_completed ? "bg-on-surface/[0.02] border-[var(--glass-border)] opacity-50" : "bg-on-surface/[0.05] border-[var(--glass-border)] hover:border-primary/30"}`}>
                       <div className="flex items-center gap-3 flex-1 min-w-0">
                         <button onClick={() => toggleSubtask(sub.id)} className={`shrink-0 transition-colors ${sub.is_completed ? "text-primary" : "text-primary/30 hover:text-primary/60"}`}>
                           {sub.is_completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                         </button>
                         <span className={`text-sm font-medium truncate ${sub.is_completed ? "line-through" : ""}`}>{sub.title}</span>
                       </div>
                       <button onClick={() => removeSubtask(sub.id)} className="p-1.5 text-red-400 opacity-0 group-hover:opacity-100 hover:opacity-100 hover:bg-red-400/10 rounded-lg transition-all" style={{ opacity: 1 /* forced to ensure UX */ }}>
                         <Trash2 size={14} />
                       </button>
                     </div>
                   ))}
                   
                   <form onSubmit={handleAddSubtask} className="flex gap-2">
                     <input
                       type="text"
                       value={newSubtaskTitle}
                       onChange={e => setNewSubtaskTitle(e.target.value)}
                       placeholder="Adicionar subtarefa..."
                       className="flex-1 bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-3 px-4 outline-none focus:border-primary/50 text-sm"
                     />
                     <button type="submit" disabled={!newSubtaskTitle.trim()} className="px-4 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 disabled:opacity-30 transition-all flex items-center justify-center">
                       <Plus size={18} />
                     </button>
                   </form>
                 </div>
               </div>

               {/* Attachments Section */}
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                   <label className="text-sm font-bold opacity-70 flex items-center gap-2 uppercase tracking-widest editorial-label">
                     <Paperclip size={14} /> Anexos e Documentos
                   </label>
                   
                   <button 
                     type="button"
                     onClick={() => fileInputRef.current?.click()}
                     disabled={isUploading}
                     className="px-4 py-2 bg-on-surface/5 hover:bg-on-surface/10 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center gap-2 disabled:opacity-50"
                   >
                     <Plus size={14} /> Novo Arquivo
                   </button>
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileUpload}
                     className="hidden" 
                     accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                   />
                 </div>

                 {uploadError && (
                   <div className="bg-red-500/10 text-red-400 p-3 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-red-500/20">
                     <AlertCircle size={14} /> {uploadError}
                   </div>
                 )}

                 {isUploading && (
                   <div className="flex justify-center items-center py-6 text-primary animate-pulse flex-col gap-2">
                     <Loader2 size={24} className="animate-spin" />
                     <span className="text-[10px] tracking-widest uppercase font-bold">Processando Upload...</span>
                   </div>
                 )}

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {attachments.length > 0 ? attachments.map((att, index) => (
                     <div key={index} className="flex flex-col rounded-xl overflow-hidden border border-[var(--glass-border)] bg-on-surface/[0.02] group">
                       {/* Preview Thumbnail if img */}
                       {att.type.includes("image") ? (
                         <div className="h-24 w-full bg-black/20 flex items-center justify-center overflow-hidden border-b border-[var(--glass-border)] shrink-0">
                           <img src={att.url} alt={att.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                         </div>
                       ) : (
                         <div className="h-24 w-full bg-black/20 flex items-center justify-center border-b border-[var(--glass-border)] shrink-0">
                           {getFileIcon(att.type)}
                         </div>
                       )}

                       <div className="p-3 flex items-center justify-between gap-3">
                         <div className="min-w-0">
                           <p className="text-xs font-bold truncate opacity-90" title={att.name}>{att.name}</p>
                           <p className="text-[9px] opacity-40 uppercase truncate mt-0.5">{att.type.split('/')[1] || 'Arquivo'}</p>
                         </div>
                         <div className="flex gap-1 shrink-0">
                           <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-surface transition-colors" title="Baixar">
                             <Download size={14} />
                           </a>
                           <button onClick={() => handleRemoveAttachment(att.path, att.url)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-surface transition-colors" title="Remover">
                             <Trash2 size={14} />
                           </button>
                         </div>
                       </div>
                     </div>
                   )) : !isUploading && (
                     <div className="col-span-1 sm:col-span-2 py-8 border border-dashed border-[var(--glass-border)] rounded-2xl flex flex-col items-center justify-center gap-2 opacity-30">
                       <FileText size={24} />
                       <span className="text-[10px] uppercase tracking-widest font-bold">Nenhum anexo encontrado.</span>
                     </div>
                   )}
                 </div>
               </div>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-surface/50 border-t border-[var(--glass-border)] flex justify-end shrink-0 relative z-10 sticky bottom-0">
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="px-8 py-3 bg-primary text-surface font-bold text-sm tracking-wide rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none"
               >
                 {isSaving ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
               </button>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
