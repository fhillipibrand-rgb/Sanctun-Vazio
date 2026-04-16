import React, { useState } from "react";
import { 
  Moon, 
  Sun, 
  Book, 
  Activity as ExerciseIcon, 
  ChevronRight, 
  Sparkles,
  ArrowRight,
  Sprout,
  Clock,
  Layout
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion } from "motion/react";
import { MOCK_HABITS } from "../lib/mockData";

const Habits = () => {
  const [exerciseDone, setExerciseDone] = useState(false);
  const [gratitude, setGratitude] = useState("");
  
  // Sleep State
  const [sleepTimes, setSleepTimes] = useState(MOCK_HABITS.sleep);
  
  // Reading State
  const [reading, setReading] = useState(MOCK_HABITS.reading);
  const readingProgress = (reading.progress / reading.total) * 100;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
          <Layout size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">DESENVOLVIMENTO PESSOAL</p>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Hábitos & Rotina</h2>
        <p className="text-on-surface-variant opacity-60 max-w-2xl text-sm leading-relaxed">
          A clareza dos seus dias começa pela consistência da sua base. 
          Monitore seu descanso, seu movimento e o alimento de sua mente.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Rotina de Sono */}
        <GlassCard className="p-8 border-primary/20 relative overflow-hidden group col-span-1 lg:col-span-1">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
            <Moon size={140} className="text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-primary mb-8">
              <div className="p-2 bg-primary/10 rounded-xl"><Moon size={20} /></div>
              <span className="editorial-label font-bold tracking-widest text-[10px]">ROTINA DE SONO</span>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-3xl bg-on-surface/5 border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <Sun size={18} className="text-yellow-400" />
                  <div>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">ACORDAR</p>
                    <input 
                      type="time" 
                      value={sleepTimes.wake} 
                      onChange={(e) => setSleepTimes({...sleepTimes, wake: e.target.value})}
                      className="bg-transparent font-mono font-bold text-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-3xl bg-on-surface/5 border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <Moon size={18} className="text-primary" />
                  <div>
                    <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">DORMIR</p>
                    <input 
                      type="time" 
                      value={sleepTimes.sleep} 
                      onChange={(e) => setSleepTimes({...sleepTimes, sleep: e.target.value})}
                      className="bg-transparent font-mono font-bold text-lg outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--glass-border)]">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">QUALIDADE ESTIMADA</span>
                  <span className="text-xl font-mono font-bold text-primary">{sleepTimes.quality}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${sleepTimes.quality}%` }} />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Exercício Físico */}
        <div className="space-y-6 flex flex-col">
          <GlassCard className={`p-8 transition-all duration-500 cursor-pointer overflow-hidden relative flex-1 ${exerciseDone ? 'bg-primary/10 border-primary/30' : 'hover:bg-on-surface/5 border-transparent'}`} onClick={() => setExerciseDone(!exerciseDone)}>
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
              <ExerciseIcon size={120} className="text-primary" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-3 text-primary mb-6">
                <div className="p-3 rounded-2xl bg-primary text-surface shadow-lg shadow-primary/20">
                  <ExerciseIcon size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-0.5">VITALIDADE</p>
                  <p className="font-bold text-sm tracking-tight">EXERCÍCIO DO DIA</p>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center text-center py-6">
                <h3 className="text-3xl font-bold tracking-tighter mb-2">{exerciseDone ? "TREINO PAGO!" : "AINDA NÃO TREINOU"}</h3>
                <p className="text-xs opacity-50 px-4">{exerciseDone ? "Seu corpo agradece pela disciplina hoje." : "Hoje o corpo pede movimento. Inicie sua sessão."}</p>
              </div>

              <div className="mt-auto pt-6 border-t border-[var(--glass-border)] flex justify-between gap-1">
                {MOCK_HABITS.exercise.map((ex, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-[8px] font-bold opacity-30">{ex.day}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${ex.done ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-on-surface/5 border-transparent opacity-30'}`}>
                      {ex.done ? <Sparkles size={12} /> : <div className="w-1 h-1 rounded-full bg-on-surface" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Leitura e Conhecimento */}
        <GlassCard className="p-8 border-secondary/20 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 opacity-5 group-hover:-rotate-12 transition-transform duration-700">
            <Book size={140} className="text-secondary" />
          </div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-3 text-secondary mb-8">
              <div className="p-2 bg-secondary/10 rounded-xl"><Book size={20} /></div>
              <span className="editorial-label font-bold tracking-widest text-[10px]">LEITURA & CONHECIMENTO</span>
            </div>

            <div className="mb-6">
              <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mb-2">LENDO AGORA</p>
              <h4 className="text-xl font-bold tracking-tight mb-1">{reading.title}</h4>
              <p className="text-xs opacity-50 italic">Faltam {reading.total - reading.progress} páginas para concluir.</p>
            </div>

            <div className="space-y-2 mt-auto">
              <div className="flex justify-between items-end text-[10px] font-bold">
                <span className="opacity-40 uppercase tracking-widest">PROGRESSO</span>
                <span className="text-secondary">{Math.round(readingProgress)}%</span>
              </div>
              <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${readingProgress}%` }} 
                  className="h-full bg-secondary"
                />
              </div>
              <div className="flex justify-between text-[9px] opacity-30 font-mono mt-1">
                <span>PG {reading.progress}</span>
                <span>PG {reading.total}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button className="flex-1 py-3 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl transition-all font-bold text-[10px] tracking-widest uppercase">REGISTRAR LIDO</button>
              <button className="p-3 bg-secondary/10 text-secondary rounded-xl hover:bg-secondary hover:text-surface transition-all"><ChevronRight size={14}/></button>
            </div>
          </div>
        </GlassCard>

        {/* Espiritualidade - Deep Section */}
        <GlassCard orb className="p-8 lg:col-span-3 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group mt-6">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-1000">
            <Sprout size={300} className="text-primary" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 text-primary mb-6">
              <div className="p-2 bg-primary/10 rounded-xl"><Sparkles size={20} /></div>
              <span className="editorial-label font-bold tracking-widest text-[10px]">ESPIRITUALIDADE & INTROSPECÇÃO</span>
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight mb-4">Como está sua alma hoje?</h3>
            <p className="text-sm text-on-surface-variant opacity-70 leading-relaxed mb-8 italic">
              "Onde quer que você esteja, esteja lá por completo." 
              A espiritualidade no Sanctum é o silêncio necessário para ouvir o próprio progresso.
            </p>

            <div className="space-y-6">
              <div className="relative">
                <textarea 
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="Registre aqui um motivo de gratidão ou uma intenção hoje..."
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-3xl p-6 text-sm outline-none focus:border-primary/50 transition-all min-h-[120px] resize-none"
                />
                <button className="absolute bottom-4 right-4 p-3 bg-primary text-surface rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all">
                  <ArrowRight size={20} />
                </button>
              </div>

              <div className="flex flex-wrap gap-4">
                {[
                  { label: "Meditação Diária", time: "10 min" },
                  { label: "Leitura Edificante", time: "15 min" },
                  { label: "Oração / Reflexão", time: "Diário" }
                ].map((hab) => (
                  <button key={hab.label} className="flex items-center gap-3 px-6 py-3 bg-on-surface/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 rounded-full transition-all group">
                    <div className="w-2 h-2 rounded-full bg-primary/30 group-hover:bg-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{hab.label}</span>
                    <span className="text-[10px] opacity-30 font-mono">{hab.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Habits;
