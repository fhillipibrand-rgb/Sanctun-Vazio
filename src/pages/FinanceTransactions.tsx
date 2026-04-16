import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownLeft, Wallet, MoreVertical, Calendar } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { MOCK_FINANCE } from "../lib/mockData";
import { motion, AnimatePresence } from "motion/react";

const FinanceTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState(MOCK_FINANCE);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || tx.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <Wallet size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">CONTROLE FINANCEIRO</p>
          </div>
          <h2 className="display-lg">Lançamentos</h2>
          <p className="text-sm opacity-50 mt-1">Registre e monitore cada entrada e saída do seu fluxo.</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-surface font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-secondary/20">
          <Plus size={18} />
          NOVO LANÇAMENTO
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/30 group-focus-within:text-secondary transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Buscar transação ou categoria..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-variant/40 border border-[var(--glass-border)] rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-secondary/50 transition-all font-medium"
          />
        </div>

        <div className="flex bg-surface-variant/40 border border-[var(--glass-border)] rounded-full p-1 w-full md:w-auto overflow-x-auto">
          {["all", "income", "expense"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === t ? "bg-secondary text-surface shadow-md" : "text-on-surface/40 hover:text-on-surface"
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
                <th className="px-6 py-4 editorial-label opacity-40">ITEM / CATEGORIA</th>
                <th className="px-6 py-4 editorial-label opacity-40">TIPO</th>
                <th className="px-6 py-4 editorial-label opacity-40">DATA</th>
                <th className="px-6 py-4 editorial-label opacity-40 text-right">VALOR</th>
                <th className="px-6 py-4 editorial-label opacity-40 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
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
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-on-surface/[0.03] ${tx.type === 'income' ? 'text-secondary' : 'text-red-400'}`}>
                          {tx.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{tx.name}</p>
                          <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{tx.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[9px] font-bold px-3 py-1 rounded-full border ${
                        tx.type === 'income' ? 'bg-secondary/10 border-secondary/20 text-secondary' : 'bg-red-400/10 border-red-400/20 text-red-400'
                      }`}>
                        {tx.type === 'income' ? 'ENTRADA' : 'SAÍDA'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-50">
                        <Calendar size={12} />
                        <span className="text-xs font-mono">{new Date(tx.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <span className={`font-mono font-bold ${tx.type === 'income' ? 'text-secondary' : 'text-on-surface'}`}>
                        {tx.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-on-surface/5 rounded-lg transition-all">
                        <MoreVertical size={16} className="opacity-40" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
            <div className="py-20 text-center">
              <p className="editorial-label opacity-20">Nenhum lançamento encontrado</p>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default FinanceTransactions;
