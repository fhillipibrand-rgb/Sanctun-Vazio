import React, { useState, useEffect, useRef } from "react";
import { Zap, Play, Pause, RotateCcw, Volume2, Maximize2, X, Music, Moon, Target, ShieldCheck, Clock, Settings, Bell, BellOff, VolumeX, SkipBack, SkipForward, ChevronDown, ChevronUp, CheckCircle2, Wallet, Heart, Search, Check, Plus, AlertCircle } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import AtmosphereBackground from "../components/ui/AtmosphereBackground";
import { useLayout } from "../components/layout/Layout";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

type FocusModeId = "deep-work" | "creative" | "routine";

type FocusMode = {
  id: FocusModeId;
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: any;
  defaultMusicId: string;
  notificationCategories: string[];
};

const AMBIENT_PLAYLIST = [
  { id: 'rain', name: 'Chuva na Floresta', genre: 'Natureza', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
  { id: 'forest', name: 'Sinfonia da Mata', genre: 'Natureza', url: 'https://assets.mixkit.co/active_storage/sfx/1203/1203-preview.mp3' },
  { id: 'zen', name: 'Meditação Profunda', genre: 'Zen', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/P_C_III/Ad_Astra_Vol_1/P_C_III_-_01_-_Ad_Astra_-_Part_1.mp3' },
  { id: 'electro', name: 'Electro Relax', genre: 'Chill', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3' },
  { id: 'lofi', name: 'Lofi Deep Focus', genre: 'Lofi', url: 'https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Ketsa/Raising_Frequency/Ketsa_-_04_-_Day_Trip.mp3' },
  { id: 'waves', name: 'Ondas do Oceano', genre: 'Natureza', url: 'https://assets.mixkit.co/active_storage/sfx/1126/1126-preview.mp3' },
];

const FOCUS_MODES: FocusMode[] = [
  { id: "deep-work", name: "O Vácuo", description: "Foco absoluto em tarefas críticas de alto impacto.", color: "#a855f7", bgGradient: "from-purple-900/40 via-black to-black", icon: Zap, defaultMusicId: "lofi", notificationCategories: ["tasks"] },
  { id: "creative", name: "O Éter", description: "Fluxo criativo e execução de projetos de longa duração.", color: "#3b82f6", bgGradient: "from-blue-900/40 via-black to-black", icon: Music, defaultMusicId: "electro", notificationCategories: ["tasks", "finance"] },
  { id: "routine", name: "O Solo", description: "Equilíbrio, hábitos e bem-estar essencial.", color: "#10b981", bgGradient: "from-emerald-900/40 via-black to-black", icon: ShieldCheck, defaultMusicId: "zen", notificationCategories: ["health", "tasks"] }
];

const TaskSelector = ({ isOpen, onClose, tasks, onSelect, selectedId, searchQuery, onSearchChange, activeModeId }: any) => {
  if (!isOpen) return null;

  const filteredTasks = tasks.filter((t: any) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeModeId === "deep-work") return t.priority === "high" || t.priority === "critical";
    if (activeModeId === "routine") return t.category === "Saúde" || t.category === "Hábitos" || !t.project_id;
    return true;
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md" onClick={onClose}>
      <GlassCard className="w-full max-w-lg p-8 space-y-6" orb onClick={(e: any) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold uppercase tracking-widest">Definir Alvo: {activeModeId === "deep-work" ? "Prioridades" : "Geral"}</h3>
          <button onClick={onClose} className="p-2 opacity-40 hover:opacity-100 transition-opacity"><X size={20} /></button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <input type="text" placeholder="Buscar tarefa..." value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full bg-on-surface/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium outline-none focus:border-primary/30 transition-all" autoFocus />
        </div>
        <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-2">
          {filteredTasks.length > 0 ? filteredTasks.map((task: any) => (
            <button key={task.id} onClick={() => { onSelect(task.id); onClose(); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${selectedId === task.id ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-on-surface/5 border-transparent hover:bg-on-surface/10'}`}>
              <div className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : 'bg-primary'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{task.title}</p>
                <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">{task.project_id ? "Projeto Vinculado" : "Tarefa Individual"}</p>
              </div>
              {selectedId === task.id && <Check size={18} />}
            </button>
          )) : <div className="py-12 text-center opacity-30 uppercase text-xs">Nenhuma tarefa compatível</div>}
        </div>
      </GlassCard>
    </motion.div>
  );
};

const SessionCompleteModal = ({ results, onClose, onCompleteTask }: any) => {
  if (!results) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
      <GlassCard className="w-full max-w-md p-8 text-center space-y-8" orb>
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto"><Zap size={40} /></div>
        <div><h3 className="text-2xl font-bold mb-2">Sessão Concluída!</h3><p className="text-sm opacity-50">Você focou em: <br/><span className="text-on-surface font-bold">{results.taskTitle}</span></p></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-on-surface/5 rounded-2xl border border-white/5"><p className="text-[10px] font-bold opacity-40 uppercase mb-1">Eficiência</p><p className="text-2xl font-bold text-primary">{results.efficiency}%</p></div>
          <div className="p-4 bg-on-surface/5 rounded-2xl border border-white/5"><p className="text-[10px] font-bold opacity-40 uppercase mb-1">Interrupções</p><p className="text-2xl font-bold">{results.interruptions}</p></div>
        </div>
        <div className="space-y-3">
          <button onClick={handleCompleteTask} className="w-full py-4 rounded-2xl bg-primary text-surface font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all">Concluir Tarefa e Sair</button>
          <button onClick={onClose} className="w-full py-4 rounded-2xl bg-on-surface/5 font-bold text-[10px] uppercase opacity-40">Apenas Fechar</button>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const Focus = () => {
  const { user } = useAuth();
  const { isSidebarOpen, isMobile } = useLayout();
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() => localStorage.getItem('sanctum_focus_task_id'));
  const [searchQuery, setSearchQuery] = useState("");
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [sessionResults, setSessionResults] = useState<any>(null);
  const [modes, setModes] = useState<FocusMode[]>(FOCUS_MODES);
  const [activeMode, setActiveMode] = useState<FocusMode>(FOCUS_MODES[0]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pomodoroConfig, setPomodoroConfig] = useState({ work: 25, break: 5 });
  const [activeTrack, setActiveTrack] = useState(AMBIENT_PLAYLIST[0]);
  const [musicSource, setMusicSource] = useState<'ambient' | 'spotify'>('ambient');
  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      const { data } = await supabase.from('tasks').select('*').eq('is_completed', false).order('priority', { ascending: false });
      if (data) setTasks(data);
    };
    fetchTasks();
  }, [user]);

  useEffect(() => {
    if (selectedTaskId) localStorage.setItem('sanctum_focus_task_id', selectedTaskId);
    else localStorage.removeItem('sanctum_focus_task_id');
  }, [selectedTaskId]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      if (!isBreakMode) {
        setSessionResults({ efficiency: Math.max(20, 100 - interruptions * 10), interruptions, duration: pomodoroConfig.work, taskTitle: tasks.find(t => t.id === selectedTaskId)?.title || "Foco Geral" });
      }
      if (alarmRef.current) alarmRef.current.play();
      const nextMode = !isBreakMode;
      setIsBreakMode(nextMode);
      setTimeLeft(nextMode ? pomodoroConfig.break * 60 : pomodoroConfig.work * 60);
      setInterruptions(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning, timeLeft, isBreakMode, interruptions, pomodoroConfig, selectedTaskId, tasks]);

  const handleCompleteTask = async () => {
    if (!selectedTaskId) return;
    const { error } = await supabase.from('tasks').update({ is_completed: true, completed_at: new Date().toISOString() }).eq('id', selectedTaskId);
    if (!error) {
      setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
      setSelectedTaskId(null);
      setSessionResults(null);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => { setIsTimerRunning(false); setIsBreakMode(false); setTimeLeft(pomodoroConfig.work * 60); setInterruptions(0); };
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      <AtmosphereBackground mode={activeMode.id} />
      
      <audio ref={alarmRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
      {musicSource === 'ambient' && activeTrack && <audio ref={audioRef} src={activeTrack.url} loop />}

      <AnimatePresence>
        {sessionResults && <SessionCompleteModal results={sessionResults} onClose={() => setSessionResults(null)} onCompleteTask={handleCompleteTask} />}
        {isTaskSelectorOpen && (
          <TaskSelector 
            isOpen={isTaskSelectorOpen} 
            onClose={() => setIsTaskSelectorOpen(false)} 
            tasks={tasks} 
            onSelect={setSelectedTaskId} 
            selectedId={selectedTaskId} 
            searchQuery={searchQuery} 
            onSearchChange={setSearchQuery} 
            activeModeId={activeMode.id}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFullscreen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex flex-col items-center justify-center text-center space-y-8 bg-black/40 backdrop-blur-sm">
            <button onClick={toggleFullscreen} className="absolute top-10 right-10 p-4 opacity-30 hover:opacity-100 text-white"><X size={32} /></button>
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.5em] opacity-40 text-primary">{isBreakMode ? 'Descanso' : activeMode.name}</p>
              <h1 className="text-9xl md:text-[15rem] font-bold font-mono tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">{formatTime(timeLeft)}</h1>
              {selectedTaskId && !isBreakMode && <p className="text-sm font-bold uppercase tracking-widest text-primary opacity-60">Focando em: {tasks.find(t => t.id === selectedTaskId)?.title}</p>}
            </div>
            <div className="flex items-center gap-8">
              <button onClick={toggleTimer} className="w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center hover:bg-white/5 transition-all text-white">
                {isTimerRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFullscreen && (
        <div className={`relative z-10 p-6 md:p-10 lg:p-16 space-y-12 transition-all duration-300 ${!isSidebarOpen && !isMobile ? 'md:pl-32' : ''}`}>
          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 opacity-60 mb-1"><Zap size={12} style={{ color: activeMode.color }} /><p className="editorial-label text-[10px] uppercase tracking-widest">Santuário Ativo</p></div>
              <h2 className="text-4xl font-bold text-white">Modo Foco</h2>
            </div>
            <button onClick={toggleFullscreen} className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-white hover:bg-white/10 transition-all"><Maximize2 size={16} /> Entrar em Imersão</button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-12">
            <div className="space-y-8">
              <div className="space-y-1">
                <h3 className="editorial-label text-[10px] opacity-40 uppercase tracking-[0.3em] text-white">Escolha sua Atmosfera</h3>
                <p className="text-[10px] opacity-20 uppercase font-bold tracking-widest">Defina a vibração do seu espaço de trabalho</p>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {modes.map(mode => (
                  <motion.div key={mode.id} whileHover={{ x: 10 }} className="relative group">
                    <GlassCard onClick={() => setActiveMode(mode)} className={`p-8 cursor-pointer border-2 transition-all relative overflow-hidden h-full ${activeMode.id === mode.id ? 'border-primary shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.1)]' : 'border-white/5 hover:border-white/20'}`}>
                      <div className={`absolute top-0 left-0 w-1 h-full transition-all duration-500 ${activeMode.id === mode.id ? 'bg-primary' : 'bg-transparent'}`} />
                      <div className="flex items-start gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[10deg] shrink-0" style={{ backgroundColor: `${mode.color}15`, color: mode.color, boxShadow: activeMode.id === mode.id ? `0 0 30px ${mode.color}30` : 'none' }}>
                          <mode.icon size={32} />
                        </div>
                        <div className="space-y-2">
                          <h4 className={`text-xl font-bold transition-colors ${activeMode.id === mode.id ? 'text-white' : 'text-white/60'}`}>{mode.name}</h4>
                          <p className="text-xs leading-relaxed opacity-40 text-white group-hover:opacity-60 transition-opacity">{mode.description}</p>
                          {activeMode.id === mode.id && (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 pt-2">
                              <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                              <span className="text-[9px] font-bold uppercase tracking-widest text-primary">Santuário Ativo</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="editorial-label text-[10px] opacity-40 uppercase tracking-[0.3em] text-white">O Alvo da Intenção</h3>
                <button onClick={() => setIsTaskSelectorOpen(true)} className="w-full p-8 rounded-[40px] bg-white/[0.03] border border-white/5 hover:border-primary/30 hover:bg-white/[0.06] transition-all text-left group relative overflow-hidden">
                  {selectedTaskId ? (
                    <div className="flex items-center justify-between text-white relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-lg shadow-primary/20"><Target size={24} /></div>
                        <div>
                          <p className="text-lg font-bold truncate max-w-[300px] group-hover:text-primary transition-colors">{tasks.find(t => t.id === selectedTaskId)?.title}</p>
                          <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Compromisso de Imersão</p>
                        </div>
                      </div>
                      <X size={16} className="opacity-20 hover:opacity-100" onClick={(e) => { e.stopPropagation(); setSelectedTaskId(null); }} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-6 opacity-40 text-white relative z-10 group-hover:opacity-100 transition-all">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all"><Plus size={24} /></div>
                      <div>
                        <p className="text-lg font-bold uppercase tracking-widest">Definir Propósito</p>
                        <p className="text-[10px] opacity-60">Escolha o desafio para este ciclo de foco</p>
                      </div>
                    </div>
                  )}
                </button>
              </div>

              <GlassCard className="p-12 text-center relative overflow-hidden border-white/10 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-primary animate-pulse' : 'bg-white/20'}`} />
                    <h3 className="editorial-label text-[10px] opacity-40 uppercase tracking-[0.4em] text-white">Cronômetro de Cristal</h3>
                  </div>
                  <button onClick={() => setShowSettings(!showSettings)} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all"><Settings size={18} /></button>
                </div>
                <div className="relative py-4">
                  <AnimatePresence>
                    {isTimerRunning && (
                      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.05, 0.1, 0.05] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-full bg-primary blur-[60px]" />
                    )}
                  </AnimatePresence>
                  <div className="relative z-10 space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-primary drop-shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]">{isBreakMode ? 'MOMENTO DE RESPIRAR' : activeMode.name.toUpperCase()}</p>
                    <h1 className="text-8xl font-bold font-mono tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">{formatTime(timeLeft)}</h1>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-8 mt-12">
                  <button onClick={resetTimer} className="p-5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"><RotateCcw size={24} /></button>
                  <button onClick={toggleTimer} className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 ${isBreakMode ? 'bg-[#00f5a0] text-black shadow-[#00f5a0]/30' : 'bg-primary text-white shadow-primary/40'}`}>
                    {isTimerRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                  </button>
                  <button onClick={() => { setInterruptions(prev => prev + 1); }} className="p-5 rounded-full bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all" title="Log de Interrupção"><AlertCircle size={24} /></button>
                </div>
                {interruptions > 0 && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-[10px] font-bold text-red-400 uppercase tracking-[0.2em]">{interruptions} FOCO INTERROMPIDO</motion.p>}
              </GlassCard>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Focus;
