import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, 
  Wallet, MoreVertical, Calendar, Trash2, X, Loader2,
  TrendingDown, TrendingUp, DollarSign
} from "lucide-react";
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

const FinanceTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estado para formulário
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newTx, setNewTx] = useState({ name: "", category: "Outros", amount: "", type: "expense" as 'income' | 'expense' });

  const categories = [
    "Alimentação", "Moradia", "Transporte", "Saúde", 
    "Lazer", "Educação", "Assinaturas", "Compras", "Impostos",
    "Salário", "Investimentos", "Freelas", "Outros"
  ];

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setTransactions(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTx.name || !newTx.amount || !user) return;

    setAdding(true);
    const { data, error } = await supabase
      .from("transactions")
      .insert([{
        ...newTx,
        amount: Number(newTx.amount),
        user_id: user.id,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (!error && data) {
      setTransactions([data, ...transactions]);
      setShowForm(false);
      setNewTx({ name: "", category: "Outros", amount: "", type: "expense" });
    }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este lançamento permanentemente?")) return;
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (!error) setTransactions(transactions.filter(t => t.id !== id));
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <Wallet size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">CONTROLE FINANCEIRO</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Lançamentos</h2>
          <p className="text-sm opacity-50 mt-1">Registre e monitore cada entrada e saída do seu fluxo pessoal.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all shadow-xl ${
            showForm ? 'bg-on-surface/10 text-on-surface' : 'bg-secondary text-surface shadow-secondary/20 hover:scale-105'
          }`}
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "CANCELAR" : "NOVO LANÇAMENTO"}
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <GlassCard className="p-8 border-secondary/30 border-2">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">ITEM / DESCRIÇÃO</label>
                    <input 
                      type="text" 
                      value={newTx.name} 
                      onChange={e => setNewTx({...newTx, name: e.target.value})}
                      placeholder="Ex: Assinatura Netflix" 
                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none focus:border-secondary/50 font-bold" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">CATEGORIA</label>
                    <select 
                      value={newTx.category} 
                      onChange={e => setNewTx({...newTx, category: e.target.value})}
                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none appearance-none font-bold uppercase tracking-widest text-[10px]"
                    >
                      {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">VALOR (BRL)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={newTx.amount} 
                      onChange={e => setNewTx({...newTx, amount: e.target.value})}
                      placeholder="0,00" 
                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none focus:border-secondary/50 font-mono font-bold" 
                      required 
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-[var(--glass-border)]">
                   <div className="flex bg-on-surface/5 p-1 rounded-2xl border border-[var(--glass-border)] w-full md:w-auto">
                      <button 
                        type="button" 
                        onClick={() => setNewTx({...newTx, type: 'income'})}
                        className={`flex-1 md:w-32 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${newTx.type === 'income' ? 'bg-secondary text-surface shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <TrendingUp size={14} /> ENTRADA
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setNewTx({...newTx, type: 'expense'})}
                        className={`flex-1 md:w-32 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${newTx.type === 'expense' ? 'bg-red-400 text-surface shadow-lg' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <TrendingDown size={14} /> SAÍDA
                      </button>
                   </div>
                   <button 
                    type="submit" 
                    disabled={adding}
                    className="w-full md:w-auto px-10 py-4 bg-on-surface text-surface rounded-full font-bold text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-on-surface/10 disabled:opacity-30"
                   >
                     {adding ? <Loader2 className="animate-spin" size={20} /> : "CONFIRMAR LANÇAMENTO"}
                   </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30 group-focus-within:text-secondary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar transação ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-secondary/50 transition-all font-medium"
          />
        </div>

        <div className="flex bg-on-surface/5 border border-[var(--glass-border)] rounded-full p-1 w-full lg:w-auto overflow-x-auto">
          {["all", "income", "expense"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === t ? "bg-on-surface text-surface shadow-md" : "text-on-surface/40 hover:text-on-surface"
              }`}
            >
              {t === "all" ? "Todos" : t === "income" ? "Entradas" : "Saídas"}
            </button>
          ))}
        </div>
      </div>

      <GlassCard className="overflow-hidden border-on-surface/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--glass-border)] bg-on-surface/[0.02]">
                <th className="px-6 py-5 editorial-label opacity-40 text-[9px]">LANÇAMENTO / CATEGORIA</th>
                <th className="px-6 py-5 editorial-label opacity-40 text-[9px]">MODALIDADE</th>
                <th className="px-6 py-5 editorial-label opacity-40 text-[9px]">DATA</th>
                <th className="px-6 py-5 editorial-label opacity-40 text-[9px] text-right">VALOR</th>
                <th className="px-6 py-5 editorial-label opacity-40 text-[9px] w-14"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center editorial-label opacity-20 animate-pulse">SINCRONIZANDO TRANSAÇÕES...</td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTransactions.map((tx) => (
                    <motion.tr 
                      key={tx.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group hover:bg-on-surface/[0.02] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-on-surface/[0.03] ${tx.type === 'income' ? 'text-secondary bg-secondary/10' : 'text-red-400 bg-red-400/10'}`}>
                            {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-sm tracking-tight">{tx.name}</p>
                            <p className="text-[9px] opacity-40 uppercase tracking-widest font-bold">{tx.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`text-[8px] font-bold px-3 py-1 rounded-full border ${
                          tx.type === 'income' ? 'border-secondary/20 text-secondary' : 'border-red-400/20 text-red-400'
                        }`}>
                          {tx.type === 'income' ? 'RECEITA' : 'DESPESA'}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 opacity-50">
                          <Calendar size={12} />
                          <span className="text-xs font-mono">{new Date(tx.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className={`font-mono font-bold text-base ${tx.type === 'income' ? 'text-secondary' : 'text-on-surface'}`}>
                          {tx.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => handleDelete(tx.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-400/10 hover:text-red-400 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
          {!loading && filteredTransactions.length === 0 && (
            <div className="py-24 text-center">
               <div className="w-16 h-16 rounded-full bg-on-surface/5 flex items-center justify-center mx-auto mb-4 opacity-20">
                  <DollarSign size={32} />
               </div>
               <p className="editorial-label text-xs opacity-30 mt-2">NENHUM LANÇAMENTO ENCONTRADO NO PERÍODO</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default FinanceTransactions;
