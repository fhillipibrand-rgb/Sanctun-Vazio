import React, { useState, useEffect } from "react";
import { 
  X, Zap, Plus, FolderKanban, CheckSquare, Sparkles, 
  Loader2, ArrowRight, Calendar as CalendarIcon, 
  Clock, ChevronDown, ChevronUp, Flag, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import GlassCard from "./GlassCard";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

const QuickCaptureModal = ({ isOpen, onClose }: QuickCaptureModalProps) => {
  const { user } = useAuth();
  const [type, setType] = useState<"task" | "project">("task");
  const [title, setTitle] = useState("");
  const [energy, setEnergy] = useState<"high" | "medium" | "low">("medium");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Novos campos avançados
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [status, setStatus] = useState("todo");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isCritical, setIsCritical] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  // Limpar estado ao fechar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setTitle("");
        setType("task");
        setSuccess(false);
        setLoading(false);
        setShowAdvanced(false);
        setStatus("todo");
        setDueDate("");
        setDueTime("");
        setProjectId("");
        setIsCritical(false);
      }, 300);
    } else {
      fetchProjects();
    }
  }, [isOpen]);

  const fetchProjects = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("projects")
      .select("id, name, color")
      .order("name");
    if (data) setProjects(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    setLoading(true);
    try {
      if (type === "task") {
        // Combinar data e hora se ambos existirem
        let fullDate = null;
        if (dueDate) {
          fullDate = dueTime ? new Date(`${dueDate}T${dueTime}`).toISOString() : new Date(dueDate).toISOString();
        }

        const { error } = await supabase.from("tasks").insert([{
          title: title.trim(),
          energy_level: energy,
          user_id: user.id,
          is_completed: status === "done",
          status: status,
          due_date: fullDate,
          project_id: projectId || null,
          is_critical: isCritical,
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-xl relative my-auto"
          >
            <GlassCard className="p-8 border-primary/20 shadow-2xl overflow-hidden" orb>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Zap size={22} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">Captura Inteligente</h3>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Fluxo Rápido de Pensamento</p>
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

                  {/* Opções Avançadas (Apenas para Tarefa) */}
                  <AnimatePresence>
                    {type === "task" && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest pl-1">DETALHES DO FLUXO</p>
                           <button 
                             type="button" 
                             onClick={() => setShowAdvanced(!showAdvanced)}
                             className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                           >
                             {showAdvanced ? "OCULTAR OPÇÕES" : "OPÇÕES AVANÇADAS"}
                             {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                           </button>
                        </div>

                        {/* Seção Básica (Energia) */}
                        <div className="space-y-2">
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
                                {lvl === 'low' ? 'Baixa Energia' : lvl === 'medium' ? 'Média Energia' : 'Alta Energia'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Seção Expandida */}
                        <AnimatePresence>
                          {showAdvanced && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-6 overflow-hidden pt-2"
                            >
                              <div className="grid grid-cols-2 gap-4">
                                {/* Status */}
                                <div className="space-y-2">
                                  <label className="editorial-label text-[10px] opacity-40 flex items-center gap-2"><Tag size={12} /> STATUS</label>
                                  <select 
                                    value={status} 
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-3 px-3 outline-none focus:border-primary/50 text-[11px] font-bold uppercase tracking-wider appearance-none cursor-pointer"
                                  >
                                    <option value="todo">A Fazer</option>
                                    <option value="in_progress">Em Progresso</option>
                                    <option value="done">Concluído</option>
                                  </select>
                                </div>

                                {/* Projeto */}
                                <div className="space-y-2">
                                  <label className="editorial-label text-[10px] opacity-40 flex items-center gap-2"><FolderKanban size={12} /> PROJETO</label>
                                  <select 
                                    value={projectId} 
                                    onChange={(e) => setProjectId(e.target.value)}
                                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-3 px-3 outline-none focus:border-primary/50 text-[11px] font-bold uppercase tracking-wider appearance-none cursor-pointer"
                                  >
                                    <option value="">Nenhum</option>
                                    {projects.map(p => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                {/* Data de Vencimento */}
                                <div className="space-y-2">
                                  <label className="editorial-label text-[10px] opacity-40 flex items-center gap-2"><CalendarIcon size={12} /> DATA</label>
                                  <div className="relative group">
                                    <input 
                                      type="date" 
                                      value={dueDate} 
                                      onChange={(e) => setDueDate(e.target.value)}
                                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-3 px-3 outline-none focus:border-primary/50 text-xs font-mono transition-all pr-10"
                                    />
                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" size={14} />
                                  </div>
                                </div>

                                {/* Horário */}
                                <div className="space-y-2">
                                  <label className="editorial-label text-[10px] opacity-40 flex items-center gap-2"><Clock size={12} /> HORÁRIO</label>
                                  <div className="relative group">
                                    <input 
                                      type="time" 
                                      value={dueTime} 
                                      onChange={(e) => setDueTime(e.target.value)}
                                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-3 px-3 outline-none focus:border-primary/50 text-xs font-mono transition-all pr-10"
                                    />
                                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" size={14} />
                                  </div>
                                </div>
                              </div>

                              {/* Prioridade Crítica */}
                              <div className="pt-2">
                                <button 
                                  type="button" 
                                  onClick={() => setIsCritical(!isCritical)}
                                  className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all ${
                                    isCritical 
                                    ? 'bg-red-400/10 border-red-400 text-red-500 shadow-lg shadow-red-400/10' 
                                    : 'bg-on-surface/5 border-transparent opacity-40 hover:opacity-100'
                                  }`}
                                >
                                  <Flag size={18} fill={isCritical ? "currentColor" : "none"} />
                                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Sapo do Dia (Tarefa Crítica)</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Botão de Envio */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading || !title.trim()}
                      className="w-full py-4 bg-on-surface text-surface rounded-2xl font-bold text-sm tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-on-surface/5 disabled:opacity-30 disabled:hover:scale-100"
                    >
                      {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <>
                          CONFIRMAR LANÇAMENTO <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
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
