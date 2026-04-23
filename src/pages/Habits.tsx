import React, { useState, useEffect } from "react";
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
  Layout,
  Loader2,
  History,
  TrendingUp,
  Dumbbell,
  X,
  BookOpen
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import SpiritualJournalModal from "../components/modals/SpiritualJournalModal";
import WorkoutLogModal from "../components/modals/WorkoutLogModal";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const Habits = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exerciseDone, setExerciseDone] = useState(false);
  const [gratitude, setGratitude] = useState("");
  const [sleepTimes, setSleepTimes] = useState({ wake: "07:00", sleep: "23:00", quality: 85 });
  const [reading, setReading] = useState({ title: "Meditações - Marco Aurélio", progress: 45, total: 320 });
  const [history, setHistory] = useState<Record<string, boolean[]>>({
    sleep: [false, false, false, false, false, false, false],
    exercise: [false, false, false, false, false, false, false],
    reading: [false, false, false, false, false, false, false]
  });
  const [spiritualityLogs, setSpiritualityLogs] = useState<any[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [readingLogs, setReadingLogs] = useState<any[]>([]);
  const [showJournal, setShowJournal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showSleepHistory, setShowSleepHistory] = useState(false);
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  const [saving, setSaving] = useState(false);

  const readingProgress = (reading.progress / reading.total) * 100;

  useEffect(() => {
    if (user) fetchHabits();
  }, [user]);

  const fetchHabits = async () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    
    // Busca logs de hoje
    const { data: todayLogs } = await supabase.from('habits_logs').select('*').eq('date', today);
    if (todayLogs) {
      todayLogs.forEach(log => {
        if (log.type === 'sleep') setSleepTimes(log.value);
        if (log.type === 'reading') setReading(log.value);
        if (log.type === 'gratitude') setGratitude(log.value.text);
        if (log.type === 'exercise') setExerciseDone(log.value.done);
      });
    }

    // Busca histórico dos últimos 7 dias para a grid de consistência
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data: histLogs } = await supabase
      .from('habits_logs')
      .select('type, date, value')
      .gte('date', sevenDaysAgo.toISOString().split('T')[0]);

    if (histLogs) {
      const newHist: Record<string, boolean[]> = { sleep: [], exercise: [], reading: [] };
      const types = ['sleep', 'exercise', 'reading'];
      
      types.forEach(type => {
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          const found = histLogs.find(l => l.type === type && l.date === dStr);
          
          if (type === 'exercise') newHist[type].push(!!found?.value?.done);
          else newHist[type].push(!!found);
        }
      });
      setHistory(newHist);
    }

    // Busca todos os registros para histórico
    const { data: allLogs } = await supabase
      .from('habits_logs')
      .select('type, date, value')
      .order('date', { ascending: false });

    if (allLogs) {
      setSpiritualityLogs(allLogs.filter(l => l.type === 'gratitude'));
      setWorkoutLogs(allLogs.filter(l => l.type === 'exercise'));
      setSleepLogs(allLogs.filter(l => l.type === 'sleep'));
      setReadingLogs(allLogs.filter(l => l.type === 'reading'));
    }

    setLoading(false);
  };

  const saveHabit = async (type: string, value: any) => {
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('habits_logs').upsert({
      user_id: user?.id,
      type,
      value,
      date: today
    }, { onConflict: 'user_id,type,date' });

    setSaving(false);
    if (error) {
       console.error("Erro ao salvar hábito:", error.message);
       window.alert(`ERRO AO SALVAR HÁBITO: ${error.message}\n\nDica: Rode o script SQL 'setup_all_tables.sql' para garantir que a tabela 'habits_logs' existe.`);
    } else {
       fetchHabits(); // Recarregar para atualizar a grid e o histórico
    }
  };

  const ConsistencyGrid = ({ data, color }: { data: boolean[], color: string }) => (
    <div className="flex gap-1.5 mt-4">
      {data.map((done, i) => (
        <div 
          key={i} 
          className={`w-2.5 h-2.5 rounded-sm transition-all duration-500 ${done ? '' : 'bg-on-surface/10'}`}
          style={{ 
            backgroundColor: done ? color : undefined,
            boxShadow: done ? `0 0 8px ${color}40` : 'none',
            opacity: 0.2 + (i * 0.13), // Mais opaco conforme chega no hoje
            border: i === 6 ? `1px solid ${color}` : 'none' // Destaque para o dia de hoje
          }}
          title={i === 6 ? "Hoje" : `${6-i} dias atrás`}
        />
      ))}
    </div>
  );

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

      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-30 editorial-label animate-pulse">SINCRONIZANDO ROTINA...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Rotina de Sono */}
          <GlassCard className="p-8 border-primary/20 relative overflow-hidden group col-span-1 lg:col-span-1">
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:rotate-12 transition-transform duration-700">
              <Moon size={140} className="text-primary" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between text-primary mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl"><Moon size={20} /></div>
                  <span className="editorial-label font-bold tracking-widest text-[10px]">ROTINA DE SONO</span>
                </div>
                <div className="flex items-center gap-3">
                   <ConsistencyGrid data={history.sleep} color="var(--color-primary)" />
                   <button 
                     onClick={() => setShowSleepHistory(true)}
                     className="p-1.5 bg-on-surface/5 hover:bg-on-surface/10 rounded-lg text-primary transition-all"
                   >
                     <History size={14} />
                   </button>
                </div>
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
                        onChange={(e) => {
                          const newSleep = {...sleepTimes, wake: e.target.value};
                          setSleepTimes(newSleep);
                          saveHabit('sleep', newSleep);
                        }}
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
                        onChange={(e) => {
                          const newSleep = {...sleepTimes, sleep: e.target.value};
                          setSleepTimes(newSleep);
                          saveHabit('sleep', newSleep);
                        }}
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
                  <div className="mt-2 h-1.5 w-full bg-on-surface/5 rounded-full overflow-hidden flex gap-0.5">
                    {/* Visualizador de tendência dos últimos 7 dias */}
                    {[...history.sleep].map((done, i) => {
                      const log = [...sleepLogs].reverse().find(l => l.date === new Date(Date.now() - (6-i)*86400000).toISOString().split('T')[0]);
                      const quality = log?.value?.quality || 0;
                      return (
                        <div 
                          key={i} 
                          className="flex-1 bg-primary/10 relative group"
                        >
                          <div 
                            className="absolute bottom-0 w-full bg-primary transition-all duration-1000" 
                            style={{ height: `${quality}%`, opacity: 0.3 + (i * 0.1) }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Exercício Físico */}
          <div className="space-y-6 flex flex-col">
            <GlassCard 
              className={`p-8 transition-all duration-500 overflow-hidden relative flex-1 group/v ${exerciseDone ? 'bg-primary/10 border-primary/30' : 'hover:bg-on-surface/5 border-transparent'}`} 
            >
              <div className="absolute -right-6 -bottom-6 opacity-5 group-hover/v:scale-110 transition-transform duration-700">
                <ExerciseIcon size={120} className="text-primary" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between text-primary mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-primary text-surface shadow-lg shadow-primary/20">
                      <ExerciseIcon size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-0.5">VITALIDADE</p>
                      <p className="font-bold text-sm tracking-tight">EXERCÍCIO DO DIA</p>
                    </div>
                  </div>
                  <ConsistencyGrid data={history.exercise} color="var(--color-primary)" />
                </div>
                
                <div className="flex-1 flex flex-col justify-center text-center py-6">
                  <h3 className="text-3xl font-bold tracking-tighter mb-2">{exerciseDone ? "TREINO PAGO!" : "AINDA NÃO TREINOU"}</h3>
                  <p className="text-xs opacity-50 px-4 mb-6">{exerciseDone ? "Sua sessão de hoje foi registrada com sucesso." : "Hoje o corpo pede movimento. Inicie sua sessão."}</p>
                  
                  <div className="flex gap-3 justify-center">
                    <button 
                      onClick={() => {
                        const newDone = !exerciseDone;
                        setExerciseDone(newDone);
                        saveHabit('exercise', { done: newDone, exercises: [] });
                      }}
                      className={`px-6 py-2 rounded-full text-[10px] font-bold border transition-all ${exerciseDone ? 'bg-primary text-surface border-primary' : 'border-primary/30 text-primary hover:bg-primary/5'}`}
                    >
                      {exerciseDone ? "CONCLUÍDO" : "MARCAR COMO FEITO"}
                    </button>
                    <button 
                      onClick={() => setShowWorkoutModal(true)}
                      className="px-6 py-2 rounded-full bg-on-surface/10 text-[10px] font-bold hover:bg-on-surface/20 transition-all flex items-center gap-2"
                    >
                      <Dumbbell size={12} /> LOG DETALHADO
                    </button>
                  </div>
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
              <div className="flex items-center justify-between text-secondary mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-xl"><Book size={20} /></div>
                  <span className="editorial-label font-bold tracking-widest text-[10px]">LEITURA & CONHECIMENTO</span>
                </div>
                <div className="flex items-center gap-3">
                   <ConsistencyGrid data={history.reading} color="var(--color-secondary)" />
                   <button 
                     onClick={() => setShowReadingHistory(true)}
                     className="p-1.5 bg-on-surface/5 hover:bg-on-surface/10 rounded-lg text-secondary transition-all"
                   >
                     <History size={14} />
                   </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest mb-2">LENDO AGORA</p>
                <input 
                  type="text"
                  value={reading.title}
                  onChange={(e) => {
                    const newR = {...reading, title: e.target.value};
                    setReading(newR);
                    saveHabit('reading', newR);
                  }}
                  className="bg-transparent text-xl font-bold tracking-tight mb-1 outline-none w-full"
                />
              </div>

              <div className="space-y-2 mt-auto">
                <div className="flex justify-between items-end text-[10px] font-bold">
                  <span className="opacity-40 uppercase tracking-widest">PROGRESSO</span>
                  <span className="text-secondary">{Math.round(readingProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${readingProgress}%` }} className="h-full bg-secondary" />
                </div>
                <div className="flex justify-between text-xs font-mono mt-2">
                  <input 
                    type="number"
                    value={reading.progress}
                    onChange={(e) => {
                      const newR = {...reading, progress: parseInt(e.target.value) || 0};
                      setReading(newR);
                      saveHabit('reading', newR);
                    }}
                    className="w-16 bg-on-surface/5 rounded px-2"
                  />
                  <span>/ {reading.total} PG</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Espiritualidade - Deep Section */}
          <GlassCard orb className="p-8 lg:col-span-3 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group mt-6">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-1000">
              <Sprout size={300} className="text-primary" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-primary">
                  <div className="p-2 bg-primary/10 rounded-xl"><Sparkles size={20} /></div>
                  <span className="editorial-label font-bold tracking-widest text-[10px]">ESPIRITUALIDADE & INTROSPECÇÃO</span>
                </div>
                <button 
                  onClick={() => setShowJournal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 text-[10px] font-bold text-primary hover:bg-primary/5 transition-all"
                >
                  <History size={14} />
                  HISTÓRICO
                </button>
              </div>
              
              <h3 className="text-2xl font-bold tracking-tight mb-4">Como está sua alma hoje?</h3>
              <p className="text-sm text-on-surface-variant opacity-70 leading-relaxed mb-8 italic">
                Registre aqui um motivo de gratidão ou uma intenção hoje...
              </p>

              <div className="relative">
                <textarea 
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  onBlur={() => saveHabit('gratitude', { text: gratitude })}
                  placeholder="Hoje sou grato por..."
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-3xl p-6 text-sm outline-none focus:border-primary/50 transition-all min-h-[120px] resize-none"
                />
                <button 
                  onClick={() => saveHabit('gratitude', { text: gratitude })} 
                  disabled={saving || !gratitude.trim()}
                  className="absolute bottom-4 right-4 p-3 bg-primary text-surface rounded-2xl shadow-lg shadow-primary/20 hover:scale-110 active:scale-90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                </button>
              </div>
            </div>
          </GlassCard>

          <SpiritualJournalModal 
            isOpen={showJournal} 
            onClose={() => setShowJournal(false)} 
            logs={spiritualityLogs} 
          />

          <WorkoutLogModal 
            isOpen={showWorkoutModal}
            onClose={() => setShowWorkoutModal(false)}
            onSave={(workout) => {
              setExerciseDone(true);
              saveHabit('exercise', { done: true, ...workout });
            }}
          />

          {/* Modal de Histórico de Sono */}
          <AnimatePresence>
            {showSleepHistory && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                  <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-primary" />
                      <h3 className="text-xl font-bold">Histórico de Sono</h3>
                    </div>
                    <button onClick={() => setShowSleepHistory(false)} className="p-2 hover:bg-on-surface/10 rounded-full"><X /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {sleepLogs.map((log, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-on-surface/5 border border-[var(--glass-border)] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold opacity-40 uppercase">{new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                          <p className="font-bold">{log.value.wake} - {log.value.sleep}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary">{log.value.quality}%</p>
                          <div className="w-20 h-1 bg-on-surface/10 rounded-full mt-1">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${log.value.quality}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}
          </AnimatePresence>

          {/* Modal de Histórico de Leitura */}
          <AnimatePresence>
            {showReadingHistory && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
                <GlassCard className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0 border-secondary/30">
                  <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-secondary/5">
                    <div className="flex items-center gap-3">
                      <BookOpen size={20} className="text-secondary" />
                      <h3 className="text-xl font-bold">Registro de Conhecimento</h3>
                    </div>
                    <button onClick={() => setShowReadingHistory(false)} className="p-2 hover:bg-on-surface/10 rounded-full"><X /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {readingLogs.map((log: any, i: number) => (
                      <div key={i} className="p-4 rounded-2xl bg-on-surface/5 border border-[var(--glass-border)] flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold opacity-40 uppercase">{new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                          <p className="font-bold">{log.value.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-secondary">{log.value.progress} / {log.value.total} pg</p>
                          <div className="w-20 h-1 bg-on-surface/10 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-secondary rounded-full" style={{ width: `${(log.value.progress/log.value.total)*100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
    </div>
  );
};

export default Habits;
