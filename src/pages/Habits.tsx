import React, { useState, useEffect, useMemo } from "react";
import { 
  Target, Sparkles, BookOpen, Dumbbell, Zap, Clock, CheckCircle2, 
  Plus, Flame, CalendarDays, MoreHorizontal, LayoutGrid, Calendar, 
  List, ChevronLeft, ChevronRight, TrendingUp, Activity, Check, Trash2
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip as RechartsTooltip 
} from "recharts";
import GlassCard from "../components/ui/GlassCard";
import HabitModal, { Habit } from "../components/modals/HabitModal";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { isDemoMode } from "../lib/demoMode";

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_HABITS: Habit[] = [
  { id: "meditation", title: "Meditação Diária", icon: "sparkles", color: "text-purple-400", active_days: [0,1,2,3,4,5,6] },
  { id: "reading", title: "Leitura 30 min", icon: "book", color: "text-blue-400", active_days: [0,1,2,3,4,5,6] },
  { id: "workout", title: "Treino Físico", icon: "dumbbell", color: "text-orange-400", active_days: [1,2,3,4,5] },
  { id: "deepwork", title: "Deep Work (2h)", icon: "zap", color: "text-yellow-400", active_days: [1,2,3,4,5] },
  { id: "fasting", title: "Jejum (16h)", icon: "clock", color: "text-cyan-400", active_days: [0,1,2,3,4,5,6] },
];

const getIcon = (iconName: string, className: string) => {
  switch(iconName) {
    case "sparkles": return <Sparkles className={className} />;
    case "book": return <BookOpen className={className} />;
    case "dumbbell": return <Dumbbell className={className} />;
    case "zap": return <Zap className={className} />;
    case "clock": return <Clock className={className} />;
    default: return <Target className={className} />;
  }
};

const getStreakAnimationProps = (streak: number) => {
  if (streak >= 30) {
    return {
      color: 'text-purple-400',
      bg: 'bg-purple-400/10',
      shadow: 'shadow-[0_0_40px_rgba(192,132,252,0.6)]',
      animate: { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] },
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    };
  } else if (streak >= 14) {
    return {
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
      shadow: 'shadow-[0_0_30px_rgba(96,165,250,0.5)]',
      animate: { scale: [1, 1.1, 1] },
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    };
  } else if (streak >= 7) {
    return {
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]',
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
    };
  } else if (streak >= 3) {
    return {
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      shadow: 'shadow-[0_0_10px_rgba(250,204,21,0.3)]',
      animate: {},
      transition: {}
    };
  }
  return {
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    shadow: 'shadow-lg shadow-orange-400/20',
    animate: {},
    transition: {}
  };
};

const Habits = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedToday, setCompletedToday] = useState<string[]>([]);
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // Generating last 7 days
  const last7Days = useMemo(() => Array.from({length: 7}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return getLocalDateString(d);
  }), []);
  
  const currentDayOfWeek = new Date().getDay();
  const [history, setHistory] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user) {
      fetchHabitsData();
    }
  }, [user]);

  const calculateHabitStreak = (habitId: string, habitActiveDays: number[], habitLogs: string[], target: number = 1, manualStreak: number = 0) => {
    if (!habitLogs) return manualStreak;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStr = getLocalDateString(today);
    const isCompletedToday = habitLogs.filter(d => d === todayStr).length >= target;
    
    let checkDate = new Date(today);
    if (!isCompletedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Iterar para trás
    let iterations = 0;
    while (iterations < 1000) {
      iterations++;
      const dateStr = getLocalDateString(checkDate);
      const dayOfWeek = checkDate.getDay();
      const isActiveDay = habitActiveDays.includes(dayOfWeek);
      const dayCompletions = habitLogs.filter(d => d === dateStr).length;
      const isDoneOnDay = dayCompletions >= target;

      if (isActiveDay) {
        if (isDoneOnDay) {
          streak++;
        } else {
          break;
        }
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
      if (checkDate < new Date(2024, 0, 1)) break;
    }

    return streak + manualStreak;
  };

  const fetchHabitsData = async () => {
    setLoading(true);
    const today = getLocalDateString();
    
    if (isDemoMode()) {
      setHabits(INITIAL_HABITS);
      setCompletedToday(["workout", "reading"]);
      setStreaks({ "workout": 12, "reading": 5, "meditation": 0 });
      
      const mockHistory: Record<string, string[]> = {};
      INITIAL_HABITS.forEach(h => {
        mockHistory[h.id] = last7Days.filter(() => Math.random() > 0.4);
      });
      setHistory(mockHistory);
      
      setLoading(false);
      return;
    }

    try {
      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true });
        
      const processedHabits = (habitsData || INITIAL_HABITS).map(h => ({
        ...h,
        active_days: h.active_days || [0,1,2,3,4,5,6]
      }));
      setHabits(processedHabits);

      const { data: logsData, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user?.id);
        
      if (!logsError && logsData) {
        const hist: Record<string, string[]> = {};
        logsData.filter(log => log.completed).forEach(log => {
          if (!hist[log.habit_id]) hist[log.habit_id] = [];
          hist[log.habit_id].push(log.date);
        });
        setHistory(hist);
        
        const newStreaks: Record<string, number> = {};
        processedHabits.forEach(h => {
          newStreaks[h.id] = calculateHabitStreak(
            h.id, 
            h.active_days || [0,1,2,3,4,5,6], 
            hist[h.id] || [], 
            h.target_frequency || 1, 
            h.manual_streak || 0
          );
        });
        setStreaks(newStreaks);

        const todayCompleted = processedHabits
          .filter(h => {
            const count = (hist[h.id] || []).filter(d => d === today).length;
            return count >= (h.target_frequency || 1);
          })
          .map(h => h.id);
        setCompletedToday(todayCompleted);
      }
    } catch (e) {
      console.warn("Erro ao buscar hábitos", e);
    }

    setLoading(false);
  };

  const toggleHabit = async (habitId: string, date: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const target = habit.target_frequency || 1;
    const habitHistory = history[habitId] || [];
    const todayLogs = habitHistory.filter(d => d === date);
    const currentCount = todayLogs.length;

    let newState: boolean;
    let updatedHistory: string[];

    if (target === 1) {
      // Comportamento normal de toggle (liga/desliga)
      newState = currentCount === 0;
      updatedHistory = newState 
        ? [...habitHistory, date]
        : habitHistory.filter((d, i) => !(d === date && i === habitHistory.indexOf(date)));
    } else {
      // Comportamento de incremento
      if (currentCount < target) {
        newState = true;
        updatedHistory = [...habitHistory, date];
      } else {
        // Se já completou tudo e clicou de novo, reseta o dia (para permitir correções)
        newState = false;
        updatedHistory = habitHistory.filter(d => d !== date);
      }
    }

    // Atualização Otimista
    setHistory(prev => {
      const newHist = { ...prev, [habitId]: updatedHistory };
      // Recalcular streak imediatamente
      setStreaks(s => ({
        ...s,
        [habitId]: calculateHabitStreak(
          habitId, 
          habit.active_days || [0,1,2,3,4,5,6], 
          updatedHistory, 
          target, 
          habit.manual_streak || 0
        )
      }));
      return newHist;
    });

    if (date === getLocalDateString()) {
      const isNowDone = updatedHistory.filter(d => d === date).length >= target;
      if (isNowDone) {
        if (!completedToday.includes(habitId)) setCompletedToday(prev => [...prev, habitId]);
      } else {
        setCompletedToday(prev => prev.filter(id => id !== habitId));
      }
    }

    if (isDemoMode()) return;

    try {
      if (newState) {
        // Insere um novo log (incremento)
        await supabase.from('habit_logs').insert({ 
          user_id: user?.id, 
          date: date, 
          habit_id: habitId, 
          completed: true 
        });
      } else {
        // Remove logs do dia (reset)
        await supabase.from('habit_logs').delete().eq('user_id', user?.id).eq('date', date).eq('habit_id', habitId);
      }
    } catch (e) {
      console.warn("Erro ao salvar log no supabase", e);
    }
  };

  const toggleHabitDay = async (habitId: string, dayId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentDays = habit.active_days || [0,1,2,3,4,5,6];
    const newDays = currentDays.includes(dayId)
      ? currentDays.filter(d => d !== dayId)
      : [...currentDays, dayId].sort();

    // Otimista
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, active_days: newDays } : h));
    
    // Recalcular streak com a nova agenda
    setStreaks(s => ({
      ...s,
      [habitId]: calculateHabitStreak(
        habitId, 
        newDays, 
        history[habitId] || [], 
        habit.target_frequency || 1, 
        habit.manual_streak || 0
      )
    }));

    try {
      await supabase
        .from('habits')
        .update({ active_days: newDays })
        .eq('id', habitId)
        .eq('user_id', user?.id);
    } catch (e) {
      console.error("Erro ao atualizar dias do hábito:", e);
    }
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id'> | Habit) => {
    if (isDemoMode()) {
      if ('id' in habitData) {
        setHabits(habits.map(h => h.id === habitData.id ? habitData as Habit : h));
      } else {
        const newHabit = { ...habitData, id: Math.random().toString(36).substring(7) };
        setHabits([...habits, newHabit]);
      }
      return;
    }

    try {
      const payload = { 
        title: habitData.title, 
        icon: habitData.icon, 
        color: habitData.color,
        active_days: habitData.active_days,
        reminder_time: habitData.reminder_time,
        target_frequency: habitData.target_frequency,
        manual_streak: habitData.manual_streak,
        user_id: user?.id 
      };

      if ('id' in habitData && habitData.id) {
        const { error } = await supabase
          .from('habits')
          .update(payload)
          .eq('id', habitData.id)
          .eq('user_id', user?.id);
        
        if (!error) {
          setHabits(habits.map(h => h.id === habitData.id ? { ...h, ...habitData } as Habit : h));
          fetchHabitsData();
        } else {
          console.error("Erro ao atualizar hábito:", error);
          alert(`Erro ao salvar: ${error.message}. Verifique se as colunas 'reminder_time', 'target_frequency' e 'manual_streak' existem na tabela 'habits' no Supabase.`);
        }
      } else {
        const { data, error } = await supabase
          .from('habits')
          .insert(payload)
          .select()
          .single();
        
        if (data && !error) {
          setHabits([...habits, data]);
          fetchHabitsData();
        } else {
          console.error("Erro ao criar hábito:", error);
          alert(`Erro ao criar: ${error?.message}. Verifique se as colunas novas existem no banco de dados.`);
        }
      }
    } catch (e: any) {
      console.error("Erro crítico ao salvar hábito:", e);
      alert(`Erro crítico: ${e.message}`);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (isDemoMode()) {
      setHabits(habits.filter(h => h.id !== id));
      return;
    }

    try {
      const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user?.id);
      if (!error) {
        setHabits(habits.filter(h => h.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddModal = () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (habit: Habit, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHabit(habit);
    setIsModalOpen(true);
  };

  const todayHabits = habits.filter(h => !h.active_days || h.active_days.includes(currentDayOfWeek));
  
  // Helper para formatar dias ativos
  const formatActiveDays = (days?: number[]) => {
    if (!days || days.length === 7) return "Todos os dias";
    const labels = ["D", "S", "T", "Q", "Q", "S", "S"];
    return days.map(d => labels[d]).join(" • ");
  };

  // Cálculo de progresso para a barra global
  const calculateDailyProgress = () => {
    if (todayHabits.length === 0) return 0;
    let totalTarget = 0;
    let totalCurrent = 0;
    
    todayHabits.forEach(h => {
      const target = h.target_frequency || 1;
      const current = (history[h.id] || []).filter(d => d === getLocalDateString()).length;
      totalTarget += target;
      totalCurrent += Math.min(current, target);
    });
    
    return (totalCurrent / totalTarget) * 100;
  };

  const progressValue = calculateDailyProgress();
  
  // Cálculo de dados para o gráfico semanal
  const weeklyChartData = useMemo(() => {
    return last7Days.map(dateStr => {
      const dayOfWeek = new Date(dateStr + 'T00:00:00').getDay();
      const habitsScheduledForDay = habits.filter(h => !h.active_days || h.active_days.includes(dayOfWeek));
      
      if (habitsScheduledForDay.length === 0) return { name: dateStr.split('-')[2], value: 0, fullDate: dateStr };
      
      let completedCount = 0;
      habitsScheduledForDay.forEach(h => {
        const logsOnDay = (history[h.id] || []).filter(d => d === dateStr).length;
        if (logsOnDay >= (h.target_frequency || 1)) {
          completedCount++;
        }
      });
      
      const percentage = (completedCount / habitsScheduledForDay.length) * 100;
      return { 
        name: new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', ''), 
        value: Math.round(percentage),
        fullDate: dateStr
      };
    });
  }, [history, habits]);

  const averagePerformance = Math.round(
    weeklyChartData.reduce((acc, curr) => acc + curr.value, 0) / 7
  );

  const maxStreakValue = Math.max(...Object.values(streaks), 0);
  const flameAnimation = getStreakAnimationProps(maxStreakValue);

  // WEEKLY VIEW HELPERS
  const startOfWeekDate = useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  }, []);

  const weekDateStrings = useMemo(() => Array.from({length: 7}).map((_, i) => {
    const d = new Date(startOfWeekDate);
    d.setDate(d.getDate() + i);
    return getLocalDateString(d);
  }), [startOfWeekDate]);

  const weekDaysShortLabels = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

  // MONTHLY VIEW HELPERS
  const currentMonthDateStrings = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    // Padding start
    for (let i = 0; i < firstDay.getDay(); i++) dates.push(null);
    // Month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(getLocalDateString(new Date(year, month, i)));
    }
    return dates;
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="editorial-label text-[10px] tracking-[0.3em] font-bold opacity-50 uppercase">Sistema de Evolução</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Hábitos</h2>
          <p className="text-sm opacity-40 font-medium max-w-md">Construa disciplina através da repetição e acompanhe sua evolução em tempo real.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-on-surface/5 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5">
            <motion.div 
              animate={flameAnimation.animate} 
              transition={flameAnimation.transition as any}
            >
              <Flame size={20} className="text-orange-400" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-lg font-mono font-bold leading-none">{maxStreakValue}</span>
              <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">OFENSIVA MÁXIMA</span>
            </div>
          </div>

          <div className="flex p-1 bg-on-surface/5 rounded-2xl border border-[var(--glass-border)] w-fit">
            {[
              { id: 'daily', label: 'Diário', icon: List },
              { id: 'weekly', label: 'Semanal', icon: LayoutGrid },
              { id: 'monthly', label: 'Mensal', icon: Calendar },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-surface text-primary shadow-sm' 
                    : 'text-on-surface/40 hover:text-on-surface/60'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Analytics & Performance Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <GlassCard className="lg:col-span-2 p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Consistência Semanal</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Performance nos últimos 7 dias</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono">{averagePerformance}%</p>
                <p className="text-[9px] opacity-40 font-bold uppercase">MÉDIA SEMANAL</p>
              </div>
            </div>

            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 10, fontWeight: 700 }} 
                    dy={15}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-surface/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                            <p className="text-[10px] font-bold opacity-40 uppercase mb-1">{payload[0].payload.fullDate}</p>
                            <p className="text-lg font-bold text-primary">{payload[0].value}% <span className="text-[10px] opacity-60">Concluído</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>
                    {weeklyChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value === 100 ? 'var(--color-primary)' : 'var(--color-primary)'} 
                        fillOpacity={0.1 + (entry.value / 100) * 0.9} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <GlassCard className="p-6 flex flex-col justify-between h-full group hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                  <Activity size={24} />
                </div>
                <div className="text-right">
                  <span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Status de Hoje</span>
                  <p className="text-sm font-bold text-secondary">Ritmo Elevado</p>
                </div>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-1">{Math.round(progressValue)}%</h3>
                <p className="text-xs opacity-50 font-medium">Sua meta diária está quase completa. Mantenha o foco.</p>
              </div>
              <div className="mt-6 h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  className="h-full bg-secondary" 
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-30 editorial-label animate-pulse">SINCRONIZANDO DADOS...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-3 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === 'daily' && (
                <motion.div
                  key="daily"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-2xl mb-1">Hábitos Diários</h3>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-bold tracking-widest text-primary mb-1">{Math.round(progressValue)}% CONCLUÍDO</p>
                        <div className="w-32 h-1.5 bg-on-surface/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressValue}%` }}
                            className="h-full bg-primary" 
                          />
                        </div>
                      </div>
                      <button 
                        onClick={openAddModal}
                        className="p-3 rounded-2xl bg-primary text-surface hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map(habit => {
                      const todayDate = getLocalDateString();
                      const currentDayOfWeek = new Date().getDay();
                      const isActiveToday = !habit.active_days || habit.active_days.includes(currentDayOfWeek);
                      
                      const currentCompletions = (history[habit.id] || []).filter(d => d === todayDate).length;
                      const target = habit.target_frequency || 1;
                      const isDone = currentCompletions >= target;
                      
                      const currentStreakCount = streaks[habit.id] || 0;
                      const animation = getStreakAnimationProps(currentStreakCount);
                      
                      return (
                        <motion.div
                          key={habit.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -5 }}
                          className={!isActiveToday ? 'opacity-60 grayscale-[0.3]' : ''}
                        >
                          <GlassCard 
                            className={`p-6 border-transparent relative overflow-hidden h-full flex flex-col transition-all duration-500 ${
                              isDone ? 'bg-primary/[0.07] border-primary/20' : 'hover:bg-on-surface/[0.03]'
                            }`}
                          >
                            {!isActiveToday && (
                              <div className="absolute top-4 left-4 z-10">
                                <span className="bg-on-surface/10 backdrop-blur-md px-2 py-0.5 rounded-md text-[8px] font-bold opacity-60 border border-white/5 uppercase tracking-tighter">
                                  Fora da Agenda
                                </span>
                              </div>
                            )}

                            {/* Header: Icon & Edit */}
                            <div className="flex items-start justify-between mb-6">
                              <div className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl ${
                                isDone ? 'bg-primary text-surface shadow-primary/20' : `bg-on-surface/5 ${habit.color}`
                              }`}>
                                {getIcon(habit.icon, "w-7 h-7")}
                              </div>
                              <button 
                                onClick={(e) => openEditModal(habit, e)}
                                className="p-2 opacity-20 hover:opacity-100 hover:bg-on-surface/10 rounded-xl transition-all"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </div>

                            {/* Scheduling Info: Interactive Day Toggles */}
                            <div className="space-y-3 mb-6">
                              <div className="flex justify-between items-center bg-on-surface/5 p-2 rounded-xl border border-white/5">
                                {["D", "S", "T", "Q", "Q", "S", "S"].map((label, idx) => {
                                  const isActive = (habit.active_days || []).includes(idx);
                                  return (
                                    <button
                                      key={idx}
                                      onClick={(e) => toggleHabitDay(habit.id, idx, e)}
                                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all ${
                                        isActive 
                                          ? `bg-secondary text-surface shadow-md shadow-secondary/20` 
                                          : 'text-on-surface/20 hover:bg-on-surface/10'
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {habit.reminder_time && (
                                <div className="flex items-center gap-1.5 px-1 opacity-40 text-[9px] font-bold uppercase tracking-widest">
                                  <Clock size={10} className="text-secondary" />
                                  <span>Agenda: {habit.reminder_time}</span>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 mb-6">
                              <h4 className="font-bold text-lg leading-tight mb-2">{habit.title}</h4>
                              <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
                                {isDone ? 'Meta atingida hoje' : 'Acompanhamento diário'}
                              </p>
                            </div>

                            {/* Checklist Toggle (Progressivo) */}
                            <div 
                              onClick={() => toggleHabit(habit.id, todayDate)}
                              className="group/btn relative cursor-pointer"
                            >
                               <div className={`w-full py-4 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-500 ${
                                 isDone 
                                   ? 'bg-primary border-primary shadow-lg shadow-primary/30' 
                                   : currentCompletions > 0 
                                     ? 'bg-primary/20 border-primary/40' 
                                     : 'bg-on-surface/5 border-white/5 hover:bg-on-surface/10'
                               }`}>
                                  {isDone ? (
                                    <CheckCircle2 size={20} className="text-surface" />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full border-2 border-on-surface/20 group-hover/btn:border-primary transition-colors flex items-center justify-center">
                                      {currentCompletions > 0 && <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />}
                                    </div>
                                  )}
                                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isDone ? 'text-surface' : currentCompletions > 0 ? 'text-primary' : 'opacity-40'}`}>
                                    {isDone ? 'FEITO' : target > 1 ? `${currentCompletions}/${target}` : 'MARCAR'}
                                  </span>
                               </div>
                            </div>

                            {/* Brilho de Fundo (Apenas se concluído) */}
                            {isDone && (
                              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
                            )}
                          </GlassCard>
                        </motion.div>
                      );
                    })}
                    {todayHabits.length === 0 && (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-on-surface/10 rounded-[3rem] opacity-20">
                        <Sparkles size={48} className="mx-auto mb-4" />
                        <p className="editorial-label text-xs">Nenhum hábito para hoje. Que tal criar um novo?</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'weekly' && (
                <motion.div
                  key="weekly"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <GlassCard className="p-8 border-primary/20">
                    <h3 className="font-bold text-xl mb-6">Visão Semanal</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left py-4 px-2 opacity-30 text-[9px] uppercase tracking-widest">Hábito</th>
                            {weekDaysShortLabels.map((day, i) => (
                              <th key={i} className="text-center py-4 px-2">
                                <span className={`text-[10px] font-bold tracking-widest ${weekDateStrings[i] === new Date().toISOString().split('T')[0] ? 'text-primary' : 'opacity-40'}`}>
                                  {day}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glass-border)]">
                          {habits.map(habit => (
                            <tr key={habit.id} className="group">
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-lg bg-on-surface/5 ${habit.color}`}>
                                    {getIcon(habit.icon, "w-4 h-4")}
                                  </div>
                                  <span className="text-sm font-bold opacity-80">{habit.title}</span>
                                </div>
                              </td>
                              {weekDateStrings.map((date, i) => {
                                const isActive = !habit.active_days || habit.active_days.includes(i);
                                const isCompleted = (history[habit.id] || []).includes(date);
                                
                                return (
                                  <td key={date} className="py-4 px-2 text-center">
                                    <button
                                      disabled={!isActive}
                                      onClick={() => toggleHabit(habit.id, date)}
                                      className={`w-8 h-8 rounded-xl transition-all flex items-center justify-center mx-auto ${
                                        isCompleted 
                                          ? 'bg-primary text-surface shadow-lg shadow-primary/20' 
                                          : isActive 
                                            ? 'bg-on-surface/5 hover:bg-on-surface/10 border border-[var(--glass-border)]' 
                                            : 'opacity-5 cursor-not-allowed bg-transparent'
                                      }`}
                                    >
                                      {isCompleted && <CheckCircle2 size={14} />}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === 'monthly' && (
                <motion.div
                  key="monthly"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <GlassCard className="p-8 border-primary/20">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-xl">Heatmap Mensal</h3>
                      <div className="flex items-center gap-4 text-[9px] font-bold opacity-40 uppercase tracking-widest">
                        <span>Menos</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-3 rounded-sm bg-on-surface/5" />
                          <div className="w-3 h-3 rounded-sm bg-primary/20" />
                          <div className="w-3 h-3 rounded-sm bg-primary/50" />
                          <div className="w-3 h-3 rounded-sm bg-primary" />
                        </div>
                        <span>Mais</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {weekDaysShortLabels.map(day => (
                        <div key={day} className="text-center text-[9px] font-bold opacity-30 mb-2">{day}</div>
                      ))}
                      {currentMonthDateStrings.map((date, i) => {
                        if (!date) return <div key={`empty-${i}`} className="aspect-square" />;
                        
                        let completions = 0;
                        let totalActiveCount = 0;
                        habits.forEach(h => {
                          const dayOfWeek = new Date(date).getDay();
                          if (!h.active_days || h.active_days.includes(dayOfWeek)) {
                            totalActiveCount++;
                            if ((history[h.id] || []).includes(date)) completions++;
                          }
                        });

                        const ratio = totalActiveCount > 0 ? completions / totalActiveCount : 0;
                        let intensityLevel = "bg-on-surface/5";
                        if (ratio > 0.75) intensityLevel = "bg-primary shadow-[0_0_12px_rgba(var(--primary),0.4)]";
                        else if (ratio > 0.4) intensityLevel = "bg-primary/60";
                        else if (ratio > 0) intensityLevel = "bg-primary/20";

                        const isCurrentDate = date === new Date().toISOString().split('T')[0];

                        return (
                          <div 
                            key={date} 
                            className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-mono transition-all ${intensityLevel} ${isCurrentDate ? 'ring-2 ring-primary ring-offset-4 ring-offset-background' : ''}`}
                            title={`${completions} hábitos em ${date}`}
                          >
                            <span className={ratio > 0.5 ? 'text-surface' : 'opacity-40'}>{new Date(date).getDate()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>

                  <div className="grid grid-cols-2 gap-6">
                    <GlassCard className="p-6 text-center">
                      <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-2">Total no Mês</p>
                      <h4 className="text-3xl font-bold">{Object.values(history).flat().length}</h4>
                    </GlassCard>
                    <GlassCard className="p-6 text-center">
                      <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mb-2">Taxa de Adesão</p>
                      <h4 className="text-3xl font-bold">
                        {Math.round((Object.values(history).flat().length / (Math.max(habits.length, 1) * 30)) * 100) || 0}%
                      </h4>
                    </GlassCard>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <HabitModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        editingHabit={editingHabit}
      />
    </div>
  );
};

export default Habits;
