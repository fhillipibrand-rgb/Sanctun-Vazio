import React, { useEffect, useState } from "react";
import { FolderKanban, Plus, MoreHorizontal, AlignLeft, CheckCircle2, Circle } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { MOCK_PROJECTS, generateMockTasks } from "../lib/mockData";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  project_id?: string;
  is_mock?: boolean;
}

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState(MOCK_PROJECTS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("#5e9eff");

  const colors = ["#5e9eff", "#a855f7", "#00f5a0", "#ff6b6b", "#f5a623"];

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, is_completed, project_id")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      setTasks(data);
    } else {
      setTasks(generateMockTasks() as Task[]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj = {
      id: `proj-${Date.now()}`,
      name: newTitle.trim(),
      color: newColor,
      progress: 0,
      created_at: new Date().toISOString()
    };
    
    setProjects([newProj, ...projects]);
    setNewTitle("");
    setShowForm(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
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

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
            <GlassCard className="p-6 border-primary/30 border-2 max-w-2xl">
              <form onSubmit={handleCreate} className="space-y-5">
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)} 
                  placeholder="Nome do projeto..." 
                  className="w-full bg-transparent text-xl font-bold placeholder:text-on-surface/20 outline-none border-b border-[var(--glass-border)] pb-3 focus:border-primary/50 transition-all" 
                  autoFocus 
                  required 
                />
                <div className="flex flex-col gap-2">
                  <label className="editorial-label text-[10px] opacity-50">COR DE IDENTIFICAÇÃO</label>
                  <div className="flex gap-3">
                    {colors.map(c => (
                      <button 
                        key={c} type="button" onClick={() => setNewColor(c)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${newColor === c ? 'scale-125 border-surface shadow-lg' : 'border-transparent skew-y-0 scale-100 hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button type="submit" className="px-8 py-3 rounded-full bg-primary text-surface font-bold text-sm shadow-lg hover:scale-105 transition-all">CRIAR PROJETO</button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj, idx) => {
          // Filtrar dinamicamente as tarefas que pertencem a este projeto específico
          const projectTasks = tasks.filter(t => t.project_id === proj.id);
          const totalTasks = projectTasks.length;
          const completedTasks = projectTasks.filter(t => t.is_completed).length;
          
          // Calcula progresso dinâmico Real-time
          const dynamicProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

          return (
            <motion.div key={proj.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <GlassCard className="p-0 border-t-4 overflow-hidden group flex flex-col h-full hover:border-[var(--glass-border)] transition-colors" style={{ borderTopColor: proj.color }}>
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-10 h-10 rounded-xl bg-on-surface/5 flex items-center justify-center">
                      <FolderKanban size={18} style={{ color: proj.color }} />
                    </div>
                    <button className="text-on-surface/30 hover:text-on-surface transition-colors p-1"><MoreHorizontal size={16} /></button>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mt-4">{proj.name}</h3>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">
                    {totalTasks === 0 ? "VAZIO" : `${completedTasks} CONCLUÍDAS DE ${totalTasks}`}
                  </p>
                </div>
                
                {/* Lista dinâmica de tarefas encapsulada no card */}
                {totalTasks > 0 && (
                  <div className="px-6 py-2 flex flex-col gap-2 mb-4">
                    {projectTasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-2">
                        {task.is_completed ? <CheckCircle2 size={12} className="text-primary opacity-50 shrink-0" /> : <Circle size={12} className="opacity-30 shrink-0" />}
                        <span className={`text-xs truncate ${task.is_completed ? 'line-through opacity-40' : 'opacity-80'}`}>{task.title}</span>
                      </div>
                    ))}
                    {totalTasks > 3 && (
                      <span className="text-[10px] items-center italic opacity-40">+ {totalTasks - 3} tarefas ocultas</span>
                    )}
                  </div>
                )}

                <div className="mt-auto bg-on-surface/[0.02] p-6 pt-4 border-t border-[var(--glass-border)]">
                  <div className="flex justify-between text-[10px] font-bold mb-2">
                    <span className="opacity-50">PROGRESSO</span>
                    <span style={{ color: proj.color }}>{dynamicProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out" 
                      style={{ backgroundColor: proj.color, width: `${dynamicProgress}%` }} 
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )
        })}
      </div>
    </div>
  );
};

export default Projects;
