import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const getLocalDateString = (d: Date = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export interface DailyData {
  name: string; 
  v: number;    
  f: number;    
  date: string; 
}

export interface SystemStats {
  tasks: { 
    total: number; 
    completed: number; 
    percentage: number; 
    criticalPending: number; 
    criticalTaskTitle?: string;
    urgentTasks: { id: string; title: string; reason: 'critical' | 'overdue'; due_date?: string }[];
  };
  finance: { balance: number; income: number; expenses: number; savingsRate: number; };
  calendar: { nextEvent: any | null; totalUpcoming: number; };
  health: { lowStockMeds: number; };
  nutrition: { waterProgress: number; };
  habits: { 
    total: number; 
    completedToday: number; 
    percentage: number; 
    maxStreak: number; 
    weeklyHistory: { name: string; v: number; date: string }[];
  };
  projects: { active: any[]; total: number; };
  weeklyHistory: DailyData[];
  isDemo: boolean;
  loading: boolean;
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const useSystemStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    tasks: { total: 0, completed: 0, percentage: 0, criticalPending: 0, criticalTaskTitle: "", urgentTasks: [] },
    finance: { balance: 0, income: 0, expenses: 0, savingsRate: 0 },
    calendar: { nextEvent: null, totalUpcoming: 0 },
    health: { lowStockMeds: 0 },
    nutrition: { waterProgress: 0 },
    habits: { total: 0, completedToday: 0, percentage: 0, maxStreak: 0, weeklyHistory: [] },
    projects: { active: [], total: 0 },
    weeklyHistory: [],
    isDemo: false,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      setStats(prev => ({ ...prev, loading: true }));

      // 1. TAREFAS
      const { data: rawTasks } = await supabase.from('tasks').select('*');
      const tasksData = rawTasks || [];
      const totalTasks = tasksData.length;
      const completedTasks = tasksData.filter((t: any) => t.is_completed).length;
      const tasksPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const now = new Date();
      const pendingTasks = tasksData.filter((t: any) => !t.is_completed);

      const urgentTasks: SystemStats['tasks']['urgentTasks'] = [];
      pendingTasks.forEach((t: any) => {
        const isOverdue = t.due_date && new Date(t.due_date) < now;
        if (t.is_critical) urgentTasks.push({ id: t.id, title: t.title, reason: 'critical', due_date: t.due_date });
        else if (isOverdue) urgentTasks.push({ id: t.id, title: t.title, reason: 'overdue', due_date: t.due_date });
      });

      const criticalTask = urgentTasks[0];

      // 2. FINANÇAS
      const { data: rawFinance } = await supabase.from('transactions').select('*');
      const financeData = rawFinance || [];
      let income = 0; let expenses = 0;
      financeData.forEach(tx => { 
        if (tx.type === 'income') income += Number(tx.amount || 0); 
        else expenses += Number(tx.amount || 0); 
      });
      const balance = income - expenses;
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      // 3. CALENDÁRIO
      const { data: rawEvents } = await supabase.from('events').select('*').gte('start_time', new Date().toISOString()).order('start_time', { ascending: true });
      const eventsData = rawEvents || [];
      const nextEvent = eventsData[0] || null;
      const totalUpcoming = eventsData.length;

      // 4. SAÚDE
      const { data: rawMeds } = await supabase.from('health_meds').select('*');
      const medsData = rawMeds || [];
      const lowStockCount = medsData.filter(m => Number(m.stock || 0) <= Number(m.min_stock || 0)).length;

      // 5. NUTRIÇÃO
      const todayStr = getLocalDateString();
      const { data: rawWater } = await supabase.from('nutrition_water').select('*').eq('date', todayStr);
      const waterData = rawWater?.[0] || null;
      const waterProgress = waterData ? (Number(waterData.amount || 0) / Number(waterData.target || 2000)) * 100 : 0;

      // 6. HÁBITOS
      const { data: habitsData } = await supabase.from('habits').select('*');
      const { data: habitsLogs } = await supabase.from('habit_logs').select('*').eq('completed', true);
      const hData = habitsData || [];
      const hLogs = habitsLogs || [];
      
      const totalHabitsToday = hData.filter(h => !h.active_days || h.active_days.includes(new Date().getDay())).length;
      const completedTodayHabits = hLogs.filter(log => log.date === todayStr).length;
      const habitsPercentage = totalHabitsToday > 0 ? (completedTodayHabits / totalHabitsToday) * 100 : 0;
      
      // Histórico Semanal de Hábitos — sempre começa no Domingo da semana atual
      const habitsHistory: { name: string; v: number; date: string }[] = [];
      const todayForHabits = new Date();
      const dayOfWeekHabits = todayForHabits.getDay(); // 0=Dom, 6=Sáb
      const sundayHabits = new Date(todayForHabits);
      sundayHabits.setDate(todayForHabits.getDate() - dayOfWeekHabits);

      for (let i = 0; i <= 6; i++) {
        const d = new Date(sundayHabits);
        d.setDate(sundayHabits.getDate() + i);
        const dStr = getLocalDateString(d);
        const dDay = d.getDay();
        
        const scheduled = hData.filter(h => !h.active_days || h.active_days.includes(dDay));
        if (scheduled.length === 0) {
          habitsHistory.push({ name: DAYS_SHORT[dDay], v: 0, date: dStr });
          continue;
        }

        let doneCount = 0;
        scheduled.forEach(h => {
          const logsOnDay = hLogs.filter(l => l.habit_id === h.id && l.date === dStr).length;
          if (logsOnDay >= (h.target_frequency || 1)) doneCount++;
        });

        habitsHistory.push({
          name: DAYS_SHORT[dDay],
          v: Math.round((doneCount / scheduled.length) * 100),
          date: dStr
        });
      }

      // 7. HISTÓRICO SEMANAL DINÂMICO (TAREFAS/FINANÇAS) — semana atual Dom→Sáb
      const history: DailyData[] = [];
      const todayForHistory = new Date();
      const dayOfWeekHistory = todayForHistory.getDay();
      const sundayHistory = new Date(todayForHistory);
      sundayHistory.setDate(todayForHistory.getDate() - dayOfWeekHistory);

      for (let i = 0; i <= 6; i++) {
        const d = new Date(sundayHistory);
        d.setDate(sundayHistory.getDate() + i);
        const dStr = getLocalDateString(d);
        
        const tasksOnDay = tasksData.filter((t: any) => 
          t.is_completed && t.completed_at && typeof t.completed_at === 'string' && t.completed_at.startsWith(dStr)
        ).length;
        
        // Saldo líquido do dia: entradas - saídas
        const incomeOnDay = financeData.filter((tx: any) => 
          tx.type === 'income' && tx.created_at && typeof tx.created_at === 'string' && tx.created_at.startsWith(dStr)
        ).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
        
        const expenseOnDay = financeData.filter((tx: any) => 
          tx.type === 'expense' && tx.created_at && typeof tx.created_at === 'string' && tx.created_at.startsWith(dStr)
        ).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

        history.push({
          name: DAYS_SHORT[d.getDay()],
          v: tasksOnDay,
          f: Math.max(0, Math.min((incomeOnDay - expenseOnDay + expenseOnDay) / 50, 100)),
          date: dStr
        });
      }

      // 8. PROJETOS
      let projectsData: any[] = [];
      const { data: rawProjects, error: projError } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (!projError && rawProjects) {
        projectsData = rawProjects.map(p => {
          const pTasks = tasksData.filter((t: any) => t.project_id === p.id);
          const pCompleted = pTasks.filter((t: any) => t.is_completed).length;
          return { ...p, progress: pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0, taskCount: pTasks.length };
        });
      }

      setStats({
        tasks: { total: totalTasks, completed: completedTasks, percentage: tasksPercentage, criticalPending: urgentTasks.length, criticalTaskTitle: criticalTask?.title || "", urgentTasks },
        finance: { balance, income, expenses, savingsRate },
        calendar: { nextEvent, totalUpcoming },
        health: { lowStockMeds: lowStockCount },
        nutrition: { waterProgress },
        habits: { 
          total: hData.length, 
          completedToday: completedTodayHabits, 
          percentage: habitsPercentage, 
          maxStreak: stats.habits.maxStreak, // Manter o calculado localmente se disponível
          weeklyHistory: habitsHistory
        },
        projects: { active: projectsData, total: projectsData.length },
        weeklyHistory: history,
        isDemo: false,
        loading: false
      });
    } catch (error: any) {
      console.error("Erro crítico no hook de stats:", error);
      
      setStats(prev => ({ 
        ...prev, 
        tasks: { 
          total: 10, completed: 5, percentage: 50, criticalPending: 1, 
          urgentTasks: [{ id: 'task-test', title: 'Tarefa de Teste', reason: 'critical' }]
        },
        habits: { total: 5, completedToday: 2, percentage: 40, maxStreak: 12 },
        isDemo: true,
        loading: false 
      }));
    }
  };

  useEffect(() => {
    fetchStats();
    
    const channels = [
      supabase.channel('stats-tasks').on('postgres_changes' as any, { event: '*', table: 'tasks' }, fetchStats).subscribe(),
      supabase.channel('stats-finance').on('postgres_changes' as any, { event: '*', table: 'transactions' }, fetchStats).subscribe(),
      supabase.channel('stats-calendar').on('postgres_changes' as any, { event: '*', table: 'events' }, fetchStats).subscribe(),
      supabase.channel('stats-health').on('postgres_changes' as any, { event: '*', table: 'health_meds' }, fetchStats).subscribe(),
      supabase.channel('stats-nutrition').on('postgres_changes' as any, { event: '*', table: 'nutrition_water' }, fetchStats).subscribe(),
      supabase.channel('stats-projects').on('postgres_changes' as any, { event: '*', table: 'projects' }, fetchStats).subscribe(),
      supabase.channel('stats-habits').on('postgres_changes' as any, { event: '*', table: 'habits' }, fetchStats).subscribe(),
      supabase.channel('stats-habit-logs').on('postgres_changes' as any, { event: '*', table: 'habit_logs' }, fetchStats).subscribe()
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user]);

  return { ...stats, refresh: fetchStats };
};
