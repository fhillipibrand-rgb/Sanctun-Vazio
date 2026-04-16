import React from "react";
import { Briefcase, TrendingUp, TrendingDown, PieChart as PieIcon, Plus, ExternalLink, ShieldCheck, Globe, Building2, Coins } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import GlassCard from "../components/ui/GlassCard";
import { MOCK_INVESTMENTS } from "../lib/mockData";
import { motion } from "motion/react";

const Investments = () => {
  const { summary, allocation, assets } = MOCK_INVESTMENTS;

  const typeIcons: any = {
    'Ações BR': Building2,
    'Ações EUA': Globe,
    'FIIs': Building2,
    'Renda Fixa': ShieldCheck,
    'Cripto': Coins
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 opacity-60 mb-1">
            <Briefcase size={12} className="text-secondary" />
            <p className="editorial-label !tracking-[0.2em]">PATRIMÔNIO CORPORATIVO & PESSOAL</p>
          </div>
          <h2 className="display-lg">Meus Investimentos</h2>
          <p className="text-sm opacity-50 mt-1">Gestão de ativos, diversificação e acompanhamento de rentabilidade.</p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-surface font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20">
          <Plus size={18} />
          ADICIONAR ATIVO
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-l-4 border-l-secondary">
          <p className="editorial-label text-[9px] opacity-40 mb-2">VALOR TOTAL INVESTIDO</p>
          <h3 className="text-3xl font-bold tracking-tighter">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.total)}
          </h3>
          <div className="flex items-center gap-2 text-secondary mt-2">
            <TrendingUp size={14} />
            <span className="text-xs font-bold font-mono">+{summary.monthlyYield}% este mês</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-primary">
          <p className="editorial-label text-[9px] opacity-40 mb-2">PROVENTOS ESTIMADOS (MÊS)</p>
          <h3 className="text-3xl font-bold tracking-tighter">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(summary.monthlyEarnings)}
          </h3>
          <p className="text-[10px] opacity-40 mt-2 font-medium">Yield on Cost médio: 0.85%</p>
        </GlassCard>

        <GlassCard className="p-6 bg-gradient-to-br from-secondary/10 to-transparent">
          <div className="flex items-center gap-2 text-secondary mb-3">
            <ShieldCheck size={16} />
            <p className="editorial-label text-[9px] font-bold">SCORE DE SEGURANÇA</p>
          </div>
          <h3 className="text-2xl font-bold">Diversificado</h3>
          <div className="mt-3 h-1.5 w-full bg-on-surface/5 rounded-full">
            <div className="h-full w-[85%] bg-secondary rounded-full shadow-[0_0_12px_rgba(0,245,160,0.4)]" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        <GlassCard className="p-8 flex flex-col items-center justify-center">
          <h4 className="text-lg font-bold mb-8">Alocação de Ativos</h4>
          <div className="relative w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocation.map((entry, index) => (
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
              <span className="editorial-label text-[8px] opacity-40">Portfolio</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full mt-8">
            {allocation.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{item.name}</p>
                  <p className="text-xs font-mono font-bold">{Math.round((item.value / summary.total) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-bold tracking-tight">Principais Ativos</h4>
            <button className="text-[10px] font-bold text-primary tracking-widest uppercase hover:underline">Ver carteira completa</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {assets.map((asset, i) => {
              const Icon = typeIcons[asset.type] || Briefcase;
              return (
                <GlassCard key={i} className="p-5 group hover:border-primary/50 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-on-surface/[0.03] flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Icon size={18} className="text-on-surface/50 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h5 className="font-bold text-sm tracking-tight">{asset.symbol}</h5>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{asset.name}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-on-surface/5 rounded-lg transition-all">
                      <ExternalLink size={14} className="opacity-40" />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] opacity-40 mb-1">TOTAL POSIÇÃO</p>
                      <p className="text-sm font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.amount)}</p>
                    </div>
                    <div className={`text-right ${asset.yield >= 0 ? 'text-secondary' : 'text-red-400'}`}>
                      <p className="text-[9px] opacity-40 mb-1">RENTABILIDADE</p>
                      <div className="flex items-center justify-end gap-1">
                        {asset.yield >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span className="text-xs font-bold">{asset.yield}%</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <GlassCard className="p-6 border-dashed border-2 border-on-surface/10 flex items-center justify-between group cursor-pointer hover:border-primary/30 transition-all">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-on-surface/5 flex items-center justify-center opacity-30 group-hover:opacity-100 group-hover:bg-primary/10 transition-all">
                  <TrendingUp size={20} className="group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h5 className="font-bold text-sm">Otimizar Rentabilidade</h5>
                  <p className="text-[10px] opacity-40">O Sanctum identificou 2 ativos com peso excessivo.</p>
                </div>
             </div>
             <ArrowUpRight size={18} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// Helper internal component
const ArrowUpRight = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

export default Investments;
