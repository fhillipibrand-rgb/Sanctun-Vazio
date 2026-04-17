import React, { useState, useEffect } from "react";
import { X, Zap, Plus, FolderKanban, CheckSquare, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlassCard from "./GlassCard";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickCaptureModal = ({ isOpen, onClose }: QuickCaptureModalProps) => {
  const { user } = useAuth();
  const [type, setType] = useState<"task" | "project">("task");
  const [title, setTitle] = useState("");
  const [energy, setEnergy] = useState<"high" | "medium" | "low">("medium");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Limpar estado ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle("");
        setType("task");
        setSuccess(false);
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setLoading(true);
    try {
      if (type === "task") {
        const { error } = await supabase.from("tasks").insert([{
          title: title.trim(),
          energy_level: energy,
          user_id: user.id,
          is_completed: false,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("projects").insert([{
          name: title.trim(),
          color: "#5e9eff",
          user_id: user.id,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erro na captura rápida:", err);
      alert("Erro ao salvar. Verifique se as tabelas foram criadas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg relative"
          >
            <GlassCard className="p-8 border-primary/20 shadow-2xl overflow-hidden" orb>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Zap size={22} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Captura Rápida</h3>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Descarregue sua mente</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-on-surface/5 rounded-xl transition-all opacity-40 hover:opacity-100">
                  <X size={20} />
                </button>
              </div>

              {success ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-300">
                   <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                     <Sparkles size={40} />
                   </div>
                   <h4 className="text-2xl font-bold">Capturado!</h4>
                   <p className="text-sm opacity-50">Sincronizado com seu santuário.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Selector Estiloso */}
                  <div className="flex p-1 bg-on-surface/5 rounded-2xl border border-[var(--glass-border)]">
                    <button
                      type="button"
                      onClick={() => setType("task")}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${type === "task" ? 'bg-primary text-surface shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                      <CheckSquare size={16} /> TAREFA
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("project")}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${type === "project" ? 'bg-primary text-surface shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                    >
                      <FolderKanban size={16} /> PROJETO
                    </button>
                  </div>

                  {/* Input Principal */}
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={type === "task" ? "O que precisa ser feito?" : "Nome do novo projeto..."}
                      className="w-full bg-transparent text-2xl font-bold placeholder:text-on-surface/10 outline-none py-4 border-b border-[var(--glass-border)] focus:border-primary/50 transition-all"
                      autoFocus
                      required
                    />
                  </div>

                  {/* Configurações Extra (Apenas para Tarefa) */}
                  <AnimatePresence>
                    {type === "task" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest pl-1">DISPONIBILIDADE DE ENERGIA</p>
                        <div className="flex gap-2">
                          {(['low', 'medium', 'high'] as const).map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setEnergy(lvl)}
                              className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-tighter transition-all ${
                                energy === lvl 
                                ? 'bg-primary/10 border-primary text-primary' 
                                : 'bg-on-surface/5 border-transparent opacity-40 hover:opacity-100'
                              }`}
                            >
                              {lvl === 'low' ? 'Baixa' : lvl === 'medium' ? 'Média' : 'Alta'}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Botão de Envio */}
                  <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="w-full py-4 bg-on-surface text-surface rounded-2xl font-bold text-sm tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-on-surface/5 disabled:opacity-30 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        SALVAR NO SANTUÁRIO <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </GlassCard>
            
            {/* Atalho do Teclado Hint */}
            <p className="text-center mt-6 text-[10px] opacity-30 font-bold uppercase tracking-[0.2em]">Pressione ESC para cancelar</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickCaptureModal;
