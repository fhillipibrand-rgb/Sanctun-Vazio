import React from "react";
import { Target, Flag, Rocket, Sparkles, Plus, ChevronRight, Calendar, Calculator, TrendingUp } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { MOCK_GOALS } from "../lib/mockData";
import { motion } from "motion/react";

const Goals = () => {
  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <Target size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">GESTÃO DE OBJETIVOS</p>
          </div>
          <h2 className="display-lg">Planos e Metas</h2>
          <p className="text-sm opacity-50 mt-1">Defina o seu futuro e acompanhe a evolução dos seus grandes sonhos.</p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-surface font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-secondary/20">
          <Plus size={18} />
          CRIAR NOVA META
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_GOALS.map((goal, i) => {
          const progress = (goal.current / goal.target) * 100;
          return (
            <GlassCard key={goal.id} className="p-7 relative group hover:border-secondary/40 transition-all flex flex-col h-full">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl bg-on-surface/[0.03] flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-surface transition-all`}>
                  {i === 0 ? <Flag size={20} /> : i === 1 ? <Rocket size={20} /> : <Target size={20} />}
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{goal.category}</p>
                  <p className="text-xs font-mono font-bold opacity-60 mt-0.5">{goal.deadline}</p>
                </div>
              </div>

              <h4 className="text-xl font-bold tracking-tight mb-2 group-hover:text-secondary transition-colors">{goal.title}</h4>
              
              <div className="mt-auto pt-4 space-y-4">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-bold font-mono">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.current)}
                    </p>
                    <p className="text-[10px] opacity-40 font-bold tracking-wider">META: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(goal.target)}</p>
                  </div>
                  <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progress}%` }} 
                      transition={{ duration: 1, delay: i * 0.1 }}
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

        <GlassCard className="p-7 flex flex-col items-center justify-center text-center gap-4 border-dashed border-2 border-on-surface/10 hover:border-secondary/30 transition-all group cursor-pointer">
           <div className="w-14 h-14 rounded-full bg-on-surface/5 flex items-center justify-center text-on-surface/20 group-hover:text-secondary group-hover:scale-110 transition-all">
             <Plus size={32} />
           </div>
           <div>
             <h5 className="font-bold">Novo Desafio</h5>
             <p className="text-xs opacity-40 mt-1">O que você vai conquistar em seguida?</p>
           </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <GlassCard className="p-8 flex items-center gap-8 overflow-hidden relative">
          <div className="absolute -right-16 -bottom-16 opacity-5 rotate-12">
            <Calculator size={200} />
          </div>
          <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
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
            <p className="text-sm opacity-60 leading-relaxed max-w-sm mb-4">Com base no seu fluxo de caixa, você pode atingir a 'Reserva de Emergência' 2 meses antes do previsto.</p>
            <button className="editorial-label text-primary hover:underline flex items-center gap-2">VER ANALISE DA IA <ChevronRight size={14} /></button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Goals;
