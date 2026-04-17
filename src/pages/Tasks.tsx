import React, { useEffect, useState } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Zap, Flag, Calendar, Filter, AlignLeft, Star, LayoutList, Columns, Clock, Table, FolderKanban, Edit2, X } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";
import { generateMockTasks, MOCK_PROJECTS } from "../lib/mockData";

export interface Task {
  id: string;
  title: string;
  energy_level: "high" | "medium" | "low";
  due_date: string | null;
  is_critical: boolean;
  is_completed: boolean;
  status?: string; 
  project_id?: string;
  created_at: string;
  is_mock?: boolean;
}

type Filter = "all" | "active" | "completed" | "critical";
type ViewMode = "list" | "kanban" | "table" | "calendar";

const ENERGY_LABELS = { high: "Alta", medium: "Média", low: "Baixa" };
const ENERGY_COLORS = {
  high: "text-red-400 bg-red-400/10 border-red-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  low: "text-green-400 bg-green-400/10 border-green-400/20",
};

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [viewDate, setViewDate] = useState(new Date());

  const [newTitle, setNewTitle] = useState("");
  const [newEnergy, setNewEnergy] = useState<"high" | "medium" | "low">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newCritical, setNewCritical] = useState(false);
  const [newProject, setNewProject] = useState(""); 
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropCol, setActiveDropCol] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("is_completed", { ascending: true })
      .order("is_critical", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      setTasks(data);
      setUsingMockData(false);
    } else {
      const mocks = generateMockTasks() as Task[];
      setTasks(mocks.map(t => ({ ...t, is_mock: true })));
      setUsingMockData(true);
    }
    setLoading(false);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;
    setAdding(true);

    if (usingMockData) {
      const mockTask: Task = {
        id: `mock-${Date.now()}`,
        title: newTitle.trim(),
        energy_level: newEnergy,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
        is_critical: newCritical,
        is_completed: false,
        status: "todo",
        project_id: newProject || undefined,
        created_at: new Date().toISOString(),
        is_mock: true
      };
      setTasks([mockTask, ...tasks]);
      resetForm();
      setAdding(false);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([{
        user_id: user.id,
        title: newTitle.trim(),
        energy_level: newEnergy,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : null,
        is_critical: newCritical,
        is_completed: false,
      }])
      .select();

    if (!error && data) {
      setTasks([data[0], ...tasks]);
      resetForm();
    }
    setAdding(false);
  };

  const saveEditedTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !editingTask.title.trim()) return;

    if (editingTask.is_mock) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, project_id: editingTask.project_id || undefined } : t));
      setEditingTask(null);
      return;
    }

    const { error } = await supabase.from("tasks").update({
      title: editingTask.title,
      energy_level: editingTask.energy_level,
      due_date: editingTask.due_date,
      is_critical: editingTask.is_critical,
    }).eq("id", editingTask.id);

    if (!error) {
      setTasks(tasks.map(t => t.id === editingTask.id ? editingTask : t));
    }
    setEditingTask(null);
  };

  const resetForm = () => {
    setNewTitle("");
    setNewDueDate("");
    setNewCritical(false);
    setNewEnergy("medium");
    setNewProject("");
    setShowForm(false);
  }

  const toggleTask = async (id: string, current: boolean) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const isNowCompleted = !current;
    const newStatus = isNowCompleted ? "done" : "todo";

    if (task.is_mock) {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: isNowCompleted, status: newStatus } : t));
      return;
    }

    // Atualização otimista: UI responde imediatamente
    setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: isNowCompleted, status: newStatus } : t));

    // Atualiza apenas is_completed (campo garantido no banco)
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: isNowCompleted })
      .eq("id", id);
    
    if (error) {
      console.error("Erro ao atualizar tarefa:", error);
      // Rollback local da tarefa específica
      setTasks(prev => prev.map(t => t.id === id ? { ...t, is_completed: current, status: current ? "done" : "todo" } : t));
    }
  };

  const toggleCritical = async (id: string, current: boolean) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.is_mock) {
      setTasks(tasks.map(t => t.id === id ? { ...t, is_critical: !current } : t));
      return;
    }

    const { error } = await supabase.from("tasks").update({ is_critical: !current }).eq("id", id);
    if (!error) setTasks(tasks.map(t => t.id === id ? { ...t, is_critical: !current } : t));
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (task.is_mock) {
      setTasks(tasks.filter(t => t.id !== id));
      return;
    }

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks(tasks.filter(t => t.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", taskId);
    setTimeout(() => {
      const el = document.getElementById(taskId);
      if (el) el.classList.add("opacity-50");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(null);
    setActiveDropCol(null);
    const el = document.getElementById(taskId);
    if (el) el.classList.remove("opacity-50");
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
    if (activeDropCol !== colId) {
      setActiveDropCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setActiveDropCol(null);
    
    let taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) taskId = draggedTaskId || "";
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (task.status === newStatus) return;

    const isCompletedNow = newStatus === "done";
    const prevStatus = task.status;
    const prevCompleted = task.is_completed;
    
    // Atualização otimista
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus, is_completed: isCompletedNow } : t
    ));

    if (!task.is_mock) {
      // Atualiza apenas is_completed (campo garantido no banco)
      const { error } = await supabase
        .from("tasks")
        .update({ is_completed: isCompletedNow })
        .eq("id", taskId);
        
      if (error) {
        console.error("Erro ao mover tarefa:", error);
        setTasks(prev => prev.map(t =>
          t.id === taskId ? { ...t, status: prevStatus, is_completed: prevCompleted } : t
        ));
      }
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "active") return !t.is_completed;
    if (filter === "completed") return t.is_completed;
    if (filter === "critical") return (t.is_critical || isOverdue(t)) && !t.is_completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Helper: tarefa atrasada = prazo vencido e não concluída
  const isOverdue = (task: Task) => {
    if (task.is_completed || !task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  const overdueCount = tasks.filter(isOverdue).length;

  const filterTabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todas", count: tasks.length },
    { key: "active", label: "Ativas", count: tasks.filter(t => !t.is_completed).length },
    { key: "critical", label: "Críticas", count: tasks.filter(t => (t.is_critical || isOverdue(t)) && !t.is_completed).length },
    { key: "completed", label: "Concluídas", count: tasks.filter(t => t.is_completed).length },
  ];

  const viewModes: { key: ViewMode; icon: any; label: string }[] = [
    { key: "list", icon: LayoutList, label: "Lista" },
    { key: "kanban", icon: Columns, label: "Kanban" },
    { key: "table", icon: Table, label: "Tabela" },
    { key: "calendar", icon: Calendar, label: "Calendário" }
  ];

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const startDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();
    
    const daysCount = daysInMonth(year, month);
    const firstDay = startDayOfMonth(year, month);
    const cells = [];
    
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-28 bg-on-surface/[0.01] border border-[var(--glass-border)] opacity-20" />);
    }
    
    for (let day = 1; day <= daysCount; day++) {
      const dateStr = new Date(year, month, day).toDateString();
      const isToday = new Date().toDateString() === dateStr;
      const dayTasks = filteredTasks.filter(t => t.due_date && new Date(t.due_date).toDateString() === dateStr);
      
      cells.push(
        <div key={day} className="h-28 border border-[var(--glass-border)] p-2 hover:bg-on-surface/[0.02] transition-colors overflow-hidden">
          <span className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-surface' : 'opacity-30'}`}>
            {day}
          </span>
          <div className="mt-1 space-y-1">
            {dayTasks.map(task => {
              const overdue = isOverdue(task);
              return (
              <div 
                key={task.id} 
                className={`text-[9px] px-1.5 py-0.5 rounded truncate font-bold border ${
                  task.is_completed ? 'bg-green-500/10 text-green-400 border-green-500/20 grayscale opacity-40' : 
                  overdue ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                  task.is_critical ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                  'bg-primary/10 text-primary border-primary/20'
                }`}
              >
                {overdue ? '⚠ ' : ''}{task.title}
              </div>
            )})}
          </div>
        </div>
      );
    }

    return (
      <GlassCard className="p-0 overflow-hidden border border-[var(--glass-border)]">
        <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between bg-on-surface/[0.02]">
           <h3 className="text-sm font-bold uppercase tracking-wider">
             {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
           </h3>
           <div className="flex items-center gap-1">
             <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-on-surface/5 rounded-lg"><Table size={14} /></button>
             <button onClick={() => setViewDate(new Date())} className="px-2 py-1 text-[9px] font-bold border border-[var(--glass-border)] rounded">HOJE</button>
             <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-on-surface/5 rounded-lg"><Table size={14} className="rotate-180" /></button>
           </div>
        </div>
        <div className="grid grid-cols-7 border-b border-[var(--glass-border)] bg-on-surface/[0.01]">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-2 text-center text-[9px] font-bold opacity-30 uppercase">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells}
        </div>
      </GlassCard>
    );
  };
  
  const renderTaskCard = (task: Task) => {
    const overdue = isOverdue(task);
    return (
    <GlassCard
      key={task.id}
      className={`px-5 py-4 flex items-center gap-4 group transition-all border-l-4 ${
        task.is_completed
          ? "opacity-40 grayscale border-l-transparent"
          : overdue
          ? "border-l-orange-500 bg-orange-500/[0.03]"
          : task.is_critical
          ? "border-l-red-500"
          : "border-l-primary/30 hover:border-l-primary"
      }`}
    >
      <button onClick={() => toggleTask(task.id, task.is_completed)} className="shrink-0 text-on-surface-variant hover:text-primary transition-colors">
        {task.is_completed ? <CheckCircle2 size={22} className="text-primary" /> : <Circle size={22} className="group-hover:text-primary transition-colors" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm md:text-base leading-snug ${task.is_completed ? "line-through" : ""}`}>
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ENERGY_COLORS[task.energy_level]}`}>
            {ENERGY_LABELS[task.energy_level].toUpperCase()} ENERGIA
          </span>
          {task.due_date && (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${
              overdue ? 'text-orange-400 font-bold' : 'opacity-50'
            }`}>
              <Calendar size={10} />
              {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </span>
          )}
          {overdue && (
            <span className="text-[9px] font-bold text-orange-400 flex items-center gap-1 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20 animate-pulse">
              <Clock size={9} /> ATRASADA
            </span>
          )}
          {task.is_critical && (
            <span className="text-[9px] font-bold text-red-400 flex items-center gap-1">
              <Zap size={9} fill="currentColor" /> CRÍTICA
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!task.is_completed && (
          <button onClick={() => toggleCritical(task.id, task.is_critical)} className={`p-2 rounded-xl transition-all hover:bg-on-surface/5`}>
            <Star size={15} fill={task.is_critical ? "red" : "none"} className={task.is_critical ? "text-red-400" : "text-on-surface-variant"} />
          </button>
        )}
        <button onClick={() => setEditingTask(task)} className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary text-on-surface-variant transition-all">
          <Edit2 size={15} />
        </button>
        <button onClick={() => deleteTask(task.id)} className="p-2 rounded-xl hover:bg-red-400/10 hover:text-red-400 text-on-surface-variant transition-all">
          <Trash2 size={15} />
        </button>
      </div>
    </GlassCard>
  );
  };

  const renderKanban = () => {
    const cols = [
      { id: "todo", label: "A Fazer" },
      { id: "in_progress", label: "Em Andamento" },
      { id: "done", label: "Concluídas" }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-start">
        {cols.map(col => {
          const colTasks = filteredTasks.filter(t => (t.status || (t.is_completed ? "done" : "todo")) === col.id);
          const isDropActive = activeDropCol === col.id;
          
          return (
            <div 
              key={col.id} 
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`bg-surface/50 border rounded-3xl p-4 flex flex-col gap-3 min-h-[400px] transition-all duration-300 ${isDropActive ? 'border-primary shadow-lg shadow-primary/10' : 'border-[var(--glass-border)]'}`}
            >
              <div className="flex items-center justify-between mb-2 px-2">
                <span className={`editorial-label text-xs font-bold transition-colors ${isDropActive ? 'text-primary' : ''}`}>{col.label.toUpperCase()}</span>
                <span className="bg-on-surface/10 px-2 py-0.5 rounded text-[10px]">{colTasks.length}</span>
              </div>
              <AnimatePresence>
                {colTasks.map(task => {
                  const proj = MOCK_PROJECTS.find(p => p.id === task.project_id);
                  const overdue = isOverdue(task);
                  return (
                    <motion.div key={task.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                      <GlassCard 
                        id={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={(e) => handleDragEnd(e, task.id)}
                        className={`p-4 flex flex-col gap-3 cursor-grab active:cursor-grabbing transition-all group border-l-4 ${
                          overdue ? 'border-l-orange-500 hover:border-orange-500/50' :
                          task.is_critical ? 'border-l-red-500 hover:border-red-500/50' :
                          proj ? '' : 'hover:border-primary/50'
                        }`}
                        style={{ borderLeftColor: !overdue && !task.is_critical && proj ? proj.color : undefined }}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className={`font-bold text-sm ${task.is_completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <button onClick={() => setEditingTask(task)} className="p-1 text-on-surface/50 hover:text-primary transition-colors"><Edit2 size={12} /></button>
                            <button onClick={() => deleteTask(task.id)} className="p-1 text-on-surface/50 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        
                        {proj && (
                          <div className="flex items-center gap-1.5 opacity-60">
                            <FolderKanban size={10} style={{ color: proj.color }} />
                            <span className="text-[9px] font-bold uppercase tracking-wider">{proj.name}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${ENERGY_COLORS[task.energy_level]}`}>
                            {ENERGY_LABELS[task.energy_level].toUpperCase()}
                          </span>
                          {overdue && (
                            <span className="text-[9px] bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 font-bold flex items-center gap-1 animate-pulse">
                              <Clock size={8} /> ATRASADA
                            </span>
                          )}
                          {task.is_critical && <span className="text-[9px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">CRÍTICA</span>}
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-8 mx-auto pb-20 ${viewMode === 'list' ? 'max-w-3xl' : 'max-w-6xl'}`}>
      <header className="space-y-4">
        <div className="flex items-center gap-2 opacity-60">
          <AlignLeft size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">{usingMockData ? "GESTÃO (DADOS FICTÍCIOS)" : "GESTÃO DE FLUXO"}</p>
        </div>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Tarefas</h2>
            <p className="text-sm opacity-50 mt-1">
              {completedCount} de {totalCount} concluídas {usingMockData && "• Modo Demo"}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="flex bg-surface/50 border border-[var(--glass-border)] rounded-full p-1">
              {viewModes.map(mode => (
                <button
                  key={mode.key}
                  onClick={() => setViewMode(mode.key)}
                  className={`p-2 rounded-full transition-all ${viewMode === mode.key ? "bg-primary text-surface shadow-md" : "text-on-surface/50 hover:bg-on-surface/5"}`}
                  title={mode.label}
                >
                  <mode.icon size={16} />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowForm(!showForm)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl ${
                showForm ? "bg-on-surface/10 text-on-surface" : "bg-primary text-surface shadow-primary/20 hover:scale-105"
              }`}
            >
              <Plus size={18} className={`transition-transform ${showForm ? "rotate-45" : ""}`} />
              <span className="hidden sm:inline">{showForm ? "CANCELAR" : "NOVA TAREFA"}</span>
            </button>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="space-y-2 max-w-3xl">
            <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
            </div>
          </div>
        )}
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }} className="max-w-3xl">
            <GlassCard className="p-6 border-primary/30 border-2">
              <form onSubmit={addTask} className="space-y-5">
                <div className="relative">
                  <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="O que precisa ser feito?" className="w-full bg-transparent text-xl font-bold placeholder:text-on-surface/20 outline-none border-b border-[var(--glass-border)] pb-3 focus:border-primary/50 transition-all" autoFocus required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><FolderKanban size={10} /> PROJETO</label>
                    <select 
                      value={newProject} 
                      onChange={e => setNewProject(e.target.value)} 
                      className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-2.5 px-3 outline-none focus:border-primary/50 transition-all text-[11px] font-bold uppercase tracking-wider appearance-none cursor-pointer"
                    >
                      <option value="">Nenhum</option>
                      {MOCK_PROJECTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><Zap size={10} /> ENERGIA</label>
                    <div className="flex gap-2">
                      {(["high", "medium", "low"] as const).map(level => (
                        <button key={level} type="button" onClick={() => setNewEnergy(level)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${newEnergy === level ? ENERGY_COLORS[level] + " border-current" : "border-[var(--glass-border)] opacity-40 hover:opacity-70"}`}>
                          {ENERGY_LABELS[level].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><Calendar size={10} /> PRAZO</label>
                    <input type="date" value={newDueDate} onChange={e => setNewDueDate(e.target.value)} className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-[9px] px-3 outline-none focus:border-primary/50 transition-all text-sm cursor-text" />
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><Flag size={10} /> PRIORIDADE</label>
                    <button type="button" onClick={() => setNewCritical(!newCritical)} className={`w-full py-2.5 rounded-xl text-[10px] font-bold border transition-all ${newCritical ? "bg-red-500/10 text-red-400 border-red-400/30" : "border-[var(--glass-border)] opacity-50 hover:opacity-80"}`}>
                      {newCritical ? "⚡ CRÍTICA" : "NORMAL"}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-[var(--glass-border)] mt-6">
                  <button type="submit" disabled={adding || !newTitle.trim()} className="px-8 py-3 rounded-full bg-primary text-surface font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40">
                    {adding ? "SALVANDO..." : "CRIAR TAREFA"}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${filter === tab.key ? "bg-primary/10 text-primary border-primary/30" : "border-[var(--glass-border)] opacity-50 hover:opacity-80"}`}>
            <Filter size={10} /> {tab.label.toUpperCase()}
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${filter === tab.key ? "bg-primary/20" : "bg-on-surface/10"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center editorial-label opacity-20 animate-pulse">CARREGANDO SUAS TAREFAS...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-[var(--glass-border)] rounded-3xl max-w-3xl">
          <p className="editorial-label text-xs opacity-30">NENHUMA TAREFA POR AQUI</p>
        </div>
      ) : (
        <div className="mt-8">
          {viewMode === "list" && <div className="space-y-3"><AnimatePresence initial={false}>{filteredTasks.map(task => <motion.div key={task.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>{renderTaskCard(task)}</motion.div>)}</AnimatePresence></div>}
          {viewMode === "kanban" && renderKanban()}
          {viewMode === "calendar" && renderCalendar()}
          {viewMode === "table" && <div className="p-8 text-center bg-surface/50 rounded-3xl border border-[var(--glass-border)] opacity-50 editorial-label">Tabela em construção com projetos...</div>}
        </div>
      )}

      <AnimatePresence>
        {editingTask && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <GlassCard className="w-full max-w-2xl p-6 relative border-primary/50 shadow-2xl">
              <button 
                onClick={() => setEditingTask(null)}
                className="absolute top-4 right-4 p-2 bg-on-surface/5 hover:bg-on-surface/10 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="mb-6 flex items-center gap-2 opacity-70">
                <Edit2 size={14} className="text-primary"/>
                <span className="editorial-label">EDITAR TAREFA</span>
              </div>

              <form onSubmit={saveEditedTask} className="space-y-5">
                <input 
                  type="text" 
                  value={editingTask.title} 
                  onChange={e => setEditingTask({...editingTask, title: e.target.value})} 
                  placeholder="Nome da tarefa" 
                  className="w-full bg-transparent text-2xl font-bold placeholder:text-on-surface/20 outline-none border-b border-[var(--glass-border)] pb-3 focus:border-primary/50 transition-all" 
                  autoFocus 
                  required 
                />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><FolderKanban size={10} /> PROJETO</label>
                    <select 
                      value={editingTask.project_id || ""} 
                      onChange={e => setEditingTask({...editingTask, project_id: e.target.value})} 
                      className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-2.5 px-3 outline-none focus:border-primary/50 transition-all text-[11px] font-bold uppercase tracking-wider appearance-none cursor-pointer"
                    >
                      <option value="">Nenhum Projeto</option>
                      {MOCK_PROJECTS.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><Zap size={10} /> ENERGIA</label>
                    <div className="flex gap-2">
                      {(["high", "medium", "low"] as const).map(level => (
                        <button key={level} type="button" onClick={() => setEditingTask({...editingTask, energy_level: level})} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${editingTask.energy_level === level ? ENERGY_COLORS[level] + " border-current" : "border-[var(--glass-border)] opacity-40 hover:opacity-70"}`}>
                          {ENERGY_LABELS[level].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><Calendar size={10} /> PRAZO</label>
                    <input type="date" value={editingTask.due_date ? editingTask.due_date.split('T')[0] : ""} onChange={e => setEditingTask({...editingTask, due_date: e.target.value ? new Date(e.target.value).toISOString() : null})} className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-[9px] px-3 outline-none focus:border-primary/50 transition-all text-sm " />
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1"><Flag size={10} /> PRIORIDADE</label>
                    <button type="button" onClick={() => setEditingTask({...editingTask, is_critical: !editingTask.is_critical})} className={`w-full py-2.5 rounded-xl text-[10px] font-bold border transition-all ${editingTask.is_critical ? "bg-red-500/10 text-red-400 border-red-400/30" : "border-[var(--glass-border)] opacity-50 hover:opacity-80"}`}>
                      {editingTask.is_critical ? "⚡ CRÍTICA" : "MARCAR CRÍTICA"}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-[var(--glass-border)] mt-6">
                  <button type="submit" className="px-8 py-3 rounded-full bg-primary text-surface font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all">
                    SALVAR ALTERAÇÕES
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Tasks;
