import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { 
  PieChart as PieIcon, TrendingUp, TrendingDown, 
  BarChart3, Calendar, Filter, Sparkles, 
  ArrowUpRight, ArrowDownLeft, Target, ShieldCheck,
  ChevronRight, BrainCircuit
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, PieChart as RePieChart, Pie, Cell, 
  BarChart, Bar, CartesianGrid 
} from "recharts";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  created_at: string;
}

const FinanceAnalytics = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) setTransactions(data);
    setLoading(false);
  };

  // Processamento de dados por categoria
  const categories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

  const pieData = Object.keys(categories).map((cat, i) => ({
    name: cat,
    value: categories[cat],
    color: ['#5e9eff', '#00f5a0', '#a855f7', '#ff6b6b', '#f5a623', '#3b82f6'][i % 6]
  })).sort((a, b) => b.value - a.value);

  // Processamento de histórico mensal (últimos 4 meses)
  const getMonthlyData = () => {
    const monthly: any = {};
    transactions.forEach(t => {
      const month = new Date(t.created_at).toLocaleString('pt-BR', { month: 'short' }).toUpperCase();
      if (!monthly[month]) monthly[month] = { month, income: 0, expense: 0 };
      if (t.type === 'income') monthly[month].income += Number(t.amount);
      else monthly[month].expense += Number(t.amount);
    });
    return Object.values(monthly).slice(-6);
  };

  const historyData = getMonthlyData();

  // KPIs
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const economyRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const averageSpend = transactions.length > 0 ? totalExpense / 6 : 0; // Média estimada por 6 meses
  const healthScore = economyRate > 30 ? "Excelente" : economyRate > 10 ? "Bom" : "Atenção";

  return (
    <div className="space-y-8 pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <BarChart3 size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">INTELIGÊNCIA FINANCEIRA</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Análise de Fluxo</h2>
          <p className="text-sm opacity-50 mt-1">Insights baseados no seu comportamento real de despesas e receitas.</p>
        </div>

        <div className="flex gap-3">
          <GlassCard className="flex items-center gap-3 px-6 py-2 bg-secondary/10 border-secondary/20 shrink-0">
             <BrainCircuit size={18} className="text-secondary" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">IA Insights Ativa</span>
          </GlassCard>
        </div>
      </header>

      {loading ? (
        <div className="py-40 text-center editorial-label opacity-20 animate-pulse">PROCESSANDO BIG DATA...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xl font-bold tracking-tight">Fluxo de Caixa</h4>
                  <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Comparativo entre Entradas e Saídas</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-secondary" />
                     <span className="text-[10px] font-bold opacity-50 uppercase">Receitas</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-primary" />
                     <span className="text-[10px] font-bold opacity-50 uppercase">Despesas</span>
                   </div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f5a0" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#00f5a0" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5e9eff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#5e9eff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 10 }} dy={10} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#00f5a0" strokeWidth={4} fillOpacity={1} fill="url(#colorInc)" />
                    <Area type="monotone" dataKey="expense" stroke="#5e9eff" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-8 flex flex-col">
              <div className="mb-10">
                <h4 className="text-xl font-bold tracking-tight">Onde Seu Dinheiro Vai</h4>
                <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Maiores centros de despesas por categoria</p>
              </div>
              
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-12">
                <div className="relative w-56 h-56 md:w-64 md:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={pieData.length > 0 ? pieData : [{ name: 'Vazio', value: 1, color: 'rgba(255,255,255,0.05)' }]}
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={6}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <PieIcon size={28} className="opacity-10 mb-1" />
                    <span className="editorial-label text-[10px] opacity-40 font-bold uppercase tracking-widest">Despesas</span>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-5">
                  {pieData.slice(0, 4).map((item, i) => (
                    <div key={i} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                          <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">{item.name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.value)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden p-[1px]">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(item.value / totalExpense) * 100}%` }} 
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full" 
                          style={{ backgroundColor: item.color }} 
                        />
                      </div>
                    </div>
                  ))}
                  {pieData.length === 0 && <p className="text-center opacity-20 editorial-label text-[10px]">Sem despesas registradas</p>}
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-7 flex items-center gap-6 border-l-4 border-secondary">
               <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                 <TrendingUp size={24} />
               </div>
               <div>
                 <p className="editorial-label text-[9px] opacity-40 mb-1">TAXA DE ECONOMIA</p>
                 <h5 className="text-3xl font-bold tracking-tighter">{economyRate.toFixed(1)}%</h5>
               </div>
            </GlassCard>

            <GlassCard className="p-7 flex items-center gap-6 border-l-4 border-primary">
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                 <ShieldCheck size={24} />
               </div>
               <div>
                 <p className="editorial-label text-[9px] opacity-40 mb-1">MÉDIA DE GASTOS</p>
                 <h5 className="text-3xl font-bold tracking-tighter">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(averageSpend)}</h5>
               </div>
            </GlassCard>

            <GlassCard className="p-7 flex items-center gap-6 border-l-4 border-purple-400">
               <div className="w-14 h-14 rounded-2xl bg-purple-400/10 flex items-center justify-center text-purple-400">
                 <Sparkles size={24} />
               </div>
               <div>
                 <p className="editorial-label text-[9px] opacity-40 mb-1">SAÚDE FINANCEIRA</p>
                 <h5 className="text-3xl font-bold tracking-tighter">{healthScore}</h5>
               </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
             <GlassCard className="p-8 group cursor-pointer hover:border-secondary/30 transition-all overflow-hidden relative">
                <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <Target size={200} />
                </div>
                <div className="relative z-10 flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-on-surface/5 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-surface transition-all">
                    <ArrowUpRight size={28} />
                  </div>
                  <div>
                    <h5 className="text-xl font-bold mb-2">Plano de Liberdade</h5>
                    <p className="text-sm opacity-50 leading-relaxed max-w-sm">Mantenha sua taxa de economia acima de 25% para atingir sua meta de reserva de emergência em apenas 8 meses.</p>
                  </div>
                </div>
             </GlassCard>

             <GlassCard className="p-8 group cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative">
                <div className="absolute -right-10 -bottom-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                  <Filter size={200} />
                </div>
                <div className="relative z-10 flex gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-on-surface/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-surface transition-all">
                    <ArrowDownLeft size={28} />
                  </div>
                  <div>
                    <h5 className="text-xl font-bold mb-2">Redução de Custos</h5>
                    <p className="text-sm opacity-50 leading-relaxed max-w-sm">Notamos um aumento de 12% em categorias de Lazer. Considere consolidar assinaturas este mês.</p>
                  </div>
                </div>
             </GlassCard>
          </div>
        </>
      )}
    </div>
  );
};

export default FinanceAnalytics;
