import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

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
    projects: { active: [], total: 0 },
    weeklyHistory: [],
    isDemo: false,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      setStats(prev => ({ ...prev, loading: true }));

      // 1. TAREFAS - Consulta segura
      const { data: rawTasks } = await supabase.from('tasks').select('*');
      const tasksData = rawTasks || [];
      const totalTasks = tasksData.length;
      const completedTasks = tasksData.filter((t: any) => t.is_completed).length;
      const tasksPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      const now = new Date();
      const pendingTasks = tasksData.filter((t: any) => !t.is_completed);

      // Tarefas urgentes: críticas + atrasadas
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

      // 5. NUTRIÇÃO - Evitando .single() que pode causar erro 406/crash
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: rawWater } = await supabase.from('nutrition_water').select('*').eq('date', todayStr);
      const waterData = rawWater?.[0] || null;
      const waterProgress = waterData ? (Number(waterData.amount || 0) / Number(waterData.target || 2000)) * 100 : 0;

      // 6. HISTÓRICO SEMANAL DINÂMICO - Proteção total contra nulos
      const history: DailyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        const tasksOnDay = tasksData.filter(t => 
          t.is_completed && t.completed_at && typeof t.completed_at === 'string' && t.completed_at.startsWith(dStr)
        ).length;
        
        const financeOnDay = financeData.filter(tx => 
          tx.type === 'expense' && tx.created_at && typeof tx.created_at === 'string' && tx.created_at.startsWith(dStr)
        ).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

        history.push({
          name: DAYS_SHORT[d.getDay()],
          v: tasksOnDay,
          f: Math.min(financeOnDay / 10, 100), 
          date: dStr
        });
      }

      // 7. PROJETOS - Com cálculo de progresso integrado
      const { data: rawProjects } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      const projectsData = (rawProjects || []).map(p => {
        const pTasks = tasksData.filter((t: any) => t.project_id === p.id);
        const pCompleted = pTasks.filter((t: any) => t.is_completed).length;
        const pProgress = pTasks.length > 0 ? Math.round((pCompleted / pTasks.length) * 100) : 0;
        return { ...p, progress: pProgress, taskCount: pTasks.length };
      });
      const totalProjects = projectsData.length;

      setStats({
        tasks: { total: totalTasks, completed: completedTasks, percentage: tasksPercentage, criticalPending: urgentTasks.length, criticalTaskTitle: criticalTask?.title || "", urgentTasks },
        finance: { balance, income, expenses, savingsRate },
        calendar: { nextEvent, totalUpcoming },
        health: { lowStockMeds: lowStockCount },
        nutrition: { waterProgress },
        projects: { active: projectsData, total: totalProjects },
        weeklyHistory: history,
        isDemo: false,
        loading: false
      });
    } catch (error) {
      console.error("Erro crítico no hook de stats:", error);
      // Fallback para evitar tela branca
      setStats(prev => ({ ...prev, loading: false }));
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
      supabase.channel('stats-projects').on('postgres_changes' as any, { event: '*', table: 'projects' }, fetchStats).subscribe()
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user]);

  return { ...stats, refresh: fetchStats };
};
