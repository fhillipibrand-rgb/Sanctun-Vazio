import { useEffect, useState } from "react";
import { 
  Calendar, Zap, Wallet, CheckCircle2, ArrowUpRight, Plus, Target, Clock, 
  ShieldCheck, Sparkles, Sun, Moon, PanelLeft, Pill, Droplets, AlertTriangle, 
  Play, Pause, Rocket, Briefcase, Code, Layout, Globe, Star, Heart, Cloud, 
  Camera, Music, Book, Trophy, Shield, Coffee, Lightbulb, Bell, Search, FolderKanban,
  ChevronRight
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { useSystemStats } from "../hooks/useSystemStats";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";
import { useLayout } from "../components/layout/Layout";
import { motion, AnimatePresence } from "motion/react";

interface Activity {
  id: string;
  title: string;
  time: string;
  category: 'Finanças' | 'Tarefas' | 'Calendário' | 'Saúde';
  icon: any;
  color: string;
}

interface FocusState {
  id: string;
  name: string;
  color: string;
  isRunning: boolean;
  isBreak: boolean;
  timeLeft?: number;
  targetEndTime?: number;
}

const Dashboard = () => {
  const { user, profile } = useAuth();
  const stats = useSystemStats();
  const { toggleSidebar, theme, toggleTheme, isSidebarOpen, isMobile } = useLayout();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [focusState, setFocusState] = useState<FocusState | null>(null);
  const [localTimeLeft, setLocalTimeLeft] = useState<number | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "Explorador";
  const avatarUrl = profile?.avatar_url || `https://picsum.photos/seed/${user?.id}/200/200`;

  // Ler estado do foco do localStorage e atualizar UI localmente
  useEffect(() => {
    const syncFocus = () => {
      const raw = localStorage.getItem('sanctum_active_focus');
      if (raw) {
        try { 
          const state = JSON.parse(raw);
          setFocusState(state);
          if (state.isRunning && state.targetEndTime) {
             setLocalTimeLeft(Math.max(0, Math.floor((state.targetEndTime - Date.now()) / 1000)));
          } else if (state.timeLeft !== undefined) {
             setLocalTimeLeft(state.timeLeft);
          }
        } catch {}
      }
    };
    syncFocus();
    
    // Atualização granular de 1s para o timer
    const interval = setInterval(syncFocus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFocus = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!focusState) return;
    
    const nextIsRunning = !focusState.isRunning;
    const currentRemaining = localTimeLeft || 0;
    
    // Se o Focus.tsx estiver montado, avisa via evento e ele atualiza o DB.
    if ((window as any).__focusMounted) {
       window.dispatchEvent(new CustomEvent('sanctum:focus-toggle'));
    } else {
       // O Focus está desmontado! Atualizamos direto como 'source of truth'
       const newState = {
           ...focusState,
           isRunning: nextIsRunning,
           timeLeft: currentRemaining,
           targetEndTime: nextIsRunning ? Date.now() + currentRemaining * 1000 : null
       };
       localStorage.setItem('sanctum_active_focus', JSON.stringify(newState));
       setFocusState(newState);
       setLocalTimeLeft(currentRemaining);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (user) {
        fetchRecentActivity();
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

  const chartDataSource = stats.weeklyHistory;

  const iconOptions = [
    { name: 'Bell', icon: Bell }, { name: 'Search', icon: Search }, { name: 'FolderKanban', icon: FolderKanban }
  ];

  // Lógica de Notificações Pró-ativas
  const notifications = [
    ...(stats.tasks.urgentTasks?.map(t => ({ 
      id: `task-${t.id}`, 
      type: 'critical', 
      title: t.title, 
      desc: t.reason === 'overdue' ? 'Tarefa está atrasada' : 'Tarefa marcada como Crítica',
      icon: AlertTriangle,
      color: 'text-red-400'
    })) || []),
    ...(stats.projects.active.filter((p: any) => {
      if (!p.deadline) return false;
      const days = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 7;
    }).map((p: any) => ({
      id: `proj-${p.id}`,
      type: 'deadline',
      title: `Entrega: ${p.name}`,
      desc: 'Prazo vencendo em menos de uma semana',
      icon: Rocket,
      color: 'text-primary'
    }))),
    ...(stats.health.lowStockMeds > 0 ? [{
      id: 'med-alert',
      type: 'health',
      title: 'Reposição de Medicamentos',
      desc: `Existem ${stats.health.lowStockMeds} itens com estoque baixo`,
      icon: Pill,
      color: 'text-orange-400'
    }] : [])
  ];

  return (
    <div className="space-y-8 md:space-y-12 pb-20 pt-4 relative">


      {/* Header Premium */}
      <header className="flex items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {!isMobile && (
              <button
                onClick={toggleSidebar}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-on-surface/5 hover:bg-primary/10 hover:text-primary border border-[var(--glass-border)] transition-all shrink-0"
              >
                <PanelLeft size={16} className={`transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
              </button>
            )}
            <div className="flex items-center gap-2 opacity-60">
              <div className={`w-1.5 h-1.5 rounded-full ${stats.isDemo ? 'bg-primary animate-ping' : 'bg-secondary animate-pulse'}`} />
              <p className="editorial-label !tracking-[0.2em]">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).toUpperCase()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isMobile && (
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-on-surface/5 hover:bg-primary/10 hover:text-primary border border-[var(--glass-border)] transition-all shrink-0"
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Olá, <span className="text-on-surface/30">{firstName}.</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
            <button 
              id="tour-notifications"
              onClick={() => setIsNotificationsOpen(true)}
              className={`relative w-12 h-12 rounded-2xl border flex items-center justify-center transition-all group ${
                notifications.length > 0 
                ? 'bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/20' 
                : 'bg-on-surface/5 border-[var(--glass-border)]'
              }`}
            >
              <Bell size={20} className={`${notifications.length > 0 ? 'animate-none' : 'group-hover:rotate-12 transition-transform'}`} />
              {notifications.length > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-background z-10">
                    {notifications.length}
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
                </>
              )}
            </button>

            <Link id="tour-avatar" to="/settings" className="w-14 h-14 md:w-16 md:h-16 rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] shadow-2xl hover:scale-105 transition-all rotate-2 hover:rotate-0">
               <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </Link>
        </div>
      </header>

      {/* Grid de KPIs - 4 Colunas High-Impact */}
      <div id="tour-dashboard-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* PRÓXIMO COMPROMISSO */}
        <Link to="/calendar" className="block transform hover:scale-[1.02] transition-all">
          <GlassCard className="p-6 relative overflow-hidden group h-full border-primary/20">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock size={40} /></div>
            <p className="editorial-label text-[10px] opacity-50 mb-4 text-purple-400 font-bold">PRÓXIMO COMPROMISSO</p>
            <h4 className="text-sm font-bold truncate mb-1">{stats.calendar.nextEvent?.title || "Horizonte Livre"}</h4>
            <p className="text-[10px] opacity-50 font-medium font-mono">
               {stats.calendar.nextEvent 
                 ? new Date(stats.calendar.nextEvent.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                 : "Sem eventos em pauta"}
            </p>
          </GlassCard>
        </Link>

        {/* PRODUTIVIDADE */}
        <Link to="/tasks" className="block transform hover:scale-[1.02] transition-all">
          <GlassCard className="p-6 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Target size={40} /></div>
            <p className="editorial-label text-[10px] opacity-50 mb-4 text-primary font-bold">PRODUTIVIDADE</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold font-mono">{Math.round(stats.tasks.percentage)}%</h3>
              <span className="text-[10px] font-bold text-secondary mb-1">+{stats.tasks.completed} CONCLUÍDAS</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${stats.tasks.percentage}%` }} />
            </div>
          </GlassCard>
        </Link>

        {/* HIDRATAÇÃO */}
        <Link to="/nutrition" className="block transform hover:scale-[1.02] transition-all">
          <GlassCard className="p-6 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Droplets size={40} /></div>
            <p className="editorial-label text-[10px] opacity-50 mb-4 text-cyan-400 font-bold">HIDRATAÇÃO</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold font-mono">{Math.round(stats.nutrition.waterProgress)}%</h3>
              <span className="text-[10px] font-bold text-cyan-500 mb-1">META DIÁRIA</span>
            </div>
            <div className="mt-4 h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 transition-all duration-1000" style={{ width: `${stats.nutrition.waterProgress}%` }} />
            </div>
          </GlassCard>
        </Link>

        {/* ECONOMIA */}
        <Link to="/finance" className="block transform hover:scale-[1.02] transition-all">
          <GlassCard className="p-6 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet size={40} /></div>
            <p className="editorial-label text-[10px] opacity-50 mb-4 text-secondary font-bold">ECONOMIA</p>
            <div className="flex items-end gap-3">
              <h3 className="text-2xl md:text-3xl font-bold font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.finance.balance)}</h3>
            </div>
            <p className="text-[9px] font-medium opacity-40 mt-3 uppercase tracking-wider">SALDO CONSOLIDADO</p>
          </GlassCard>
        </Link>
      </div>

      {/* Seção de Projetos em Foco */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary rounded-full" />
              <h3 className="editorial-label text-xs tracking-[0.3em] font-bold opacity-40 uppercase">Projetos em Foco</h3>
           </div>
           <Link to="/projects" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
             GERENCIAR <ChevronRight size={12} />
           </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.projects.active.slice(0, 4).map((proj: any, idx: number) => {
            const IconComp = iconOptions.find(i => i.name === proj.icon)?.icon || FolderKanban;
            return (
              <motion.div 
                key={proj.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to="/projects">
                  <GlassCard className="p-5 group hover:border-primary/40 transition-all relative overflow-hidden h-full">
                    <div className="absolute -right-2 -top-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                       <IconComp size={80} style={{ color: proj.color }} />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                       <div className="w-10 h-10 rounded-xl bg-on-surface/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <IconComp size={20} style={{ color: proj.color }} />
                       </div>
                       <div className="min-w-0">
                          <h4 className="text-sm font-bold truncate tracking-tight">{proj.name}</h4>
                          <p className="text-[9px] opacity-40 uppercase font-bold tracking-widest">{proj.taskCount || 0} Atividades</p>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between items-end text-[9px] font-bold">
                          <span className="opacity-30 uppercase">Status</span>
                          <span style={{ color: proj.color }}>{proj.progress}%</span>
                       </div>
                       <div className="h-1 w-full bg-on-surface/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${proj.progress}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            style={{ backgroundColor: proj.color }}
                          />
                       </div>
                    </div>
                  </GlassCard>
                </Link>
              </motion.div>
            );
          })}
          {stats.projects.active.length === 0 && !stats.loading && (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-on-surface/5 rounded-3xl opacity-20">
               <p className="editorial-label text-[10px] tracking-widest uppercase">Nenhum projeto ativo para exibir</p>
            </div>
          )}
        </div>
      </div>

      {/* Alertas Críticos */}
      {stats.health.lowStockMeds > 0 && (
        <Link to="/health">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-400/10 border border-red-400/20 p-4 rounded-3xl flex items-center justify-between group hover:bg-red-400/20 transition-all">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-2xl bg-red-400 text-surface flex items-center justify-center shadow-lg shadow-red-400/20">
                 <Pill size={20} />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest text-red-400">Reposição Urgente</p>
                 <p className="text-[11px] opacity-60">Você tem {stats.health.lowStockMeds} medicamento(s) com estoque baixo.</p>
               </div>
             </div>
             <ArrowUpRight size={20} className="text-red-400 opacity-40 group-hover:opacity-100 transition-all" />
          </motion.div>
        </Link>
      )}

      {/* Grid Principal - 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8">
        <div className="space-y-8">
          {/* Painel de Urgências: Críticas + Atrasadas */}
          {stats.tasks.urgentTasks && stats.tasks.urgentTasks.length > 0 ? (
            <GlassCard className="p-6 border-red-500/20 border overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 pointer-events-none" />
              <div className="flex items-center justify-between mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center">
                    <AlertTriangle size={16} className="text-red-400" />
                  </div>
                  <div>
                    <p className="editorial-label text-[10px] tracking-[0.2em] font-bold text-red-400">ATENÇÃO IMEDIATA</p>
                    <p className="text-[9px] opacity-40 uppercase tracking-wider mt-0.5">{stats.tasks.urgentTasks.length} {stats.tasks.urgentTasks.length === 1 ? 'item urgente' : 'itens urgentes'}</p>
                  </div>
                </div>
                <Link to="/tasks?filter=critical" className="text-[9px] font-bold text-red-400 hover:underline tracking-widest uppercase opacity-70 hover:opacity-100">VER TODAS</Link>
              </div>
              <div className="space-y-3 relative z-10">
                {stats.tasks.urgentTasks.slice(0, 4).map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border ${
                      t.reason === 'critical'
                        ? 'bg-red-500/[0.06] border-red-500/20'
                        : 'bg-orange-500/[0.06] border-orange-500/20'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      t.reason === 'critical' ? 'bg-red-500/20' : 'bg-orange-500/20'
                    }`}>
                      {t.reason === 'critical'
                        ? <Zap size={11} className="text-red-400" fill="currentColor" />
                        : <Clock size={11} className="text-orange-400" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{t.title}</p>
                      {t.due_date && (
                        <p className={`text-[9px] font-bold mt-0.5 ${
                          t.reason === 'overdue' ? 'text-orange-400' : 'opacity-40'
                        }`}>
                          {t.reason === 'overdue' ? '⚠ Prazo: ' : 'Prazo: '}
                          {new Date(t.due_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </div>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      t.reason === 'critical'
                        ? 'text-red-400 border-red-500/30 bg-red-500/10'
                        : 'text-orange-400 border-orange-500/30 bg-orange-500/10'
                    }`}>
                      {t.reason === 'critical' ? 'CRÍTICA' : 'ATRASADA'}
                    </span>
                  </motion.div>
                ))}
              </div>
              <Link to="/tasks" className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-on-surface/5 hover:bg-red-500/10 border border-[var(--glass-border)] hover:border-red-500/20 text-[10px] font-bold tracking-widest transition-all relative z-10">
                <Zap size={12} className="text-red-400" />
                RESOLVER AGORA
              </Link>
            </GlassCard>
          ) : (
            <GlassCard className="p-8 border-dashed border-2 border-on-surface/10 flex flex-col items-center justify-center text-center gap-4 py-12">
               <div className="w-16 h-16 rounded-full bg-on-surface/5 flex items-center justify-center opacity-20"><ShieldCheck size={32} /></div>
               <div>
                 <p className="editorial-label text-xs opacity-40 mb-1">LIMITES ESTRATÉGICOS LIMPOS</p>
                 <p className="text-sm font-medium opacity-60">Nenhuma tarefa crítica ou atrasada. Você está no controle do seu fluxo.</p>
               </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="text-base font-bold">Tarefas & Projetos</h4>
                  </div>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Status Atual</p>
                </div>
                <Link to="/tasks" className="text-[10px] font-bold text-primary hover:underline tracking-widest uppercase">VER TUDO</Link>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataSource}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5e9eff" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#5e9eff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 9 }} dy={10} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                      contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', backdropFilter: 'blur(10px)' }}
                    />
                    <Area type="monotone" dataKey="v" stroke="#5e9eff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTasks)" dot={{ r: 3, fill: '#5e9eff', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    <h4 className="text-base font-bold">Fluxo Financeiro</h4>
                  </div>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest">Fluxo de Saldo</p>
                </div>
                <Link to="/finance" className="text-[10px] font-bold text-purple-400 hover:underline tracking-widest uppercase">VER TUDO</Link>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartDataSource}>
                    <defs>
                      <linearGradient id="colorFinance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 9 }} dy={10} />
                    <Tooltip
                      cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                      contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', backdropFilter: 'blur(10px)' }}
                    />
                    <Area type="monotone" dataKey="f" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFinance)" dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-lg font-bold">Linha do Tempo</h4>
              <Link to="/tasks" className="text-[10px] font-bold text-primary hover:underline tracking-widest uppercase">VER TUDO</Link>
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

          <Link to="/focus" className="block transform hover:translate-y-[-4px] transition-all">
            <GlassCard 
              className="p-7 group relative overflow-hidden h-full border transition-all"
              style={{
                background: focusState ? `linear-gradient(135deg, ${focusState.color}15, transparent)` : 'linear-gradient(135deg, var(--color-primary)/10, transparent)',
                borderColor: focusState ? `${focusState.color}40` : 'var(--glass-border)',
              }}
            >
               <div className="absolute right-0 top-0 w-32 h-32 blur-3xl -mr-16 -mt-16 group-hover:opacity-60 transition-all opacity-30"
                 style={{ backgroundColor: focusState?.color || 'var(--color-primary)' }} />
               <div className="flex items-center justify-between relative z-10">
                 <div>
                   <div className="flex items-center gap-2 mb-2" style={{ color: focusState?.color || 'var(--color-primary)' }}>
                     <Zap size={14} fill="currentColor" />
                     <p className="editorial-label text-[10px] tracking-widest font-bold uppercase">ESTADO DE FOCO</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <p className="text-sm font-bold">
                       {focusState ? focusState.name.toUpperCase() : 'DISPONÍVEL'}
                     </p>
                     {localTimeLeft !== null && focusState && (
                       <span className="font-mono text-lg tracking-wider opacity-90 drop-shadow-lg p-1 bg-surface/30 rounded-md shadow-sm border border-white/5">
                         {formatTime(localTimeLeft)}
                       </span>
                     )}
                   </div>
                   <p className="text-[9px] opacity-40 mt-1 uppercase">
                     {focusState?.isRunning 
                       ? (focusState.isBreak ? 'EM PAUSA — RECUPERANDO' : '⏱ SESSÃO ATIVA')
                       : focusState 
                       ? 'PAUSADO — CLIQUE NO PLAY PARA CONTINUAR'
                       : 'CLIQUE NO CARD PARA INICIAR MODO PROFUNDO'
                     }
                   </p>
                 </div>
                 {focusState ? (
                   <button 
                     onClick={handleToggleFocus}
                     className="w-12 h-12 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline-none"
                     style={{ 
                       backgroundColor: `${focusState.color}30`,
                       color: focusState.color,
                       boxShadow: focusState.isRunning ? `0 0 20px ${focusState.color}20` : 'none'
                     }}
                   >
                     {focusState.isRunning
                       ? <Pause size={20} fill="currentColor" />
                       : <Play size={20} fill="currentColor" className="ml-1" />
                     }
                   </button>
                 ) : (
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                     <Zap size={24} fill="currentColor" />
                   </div>
                 )}
               </div>
               {focusState?.isRunning && (
                 <div className="mt-3 flex items-center gap-1.5 relative z-10">
                   {[...Array(5)].map((_, i) => (
                     <motion.div
                       key={i}
                       className="h-1 rounded-full flex-1"
                       style={{ backgroundColor: focusState.color }}
                       animate={{ opacity: [0.3, 1, 0.3] }}
                       transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
                     />
                   ))}
                 </div>
               )}
            </GlassCard>
          </Link>
        </div>
      </div>

      {/* Drawer de Notificações / Central de Ações */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100]"
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-surface/95 border-l border-[var(--glass-border)] shadow-2xl z-[101] p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/10 rounded-xl text-primary"><Bell size={20} /></div>
                   <div>
                     <h3 className="text-xl font-bold tracking-tight">Central de Ações</h3>
                     <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{notifications.length} ALERTAS ATIVOS</p>
                   </div>
                </div>
                <button onClick={() => setIsNotificationsOpen(false)} className="p-2 hover:bg-on-surface/5 rounded-full transition-colors opacity-50"><Plus className="rotate-45" size={24} /></button>
              </div>

              <div className="space-y-6">
                {notifications.length > 0 ? (
                  notifications.map((n, i) => (
                    <motion.div 
                      key={n.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <GlassCard className="p-5 border-none bg-on-surface/[0.03] hover:bg-on-surface/[0.06] transition-all group">
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-on-surface/5 ${n.color}`}>
                            <n.icon size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{n.title}</h4>
                            <p className="text-xs opacity-50 leading-relaxed">{n.desc}</p>
                            <button className="mt-3 text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1 group/btn">
                              RESOLVER AGORA <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-20 text-center opacity-20 flex flex-col items-center gap-4">
                    <ShieldCheck size={48} />
                    <p className="editorial-label text-xs">SISTEMA EM ESTADO DE HARMONIA</p>
                  </div>
                )}
              </div>

              <div className="mt-12 p-6 rounded-3xl bg-secondary/10 border border-secondary/20 border-dashed">
                 <p className="text-xs font-bold text-secondary mb-2 uppercase tracking-tight">Dica de Produtividade</p>
                 <p className="text-[11px] opacity-70 leading-relaxed italic">
                   "A disciplina de revisar sua central de ações garante que nada escape do seu horizonte estratégico."
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
