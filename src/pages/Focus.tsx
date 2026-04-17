import React, { useState, useEffect, useRef } from "react";
import { Zap, Play, Pause, RotateCcw, Volume2, Maximize2, X, Music, Moon, Target, ShieldCheck, Clock, Settings, Bell, BellOff, VolumeX, SkipBack, SkipForward, ChevronDown, ChevronUp } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

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
              duration: Math.random() * 20 + 30,
              repeat: Infinity,
              ease: "easeInOut",
            }}
        />
      ))}
    </div>
  );
};

const SPOTIFY_CLIENT_ID = "e017a24e45534327b58bb895137bda8f";
const REDIRECT_URI = typeof window !== 'undefined' && window.location.origin.includes('localhost') 
  ? "http://localhost:5173/callback" 
  : "https://sanctun-vazio.vercel.app/callback";

const Focus = () => {
  const [activeMode, setActiveMode] = useState<FocusMode>(FOCUS_MODES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [musicSource, setMusicSource] = useState<'ambient' | 'spotify'>(() => {
    if (typeof window === 'undefined') return 'ambient';
    return (localStorage.getItem('sanctum_music_source') as 'ambient' | 'spotify') || 'ambient';
  });
  const [spotifyUrl, setSpotifyUrl] = useState(() => {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('sanctum_spotify_url') || 'https://open.spotify.com/playlist/37i9dQZF1DX8Ueb990JyS';
  });

  // Spotify SDK State
  const [spotifyToken, setSpotifyToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem("spotify_access_token");
  });
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  
  // Pomodoro State
  const [pomodoroConfig, setPomodoroConfig] = useState(() => {
    const saved = localStorage.getItem('sanctum_pomodoro_config');
    return saved ? JSON.parse(saved) : { work: 25, break: 5 };
  });
  const getSavedFocusState = () => {
    try {
      const saved = localStorage.getItem('sanctum_active_focus');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };

  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    const state = getSavedFocusState();
    return state ? state.isRunning : false;
  });
  
  const [isBreakMode, setIsBreakMode] = useState(() => {
    const state = getSavedFocusState();
    return state ? state.isBreak : false;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const state = getSavedFocusState();
    if (state && state.timeLeft !== undefined) {
       if (state.isRunning && state.targetEndTime) {
           const remaining = Math.max(0, Math.floor((state.targetEndTime - Date.now()) / 1000));
           return remaining;
       }
       return state.timeLeft;
    }
    return pomodoroConfig.work * 60;
  });

  const [showSettings, setShowSettings] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (window as any).__focusMounted = true;
    return () => { (window as any).__focusMounted = false; };
  }, []);

  // Load Spotify SDK
  useEffect(() => {
    if (musicSource === 'spotify' && spotifyToken) {
      if (!window.Spotify) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        const newPlayer = new window.Spotify.Player({
          name: 'Sanctum v2 Player',
          getOAuthToken: cb => { cb(spotifyToken); },
          volume: volume
        });

        newPlayer.addListener('ready', ({ device_id }) => {
          setDeviceId(device_id);
        });

        newPlayer.addListener('player_state_changed', state => {
          if (!state) return;
          setCurrentTrack(state.track_window.current_track);
          setIsPlaying(!state.paused);
        });

        newPlayer.connect();
        setPlayer(newPlayer);
      };
    }
    
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [spotifyToken, musicSource]);

  // Sync Volume
  useEffect(() => {
    if (player) player.setVolume(volume);
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume, player]);

  // Sync Mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Ambient Audio Control
  useEffect(() => {
    if (audioRef.current && musicSource === 'ambient') {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeMode, musicSource]);

  // Persist State
  useEffect(() => {
    localStorage.setItem('sanctum_music_source', musicSource);
    localStorage.setItem('sanctum_spotify_url', spotifyUrl);
    localStorage.setItem('sanctum_pomodoro_config', JSON.stringify(pomodoroConfig));
  }, [musicSource, spotifyUrl, pomodoroConfig]);

  // Persist active focus mode para o Dashboard
  useEffect(() => {
    const targetEndTime = isTimerRunning ? Date.now() + timeLeft * 1000 : null;
    localStorage.setItem('sanctum_active_focus', JSON.stringify({
      id: activeMode.id,
      name: activeMode.name,
      color: activeMode.color,
      isRunning: isTimerRunning,
      isBreak: isBreakMode,
      timeLeft,
      targetEndTime,
    }));
  }, [activeMode, isTimerRunning, isBreakMode, timeLeft]);

  // Escuta comandos remotos do Dashboard via Custom Events
  useEffect(() => {
    const handleFocusToggle = () => setIsTimerRunning(prev => !prev);
    const handleFocusReset = () => {
      setIsTimerRunning(false);
      setIsBreakMode(false);
      setTimeLeft(pomodoroConfig.work * 60);
    };
    window.addEventListener('sanctum:focus-toggle', handleFocusToggle);
    window.addEventListener('sanctum:focus-reset', handleFocusReset);
    return () => {
      window.removeEventListener('sanctum:focus-toggle', handleFocusToggle);
      window.removeEventListener('sanctum:focus-reset', handleFocusReset);
    };
  }, [pomodoroConfig.work]);

  // Timer Logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      // Play Alarm
      if (alarmRef.current) {
        alarmRef.current.currentTime = 0;
        alarmRef.current.play().catch(e => console.error("Alarm failed:", e));
      }

      // Switch Mode
      const nextMode = !isBreakMode;
      setIsBreakMode(nextMode);
      setTimeLeft(nextMode ? pomodoroConfig.break * 60 : pomodoroConfig.work * 60);
      
      // Optional: Auto-start next cycle could be added here
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft, isBreakMode, pomodoroConfig]);

  const handleSpotifyLogin = () => {
    const scopes = "streaming user-read-email user-read-private user-modify-playback-state";
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&response_type=token`;
  };

  const playSpotifyPlaylist = async () => {
    if (!deviceId || !spotifyToken || !spotifyUrl) return;
    
    const match = spotifyUrl.match(/\/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
    if (!match) return;
    
    const type = match[1];
    const id = match[2];
    const context_uri = `spotify:${type}:${id}`;
    
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(type === 'track' ? { uris: [context_uri] } : { context_uri: context_uri }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${spotifyToken}`
      },
    });
  };

  const toggleSpotifyPlayback = () => {
    if (player) player.togglePlay();
  };

  const skipNext = () => player && player.nextTrack();
  const skipPrev = () => player && player.previousTrack();

  const toggleTimer = () => setIsTimerRunning(!isTimerRunning);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setIsBreakMode(false);
    setTimeLeft(pomodoroConfig.work * 60);
  };

  const formatSpotifyUrl = (url: string) => {
    try {
      if (!url) return "";
      if (url.includes('embed')) return url;
      const match = url.match(/\/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
      if (match) {
        const type = match[1];
        const id = match[2];
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Sync state with browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${isFullscreen ? 'fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center' : 'space-y-10'}`}>
      
      {/* Alarm Audio */}
      <audio 
        ref={alarmRef}
        src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"
        preload="auto"
      />

      {/* Hidden Audio Element for Ambient */}
      {musicSource === 'ambient' && (
        <audio 
          ref={audioRef}
          src={activeMode.audioUrl}
          loop
        />
      )}

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
                    onClick={() => setActiveMode(mode)}
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
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="editorial-label opacity-40">TIMER POMODORO</h3>
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`p-2 rounded-lg transition-all ${showSettings ? 'bg-primary text-surface' : 'hover:bg-on-surface/5 opacity-40 hover:opacity-100'}`}
                  >
                    <Settings size={16} />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {showSettings ? (
                    <motion.div 
                      key="settings"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6 pt-2"
                    >
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest pl-1">Foco (min)</label>
                             <div className="flex items-center gap-2 bg-on-surface/5 rounded-xl border border-[var(--glass-border)] px-4 py-2">
                                <button onClick={() => setPomodoroConfig(prev => ({ ...prev, work: Math.max(1, prev.work - 5) }))} className="opacity-40 hover:opacity-100">-</button>
                                <input 
                                  type="number" 
                                  value={pomodoroConfig.work}
                                  onChange={(e) => setPomodoroConfig(prev => ({ ...prev, work: parseInt(e.target.value) || 1 }))}
                                  className="w-full bg-transparent text-center text-xs font-bold outline-none"
                                />
                                <button onClick={() => setPomodoroConfig(prev => ({ ...prev, work: prev.work + 5 }))} className="opacity-40 hover:opacity-100">+</button>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest pl-1">Pausa (min)</label>
                             <div className="flex items-center gap-2 bg-on-surface/5 rounded-xl border border-[var(--glass-border)] px-4 py-2">
                                <button onClick={() => setPomodoroConfig(prev => ({ ...prev, break: Math.max(1, prev.break - 1) }))} className="opacity-40 hover:opacity-100">-</button>
                                <input 
                                  type="number" 
                                  value={pomodoroConfig.break}
                                  onChange={(e) => setPomodoroConfig(prev => ({ ...prev, break: parseInt(e.target.value) || 1 }))}
                                  className="w-full bg-transparent text-center text-xs font-bold outline-none"
                                />
                                <button onClick={() => setPomodoroConfig(prev => ({ ...prev, break: prev.break + 1 }))} className="opacity-40 hover:opacity-100">+</button>
                             </div>
                          </div>
                       </div>
                       <button 
                        onClick={() => {
                          setShowSettings(false);
                          if (!isTimerRunning) setTimeLeft(isBreakMode ? pomodoroConfig.break * 60 : pomodoroConfig.work * 60);
                        }}
                        className="w-full py-3 rounded-xl bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all border border-primary/20"
                       >
                         Salvar Configuração
                       </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="timer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <div className="text-7xl font-mono font-bold tracking-tight mb-2">{formatTime(timeLeft)}</div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-10 ${isBreakMode ? 'bg-[#00f5a0]/10 text-[#00f5a0]' : 'bg-primary/10 text-primary'}`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${isBreakMode ? 'bg-[#00f5a0]' : 'bg-primary'} animate-pulse`} />
                         {isBreakMode ? 'Tempo de Pausa' : 'Sessão de Foco'}
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <button onClick={resetTimer} className="p-4 rounded-full bg-on-surface/5 hover:bg-on-surface/10 transition-all">
                          <RotateCcw size={20} />
                        </button>
                        <button 
                          onClick={toggleTimer} 
                          className={`w-20 h-20 rounded-full flex items-center justify-center text-surface shadow-2xl transition-all scale-110 ${isBreakMode ? 'bg-[#00f5a0] shadow-[#00f5a0]/30' : 'bg-primary shadow-primary/30'} hover:scale-115 active:scale-95`}
                        >
                          {isTimerRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                        <button onClick={() => {
                          setIsBreakMode(!isBreakMode);
                          setTimeLeft(!isBreakMode ? pomodoroConfig.break * 60 : pomodoroConfig.work * 60);
                          setIsTimerRunning(false);
                        }} className="p-4 rounded-full bg-on-surface/5 hover:bg-on-surface/10 transition-all">
                          <Target size={20} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                        <button onClick={(() => setIsPlaying(!isPlaying))} className="p-2">
                           {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        </button>
                     </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {!spotifyToken ? (
                       <button 
                         onClick={handleSpotifyLogin}
                         className="w-full py-8 rounded-2xl bg-[#1DB954]/10 border-2 border-dashed border-[#1DB954]/30 flex flex-col items-center justify-center gap-3 hover:bg-[#1DB954]/20 transition-all group"
                       >
                          <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-white shadow-xl shadow-[#1DB954]/30 group-hover:scale-110 transition-transform">
                             <Music size={24} />
                          </div>
                          <div className="text-center">
                             <p className="text-xs font-bold uppercase tracking-widest text-[#1DB954]">Conectar Spotify Premium</p>
                             <p className="text-[9px] opacity-40 mt-1">Necessário para áudio completo sem limites</p>
                          </div>
                       </button>
                     ) : (
                       <div className="space-y-4">
                         <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest pl-1">Playlist ou Álbum</label>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={spotifyUrl}
                                onChange={(e) => setSpotifyUrl(e.target.value)}
                                placeholder="Cole o link do Spotify aqui..."
                                className="flex-1 bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-2 px-3 text-[10px] outline-none focus:border-[#1DB954]/50 transition-all font-mono"
                              />
                              <button 
                                onClick={playSpotifyPlaylist}
                                className="px-4 py-2 bg-[#1DB954] text-white rounded-xl text-[9px] font-bold hover:scale-105 transition-all"
                              >
                                CARREGAR
                              </button>
                            </div>
                         </div>
                         
                         <div className="p-4 rounded-2xl bg-on-surface/5 border border-[var(--glass-border)] flex items-center gap-4">
                            {currentTrack ? (
                              <>
                                <img src={currentTrack.album.images[0].url} className="w-12 h-12 rounded-lg shadow-lg" alt="" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-xs font-bold truncate">{currentTrack.name}</p>
                                   <p className="text-[10px] opacity-40 truncate">{currentTrack.artists[0].name}</p>
                                </div>
                              </>
                            ) : (
                              <div className="flex-1 text-center py-2 opacity-30 text-[10px] font-bold">AGUARDANDO REPRODUÇÃO...</div>
                            )}
                         </div>

                         <div className="flex items-center justify-center gap-6 pt-2">
                            <button onClick={skipNext === player && player.nextTrack} className="opacity-40 hover:opacity-100 transition-opacity"><SkipBack size={18} fill="currentColor" /></button>
                            <button 
                              onClick={toggleSpotifyPlayback} 
                              className="w-12 h-12 rounded-full bg-on-surface/5 flex items-center justify-center hover:bg-on-surface/10 transition-all"
                            >
                               {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                            </button>
                            <button onClick={skipNext} className="opacity-40 hover:opacity-100 transition-opacity"><SkipForward size={18} fill="currentColor" /></button>
                         </div>
                         <button onClick={() => { localStorage.removeItem("spotify_access_token"); setSpotifyToken(null); }} className="w-full text-[8px] opacity-20 hover:opacity-100 py-2 border-t border-[var(--glass-border)] transition-opacity uppercase tracking-widest">Desconectar Conta</button>
                       </div>
                     )}
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
            key={isBreakMode ? 'break' : 'work'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4 mb-12"
          >
            <div className={`flex items-center justify-center gap-3 uppercase tracking-[0.5em] font-bold text-xs ${isBreakMode ? 'text-[#00f5a0]' : 'text-on-surface/40'}`}>
              {isBreakMode ? <ShieldCheck size={16} /> : <activeMode.icon size={16} />}
              {isBreakMode ? 'Momento de Descanso' : `${activeMode.name} Ativo`}
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
                      <button onClick={() => setIsPlaying(!isPlaying)} className={`w-20 h-20 rounded-full border border-on-surface/10 flex items-center justify-center hover:bg-on-surface/5 transition-all outline-none ${isPlaying ? 'text-primary border-primary/20' : ''}`}>
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
                  <div className="space-y-4 w-full">
                    {currentTrack ? (
                       <div className="flex flex-col items-center gap-6">
                          <img src={currentTrack.album.images[0].url} className="w-48 h-48 rounded-3xl shadow-2xl" alt="" />
                          <div className="text-center">
                             <h4 className="text-2xl font-bold">{currentTrack.name}</h4>
                             <p className="text-sm opacity-40">{currentTrack.artists[0].name}</p>
                          </div>
                          <div className="flex items-center gap-8">
                             <button onClick={skipPrev} className="opacity-30 hover:opacity-100 transition-opacity"><SkipBack size={24} fill="currentColor"/></button>
                             <button onClick={toggleSpotifyPlayback} className="w-16 h-16 rounded-full border border-on-surface/10 flex items-center justify-center hover:bg-on-surface/5 transition-all">
                                {isPlaying ? <Pause size={28} fill="currentColor"/> : <Play size={28} fill="currentColor" className="ml-1"/>}
                             </button>
                             <button onClick={skipNext} className="opacity-30 hover:opacity-100 transition-opacity"><SkipForward size={24} fill="currentColor"/></button>
                          </div>
                       </div>
                    ) : (
                       <div className="w-full py-12 text-center opacity-20 editorial-label">ABRA O SPOTIFY E DÊ O PLAY</div>
                    )}
                  </div>
                )}
             </div>

             <div className="flex flex-col items-center gap-6">
               <button 
                 onClick={toggleTimer}
                 className={`w-32 h-32 rounded-full border-2 flex items-center justify-center hover:bg-primary/5 transition-all group shadow-2xl ${isBreakMode ? 'border-[#00f5a0] text-[#00f5a0] shadow-[#00f5a0]/20' : 'border-primary text-primary shadow-primary/20'}`}
               >
                 {isTimerRunning ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
               </button>
               <div className="flex flex-col gap-2">
                 <button onClick={resetTimer} className="text-[10px] opacity-30 hover:opacity-100 transition-opacity uppercase tracking-[0.3em] font-bold">Reiniciar Timer</button>
                 <button onClick={() => {
                   setIsBreakMode(!isBreakMode);
                   setTimeLeft(!isBreakMode ? pomodoroConfig.break * 60 : pomodoroConfig.work * 60);
                 }} className="text-[8px] opacity-20 hover:opacity-100 transition-opacity uppercase tracking-[0.2em]">Pular para {!isBreakMode ? 'Pausa' : 'Trabalho'}</button>
               </div>
             </div>
          </div>

          <p className="mt-16 text-[9px] opacity-20 uppercase tracking-[0.4em] font-mono italic">"A excelência não é um ato, mas um hábito."</p>
        </div>
      )}
    </div>
  );
};

export default Focus;
