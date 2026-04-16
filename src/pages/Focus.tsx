import React, { useState, useEffect, useRef } from "react";
import { Zap, Play, Pause, RotateCcw, Volume2, Maximize2, X, Music, Moon, Target, ShieldCheck, Clock, Settings, Bell, BellOff, VolumeX } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";

type FocusMode = {
  id: string;
  name: string;
  description: string;
  color: string;
  bgGradient: string;
  icon: any;
  allowNotifications: boolean;
  defaultMusic: string;
  audioUrl: string;
};

const FOCUS_MODES: FocusMode[] = [
  {
    id: "deep-work",
    name: "Deep Work",
    description: "Foco absoluto em tarefas de alto impacto. Notificações silenciadas.",
    color: "#a855f7",
    bgGradient: "from-purple-900/40 via-black to-black",
    icon: Zap,
    allowNotifications: false,
    defaultMusic: "Lofi Chill Beats",
    audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Ketsa/Raising_Frequency/Ketsa_-_04_-_Day_Trip.mp3"
  },
  {
    id: "personal",
    name: "Pessoal",
    description: "Tempo para você. Conexão equilibrada com o essencial.",
    color: "#5e9eff",
    bgGradient: "from-blue-900/40 via-black to-black",
    icon: Moon,
    allowNotifications: true,
    defaultMusic: "Ambient Minimalist",
    audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3"
  },
  {
    id: "health",
    name: "Saúde & Escrita",
    description: "Foco no bem-estar físico e mental. Alertas de pausa ativos.",
    color: "#00f5a0",
    bgGradient: "from-emerald-900/40 via-black to-black",
    icon: ShieldCheck,
    allowNotifications: true,
    defaultMusic: "Zen Meditation Ambient",
    audioUrl: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/P_C_III/Ad_Astra_Vol_1/P_C_III_-_01_-_Ad_Astra_-_Part_1.mp3"
  }
];

const FocusBackgroundEffects = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[100px]"
          style={{
            backgroundColor: color,
            width: Math.random() * 400 + 200,
            height: Math.random() * 400 + 200,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

const Focus = () => {
  const [activeMode, setActiveMode] = useState<FocusMode>(FOCUS_MODES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Pomodoro State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [pomodoroConfig, setPomodoroConfig] = useState({ work: 25, break: 5 });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeMode]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(pomodoroConfig.work * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isFullscreen ? 'fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center' : 'space-y-10'}`}>
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        src={activeMode.audioUrl}
        loop
      />

      {/* Background Effects */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-to-tr ${activeMode.bgGradient} transition-all duration-1000`}
          >
            <FocusBackgroundEffects color={activeMode.color} />
          </motion.div>
        )}
      </AnimatePresence>

      {!isFullscreen ? (
        <>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 opacity-60 mb-1">
                <Zap size={12} style={{ color: activeMode.color }} />
                <p className="editorial-label !tracking-[0.2em]">ESTADO DE IMERSÃO</p>
              </div>
              <h2 className="display-lg">Modo Foco</h2>
              <p className="text-sm opacity-50 mt-1">Configure o seu santuário particular para trabalho profundo.</p>
            </div>

            <button 
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-on-surface/[0.03] border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface/5 transition-all"
            >
              <Maximize2 size={16} /> Entrar em Tela Cheia
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">
            {/* Main Selector */}
            <div className="space-y-6">
              <h3 className="editorial-label opacity-40">ESCOLHER MODO DE FOCO</h3>
              <div className="grid grid-cols-1 gap-4">
                {FOCUS_MODES.map((mode) => (
                  <GlassCard 
                    key={mode.id}
                    onClick={() => {
                        setActiveMode(mode);
                        // If it's already playing, keep it playing with new source
                    }}
                    className={`p-6 cursor-pointer border-2 transition-all ${
                      activeMode.id === mode.id ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${mode.color}15`, color: mode.color }}>
                        <mode.icon size={32} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-lg font-bold">{mode.name}</h4>
                          <div className="flex items-center gap-2 opacity-50 text-[10px] font-bold uppercase">
                            {mode.allowNotifications ? <Bell size={12} /> : <BellOff size={12} />}
                            {mode.allowNotifications ? "Notificações On" : "Notificações Off"}
                          </div>
                        </div>
                        <p className="text-sm opacity-50">{mode.description}</p>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Config & Controls */}
            <div className="space-y-8">
              <GlassCard className="p-8">
                <h3 className="editorial-label opacity-40 mb-6 text-center">TIMER POMODORO</h3>
                <div className="text-center mb-10">
                   <div className="text-7xl font-mono font-bold tracking-tight mb-2">{formatTime(timeLeft)}</div>
                   <p className="text-[10px] opacity-40 font-bold tracking-[0.3em] uppercase">Sessão de Trabalho</p>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={resetTimer} className="p-4 rounded-full bg-on-surface/5 hover:bg-on-surface/10 transition-all">
                    <RotateCcw size={20} />
                  </button>
                  <button 
                    onClick={toggleTimer} 
                    className="w-20 h-20 rounded-full flex items-center justify-center bg-primary text-surface shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </button>
                  <button className="p-4 rounded-full bg-on-surface/5 hover:bg-on-surface/10 transition-all">
                    <Settings size={20} />
                  </button>
                </div>
              </GlassCard>

              <GlassCard className="p-6">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Music size={16} className="text-secondary" />
                      <h4 className="text-sm font-bold uppercase tracking-widest">Música Ambiente</h4>
                    </div>
                    <div className="flex items-center gap-4">
                       <button onClick={() => setIsMuted(!isMuted)} className="opacity-50 hover:opacity-100 transition-opacity">
                         {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                       </button>
                       <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    </div>
                 </div>
                 <div className="p-4 rounded-2xl bg-on-surface/5 flex items-center gap-4 group cursor-pointer hover:bg-on-surface/10 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                       <Music size={20} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                       <p className="text-sm font-bold truncate group-hover:text-secondary transition-colors">{activeMode.defaultMusic}</p>
                       <p className="text-[10px] opacity-40 uppercase tracking-tighter">Fluxo: Ativo</p>
                    </div>
                    <button onClick={() => setIsPlaying(!isPlaying)} className="p-2">
                       {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    </button>
                 </div>
              </GlassCard>
            </div>
          </div>
        </>
      ) : (
        /* FULLSCREEN MODE / SCREENSAVER */
        <div className="relative z-[110] w-full max-w-4xl mx-auto flex flex-col items-center text-center">
          <button 
            onClick={toggleFullscreen} 
            className="absolute -top-10 right-0 p-4 opacity-30 hover:opacity-100 transition-opacity"
          >
            <X size={32} />
          </button>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4 mb-16"
          >
            <div className="flex items-center justify-center gap-3 text-on-surface/40 uppercase tracking-[0.5em] font-bold text-xs">
              <activeMode.icon size={16} />
              {activeMode.name} Ativo
            </div>
            <h1 className="text-9xl md:text-[12rem] font-bold tracking-tighter font-mono">{formatTime(timeLeft)}</h1>
            <div className="h-1 w-64 bg-on-surface/5 rounded-full mx-auto overflow-hidden">
               <motion.div 
                 className="h-full bg-primary"
                 initial={{ width: 0 }}
                 animate={{ width: `${(timeLeft / (pomodoroConfig.work * 60)) * 100}%` }}
               />
            </div>
          </motion.div>

          {/* Pomodoro Progress Visualization */}
          <div className="flex items-center gap-12 text-on-surface/60">
             <div className="space-y-2">
               <p className="text-[10px] opacity-20 uppercase tracking-[0.3em]">TAREFA ATUAL</p>
               <h3 className="text-xl font-bold">Respirar e Focar</h3>
             </div>
             <div className="h-12 w-[1px] bg-on-surface/10" />
             <div className="space-y-2">
               <p className="text-[10px] opacity-20 uppercase tracking-[0.3em]">MÚSICA</p>
               <h3 className="text-xl font-bold flex items-center gap-2 justify-center">
                 {activeMode.defaultMusic}
                 {isPlaying && <div className="flex items-center gap-0.5 h-3"><div className="w-0.5 bg-secondary animate-[wave_1s_infinite]" style={{height: '60%'}}></div><div className="w-0.5 bg-secondary animate-[wave_1s_infinite_0.1s]" style={{height: '100%'}}></div><div className="w-0.5 bg-secondary animate-[wave_1s_infinite_0.2s]" style={{height: '80%'}}></div></div>}
               </h3>
             </div>
          </div>

          <div className="mt-20 flex items-center justify-center gap-12">
             <button onClick={() => setIsPlaying(!isPlaying)} className="p-4 rounded-full border border-on-surface/10 hover:bg-on-surface/5 transition-all">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
             </button>
             <button 
               onClick={toggleTimer}
               className="w-24 h-24 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/5 transition-all text-primary"
             >
               {isTimerRunning ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
             </button>
             <button onClick={resetTimer} className="p-4 rounded-full border border-on-surface/10 hover:bg-on-surface/5 transition-all">
                <RotateCcw size={24} />
             </button>
          </div>

          <p className="mt-16 text-[9px] opacity-20 uppercase tracking-[0.4em]">Santuário v2.0 · Foco Profundo</p>
        </div>
      )}
      <style>{`
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default Focus;
