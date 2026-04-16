import React, { useState } from "react";
import { 
  Utensils, 
  Droplets, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ChevronRight,
  Sparkles,
  PieChart,
  Zap,
  Leaf
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_NUTRITION } from "../lib/mockData";

const Nutrition = () => {
  // Water State
  const [water, setWater] = useState(MOCK_NUTRITION.water);
  const progressWater = (water.current / water.target) * 100;

  // Meals State
  const [meals, setMeals] = useState(MOCK_NUTRITION.meals);

  // Supplements
  const [supps, setSupps] = useState(MOCK_NUTRITION.supplements);

  const toggleSupp = (name: string) => {
    setSupps(supps.map(s => s.name === name ? { ...s, done: !s.done } : s));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
          <Utensils size={12} className="text-orange-400" />
          <p className="editorial-label !tracking-[0.2em]">NUTRIÇÃO E PERFORMANCE</p>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Dieta & Nutrição</h2>
        <p className="text-on-surface-variant opacity-60 max-w-2xl text-sm leading-relaxed">
          O que você consome define o seu nível de energia. 
          Gerencie suas refeições, hidratação e suplementação estratégica.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Hidratação Principal */}
        <GlassCard className="p-8 border-cyan-400/20 relative overflow-hidden group col-span-1 lg:col-span-1">
          <div className="absolute -right-10 -top-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
            <Droplets size={180} className="text-cyan-400" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 text-cyan-400 mb-6">
              <div className="p-2 bg-cyan-400/10 rounded-xl"><Droplets size={20} /></div>
              <span className="editorial-label font-bold tracking-widest text-[10px]">HIDRATAÇÃO</span>
            </div>
            
            <div className="flex items-center justify-center py-10">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="68" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-on-surface/5" />
                  <circle 
                    cx="72" cy="72" r="68" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    strokeDasharray={427} strokeDashoffset={427 - (427 * Math.min(progressWater, 100)) / 100}
                    className="text-cyan-400 transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-bold font-mono">{water.current}</span>
                  <span className="text-[10px] block opacity-40 font-bold">DE {water.target} COPOS</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button 
                onClick={() => setWater({...water, current: Math.max(0, water.current - 1)})}
                className="flex-1 py-4 bg-on-surface/5 hover:bg-on-surface/10 rounded-2xl transition-all font-bold flex items-center justify-center"
              >
                <Minus size={18} />
              </button>
              <button 
                onClick={() => setWater({...water, current: water.current + 1})}
                className="flex-[2] py-4 bg-cyan-400 text-surface hover:scale-[1.02] active:scale-95 shadow-lg shadow-cyan-400/20 rounded-2xl transition-all font-bold flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span>ADICIONAR</span>
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Dieta e Refeições */}
        <GlassCard className="p-8 border-orange-400/20 col-span-1 lg:col-span-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-orange-400 font-bold tracking-widest text-[10px] editorial-label">
              <Leaf size={14} /> REFEIÇÕES DO DIA
            </div>
            <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Dieta Clean</div>
          </div>
          
          <div className="space-y-4 flex-1">
            {[
              { id: 'breakfast', label: 'Café da Manhã', desc: 'Frutas e Ovos' },
              { id: 'lunch', label: 'Almoço', desc: 'Proteína e Salada' },
              { id: 'afternoon', label: 'Lanche', desc: 'Iogurte ou Nuts' },
              { id: 'dinner', label: 'Jantar', desc: 'Leve (Sopa ou Peixe)' }
            ].map((item) => {
              const checked = meals[item.id as keyof typeof meals];
              return (
                <button 
                  key={item.id}
                  onClick={() => setMeals({...meals, [item.id]: !checked})}
                  className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all text-left ${
                    checked 
                    ? 'bg-orange-400/10 border-orange-400/30 text-orange-400' 
                    : 'bg-on-surface/5 border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className={`text-xs truncate ${checked ? 'opacity-70' : 'opacity-30'}`}>{item.desc}</p>
                  </div>
                  {checked ? <CheckCircle2 size={18} /> : <div className="w-5 h-5 rounded-full border-2 border-current opacity-20" />}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
             <div className="flex justify-between items-center text-[10px] font-bold opacity-40 uppercase tracking-widest">
               <span>Meta Diária</span>
               <span>75%</span>
             </div>
             <div className="mt-2 h-1 w-full bg-on-surface/5 rounded-full overflow-hidden">
               <div className="h-full bg-orange-400" style={{ width: '75%' }} />
             </div>
          </div>
        </GlassCard>

        {/* Suplementação Estratégica */}
        <GlassCard orb className="p-8 border-yellow-400/20 relative overflow-hidden flex flex-col h-full group">
          <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform">
            <Zap size={150} className="text-yellow-400" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-yellow-500 font-bold tracking-widest text-[10px] editorial-label">
                <Zap size={14} fill="currentColor" /> SUPLEMENTAÇÃO
              </div>
              <button className="text-[14px] p-2 bg-on-surface/5 rounded-xl hover:bg-on-surface/10 transition-all">+</button>
            </div>

            <div className="space-y-3">
              {supps.map((supp) => (
                <div 
                  key={supp.name}
                  onClick={() => toggleSupp(supp.name)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                    supp.done ? 'bg-yellow-400/5 border-yellow-400/20' : 'bg-on-surface/5 border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                    supp.done ? 'bg-yellow-400 text-surface shadow-lg shadow-yellow-400/20 border-yellow-400' : 'bg-on-surface/10 border-transparent'
                  }`}>
                    {supp.done ? <CheckCircle2 size={20} /> : <Zap size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${supp.done ? 'text-yellow-500 line-through' : ''}`}>{supp.name}</p>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">{supp.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-3xl bg-secondary/5 border border-secondary/10">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                   <Sparkles size={14} />
                 </div>
                 <p className="text-[11px] font-medium leading-tight opacity-70">
                   Sua suplementação está em conformidade. Continue nutrindo seu potencial.
                 </p>
               </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Nutrition;
