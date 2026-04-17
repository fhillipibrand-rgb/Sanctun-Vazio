import { useEffect, useState } from "react";
import { 
  Calendar, Settings, TrendingUp, TrendingDown, Wallet, Coffee, 
  Plane, Plus, Target, ShoppingBag, Home, Zap, Heart, Car, 
  ArrowUpRight, ArrowDownRight, Tag, Briefcase, Minus
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell, Tooltip } from "recharts";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { motion, AnimatePresence } from "motion/react";

interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  created_at: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Alimentação': Coffee,
  'Transporte': Car,
  'Viagem': Plane,
  'Moradia': Home,
  'Lazer': Sparkles,
  'Utilidades': Zap,
  'Saúde': Heart,
  'Compras': ShoppingBag,
  'Salário': Wallet,
  'Investimento': TrendingUp,
  'Outros': Tag
};

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

    if (!error && data) {
      setTransactions(data);
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

  // Formatar dados para o gráfico de barras
  const chartData = [
    { name: 'PROJEÇÃO', income: totalIncome * 0.9, expense: totalExpense * 0.8 },
    { name: 'ATUAL', income: totalIncome, expense: totalExpense },
  ];

  const categories = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: any, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

  const pieData = Object.keys(categories).map((cat, i) => ({
    name: cat,
    value: categories[cat],
    color: ['#5e9eff', '#a855f7', '#00f5a0', '#ff6b6b'][i % 4]
  })).sort((a, b) => b.value - a.value).slice(0, 4);

  if (pieData.length === 0) {
    pieData.push({ name: 'Sem gastos', value: 1, color: 'rgba(255,255,255,0.05)' });
  }

  const getIcon = (category: string) => CATEGORY_ICONS[category] || Tag;

  return (
    <div className="space-y-8 md:space-y-12 pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 opacity-50">
            <Wallet size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">PATRIMÔNIO & FLUXO</p>
          </div>
          <h2 className="display-lg">Visão de Capital</h2>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-full bg-secondary text-surface font-bold text-sm shadow-xl shadow-secondary/20 hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={18} />
            ADICIONAR
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        <div className="space-y-8">
          <GlassCard className="p-10 relative overflow-hidden" orb>
            <div className="relative z-10">
              <p className="editorial-label opacity-40 mb-2">SALDO CONSOLIDADO</p>
              <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-10">
                <h3 className="text-5xl md:text-7xl font-bold tracking-tighter">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(netWorth)}
                </h3>
                <div className={`flex items-center gap-1.5 font-bold px-3 py-1 rounded-full text-xs ${netWorth >= 0 ? 'bg-secondary/10 text-secondary' : 'bg-red-400/10 text-red-400'}`}>
                  {netWorth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  <span>{netWorth >= 0 ? '+R$ 1.250 este mês' : 'Fluxo negativo'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 border-t border-[var(--glass-border)] pt-8">
                <div className="space-y-1">
                   <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] flex items-center gap-2">
                     <ArrowUpRight size={12} className="text-secondary" /> RECEITAS
                   </p>
                   <p className="text-2xl font-bold text-secondary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalIncome)}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] flex items-center gap-2">
                     <ArrowDownRight size={12} className="text-red-400" /> DESPESAS
                   </p>
                   <p className="text-2xl font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalExpense)}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h4 className="editorial-label text-xs tracking-widest font-bold opacity-40">ÚLTIMAS TRANSAÇÕES</h4>
               <button className="text-[10px] font-bold text-primary tracking-widest uppercase hover:underline">VER TODO O EXTRATO</button>
            </div>
            
            <div className="space-y-3">
              <AnimatePresence>
                {transactions.slice(0, 5).map((tx, idx) => {
                  const Icon = getIcon(tx.category);
                  return (
                    <motion.div 
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <GlassCard className="p-4 flex items-center justify-between hover:bg-on-surface/5 transition-all group border border-transparent hover:border-[var(--glass-border)]">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12 ${tx.type === 'income' ? 'bg-secondary/10 text-secondary' : 'bg-on-surface/5 text-on-surface/60'}`}>
                              <Icon size={20} />
                           </div>
                           <div>
                              <p className="text-sm font-bold tracking-tight">{tx.name}</p>
                              <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">{tx.category}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className={`font-mono font-bold ${tx.type === 'income' ? 'text-secondary' : ''}`}>
                             {tx.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(tx.amount))}
                           </p>
                           <p className="text-[10px] opacity-20 uppercase font-bold tracking-tighter">{new Date(tx.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <GlassCard className="p-8 flex flex-col items-center justify-center text-center">
            <h4 className="editorial-label text-xs tracking-widest font-bold opacity-40 mb-8">DISTRIBUIÇÃO POR CATEGORIA</h4>
            <div className="relative w-56 h-56 mb-8 group">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '11px', backdropFilter: 'blur(10px)' }}
                  />
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="editorial-label opacity-30 text-[9px]">TOTAL GASTO</p>
                <p className="text-2xl font-bold tracking-tighter">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalExpense)}
                </p>
              </div>
            </div>
            <div className="w-full space-y-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }} />
                    <span className="text-xs font-bold opacity-60 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="font-mono text-sm font-bold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-8 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
             <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                   <Target size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-tight">Metas de Reserva</h4>
                  <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Horizonte de 6 Meses</p>
                </div>
             </div>
             
             <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className="opacity-40 uppercase">Reserva de Emergência</span>
                      <span className="text-primary">84%</span>
                   </div>
                   <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: '84%' }} />
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className="opacity-40 uppercase">Fundo de Viagem</span>
                      <span className="text-secondary">42%</span>
                   </div>
                   <div className="h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary" style={{ width: '42%' }} />
                   </div>
                </div>
             </div>

             <button className="mt-8 w-full py-4 rounded-2xl bg-on-surface/5 hover:bg-on-surface/10 border border-[var(--glass-border)] text-[10px] font-bold tracking-[0.2em] transition-all">
               REPLANEJAR OBJETIVOS
             </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Finance;
  );
};

export default Finance;
