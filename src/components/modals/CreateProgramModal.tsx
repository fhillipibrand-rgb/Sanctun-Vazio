import React, { useState, useEffect } from "react";
import { X, Save, Plus, Target, Clock } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion } from "motion/react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const CreateProgramModal: React.FC<CreateProgramModalProps> = ({ isOpen, onClose, onSave }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setErrorMsg("");
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      setErrorMsg("O nome do programa é obrigatório.");
      return;
    }
    
    setSaving(true);
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from('workout_programs')
        .insert({
          user_id: user.id,
          name,
          description,
          is_active: true // Auto activate new program
        });

      if (error) throw error;

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar programa:", error);
      setErrorMsg(error.message || "Erro ao salvar o programa.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="p-0 border-primary/30 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Novo Programa</h3>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
                  Ex: Hipertrofia 4x na Semana
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <label className="editorial-label text-xs">NOME DO PROGRAMA</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Força Bruta Foco Inferiores"
                className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/50"
              />
            </div>
            <div className="space-y-4">
              <label className="editorial-label text-xs">DESCRIÇÃO OU OBJETIVO (OPCIONAL)</label>
              <input 
                type="text" 
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: Foco em ganho de massa, treinando AB"
                className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl text-center">
                Erro: {errorMsg}
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-4 border-t border-[var(--glass-border)]">
              <button 
                onClick={onClose} 
                className="px-6 py-3 rounded-2xl border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface/5 transition-all"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="px-8 py-3 rounded-2xl bg-primary text-surface text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <Clock className="animate-spin" size={16} /> : <Save size={16} />}
                CRIAR PROGRAMA
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CreateProgramModal;
