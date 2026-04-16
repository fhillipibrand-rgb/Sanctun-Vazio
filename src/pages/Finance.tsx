import { useEffect, useState } from "react";
import { Calendar, Settings, TrendingUp, Utensils, Wallet, Coffee, Plane, Plus } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell } from "recharts";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { MOCK_FINANCE } from "../lib/mockData";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  created_at: string;
}

const Finance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setTransactions(data);
    } else {
      setTransactions(MOCK_FINANCE as Transaction[]);
    }
    setLoading(false);
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const netWorth = totalIncome - totalExpense;

  // Formatar dados para o gráfico de barras (últimos meses simplificado)
  const chartData = [
    { name: 'JUN', income: totalIncome * 0.8, expense: totalExpense * 0.9 }, // Mock histórico
    { name: 'JUL', income: totalIncome, expense: totalExpense },
  ];

  // Agrupar por categoria para o gráfico de pizza
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
  })).slice(0, 3);

  if (pieData.length === 0) {
    pieData.push({ name: 'Sem gastos', value: 1, color: '#949499' });
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="editorial-label mb-2">VISÃO GERAL FINANCEIRA</p>
          <h2 className="display-lg">Capital Líquido Real</h2>
        </div>
        <div className="flex gap-4 self-end md:self-auto">
          <button className="p-3 rounded-xl bg-on-surface/[0.03] hover:bg-on-surface/[0.06] transition-colors"><Plus size={20} /></button>
          <button className="p-3 rounded-xl bg-on-surface/[0.03] hover:bg-on-surface/[0.06] transition-colors"><Settings size={20} /></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 md:gap-8">
        <GlassCard className="p-6 md:p-8" orb>
          <p className="editorial-label opacity-50 mb-4">Patrimônio Líquido Estimado</p>
          <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-8">
            <h3 className="text-4xl md:text-6xl font-bold tracking-tighter">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netWorth)}
            </h3>
            <div className={`flex items-center gap-1 font-bold ${netWorth >= 0 ? 'text-secondary' : 'text-red-400'}`}>
              <TrendingUp size={20} className={netWorth >= 0 ? '' : 'rotate-180'} />
              <span>{netWorth >= 0 ? '+12.4%' : '-2.1%'}</span>
            </div>
          </div>
          <div className="h-48 md:h-56 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5e9eff" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#5e9eff" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Bar dataKey="income" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center text-center p-6 md:p-7">
          <h4 className="text-xl font-bold mb-6">Distribuição de Despesas</h4>
          <div className="relative w-40 h-40 md:w-56 md:h-56 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="editorial-label opacity-50 text-[8px]">Total Gasto</p>
              <p className="text-xl md:text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalExpense)}
              </p>
            </div>
          </div>
          <div className="w-full space-y-3">
            {pieData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs md:text-sm font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-sm md:text-base">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 md:gap-8">
        <GlassCard className="p-6 md:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h4 className="text-lg md:text-xl font-bold">Fluxo de Caixa Mensal</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-primary rounded-sm" /><span className="editorial-label">Receitas</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-on-surface/20 rounded-sm" /><span className="editorial-label">Despesas</span></div>
            </div>
          </div>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <Bar dataKey="income" fill="#5e9eff" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="expense" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} barSize={25} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#949499', fontSize: 10 }} dy={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-lg md:text-xl font-bold">Últimas Movimentações</h4>
            <button className="text-primary editorial-label">Ver tudo</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="py-10 text-center editorial-label opacity-20">BUSCANDO...</div>
            ) : transactions.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-[var(--glass-border)] rounded-2xl opacity-20 text-[10px]">
                NENHUMA TRANSAÇÃO REGISTRADA
              </div>
            ) : (
              transactions.slice(0, 4).map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-on-surface/[0.03] hover:bg-on-surface/[0.06] transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-on-surface/[0.03] flex items-center justify-center">
                      {tx.type === 'income' ? <TrendingUp size={16} className="text-secondary" /> : <Wallet size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{tx.name}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-wider opacity-60">
                        {tx.category} • {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold text-sm md:text-base ${tx.type === 'income' ? 'text-secondary' : 'text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;
