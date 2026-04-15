import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface SystemStats {
  tasks: { total: number; completed: number; percentage: number; criticalPending: number; criticalTaskTitle?: string; };
  finance: { balance: number; income: number; expenses: number; savingsRate: number; };
  calendar: { nextEvent: any | null; totalUpcoming: number; };
  isDemo: boolean;
  loading: boolean;
}

export const useSystemStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    tasks: { total: 0, completed: 0, percentage: 0, criticalPending: 0, criticalTaskTitle: "" },
    finance: { balance: 0, income: 0, expenses: 0, savingsRate: 0 },
    calendar: { nextEvent: null, totalUpcoming: 0 },
    isDemo: false,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      setStats(prev => ({ ...prev, loading: true }));

      // 1. TAREFAS
      const { data: tasksData } = await supabase.from('tasks').select('is_completed, is_critical, title');
      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter(t => t.is_completed).length || 0;
      const criticalTask = tasksData?.find(t => t.is_critical && !t.is_completed);
      const tasksPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // 2. FINANÇAS
      const { data: financeData } = await supabase.from('transactions').select('amount, type');
      let income = 0; let expenses = 0;
      financeData?.forEach(tx => { if (tx.type === 'income') income += Number(tx.amount); else expenses += Number(tx.amount); });
      const balance = income - expenses;
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      // 3. CALENDÁRIO
      const { data: eventsData } = await supabase.from('events').select('*').gte('start_time', new Date().toISOString()).order('start_time', { ascending: true });
      const nextEvent = eventsData?.[0] || null;
      const totalUpcoming = eventsData?.length || 0;

      // CHECAR SE ESTÁ VAZIO (NEW USER)
      const isEmpty = totalTasks === 0 && income === 0 && totalUpcoming === 0;

      if (isEmpty) {
        setStats({
          tasks: { total: 5, completed: 3, percentage: 60, criticalPending: 1, criticalTaskTitle: "Explorar o Novo Dashboard" },
          finance: { balance: 5240, income: 8000, expenses: 2760, savingsRate: 65 },
          calendar: { nextEvent: { title: "Mentoria de Performance", start_time: new Date(Date.now() + 86400000).toISOString() }, totalUpcoming: 3 },
          isDemo: true,
          loading: false
        });
      } else {
        setStats({
          tasks: { total: totalTasks, completed: completedTasks, percentage: tasksPercentage, criticalPending: 0, criticalTaskTitle: criticalTask?.title || "" },
          finance: { balance, income, expenses, savingsRate },
          calendar: { nextEvent, totalUpcoming },
          isDemo: false,
          loading: false
        });
      }
    } catch (error) {
      console.error("Erro stats:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };
  useEffect(() => {
    fetchStats();
    
    // Opcional: Escutar mudanças em tempo real (Realtime)
    const channels = [
      supabase.channel('stats-tasks').on('postgres_changes', { event: '*', table: 'tasks' }, fetchStats).subscribe(),
      supabase.channel('stats-finance').on('postgres_changes', { event: '*', table: 'transactions' }, fetchStats).subscribe(),
      supabase.channel('stats-calendar').on('postgres_changes', { event: '*', table: 'events' }, fetchStats).subscribe()
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user]);

  return { ...stats, refresh: fetchStats };
};
