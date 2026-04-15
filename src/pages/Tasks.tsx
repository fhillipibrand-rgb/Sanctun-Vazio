import React, { useEffect, useState } from "react";
import { Plus, CheckCircle2, Circle, Trash2, Zap, Flag, Calendar, Filter, AlignLeft, Star } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";

interface Task {
  id: string;
  title: string;
  energy_level: "high" | "medium" | "low";
  due_date: string | null;
  is_critical: boolean;
  is_completed: boolean;
  created_at: string;
}

type Filter = "all" | "active" | "completed" | "critical";

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
  const [newTitle, setNewTitle] = useState("");
  const [newEnergy, setNewEnergy] = useState<"high" | "medium" | "low">("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newCritical, setNewCritical] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);

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

    if (!error && data) setTasks(data);
    setLoading(false);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !user) return;
    setAdding(true);

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
      setNewTitle("");
      setNewDueDate("");
      setNewCritical(false);
      setNewEnergy("medium");
      setShowForm(false);
    }
    setAdding(false);
  };

  const toggleTask = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_completed: !current })
      .eq("id", id);
    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !current } : t));
    }
  };

  const toggleCritical = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from("tasks")
      .update({ is_critical: !current })
      .eq("id", id);
    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, is_critical: !current } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks(tasks.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "active") return !t.is_completed;
    if (filter === "completed") return t.is_completed;
    if (filter === "critical") return t.is_critical && !t.is_completed;
    return true;
  });

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const filterTabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Todas", count: tasks.length },
    { key: "active", label: "Ativas", count: tasks.filter(t => !t.is_completed).length },
    { key: "critical", label: "Críticas", count: tasks.filter(t => t.is_critical && !t.is_completed).length },
    { key: "completed", label: "Concluídas", count: tasks.filter(t => t.is_completed).length },
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-20">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-2 opacity-60">
          <AlignLeft size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">GESTÃO DE FLUXO</p>
        </div>
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Tarefas</h2>
            <p className="text-sm opacity-50 mt-1">
              {completedCount} de {totalCount} concluídas
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl ${
              showForm
                ? "bg-on-surface/10 text-on-surface"
                : "bg-primary text-surface shadow-primary/20 hover:scale-105"
            }`}
          >
            <Plus size={18} className={`transition-transform ${showForm ? "rotate-45" : ""}`} />
            {showForm ? "CANCELAR" : "NOVA TAREFA"}
          </button>
        </div>

        {/* Barra de progresso */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] opacity-30 font-mono tracking-widest text-right">{Math.round(progress)}% COMPLETO</p>
          </div>
        )}
      </header>

      {/* Formulário de nova tarefa */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <GlassCard className="p-6 border-primary/30 border-2">
              <form onSubmit={addTask} className="space-y-5">
                {/* Título */}
                <div className="relative">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="O que precisa ser feito?"
                    className="w-full bg-transparent text-xl font-bold placeholder:text-on-surface/20 outline-none border-b border-[var(--glass-border)] pb-3 focus:border-primary/50 transition-all"
                    autoFocus
                    required
                  />
                </div>

                {/* Opções */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Energia */}
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1">
                      <Zap size={10} /> NÍVEL DE ENERGIA
                    </label>
                    <div className="flex gap-2">
                      {(["high", "medium", "low"] as const).map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setNewEnergy(level)}
                          className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                            newEnergy === level
                              ? ENERGY_COLORS[level] + " border-current"
                              : "border-[var(--glass-border)] opacity-40 hover:opacity-70"
                          }`}
                        >
                          {ENERGY_LABELS[level].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Data */}
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1">
                      <Calendar size={10} /> PRAZO (OPCIONAL)
                    </label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-2.5 px-3 outline-none focus:border-primary/50 transition-all text-sm"
                    />
                  </div>

                  {/* Crítica */}
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-50 flex items-center gap-1">
                      <Flag size={10} /> PRIORIDADE
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewCritical(!newCritical)}
                      className={`w-full py-2.5 rounded-xl text-[10px] font-bold border transition-all ${
                        newCritical
                          ? "bg-red-500/10 text-red-400 border-red-400/30"
                          : "border-[var(--glass-border)] opacity-50 hover:opacity-80"
                      }`}
                    >
                      {newCritical ? "⚡ CRÍTICA" : "MARCAR CRÍTICA"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={adding || !newTitle.trim()}
                    className="px-8 py-3 rounded-full bg-primary text-surface font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
                  >
                    {adding ? "SALVANDO..." : "ADICIONAR TAREFA"}
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold border transition-all ${
              filter === tab.key
                ? "bg-primary/10 text-primary border-primary/30"
                : "border-[var(--glass-border)] opacity-50 hover:opacity-80"
            }`}
          >
            <Filter size={10} />
            {tab.label.toUpperCase()}
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
              filter === tab.key ? "bg-primary/20" : "bg-on-surface/10"
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center editorial-label opacity-20 animate-pulse">CARREGANDO SUAS TAREFAS...</div>
        ) : filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-20 text-center border-2 border-dashed border-[var(--glass-border)] rounded-3xl"
          >
            <div className="w-16 h-16 rounded-full bg-on-surface/5 flex items-center justify-center mx-auto mb-4 opacity-20">
              <CheckCircle2 size={32} />
            </div>
            <p className="editorial-label text-xs opacity-30">
              {filter === "completed" ? "NENHUMA TAREFA CONCLUÍDA" :
               filter === "critical" ? "NENHUMA TAREFA CRÍTICA" :
               "NENHUMA TAREFA POR AQUI"}
            </p>
            {filter === "all" && (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-primary text-xs font-bold hover:underline"
              >
                + Adicionar sua primeira tarefa
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard
                  className={`px-5 py-4 flex items-center gap-4 group transition-all border-l-4 ${
                    task.is_completed
                      ? "opacity-40 grayscale border-l-transparent"
                      : task.is_critical
                      ? "border-l-red-500"
                      : "border-l-primary/30 hover:border-l-primary"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id, task.is_completed)}
                    className="shrink-0 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {task.is_completed ? (
                      <CheckCircle2 size={22} className="text-primary" />
                    ) : (
                      <Circle size={22} className="group-hover:text-primary transition-colors" />
                    )}
                  </button>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm md:text-base leading-snug ${task.is_completed ? "line-through" : ""}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      {/* Badge de energia */}
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ENERGY_COLORS[task.energy_level]}`}>
                        {ENERGY_LABELS[task.energy_level].toUpperCase()} ENERGIA
                      </span>
                      {/* Data */}
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-[10px] opacity-50 font-medium">
                          <Calendar size={10} />
                          {new Date(task.due_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                      )}
                      {/* Crítica */}
                      {task.is_critical && (
                        <span className="text-[9px] font-bold text-red-400 flex items-center gap-1">
                          <Zap size={9} fill="currentColor" /> CRÍTICA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* Marcar crítica */}
                    {!task.is_completed && (
                      <button
                        onClick={() => toggleCritical(task.id, task.is_critical)}
                        title={task.is_critical ? "Remover prioridade crítica" : "Marcar como crítica"}
                        className={`p-2 rounded-xl transition-all ${
                          task.is_critical
                            ? "text-red-400 bg-red-400/10"
                            : "hover:bg-on-surface/5 text-on-surface-variant"
                        }`}
                      >
                        <Star size={15} fill={task.is_critical ? "currentColor" : "none"} />
                      </button>
                    )}
                    {/* Deletar */}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 rounded-xl hover:bg-red-400/10 hover:text-red-400 text-on-surface-variant transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Rodapé: Limpar concluídas */}
      {tasks.some(t => t.is_completed) && (
        <div className="flex justify-center pt-4">
          <button
            onClick={async () => {
              const ids = tasks.filter(t => t.is_completed).map(t => t.id);
              await supabase.from("tasks").delete().in("id", ids);
              setTasks(tasks.filter(t => !t.is_completed));
            }}
            className="text-[10px] font-bold opacity-30 hover:opacity-60 hover:text-red-400 transition-all"
          >
            LIMPAR {tasks.filter(t => t.is_completed).length} CONCLUÍDAS
          </button>
        </div>
      )}
    </div>
  );
};

export default Tasks;
