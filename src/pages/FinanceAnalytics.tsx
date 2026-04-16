import React from "react";
import { PieChart as PieIcon, TrendingUp, TrendingDown, BarChart3, Calendar, Filter, Sparkles, PieChart } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart as RePieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from "recharts";
import GlassCard from "../components/ui/GlassCard";
import { MOCK_FINANCE } from "../lib/mockData";

const FinanceAnalytics = () => {
  // Dados de categorias processados do mock
  const transactions = MOCK_FINANCE;
  const categories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

  const pieData = Object.keys(categories).map((cat, i) => ({
    name: cat,
    value: categories[cat],
    color: ['#5e9eff', '#00f5a0', '#a855f7', '#ff6b6b'][i % 4]
  }));

  const historyData = [
    { month: 'Jan', income: 4500, expense: 3200 },
    { month: 'Fev', income: 5200, expense: 3800 },
    { month: 'Mar', income: 4800, expense: 3100 },
    { month: 'Abr', income: 5500, expense: 2900 },
  ];

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <BarChart3 size={12} className="text-primary" />
            <p className="editorial-label !tracking-[0.2em]">INTELIGÊNCIA FINANCEIRA</p>
          </div>
          <h2 className="display-lg">Análises</h2>
          <p className="text-sm opacity-50 mt-1">Insights profundos sobre seus hábitos de consumo e saúde econômica.</p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-variant/40 border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface/5 transition-all">
            <Calendar size={14} />
            Últimos 6 Meses
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold">Fluxo Histórico</h4>
              <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Comparativo Mensal</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
                 <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Receitas</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                 <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">Despesas</span>
               </div>
            </div>
          </div>
          <div className="h-64 w-full">
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
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.3, fontSize: 10 }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                />
                <Area type="monotone" dataKey="income" stroke="#00f5a0" strokeWidth={3} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="expense" stroke="#5e9eff" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col">
          <div className="mb-8 text-center sm:text-left">
            <h4 className="text-lg font-bold">Onde Seu Dinheiro Vai</h4>
            <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">Distribuição por Categoria</p>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-10">
            <div className="relative w-48 h-48 md:w-56 md:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <PieIcon size={24} className="opacity-20 mb-1" />
                <span className="editorial-label text-[8px] opacity-40">Gastos</span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-4">
              {pieData.map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: '60%' }} // Simulação de progresso relativo
                      className="h-full rounded-full" 
                      style={{ backgroundColor: item.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Economia p/ Mês", value: "32%", icon: TrendingUp, color: "text-secondary" },
          { label: "Média de Gastos", value: "R$ 2.450", icon: Filter, color: "text-primary" },
          { label: "Saúde Financeira", value: "Excelente", icon: Sparkles, color: "text-purple-400" },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-6 flex items-center gap-5">
            <div className={`w-12 h-12 rounded-2xl bg-on-surface/[0.03] flex items-center justify-center ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="editorial-label text-[9px] opacity-40">{stat.label.toUpperCase()}</p>
              <h5 className="text-xl font-bold tracking-tight">{stat.value}</h5>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default FinanceAnalytics;
