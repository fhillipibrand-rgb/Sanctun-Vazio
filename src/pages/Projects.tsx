import React, { useEffect, useState } from "react";
import { 
  FolderKanban, Plus, MoreHorizontal, AlignLeft, 
  CheckCircle2, Circle, Trash2, Edit2, Calendar, 
  Clock, X, ChevronRight, AlertCircle, Info
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface Project {
  id: string;
  name: string;
  color: string;
  deadline?: string;
  description?: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  project_id?: string;
}

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para Criação/Edição
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#5e9eff");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [description, setDescription] = useState("");

  const colors = ["#5e9eff", "#a855f7", "#00f5a0", "#ff6b6b", "#f5a623", "#3b82f6", "#ec4899"];

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchTasks();
    }
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoading(false);
  };

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("id, title, is_completed, project_id")
      .order("created_at", { ascending: false });

    if (data) setTasks(data);
  };

  const resetForm = () => {
    setTitle("");
    setColor("#5e9eff");
    setDeadlineDate("");
    setDeadlineTime("");
    setDescription("");
    setShowForm(false);
    setEditingProject(null);
  };

  const handleOpenEdit = (proj: Project) => {
    setEditingProject(proj);
    setTitle(proj.name);
    setColor(proj.color);
    setDescription(proj.description || "");
    if (proj.deadline) {
      const dt = new Date(proj.deadline);
      setDeadlineDate(dt.toISOString().split('T')[0]);
      setDeadlineTime(dt.toTimeString().slice(0, 5));
    } else {
      setDeadlineDate("");
      setDeadlineTime("");
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;

    let fullDeadline = null;
    if (deadlineDate) {
      fullDeadline = deadlineTime 
        ? new Date(`${deadlineDate}T${deadlineTime}`).toISOString() 
        : new Date(deadlineDate).toISOString();
    }

    if (editingProject) {
      // Lógica de Edição
      const { data, error } = await supabase
        .from("projects")
        .update({
          name: title.trim(),
          color: color,
          deadline: fullDeadline,
          description: description.trim()
        })
        .eq("id", editingProject.id)
        .select()
        .single();

      if (!error && data) {
        setProjects(projects.map(p => p.id === data.id ? data : p));
        resetForm();
      }
    } else {
      // Lógica de Criação
      const { data, error } = await supabase
        .from("projects")
        .insert([{
          name: title.trim(),
          color: color,
          deadline: fullDeadline,
          description: description.trim(),
          user_id: user.id
        }])
        .select()
        .single();

      if (!error && data) {
        setProjects([data, ...projects]);
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto e todo o seu histórico?")) return;
    
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const getTimeRemaining = (deadline?: string) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff < 0) return "Atrasado";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} dias restantes`;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} horas restantes`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-4">
        <div className="flex items-center gap-2 opacity-60">
          <AlignLeft size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">GESTÃO DE FLUXO</p>
        </div>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Projetos</h2>
            <p className="text-sm opacity-50 mt-1">Organize suas tarefas em escopos maiores</p>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl ${
              showForm ? "bg-on-surface/10 text-on-surface" : "bg-primary text-surface shadow-primary/20 hover:scale-105"
            }`}
          >
            <Plus size={18} className={`transition-transform ${showForm ? "rotate-45" : ""}`} />
            <span className="hidden sm:inline">{showForm ? "CANCELAR" : "NOVO PROJETO"}</span>
          </button>
        </div>
      </header>

      {/* Formulário de Criação/Edição */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            <GlassCard className="p-8 border-primary/30 border-2 max-w-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <FolderKanban size={150} className="text-primary" />
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="flex items-center gap-3 mb-2">
                   <Edit2 size={16} className="text-primary" />
                   <h3 className="editorial-label font-bold text-xs tracking-[0.2em]">{editingProject ? "EDITAR PROJETO" : "NOVO PROJETO"}</h3>
                </div>

                <div className="space-y-6">
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Nome do projeto..." 
                    className="w-full bg-transparent text-3xl font-bold placeholder:text-on-surface/10 outline-none border-b border-[var(--glass-border)] pb-4 focus:border-primary/50 transition-all" 
                    autoFocus 
                    required 
                  />

                  <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Adicione uma breve descrição do escopo (opcional)..."
                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 text-sm outline-none focus:border-primary/50 transition-all min-h-[80px] resize-none"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="editorial-label text-[10px] opacity-40 flex items-center gap-2"><TagIcon size={12} /> COR DE IDENTIFICAÇÃO</label>
                      <div className="flex flex-wrap gap-4">
                        {colors.map(c => (
                          <button 
                            key={c} type="button" onClick={() => setColor(c)}
                            className={`w-12 h-12 rounded-full border-4 transition-all flex items-center justify-center ${
                              color === c 
                              ? 'scale-110 border-white shadow-xl shadow-white/10 ring-4 ring-white/10' 
                              : 'border-transparent opacity-40 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: c }}
                          >
                            {color === c && <CheckCircle2 size={18} className="text-surface drop-shadow-md" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="editorial-label text-[10px] opacity-40 flex items-center gap-2"><Calendar size={12} /> PRAZO DE ENTREGA (OPCIONAL)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-bold opacity-30 uppercase tracking-widest pl-1">
                               <Calendar size={10} /> DATA
                            </div>
                            <input 
                              type="date" 
                              value={deadlineDate} 
                              onChange={e => setDeadlineDate(e.target.value)}
                              className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 text-xs outline-none focus:border-primary/50 font-bold transition-all"
                            />
                         </div>
                         <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[9px] font-bold opacity-30 uppercase tracking-widest pl-1">
                               <Clock size={10} /> HORA
                            </div>
                            <input 
                              type="time" 
                              value={deadlineTime} 
                              onChange={e => setDeadlineTime(e.target.value)}
                              className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 text-xs outline-none focus:border-primary/50 font-bold transition-all"
                            />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-[var(--glass-border)]">
                  <button type="button" onClick={resetForm} className="px-8 py-3 rounded-full font-bold text-sm opacity-40 hover:opacity-100 transition-all">CANCELAR</button>
                  <button type="submit" className="px-10 py-3 rounded-full bg-primary text-surface font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                    {editingProject ? "SALVAR ALTERAÇÕES" : "CRIAR PROJETO"}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-30 editorial-label animate-pulse">SINCRONIZANDO PROJETOS...</div>
      ) : projects.length === 0 ? (
        <GlassCard className="p-24 flex flex-col items-center justify-center text-center gap-6 opacity-50 border-dashed border-2">
          <div className="w-20 h-20 rounded-3xl bg-on-surface/5 flex items-center justify-center">
            <FolderKanban size={40} className="opacity-20" />
          </div>
          <div>
            <h4 className="font-bold text-xl mb-2">Nenhum projeto registrado</h4>
            <p className="max-w-xs text-sm opacity-60">Comece criando um projeto para organizar suas tarefas e estabelecer prazos de entrega.</p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj, idx) => {
            const projectTasks = tasks.filter(t => t.project_id === proj.id);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.is_completed).length;
            const dynamicProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const timeLeft = getTimeRemaining(proj.deadline);

            return (
              <motion.div key={proj.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                <GlassCard className="p-0 border-t-8 overflow-hidden group flex flex-col h-full hover:border-[var(--glass-border)] transition-all hover:scale-[1.01]" style={{ borderTopColor: proj.color }}>
                  <div className="p-7 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-on-surface/5 flex items-center justify-center shadow-inner">
                        <FolderKanban size={22} style={{ color: proj.color }} />
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleOpenEdit(proj)} className="text-on-surface/30 hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary/10"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(proj.id)} className="text-on-surface/30 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-xl leading-snug group-hover:text-primary transition-colors">{proj.name}</h3>
                    {proj.description && <p className="text-xs opacity-40 mt-2 line-clamp-2">{proj.description}</p>}
                    
                    <div className="flex items-center gap-4 mt-6">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">STATUS</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                            {totalTasks === 0 ? "VAZIO" : `${completedTasks}/${totalTasks} TAREFAS`}
                          </span>
                       </div>
                       {proj.deadline && (
                         <div className="flex flex-col border-l border-[var(--glass-border)] pl-4">
                            <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">PRAZO</span>
                            <div className={`flex items-center gap-1.5 mt-1 ${timeLeft === 'Atrasado' ? 'text-red-400' : 'text-primary'}`}>
                               <Clock size={10} />
                               <span className="text-[10px] font-bold uppercase tracking-widest">{timeLeft}</span>
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                  
                  {totalTasks > 0 && (
                    <div className="px-7 py-3 flex flex-col gap-2 mb-4 bg-on-surface/[0.01]">
                      {projectTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center gap-2 group/task">
                          {task.is_completed ? <CheckCircle2 size={12} className="text-primary opacity-50 shrink-0" /> : <Circle size={12} className="opacity-30 shrink-0 group-hover/task:text-primary transition-colors" />}
                          <span className={`text-[11px] truncate ${task.is_completed ? 'line-through opacity-30' : 'opacity-70 group-hover/task:opacity-100 transition-opacity'}`}>{task.title}</span>
                        </div>
                      ))}
                      {totalTasks > 3 && (
                        <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest mt-1 flex items-center gap-1">
                          <Plus size={10} /> {totalTasks - 3} MAIS TAREFAS
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-auto bg-on-surface/[0.03] p-7 pt-5 border-t border-[var(--glass-border)]">
                    <div className="flex justify-between text-[10px] font-bold mb-3">
                      <span className="opacity-40 uppercase tracking-[0.2em] font-bold">PROGRESSO TOTAL</span>
                      <span className="font-mono" style={{ color: proj.color }}>{dynamicProgress}%</span>
                    </div>
                    <div className="h-2 w-full bg-on-surface/10 rounded-full overflow-hidden p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${dynamicProgress}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full rounded-full shadow-[0_0_12px_rgba(0,0,0,0.2)]" 
                        style={{ backgroundColor: proj.color }} 
                      />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  );
};

// Icon inline helper
const TagIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </svg>
);

export default Projects;
