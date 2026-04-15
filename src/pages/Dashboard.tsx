import { useEffect, useState } from "react";
import { Calendar, Zap, MessageSquare, Wallet, CheckSquare, ArrowUpRight, CheckCircle2, Settings } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";

interface Activity {
  id: string;
  title: string;
  time: string;
  category: string;
  icon: any;
  color: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [criticalTask, setCriticalTask] = useState<any>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Usuário";
  const avatarUrl = profile?.avatar_url || `https://picsum.photos/seed/${user?.id}/200/200`;

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Buscar a tarefa mais crítica (Sapo do Dia)
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('is_completed', false)
      .eq('is_critical', true)
      .order('created_at', { ascending: true })
      .limit(1);
    
    if (tasks && tasks.length > 0) {
      setCriticalTask(tasks[0]);
    } else {
      // Se não houver crítica, pega a mais antiga pendente
      const { data: normalTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_completed', false)
        .order('created_at', { ascending: true })
        .limit(1);
      if (normalTasks) setCriticalTask(normalTasks[0]);
    }

    // 2. Buscar últimas atividades (Mistura de Tarefas e Finanças)
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    const combined: Activity[] = [];
    
    recentTasks?.forEach(t => {
      combined.push({
        id: t.id,
        title: t.is_completed ? `Concluiu "${t.title}"` : `Nova tarefa: "${t.title}"`,
        time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Produtividade',
        icon: CheckCircle2,
        color: 'text-primary'
      });
    });

    recentTransactions?.forEach(tx => {
      combined.push({
        id: tx.id,
        title: `${tx.type === 'income' ? 'Recebeu' : 'Gastou'}: ${tx.name}`,
        time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'Finanças',
        icon: Wallet,
        color: tx.type === 'income' ? 'text-secondary' : 'text-red-400'
      });
    });

    setActivities(combined.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 4));
    setLoading(false);
  };

  const completeSapo = async () => {
    if (!criticalTask) return;
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: true })
      .eq('id', criticalTask.id);
    
    if (!error) {
      setCriticalTask(null);
      fetchDashboardData();
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 pt-16 md:pt-0">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 opacity-60">
            <Calendar size={12} className="text-primary" />
            <p className="editorial-label !tracking-[0.2em]">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}</p>
          </div>
          <h2 className="text-3xl md:text-7xl font-bold tracking-tight leading-[1.1] text-on-surface">
            Bem-vindo,<br className="md:hidden" /> {firstName}.
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Link 
            to="/settings"
            className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border border-[var(--glass-border)] bg-on-surface/[0.03] flex items-center justify-center hover:bg-on-surface/[0.06] transition-colors shadow-lg group"
          >
            <Settings className="text-on-surface-variant group-hover:rotate-90 transition-transform duration-500" size={24} />
          </Link>
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl border border-[var(--glass-border)] overflow-hidden shrink-0 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </div>
      </header>

      {criticalTask ? (
        <GlassCard className="p-5 md:p-8 border border-[var(--glass-border)] relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 md:space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-secondary">
                <Zap size={14} fill="currentColor" />
                <span className="editorial-label text-secondary text-[8px] md:text-[10px]">SAPO DO DIA</span>
              </div>
              <h3 className="text-xl md:text-3xl font-bold leading-tight">{criticalTask.title}</h3>
              <p className="text-on-surface-variant text-sm md:text-base leading-relaxed opacity-80">
                Esta é a sua tarefa prioritária agora. Foque nela para manter seu momentum.
              </p>
            </div>
            <button 
              onClick={completeSapo}
              className="w-full lg:w-auto px-6 py-3 md:px-7 md:py-3.5 rounded-full bg-on-surface text-surface font-bold text-sm md:text-base hover:scale-105 active:scale-95 transition-all shadow-xl shadow-on-surface/5"
            >
              Concluir Tarefa
            </button>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-5 md:p-8 border border-[var(--glass-border)] border-dashed opacity-40">
           <p className="text-center editorial-label">NENHUM "SAPO" NO MOMENTO. APROVEITE O FLUXO.</p>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {[
          { to: "/tasks", icon: MessageSquare, label: "Capturar Nota", desc: "Descarte instantâneo de pensamentos.", color: "text-primary" },
          { to: "/finance", icon: Wallet, label: "Adicionar Gasto", desc: "Registre transações rapidamente.", color: "text-secondary" },
          { to: "/tasks", icon: CheckSquare, label: "Nova Tarefa", desc: "Agende um novo item de ação.", color: "text-purple-400" },
        ].map((item, i) => (
          <Link key={i} to={item.to}>
            <GlassCard className="hover:bg-on-surface/5 transition-colors cursor-pointer group h-full p-4 md:p-5 border border-[var(--glass-border)]">
              <div className="flex items-center gap-3 mb-2 md:mb-3">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-on-surface/5 flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={16} className="md:size-5" />
                </div>
                <h4 className="text-sm md:text-base font-bold leading-tight">{item.label}</h4>
              </div>
              <p className="text-[10px] md:text-xs text-on-surface-variant leading-relaxed opacity-70">{item.desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 md:gap-10">
        <div className="space-y-6 md:space-y-7">
          <div className="flex items-center justify-between">
            <h4 className="text-xl md:text-2xl font-bold">Próximos Compromissos</h4>
            <Link to="/calendar" className="text-primary editorial-label flex items-center gap-2 hover:underline">
              Ver Calendário <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="py-10 text-center border border-dashed border-[var(--glass-border)] rounded-3xl opacity-20">
             <p className="editorial-label text-xs">SINCRONIZAÇÃO DE CALENDÁRIO PENDENTE</p>
          </div>
        </div>

        <div className="space-y-6 md:space-y-7">
          <h4 className="text-xl md:text-2xl font-bold">Feed de Atividade</h4>
          <div className="space-y-4 md:space-y-5">
            {loading ? (
              <div className="py-10 text-center editorial-label opacity-20 animate-pulse">ATUALIZANDO...</div>
            ) : activities.length === 0 ? (
              <div className="py-10 text-center opacity-20 editorial-label text-[10px]">SEM ATIVIDADE RECENTE</div>
            ) : (
              activities.map((item) => (
                <div key={item.id} className="flex gap-3 md:gap-4 items-center">
                  <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full bg-on-surface/[0.03] flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-medium leading-tight">{item.title}</p>
                    <p className="text-[8px] md:text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-wider opacity-60">
                      HOJE {item.time} • {item.category}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
