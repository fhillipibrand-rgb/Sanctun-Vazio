import React, { useEffect, useState } from "react";
import { Briefcase, TrendingUp, TrendingDown, PieChart as PieIcon, Plus, ExternalLink, ShieldCheck, Globe, Building2, Coins, Trash2, X, Loader2 } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  amount: number;
  current_yield: number;
}

const Investments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAsset, setNewAsset] = useState({ symbol: "", name: "", type: "Ações", amount: 0, current_yield: 0 });

  const typeIcons: any = {
    'Ações': Building2,
    'FIIs': Building2,
    'Renda Fixa': ShieldCheck,
    'Cripto': Coins,
    'Internacional': Globe
  };

  useEffect(() => {
    if (user) fetchInvestments();
  }, [user]);

  const fetchInvestments = async () => {
    setLoading(true);
    const { data } = await supabase.from('investments').select('*').order('amount', { ascending: false });
    if (data) setAssets(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.symbol || !user) return;

    const { data, error } = await supabase.from('investments').insert([{
      ...newAsset,
      user_id: user.id
    }]).select().single();

    if (!error && data) {
      setAssets([...assets, data]);
      setShowForm(false);
      setNewAsset({ symbol: "", name: "", type: "Ações", amount: 0, current_yield: 0 });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('investments').delete().eq('id', id);
    if (!error) setAssets(assets.filter(a => a.id !== id));
  };

  const totalInvested = assets.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  const allocationData = assets.reduce((acc: any[], curr) => {
    const existing = acc.find(a => a.name === curr.type);
    if (existing) {
      existing.value += Number(curr.amount);
    } else {
      const colors: any = { 'Ações': '#5e9eff', 'FIIs': '#00f5a0', 'Renda Fixa': '#a855f7', 'Cripto': '#f5a623', 'Internacional': '#ff6b6b' };
      acc.push({ name: curr.type, value: Number(curr.amount), color: colors[curr.type] || '#ffffff' });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-8 pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <Briefcase size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">PATRIMÔNIO CORPORATIVO & PESSOAL</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Meus Investimentos</h2>
          <p className="text-sm opacity-50 mt-1">Gestão de ativos, diversificação e acompanhamento de rentabilidade.</p>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-surface font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "CANCELAR" : "ADICIONAR ATIVO"}
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <GlassCard className="p-8 border-primary/30 border-2">
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="editorial-label text-[10px] opacity-40">TICKER / SÍMBOLO</label>
                  <input type="text" value={newAsset.symbol} onChange={e => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})} placeholder="Ex: PETR4" className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="editorial-label text-[10px] opacity-40">NOME DO ATIVO</label>
                  <input type="text" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} placeholder="Ex: Petrobras" className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="editorial-label text-[10px] opacity-40">TIPO DE ATIVO</label>
                  <select value={newAsset.type} onChange={e => setNewAsset({...newAsset, type: e.target.value})} className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none appearance-none font-bold text-xs uppercase tracking-widest">
                    <option value="Ações">Ações</option>
                    <option value="FIIs">FIIs</option>
                    <option value="Renda Fixa">Renda Fixa</option>
                    <option value="Cripto">Cripto</option>
                    <option value="Internacional">Internacional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="editorial-label text-[10px] opacity-40">VALOR TOTAL POSIÇÃO (BRL)</label>
                  <input type="number" value={newAsset.amount} onChange={e => setNewAsset({...newAsset, amount: Number(e.target.value)})} className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none font-mono font-bold" required />
                </div>
                <div className="space-y-2">
                  <label className="editorial-label text-[10px] opacity-40">RENTABILIDADE (%)</label>
                  <input type="number" step="0.01" value={newAsset.current_yield} onChange={e => setNewAsset({...newAsset, current_yield: Number(e.target.value)})} className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none font-mono font-bold" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full py-4 bg-primary text-surface rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">SALVAR ATIVO</button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-l-4 border-l-secondary">
          <p className="editorial-label text-[9px] opacity-40 mb-2">VALOR TOTAL INVESTIDO</p>
          <h3 className="text-3xl font-bold tracking-tighter font-mono">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvested)}
          </h3>
          <div className="flex items-center gap-2 text-secondary mt-2">
            <TrendingUp size={14} />
            <span className="text-xs font-bold font-mono">Sincronizado com Mercado</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-primary">
          <p className="editorial-label text-[9px] opacity-40 mb-2">DIVERSIFICAÇÃO</p>
          <h3 className="text-3xl font-bold tracking-tighter font-mono">
            {allocationData.length} Categorias
          </h3>
          <p className="text-[10px] opacity-40 mt-2 font-medium uppercase tracking-widest">Score de Risco: Baixo</p>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-secondary/10 to-transparent">
          <div className="flex items-center gap-2 text-secondary mb-3">
            <ShieldCheck size={16} />
            <p className="editorial-label text-[9px] font-bold">CARTEIRA ATIVA</p>
          </div>
          <h3 className="text-2xl font-bold">Saúde Financeira</h3>
          <div className="mt-3 h-1.5 w-full bg-on-surface/5 rounded-full">
            <div className={`h-full bg-secondary rounded-full shadow-[0_0_12px_rgba(0,245,160,0.4)]`} style={{ width: assets.length > 0 ? '90%' : '10%' }} />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        <GlassCard className="p-8 flex flex-col items-center justify-center">
          <h4 className="text-lg font-bold mb-8 uppercase tracking-widest text-[11px] editorial-label">Alocação de Ativos</h4>
          {assets.length > 0 ? (
            <>
              <div className="relative w-64 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(20,20,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <PieIcon size={24} className="opacity-20 mb-1" />
                  <span className="editorial-label text-[8px] opacity-40 uppercase">Assets</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-8">
                {allocationData.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter truncate">{item.name}</p>
                      <p className="text-xs font-mono font-bold truncate">{Math.round((item.value / totalInvested) * 100)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="py-20 text-center opacity-20 text-[10px] font-bold uppercase tracking-widest">Nenhuma alocação registrada</div>
          )}
        </GlassCard>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold tracking-tight">Ativos na Carteira</h4>
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{assets.length} Itens</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map((asset) => {
              const Icon = typeIcons[asset.type] || Briefcase;
              const isPositive = Number(asset.current_yield) >= 0;
              return (
                <GlassCard key={asset.id} className="p-5 group hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-on-surface/[0.03] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Icon size={20} className="text-on-surface/50 group-hover:text-primary transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-base tracking-tight truncate">{asset.symbol}</h5>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold truncate">{asset.name}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(asset.id)} className="opacity-0 group-hover:opacity-40 hover:opacity-100 hover:text-red-400 p-1.5 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] opacity-40 mb-1">POSIÇÃO ATUAL</p>
                      <p className="text-sm font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.amount)}</p>
                    </div>
                    <div className={`text-right ${isPositive ? 'text-secondary' : 'text-red-400'}`}>
                      <p className="text-[9px] opacity-40 mb-1">YIELD</p>
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span className="text-xs font-bold font-mono">{asset.current_yield}%</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {assets.length === 0 && (
            <GlassCard onClick={() => setShowForm(true)} className="p-12 border-dashed border-2 border-on-surface/10 flex flex-col items-center justify-center text-center gap-4 hover:border-primary/30 transition-all group cursor-pointer">
               <Plus size={32} className="opacity-20 group-hover:text-primary group-hover:scale-110 transition-all" />
               <div>
                 <p className="text-sm font-bold opacity-60">Sua carteira está vazia</p>
                 <p className="text-[10px] opacity-30 uppercase tracking-widest mt-1">Adicione seu primeiro ativo para começar o acompanhamento.</p>
               </div>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investments;
