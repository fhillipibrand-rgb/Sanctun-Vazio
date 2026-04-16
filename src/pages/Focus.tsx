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
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 group-hover:opacity-40 transition-opacity duration-1000">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-[200px]"
          style={{
            backgroundColor: color,
            width: Math.random() * 600 + 400,
            height: Math.random() * 600 + 400,
            left: `${Math.random() * 100 - 20}%`,
            top: `${Math.random() * 100 - 20}%`,
          }}
          animate={{
            x: [0, Math.random() * 200 - 100, 0],
            y: [0, Math.random() * 200 - 100, 0],
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: Math.random() * 20 + 30, // Much slower: 30s to 50s
            repeat: Infinity,
            ease: "easeInOut",
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
  const [volume, setVolume] = useState(0.5);
  const [musicSource, setMusicSource] = useState<'ambient' | 'spotify'>('ambient');
  const [spotifyUrl, setSpotifyUrl] = useState('https://open.spotify.com/playlist/37i9dQZF1DX8Ueb990JyS');
  
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
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  const formatSpotifyUrl = (url: string) => {
    try {
      if (!url) return "";
      if (url.includes('embed')) return url;
      const parts = url.split('/');
      const type = parts[parts.indexOf('open.spotify.com') + 1];
      const id = parts[parts.indexOf(type) + 1].split('?')[0];
      return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
    } catch (e) {
      return url;
    }
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
                      <h4 className="text-sm font-bold uppercase tracking-widest">Fonte de Áudio</h4>
                    </div>
                    <div className="flex bg-on-surface/5 p-1 rounded-full border border-[var(--glass-border)]">
                      <button 
                        onClick={() => setMusicSource('ambient')}
                        className={`px-3 py-1 text-[9px] font-bold rounded-full transition-all ${musicSource === 'ambient' ? 'bg-primary text-surface' : 'opacity-40 hover:opacity-100'}`}
                      >
                        AMBIENTE
                      </button>
                      <button 
                        onClick={() => setMusicSource('spotify')}
                        className={`px-3 py-1 text-[9px] font-bold rounded-full transition-all ${musicSource === 'spotify' ? 'bg-[#1DB954] text-white' : 'opacity-40 hover:opacity-100'}`}
                      >
                        SPOTIFY
                      </button>
                    </div>
                 </div>

                 {musicSource === 'ambient' ? (
                   <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="flex items-center gap-2 group/vol">
                             <Volume2 size={14} className="opacity-40 group-hover/vol:opacity-100 transition-opacity" />
                             <input 
                               type="range" 
                               min="0" 
                               max="1" 
                               step="0.01" 
                               value={volume} 
                               onChange={(e) => setVolume(parseFloat(e.target.value))}
                               className="w-20 h-1 bg-on-surface/10 rounded-full appearance-none cursor-pointer accent-primary"
                             />
                           </div>
                           <button onClick={() => setIsMuted(!isMuted)} className="opacity-50 hover:opacity-100 transition-opacity">
                             {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
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
                   </div>
                 ) : (
                   <div className="space-y-4">
                     <div className="flex flex-col gap-2">
                        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest pl-1">Link da Playlist/Álbum</label>
                        <input 
                          type="text" 
                          value={spotifyUrl}
                          onChange={(e) => setSpotifyUrl(e.target.value)}
                          placeholder="Cole o link do Spotify aqui..."
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-2 px-3 text-[10px] outline-none focus:border-[#1DB954]/50 transition-all font-mono"
                        />
                     </div>
                     <div className="rounded-2xl overflow-hidden bg-black/40 h-40">
                        <iframe 
                          src={formatSpotifyUrl(spotifyUrl)} 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                          loading="lazy"
                        ></iframe>
                     </div>
                     <p className="text-[8px] opacity-20 text-center italic">Nota: Use sua conta Spotify no navegador para ouvir a música completa.</p>
                   </div>
                 )}
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
            className="space-y-4 mb-12"
          >
            <div className="flex items-center justify-center gap-3 text-on-surface/40 uppercase tracking-[0.5em] font-bold text-xs">
              <activeMode.icon size={16} />
              {activeMode.name} Ativo
            </div>
            <h1 className="text-9xl md:text-[12rem] font-bold tracking-tighter font-mono">{formatTime(timeLeft)}</h1>
          </motion.div>

          {/* Integration View (Ambient vs Spotify) */}
          <div className="w-full max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="text-left space-y-6">
                <div className="space-y-2">
                  <p className="text-[10px] opacity-20 uppercase tracking-[0.3em]">MODO DE IMERSÃO</p>
                  <h3 className="text-2xl font-bold opacity-60">Santuário v2.0</h3>
                </div>
                
                {musicSource === 'ambient' ? (
                  <div className="space-y-8">
                    <div className="flex items-center gap-12">
                      <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 rounded-full border border-on-surface/10 flex items-center justify-center hover:bg-on-surface/5 transition-all outline-none">
                         {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                      </button>
                      <div className="space-y-2 flex-1">
                         <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">{activeMode.defaultMusic}</h4>
                            <Volume2 size={12} className="opacity-20" />
                         </div>
                         <input 
                           type="range" 
                           min="0" 
                           max="1" 
                           step="0.01" 
                           value={volume} 
                           onChange={(e) => setVolume(parseFloat(e.target.value))}
                           className="w-full h-1 bg-on-surface/10 rounded-full appearance-none cursor-pointer accent-primary"
                         />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-on-surface/10 shadow-2xl h-48 group">
                    <iframe 
                        src={formatSpotifyUrl(spotifyUrl)} 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                        loading="lazy"
                    ></iframe>
                  </div>
                )}
             </div>

             <div className="flex flex-col items-center gap-6">
               <button 
                 onClick={toggleTimer}
                 className="w-32 h-32 rounded-full border-2 border-primary flex items-center justify-center hover:bg-primary/5 transition-all text-primary group"
               >
                 {isTimerRunning ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
               </button>
               <button onClick={resetTimer} className="text-[10px] opacity-30 hover:opacity-100 transition-opacity uppercase tracking-[0.3em] font-bold">Reiniciar Timer</button>
             </div>
          </div>

          <p className="mt-16 text-[9px] opacity-20 uppercase tracking-[0.4em] font-mono">Respirar · Focar · Executar</p>
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
