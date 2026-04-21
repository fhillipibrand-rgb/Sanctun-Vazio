import React, { useEffect, useState } from "react";
import { Target, Flag, Rocket, Sparkles, Plus, ChevronRight, Calendar, Calculator, TrendingUp, Trash2, Loader2, X, Briefcase } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { MOCK_GOALS } from "../lib/mockData";

interface Goal {
  id: string;
  title: string;
  category: string;
  type?: "financial" | "qualitative";
  current_amount: number;
  target_amount: number;
  deadline: string;
}

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [usingMock, setUsingMock] = useState(false);
  const [newGoal, setNewGoal] = useState<{ title: string; category: string; type: "financial" | "qualitative"; target_amount: number; current_amount: number; deadline: string }>({ 
    title: "", category: "Empresa", type: "qualitative", target_amount: 100, current_amount: 0, deadline: "" 
  });

  useEffect(() => {
    if (user) fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setGoals(data);
      setUsingMock(false);
    } else {
      setGoals(MOCK_GOALS as any);
      setUsingMock(true);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.title || !user) return;

    const { data, error } = await supabase.from('goals').insert([{
      ...newGoal,
      user_id: user.id
    }]).select().single();

    if (!error && data) {
      setGoals([data, ...goals]);
      setShowForm(false);
      setNewGoal({ title: "", category: "Empresa", type: "qualitative", target_amount: 100, current_amount: 0, deadline: "" });
    }
  };

  const handleDelete = async (id: string) => {
    if (usingMock) {
      setGoals(goals.filter(g => g.id !== id));
      return;
    }
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (!error) setGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div className="space-y-8 pb-20 pt-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <Target size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">{usingMock ? "MOCK DATA" : "GESTÃO DE OBJETIVOS"}</p>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Planos e Metas</h2>
          <p className="text-sm opacity-50 mt-1">Defina o seu futuro e acompanhe a evolução dos seus grandes sonhos.</p>
        </div>

        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-surface font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-secondary/20"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "CANCELAR" : "CRIAR NOVA META"}
        </button>
      </header>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <GlassCard className="p-8 border-secondary/30 border-2">
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">TÍTULO DO OBJETIVO</label>
                    <input type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} placeholder="Ex: Reserva de Emergência" className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none focus:border-secondary/50 transition-all font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">CATEGORIA</label>
                    <select value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value, type: e.target.value === 'Financeiro' ? 'financial' : 'qualitative'})} className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none appearance-none font-bold uppercase tracking-widest text-xs">
                       <option value="Empresa">Organizacional / Empresa</option>
                       <option value="Financeiro">Financeiro</option>
                       <option value="Pessoal">Pessoal</option>
                       <option value="Carreira">Carreira</option>
                       <option value="Saúde">Saúde</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">{newGoal.type === 'financial' ? 'VALOR ALVO (BRL)' : 'OBJETIVO ALVO (ex: 100%)'}</label>
                    <input type="number" value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: Number(e.target.value)})} className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none font-mono font-bold" required />
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">{newGoal.type === 'financial' ? 'ESTADO ATUAL (BRL)' : 'PROGRESSO ATUAL'}</label>
                    <input type="number" value={newGoal.current_amount} onChange={e => setNewGoal({...newGoal, current_amount: Number(e.target.value)})} className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none font-mono font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="editorial-label text-[10px] opacity-40">PRAZO ESTIMADO (DEADLINE)</label>
                    <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 outline-none" />
                  </div>
                </div>
                <div className="flex justify-end">
                   <button type="submit" className="px-10 py-4 bg-secondary text-surface rounded-full font-bold shadow-xl shadow-secondary/20 hover:scale-105 transition-all">ESTABELECER META</button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-20 text-center editorial-label opacity-20 animate-pulse">MAPEANDO SEU FUTURO...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, i) => {
            const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
            return (
              <GlassCard key={goal.id} className="p-7 relative group hover:border-secondary/40 transition-all flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-on-surface/[0.03] flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-surface transition-all`}>
                    {goal.category === 'Financeiro' ? <TrendingUp size={20} /> : goal.category === 'Empresa' ? <Briefcase size={20} /> : goal.category === 'Saúde' ? <Rocket size={20} /> : <Target size={20} />}
                  </div>
                  <div className="flex flex-col items-end">
                    <button onClick={() => handleDelete(goal.id)} className="opacity-0 group-hover:opacity-30 hover:opacity-100 p-1 mb-1 transition-all"><Trash2 size={14}/></button>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{goal.category}</p>
                    <p className="text-xs font-mono font-bold opacity-60 mt-0.5">{goal.deadline ? new Date(goal.deadline).toLocaleDateString('pt-BR') : 'Sem prazo'}</p>
                  </div>
                </div>

                <h4 className="text-xl font-bold tracking-tight mb-2 group-hover:text-secondary transition-colors">{goal.title}</h4>
                
                <div className="mt-auto pt-4 space-y-4">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-bold font-mono">
                        {(!goal.type || goal.type === 'financial') 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.current_amount)
                          : `${goal.current_amount} pts`}
                      </p>
                      <p className="text-[10px] opacity-40 font-bold tracking-wider">META: {(!goal.type || goal.type === 'financial') 
                          ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.target_amount)
                          : `${goal.target_amount} pts`}</p>
                    </div>
                    <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(progress, 100)}%` }} 
                        transition={{ duration: 1, delay: 0.1 }}
                        className="h-full bg-secondary rounded-full shadow-[0_0_12px_rgba(0,245,160,0.3)]" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--glass-border)]">
                    <span className="text-[10px] font-bold opacity-50">{Math.round(progress)}% CONCLUÍDO</span>
                    <button className="flex items-center gap-1 text-[10px] font-bold text-secondary hover:underline tracking-widest uppercase">
                      DETALHES
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}

          <GlassCard onClick={() => setShowForm(true)} className="p-7 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2 border-on-surface/10 hover:border-secondary/30 transition-all group cursor-pointer">
             <div className="w-14 h-14 rounded-full bg-on-surface/5 flex items-center justify-center text-on-surface/20 group-hover:text-secondary group-hover:scale-110 transition-all">
               <Plus size={32} />
             </div>
             <div>
               <h5 className="font-bold">Novo Desafio</h5>
               <p className="text-xs opacity-40 mt-1">O que você vai conquistar em seguida?</p>
             </div>
          </GlassCard>
        </div>
      )}

      {/* Utilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <GlassCard className="p-8 flex items-center gap-8 overflow-hidden relative group">
          <div className="absolute -right-16 -bottom-16 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
            <Calculator size={200} />
          </div>
          <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 group-hover:bg-secondary group-hover:text-surface transition-all">
            <TrendingUp size={32} />
          </div>
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">Simulador de Aportes</h4>
            <p className="text-sm opacity-60 leading-relaxed max-w-sm mb-4">Descubra quanto tempo levaria para atingir seus objetivos com base nos seus aportes mensais atuais.</p>
            <button className="editorial-label text-secondary hover:underline flex items-center gap-2">ABRIR CALCULADORA <ChevronRight size={14} /></button>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex items-center gap-8 overflow-hidden relative border-primary/20 bg-primary/5">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Sparkles size={32} />
          </div>
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">IA Insights: Objetivos</h4>
            <p className="text-sm opacity-60 leading-relaxed max-w-sm mb-4">Com base no seu fluxo de caixa, o Sanctum sugere priorizar a Reserva de Emergência este mês.</p>
            <button className="editorial-label text-primary hover:underline flex items-center gap-2">VER ANALISE DA IA <ChevronRight size={14} /></button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Goals;
