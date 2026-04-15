import { useEffect, useState } from "react";
import { Calendar, Zap, Wallet, CheckCircle2, Settings, ArrowUpRight, Plus, MessageSquare, Target, Rocket, Clock, ShieldCheck, Sparkles } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useSystemStats } from "../hooks/useSystemStats";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, AreaChart, Area } from "recharts";

interface Activity {
  id: string;
  title: string;
  time: string;
  category: 'Finanças' | 'Tarefas' | 'Calendário';
  icon: any;
  color: string;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const stats = useSystemStats();
  const [activities, setActivities] = useState<Activity[]>([]);
  
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Explorador";
  const avatarUrl = profile?.avatar_url || `https://picsum.photos/seed/${user?.id}/200/200`;

  useEffect(() => {
    if (user) {
      if (stats.isDemo) {
        setActivities([
          { id: '1', title: 'Exemplo: Recebeu Salário Mensal', time: '09:00', category: 'Finanças', icon: Wallet, color: 'text-secondary' },
          { id: '2', title: 'Exemplo: Concluiu "Configurar Santuário"', time: '10:30', category: 'Tarefas', icon: CheckCircle2, color: 'text-primary' },
          { id: '3', title: 'Exemplo: Café com a Equipe', time: '11:15', category: 'Calendário', icon: Calendar, color: 'text-purple-400' },
        ]);
      } else {
        fetchRecentActivity();
      }
    }
  }, [user, stats.isDemo]);

  const fetchRecentActivity = async () => {
    const { data: tasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(3);
    const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(3);
    const combined: Activity[] = [];
    tasks?.forEach(t => combined.push({ id: t.id, title: t.is_completed ? `Concluiu: ${t.title}` : `Novo: ${t.title}`, time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), category: 'Tarefas', icon: CheckCircle2, color: 'text-primary' }));
    txs?.forEach(tx => combined.push({ id: tx.id, title: `${tx.type === 'income' ? 'Recebeu' : 'Gastou'}: ${tx.name}`, time: new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), category: 'Finanças', icon: Wallet, color: tx.type === 'income' ? 'text-secondary' : 'text-red-400' }));
    setActivities(combined.sort((a,b) => b.time.localeCompare(a.time)).slice(0, 5));
  };

  const chartDataSource = stats.isDemo ? [
    { name: 'Seg', v: 40, f: 30 }, { name: 'Ter', v: 70, f: 50 }, { name: 'Qua', v: 50, f: 45 }, { name: 'Qui', v: 90, f: 80 }, { name: 'Sex', v: 65, f: 60 }, { name: 'Sab', v: 30, f: 20 }, { name: 'Dom', v: 10, f: 5 }
  ] : [
    { name: 'Seg', v: 0, f: 0 }, { name: 'Ter', v: 0, f: 0 }, { name: 'Qua', v: 0, f: 0 }, { name: 'Qui', v: 0, f: 0 }, { name: 'Sex', v: 0, f: 0 }, { name: 'Sab', v: 30, f: 0 }, { name: 'Dom', v: stats.tasks.completed * 10, f: stats.finance.income / 100 }
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-20 pt-4 relative">
      {/* Banner de Boas-vindas / Demo Mode */}
      {stats.isDemo && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-md z-50 flex items-center gap-2 shadow-2xl">
           <Sparkles size={14} className="text-primary animate-pulse" />
           <span className="text-[10px] font-bold tracking-[0.2em] text-primary">MODO DE DEMONSTRAÇÃO ATIVO</span>
        </div>
      )}

      {/* Header Premium */}
      <header className="flex items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 opacity-60">
            <div className={`w-1.5 h-1.5 rounded-full ${stats.isDemo ? 'bg-primary animate-ping' : 'bg-secondary animate-pulse'}`} />
            <p className="editorial-label !tracking-[0.2em]">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}</p>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
            Olá, <span className="text-on-surface/30">{firstName}.</span>
          </h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden md:block text-right">
             <p className="text-[10px] editorial-label opacity-40">RESUMO DO FLUXO</p>
             <p className="text-sm font-bold text-secondary uppercase tracking-tighter">{stats.isDemo ? "Visualização Inicial" : "Dados em Tempo Real"}</p>
           </div>
           <Link to="/settings" className="w-14 h-14 md:w-16 md:h-16 rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] shadow-2xl hover:scale-105 transition-all rotate-2 hover:rotate-0">
             <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
           </Link>
        </div>
      </header>

      {/* Grid de KPIs - 4 Colunas High-Impact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={40} /></div>
          <p className="editorial-label text-[10px] opacity-50 mb-4 text-primary font-bold">PRODUTIVIDADE</p>
          <div className="flex items-end gap-3">
            <h3 className="text-3xl font-bold font-mono">{Math.round(stats.tasks.percentage)}%</h3>
            <span className="text-[10px] font-bold text-secondary mb-1">+{stats.tasks.completed} ATIVOS</span>
          </div>
          <div className="mt-4 h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats.tasks.percentage}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={40} /></div>
          <p className="editorial-label text-[10px] opacity-50 mb-4 text-secondary font-bold">ECONOMIA</p>
          <div className="flex items-end gap-3">
            <h3 className="text-2xl md:text-3xl font-bold font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.finance.balance)}</h3>
          </div>
          <p className="text-[9px] font-medium opacity-40 mt-3 uppercase tracking-wider">SALDO CONSOLIDADO</p>
        </GlassCard>

        <GlassCard className="p-6 relative overflow-hidden group col-span-2 md:col-span-1 border-primary/20">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={40} /></div>
          <p className="editorial-label text-[10px] opacity-50 mb-4 text-purple-400 font-bold">PRÓXIMO COMPROMISSO</p>
          <h4 className="text-sm font-bold truncate mb-1">{stats.calendar.nextEvent?.title || "Horizonte Livre"}</h4>
          <p className="text-[10px] opacity-50 font-medium font-mono">
             {stats.calendar.nextEvent 
               ? new Date(stats.calendar.nextEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
               : "Sem eventos em pauta"}
          </p>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 hidden lg:block">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Rocket size={14} />
            <p className="editorial-label text-[10px] opacity-80 uppercase tracking-widest font-bold">BEM-VINDO</p>
          </div>
          <p className="text-xs font-medium leading-relaxed opacity-70 italic">
            {stats.isDemo ? "Este é o Santuário. O seu ecossistema pessoal está pronto." : "Mantenha o ritmo. Cada transação e tarefa cadastrada molda o seu progresso."}
          </p>
        </GlassCard>
      </div>

      {/* Grid Principal - 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8">
        <div className="space-y-8">
          {/* Sapo do Dia / Destaque de Impacto */}
          {stats.tasks.criticalTaskTitle ? (
            <GlassCard orb className="p-8 border-l-4 border-l-secondary overflow-hidden group relative">
              <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                <Zap size={240} className="text-secondary" />
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-secondary">
                    <Zap size={14} fill="currentColor" />
                    <span className="editorial-label text-[10px] tracking-[0.2em] font-bold">SAPO DO DIA: PRIORIDADE</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight max-w-xl line-clamp-2">{stats.tasks.criticalTaskTitle}</h3>
                  <p className="text-sm md:text-base text-on-surface-variant opacity-70 max-w-lg leading-relaxed">
                    {stats.isDemo ? "Este espaço exibirá sua tarefa mais crítica assim que você marcá-la como 'Importante' na lista de tarefas." : "Esta ação gerará o maior impacto hoje. Não se deixe distrair por menos."}
                  </p>
                </div>
                <Link to="/tasks" className="px-8 py-4 rounded-full bg-on-surface text-surface font-bold text-sm hover:translate-y-[-4px] transition-all shadow-xl shadow-on-surface/10 whitespace-nowrap">
                  {stats.isDemo ? "VER EXEMPLO" : "RESOLVER AGORA"}
                </Link>
              </div>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 border-dashed border-2 border-on-surface/10 flex flex-col items-center justify-center text-center gap-4 py-12">
               <div className="w-16 h-16 rounded-full bg-on-surface/5 flex items-center justify-center opacity-20"><ShieldCheck size={32} /></div>
               <div>
                 <p className="editorial-label text-xs opacity-40 mb-1">LIMITES ESTRATÉGICOS LIMPOS</p>
                 <p className="text-sm font-medium opacity-60">Nenhuma tarefa crítica pendente. Você está no controle do seu fluxo.</p>
               </div>
            </GlassCard>
          )}

          {/* Gráfico de Fluxo Semana - Visual Premium */}
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-10">
               <div>
                 <h4 className="text-xl font-bold">Pulso Produtivo</h4>
                 <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">{stats.isDemo ? "Dados ilustrativos da semana" : "Atividade real dos últimos 7 dias"}</p>
               </div>
               <div className="flex gap-6">
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[10px] font-bold opacity-40">TREFAS</span></div>
                 <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-secondary" /><span className="text-[10px] font-bold opacity-40">FINANÇAS</span></div>
               </div>
            </div>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartDataSource}>
                   <defs>
                     <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#5e9eff" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#5e9eff" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorFin" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                       <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 10 }} dy={10} />
                   <Tooltip 
                     cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                     contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', backdropFilter: 'blur(10px)' }}
                   />
                   <Area type="monotone" dataKey="v" stroke="#5e9eff" strokeWidth={3} fillOpacity={1} fill="url(#colorProd)" />
                   <Area type="monotone" dataKey="f" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorFin)" strokeDasharray="5 5" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Coluna Direita - Feed e Ações */}
        <div className="space-y-8">
          {/* Feed de Atividade - Mix de Dados */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold">Linha do Tempo</h4>
              <Link to="/tasks" className="text-[10px] font-bold text-primary hover:underline tracking-widest uppercase">{stats.isDemo ? "EXEMPLO" : "VER TUDO"}</Link>
            </div>
            <div className="space-y-7">
              {activities.length > 0 ? activities.map((act) => (
                <div key={act.id} className="flex gap-4 items-start group cursor-pointer">
                  <div className={`w-9 h-9 rounded-2xl bg-on-surface/[0.03] flex items-center justify-center shrink-0 ${act.color} transition-all group-hover:bg-on-surface/10 group-hover:rotate-12`}>
                    <act.icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{act.title}</p>
                    <p className="text-[10px] opacity-40 uppercase tracking-tighter mt-1">{act.category} • {act.time}</p>
                  </div>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-30 transition-all -translate-x-2 group-hover:translate-x-0" />
                </div>
              )) : (
                <div className="text-center py-12 opacity-20 flex flex-col items-center gap-3">
                   <Target size={24} />
                   <p className="editorial-label text-[10px]">SEM ATIVIDADE RECENTE</p>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Quick Actions - Design Minimalista */}
          <div className="grid grid-cols-2 gap-4">
            <Link to="/tasks" className="group">
              <GlassCard className="p-5 flex flex-col items-center justify-center text-center gap-3 hover:bg-primary/5 transition-all border-dashed border-primary/20 hover:border-solid hover:scale-102">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface transition-all">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                </div>
                <span className="text-[10px] font-bold opacity-60 tracking-wider">NOVA TAREFA</span>
              </GlassCard>
            </Link>
            <Link to="/finance" className="group">
              <GlassCard className="p-5 flex flex-col items-center justify-center text-center gap-3 hover:bg-secondary/5 transition-all border-dashed border-secondary/20 hover:border-solid hover:scale-102">
                <div className="w-10 h-10 rounded-full bg-secondary/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-surface transition-all">
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                </div>
                <span className="text-[10px] font-bold opacity-60 tracking-wider">NOVO GASTO</span>
              </GlassCard>
            </Link>
          </div>

          {/* Deep Work / Focus Status */}
          <Link to="/dashboard" className="block transform hover:translate-y-[-4px] transition-all">
            <GlassCard className="p-7 bg-gradient-to-br from-purple-500/15 to-transparent border-purple-500/30 group relative overflow-hidden">
               <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all" />
               <div className="flex items-center justify-between relative z-10">
                 <div>
                   <div className="flex items-center gap-2 text-purple-400 mb-2">
                     <Clock size={14} />
                     <p className="editorial-label text-[10px] tracking-widest font-bold uppercase">ESTADO DE FOCO</p>
                   </div>
                   <p className="text-sm font-bold">DEEP WORK</p>
                   <p className="text-[9px] opacity-40 mt-1 uppercase">INICIAR SESSÃO AGORA</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:animate-pulse">
                   <Zap size={20} fill="currentColor" />
                 </div>
               </div>
            </GlassCard>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
