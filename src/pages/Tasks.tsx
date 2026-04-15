import { useEffect, useState } from "react";
import { Search, Bell, Settings, Calendar, Circle, Zap, Share2, MoreVertical, Plus, CheckCircle2 } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface Task {
  id: string;
  title: string;
  energy_level: 'high' | 'medium' | 'low';
  device_type: 'computer' | 'mobile';
  due_date: string;
  is_critical: boolean;
  is_completed: boolean;
}

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !currentStatus })
      .eq('id', id);

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? { ...t, is_completed: !currentStatus } : t));
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        user_id: user.id,
        title: newTaskTitle,
        energy_level: 'medium',
        device_type: 'computer'
      }])
      .select();

    if (!error && data) {
      setTasks([data[0], ...tasks]);
      setNewTaskTitle("");
    }
  };

  const highEnergyTasks = tasks.filter(t => t.energy_level === 'high' && !t.is_completed);
  const mediumEnergyTasks = tasks.filter(t => t.energy_level === 'medium' && !t.is_completed);

  return (
    <div className="space-y-12">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <h2 className="display-lg">Estado de Fluxo</h2>
          <div className="flex gap-2">
            <span className="nav-pill active">TODAS</span>
            <span className="nav-pill">PROJETOS</span>
          </div>
        </div>
        <form onSubmit={addTask} className="flex flex-col md:flex-row gap-4">
          <div className="relative">
            <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={18} />
            <input 
              type="text" 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Adicionar nova tarefa rápida..." 
              className="bg-on-surface/[0.03] rounded-full pl-12 pr-6 py-3 border border-[var(--glass-border)] focus:border-primary/50 outline-none w-full md:w-80 transition-all font-medium"
            />
          </div>
          <div className="flex gap-4 self-end md:self-auto">
            <button type="button" className="p-3 rounded-xl bg-on-surface/[0.03] hover:bg-on-surface/[0.06] transition-colors"><Bell size={20} /></button>
            <button type="button" className="p-3 rounded-xl bg-on-surface/[0.03] hover:bg-on-surface/[0.06] transition-colors"><Settings size={20} /></button>
          </div>
        </form>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 md:gap-10">
        <div className="space-y-8 md:space-y-10">
          {loading ? (
            <div className="py-20 text-center opacity-30 editorial-label animate-pulse">CARREGANDO SUAS TAREFAS...</div>
          ) : tasks.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-[var(--glass-border)] rounded-3xl opacity-30">
              <p className="editorial-label">NENHUMA TAREFA ENCONTRADA</p>
            </div>
          ) : (
            <>
              {highEnergyTasks.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-7 bg-red-500 rounded-full" />
                      <h3 className="text-xl md:text-2xl font-bold">Alta Energia</h3>
                    </div>
                    <span className="editorial-label opacity-50">{highEnergyTasks.length} RESTANTES</span>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {highEnergyTasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1.5 h-7 bg-purple-500 rounded-full" />
                  <h3 className="text-xl md:text-2xl font-bold">Seu Fluxo</h3>
                </div>
                <div className="space-y-3 md:space-y-4">
                  {mediumEnergyTasks.map(task => (
                    <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                  ))}
                  {tasks.filter(t => t.is_completed).length > 0 && (
                    <div className="pt-4 mt-4 border-t border-[var(--glass-border)]">
                       <p className="editorial-label opacity-30 mb-4 ml-2">CONCLUÍDAS</p>
                       <div className="opacity-50 grayscale">
                         {tasks.filter(t => t.is_completed).slice(0, 3).map(task => (
                           <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        <GlassCard className="h-fit lg:sticky lg:top-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <span className="editorial-label text-primary">STATUS DO SISTEMA</span>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg hover:bg-on-surface/5 transition-colors"><Share2 size={15} /></button>
              <button className="p-2 rounded-lg hover:bg-on-surface/5 transition-colors"><MoreVertical size={15} /></button>
            </div>
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold leading-tight mb-5">Sincronização Ativa</h3>
          <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed mb-6 opacity-80">
            Suas tarefas agora estão sendo persistidas no Supabase. Isso garante que você nunca perca seu progresso, mesmo mudando de dispositivo.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-on-surface/[0.03]">
              <span className="editorial-label opacity-50 text-[8px]">TOTAL DE TAREFAS</span>
              <span className="font-bold text-sm">{tasks.length}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-on-surface/[0.03]">
              <span className="editorial-label opacity-50 text-[8px]">CONCLUÍDAS</span>
              <span className="font-bold text-primary text-sm">{tasks.filter(t => t.is_completed).length}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onToggle }: { task: Task, onToggle: (id: string, status: boolean) => void }) => (
  <GlassCard className={`p-4 md:p-5 border-l-4 ${task.is_critical ? 'border-red-500' : 'border-purple-500'} flex items-center justify-between group cursor-pointer hover:bg-on-surface/5 transition-colors`}>
    <div className="flex items-center gap-4 md:gap-5">
      <button onClick={() => onToggle(task.id, task.is_completed)}>
        {task.is_completed ? (
          <CheckCircle2 className="text-primary shrink-0" size={22} />
        ) : (
          <Circle className="text-on-surface-variant group-hover:text-primary transition-colors shrink-0" size={22} />
        )}
      </button>
      <div>
        <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-3 mb-1">
          <h4 className={`text-sm md:text-base font-bold ${task.is_completed ? 'line-through opacity-40' : ''}`}>{task.title}</h4>
          {task.is_critical && (
             <span className="w-fit px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold">! CRÍTICO</span>
          )}
        </div>
        <div className="flex wrap items-center gap-3 text-[9px] md:text-xs text-on-surface-variant">
          <span className="flex items-center gap-1 uppercase tracking-wider opacity-60"><Zap size={11} /> {task.energy_level} energia</span>
          <span className="flex items-center gap-1 uppercase tracking-wider opacity-60"><Calendar size={11} /> {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sem prazo'}</span>
        </div>
      </div>
    </div>
  </GlassCard>
);

export default Tasks;
