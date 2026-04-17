import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface DailyData {
  name: string; // Ex: 'Seg', 'Ter'
  v: number;    // Valor Tarefas
  f: number;    // Valor Finanças
  date: string; // ISO Date para ordenação
}

export interface SystemStats {
  tasks: { total: number; completed: number; percentage: number; criticalPending: number; criticalTaskTitle?: string; };
  finance: { balance: number; income: number; expenses: number; savingsRate: number; };
  calendar: { nextEvent: any | null; totalUpcoming: number; };
  health: { lowStockMeds: number; };
  nutrition: { waterProgress: number; };
  weeklyHistory: DailyData[];
  isDemo: boolean;
  loading: boolean;
}

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const useSystemStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SystemStats>({
    tasks: { total: 0, completed: 0, percentage: 0, criticalPending: 0, criticalTaskTitle: "" },
    finance: { balance: 0, income: 0, expenses: 0, savingsRate: 0 },
    calendar: { nextEvent: null, totalUpcoming: 0 },
    health: { lowStockMeds: 0 },
    nutrition: { waterProgress: 0 },
    weeklyHistory: [],
    isDemo: false,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      setStats(prev => ({ ...prev, loading: true }));

      const last7Days = new Date();
      last7Days.setDate(last7Days.getDate() - 7);
      const last7DaysStr = last7Days.toISOString();

      // 1. TAREFAS
      const { data: tasksData } = await supabase.from('tasks').select('is_completed, is_critical, title, completed_at, created_at');
      const totalTasks = tasksData?.length || 0;
      const completedTasks = tasksData?.filter((t: any) => t.is_completed).length || 0;
      const criticalTask = tasksData?.find((t: any) => t.is_critical && !t.is_completed);
      const tasksPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      // 2. FINANÇAS
      const { data: financeData } = await supabase.from('transactions').select('amount, type, created_at');
      let income = 0; let expenses = 0;
      financeData?.forEach(tx => { 
        if (tx.type === 'income') income += Number(tx.amount); 
        else expenses += Number(tx.amount); 
      });
      const balance = income - expenses;
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

      // 3. CALENDÁRIO
      const { data: eventsData } = await supabase.from('events').select('*').gte('start_time', new Date().toISOString()).order('start_time', { ascending: true });
      const nextEvent = eventsData?.[0] || null;
      const totalUpcoming = eventsData?.length || 0;

      // 4. SAÚDE
      const { data: medsData } = await supabase.from('health_meds').select('stock, min_stock');
      const lowStockCount = medsData?.filter(m => m.stock <= m.min_stock).length || 0;

      // 5. NUTRIÇÃO
      const todayStr = new Date().toISOString().split('T')[0];
      const { data: waterData } = await supabase.from('nutrition_water').select('amount, target').eq('date', todayStr).single();
      const waterProgress = waterData ? (waterData.amount / waterData.target) * 100 : 0;

      // 6. HISTÓRICO SEMANAL DINÂMICO
      const history: DailyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        
        // Tarefas concluídas neste dia
        const tasksOnDay = tasksData?.filter(t => t.is_completed && t.completed_at && t.completed_at.startsWith(dStr)).length || 0;
        
        // Volume financeiro (gastos) neste dia
        const financeOnDay = financeData?.filter(tx => tx.type === 'expense' && tx.created_at.startsWith(dStr)).reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

        history.push({
          name: DAYS_SHORT[d.getDay()],
          v: tasksOnDay,
          f: Math.min(financeOnDay / 10, 100), // Normalizado para o gráfico
          date: dStr
        });
      }

      // CHECAR MODO LIVE VS EMPTY
      const isLiveMode = localStorage.getItem("sanctuary_live_mode") === "true";
      const isEmpty = totalTasks === 0 && income === 0 && totalUpcoming === 0 && (medsData?.length || 0) === 0;
      const showDemo = !isLiveMode && isEmpty;

      if (showDemo) {
        setStats({
          tasks: { total: 5, completed: 3, percentage: 60, criticalPending: 1, criticalTaskTitle: "Explorar o Novo Dashboard" },
          finance: { balance: 5240, income: 8000, expenses: 2760, savingsRate: 65 },
          calendar: { nextEvent: { title: "Mentoria de Performance", start_time: new Date(Date.now() + 86400000).toISOString() }, totalUpcoming: 3 },
          health: { lowStockMeds: 1 },
          nutrition: { waterProgress: 45 },
          weeklyHistory: [
            { name: 'Seg', v: 40, f: 30, date: '1' }, { name: 'Ter', v: 70, f: 50, date: '2' }, { name: 'Qua', v: 50, f: 45, date: '3' }, 
            { name: 'Qui', v: 90, f: 80, date: '4' }, { name: 'Sex', v: 65, f: 60, date: '5' }, { name: 'Sab', v: 30, f: 20, date: '6' }, { name: 'Dom', v: 10, f: 5, date: '7' }
          ],
          isDemo: true,
          loading: false
        });
      } else {
        setStats({
          tasks: { total: totalTasks, completed: completedTasks, percentage: tasksPercentage, criticalPending: 0, criticalTaskTitle: criticalTask?.title || "" },
          finance: { balance, income, expenses, savingsRate },
          calendar: { nextEvent, totalUpcoming },
          health: { lowStockMeds: lowStockCount },
          nutrition: { waterProgress },
          weeklyHistory: history,
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
    
    const channels = [
      supabase.channel('stats-tasks').on('postgres_changes' as any, { event: '*', table: 'tasks' }, fetchStats).subscribe(),
      supabase.channel('stats-finance').on('postgres_changes' as any, { event: '*', table: 'transactions' }, fetchStats).subscribe(),
      supabase.channel('stats-calendar').on('postgres_changes' as any, { event: '*', table: 'events' }, fetchStats).subscribe(),
      supabase.channel('stats-health').on('postgres_changes' as any, { event: '*', table: 'health_meds' }, fetchStats).subscribe(),
      supabase.channel('stats-nutrition').on('postgres_changes' as any, { event: '*', table: 'nutrition_water' }, fetchStats).subscribe()
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user]);

  return { ...stats, refresh: fetchStats };
};
