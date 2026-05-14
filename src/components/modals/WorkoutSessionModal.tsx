import React, { useState, useEffect } from "react";
import { X, Play, Save, Plus, Trash2, Clock, Activity, ChevronRight, Dumbbell, Check } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface Exercise {
  id?: string;
  exercise_name: string;
  exercise_type_id?: string;
  sets: number;
  reps: number;
  weight: number;
  target_rest_seconds?: number;
  notes?: string;
  completed_sets?: boolean[];
}

interface WorkoutSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  routineId?: string;
  routineName?: string;
  onSave?: () => void;
}

const WorkoutSessionModal: React.FC<WorkoutSessionModalProps> = ({ 
  isOpen, 
  onClose, 
  routineId, 
  routineName = "Treino Livre",
  onSave 
}) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([{ exercise_name: "", sets: 3, reps: 10, weight: 0, completed_sets: [false, false, false] }]);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(3);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [startTime] = useState(Date.now());
  const [isSuccess, setIsSuccess] = useState(false);
  const [exerciseTypes, setExerciseTypes] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState(0);
  const [lastWeights, setLastWeights] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      const timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, startTime]);

  useEffect(() => {
    if (restSecondsRemaining > 0) {
      const timer = setInterval(() => {
        setRestSecondsRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [restSecondsRemaining]);

  useEffect(() => {
    if (isOpen && user) {
      fetchLastWeights();
      fetchExerciseTypes();
    }
  }, [isOpen, user]);

  const fetchExerciseTypes = async () => {
    const { data } = await supabase.from('workout_exercise_types').select('*').order('name');
    if (data) setExerciseTypes(data);
  };

  const fetchLastWeights = async () => {
    // Busca os últimos exercícios feitos pelo usuário para achar a última carga
    const { data } = await supabase
      .from('workout_session_exercises')
      .select('exercise_name, weight, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) {
      const weights: Record<string, number> = {};
      data.forEach(row => {
        if (!weights[row.exercise_name]) {
          weights[row.exercise_name] = row.weight;
        }
      });
      setLastWeights(weights);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    if (routineId) {
      fetchRoutineExercises();
    }
  }, [routineId]);

  const fetchRoutineExercises = async () => {
    const { data } = await supabase
      .from('workout_routine_exercises')
      .select('*')
      .eq('routine_id', routineId)
      .order('order');
    
    if (data && data.length > 0) {
      setExercises(data.map(ex => ({
        exercise_name: ex.exercise_name,
        exercise_type_id: ex.exercise_type_id,
        sets: ex.target_sets || 3,
        reps: ex.target_reps || 10,
        weight: ex.target_weight || 0,
        target_rest_seconds: ex.target_rest_seconds || 90,
        completed_sets: Array(ex.target_sets || 3).fill(false)
      })));
    }
  };

  const addExerciseFromCatalog = (type: any) => {
    setExercises([...exercises, {
      exercise_name: type.name,
      exercise_type_id: type.id,
      sets: 3,
      reps: 10,
      weight: lastWeights[type.name] || 0,
      target_rest_seconds: 90,
      completed_sets: [false, false, false]
    }]);
    setShowSearch(false);
    setSearchQuery("");
  };

  const addFreeExercise = () => {
    setExercises([...exercises, { 
      exercise_name: "", 
      sets: 3, 
      reps: 10, 
      weight: 0,
      target_rest_seconds: 90,
      completed_sets: [false, false, false]
    }]);
    setShowSearch(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const newExercises = [...exercises];
    
    // Se mudar a quantidade de séries, ajustamos o array de completed_sets
    if (field === 'sets') {
      const currentSets = newExercises[index].completed_sets || [];
      const newCount = value as number;
      if (newCount > currentSets.length) {
        newExercises[index].completed_sets = [...currentSets, ...Array(newCount - currentSets.length).fill(false)];
      } else {
        newExercises[index].completed_sets = currentSets.slice(0, newCount);
      }
    }
    
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const toggleSet = (exIndex: number, setIndex: number) => {
    const newExercises = [...exercises];
    const currentCompleted = newExercises[exIndex].completed_sets || Array(newExercises[exIndex].sets).fill(false);
    
    const isNowCompleted = !currentCompleted[setIndex];
    currentCompleted[setIndex] = isNowCompleted;
    newExercises[exIndex].completed_sets = currentCompleted;
    
    setExercises(newExercises);

    // Se acabou de marcar como feito (check), iniciar o cronômetro de descanso automaticamente!
    if (isNowCompleted) {
      setRestSecondsRemaining(newExercises[exIndex].target_rest_seconds || 90);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setErrorMsg("");

    try {
      const totalVolume = exercises.reduce((acc, ex) => acc + (ex.sets * ex.reps * ex.weight), 0);

      // 1. Criar sessão
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          routine_id: routineId || null,
          routine_name: routineName,
          duration_minutes: Math.max(1, Math.floor(elapsedSeconds / 60)),
          total_volume: totalVolume,
          notes,
          rating,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Criar exercícios da sessão (processando novos tipos se necessário)
      const processedExercises = await Promise.all(exercises.map(async (ex) => {
        if (!ex.exercise_type_id && ex.exercise_name.trim()) {
          const { data: newType } = await supabase
            .from('workout_exercise_types')
            .insert({ name: ex.exercise_name, category: 'Outro', muscle_group: 'Geral' })
            .select().single();
          return { ...ex, exercise_type_id: newType?.id };
        }
        return ex;
      }));

      const sessionExercises = processedExercises.map(ex => ({
        session_id: session.id,
        exercise_name: ex.exercise_name,
        exercise_type_id: ex.exercise_type_id || null,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes
      }));

      const { error: exercisesError } = await supabase
        .from('workout_session_exercises')
        .insert(sessionExercises);

      if (exercisesError) throw exercisesError;

      setIsSuccess(true);
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100]);
      }
      
      setTimeout(() => {
        if (onSave) onSave();
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Erro ao salvar sessão de treino:", error);
      setErrorMsg(error.message || JSON.stringify(error) || "Erro desconhecido ao salvar o treino.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        <GlassCard className="h-full flex flex-col p-0 border-primary/30 shadow-2xl">
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary text-surface rounded-2xl shadow-lg shadow-primary/20 animate-pulse">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">{routineName}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest">
                    <Clock size={12} /> {formatTime(elapsedSeconds)}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-on-surface/20" />
                  <div className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                    SESSÃO EM ANDAMENTO
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {restSecondsRemaining > 0 && (
                <div className="px-4 py-2 bg-orange-500 text-surface rounded-xl text-sm font-black flex items-center gap-2 animate-bounce shadow-lg shadow-orange-500/20">
                  <Clock size={16} />
                  DESCANSO: {formatTime(restSecondsRemaining)}
                </div>
              )}
              <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {restSecondsRemaining > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[120] bg-orange-500/90 backdrop-blur-xl flex flex-col items-center justify-center text-surface p-8 text-center"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="p-8 bg-surface/20 rounded-full inline-block animate-pulse">
                    <Clock size={80} />
                  </div>
                  <div>
                    <p className="text-xl font-bold opacity-80 uppercase tracking-widest mb-2">Hora de Recuperar</p>
                    <h2 className="text-9xl font-black tabular-nums">{formatTime(restSecondsRemaining)}</h2>
                  </div>
                  <button 
                    onClick={() => setRestSecondsRemaining(0)}
                    className="px-10 py-4 bg-surface text-orange-500 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl"
                  >
                    PULAR DESCANSO
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="editorial-label text-xs">EXERCÍCIOS DA SESSÃO</h4>
                <div className="relative">
                  <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className="flex items-center gap-2 text-[10px] font-bold text-primary hover:opacity-70 transition-all uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl"
                  >
                    <Plus size={14} /> ADICIONAR EXERCÍCIO
                  </button>

                  <AnimatePresence>
                    {showSearch && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-72 bg-surface border border-[var(--glass-border)] rounded-2xl shadow-2xl z-[110] p-4 space-y-4"
                      >
                        <input 
                          type="text"
                          placeholder="Buscar no catálogo..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-2 text-xs font-bold outline-none"
                          autoFocus
                        />
                        
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                          {exerciseTypes
                            .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(type => (
                              <button
                                key={type.id}
                                onClick={() => addExerciseFromCatalog(type)}
                                className="w-full text-left px-3 py-2 hover:bg-primary/10 rounded-lg text-xs font-bold transition-all"
                              >
                                {type.name}
                              </button>
                            ))
                          }
                          {searchQuery && !exerciseTypes.some(t => t.name.toLowerCase() === searchQuery.toLowerCase()) && (
                            <button
                              onClick={addFreeExercise}
                              className="w-full text-left px-3 py-2 hover:bg-orange-500/10 rounded-lg text-xs font-bold text-orange-400 transition-all italic"
                            >
                              + Criar "{searchQuery}"
                            </button>
                          )}
                          {!searchQuery && (
                            <button
                              onClick={addFreeExercise}
                              className="w-full text-left px-3 py-2 hover:bg-on-surface/5 rounded-lg text-xs font-bold opacity-60 transition-all"
                            >
                              + Exercício Livre
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {exercises.map((ex, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-on-surface/[0.02] border border-[var(--glass-border)] space-y-4 group relative hover:bg-on-surface/[0.04] transition-all">
                  <div className="flex flex-wrap items-end gap-4 w-full">
                    {/* Nome do Exercício */}
                    <div className="flex-[2] min-w-[200px] space-y-1.5">
                      <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">NOME DO EXERCÍCIO</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Supino Reto"
                        value={ex.exercise_name}
                        onChange={(e) => updateExercise(idx, 'exercise_name', e.target.value)}
                        className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/50"
                        required
                      />
                    </div>
                    
                    {/* Séries / Reps / Peso */}
                    <div className="flex-1 min-w-[220px] grid grid-cols-3 gap-2">
                      <div className="space-y-1.5 text-center">
                        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">SÉRIES</label>
                        <input 
                          type="number" 
                          value={ex.sets}
                          onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-3 text-center text-sm font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 text-center">
                        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">REPS</label>
                        <input 
                          type="number" 
                          value={ex.reps}
                          onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl py-3 text-center text-sm font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5 text-center">
                        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-primary flex items-center justify-center flex-col gap-0.5">
                          <span>PESO (KG)</span>
                          <span className="text-[7px] lowercase whitespace-nowrap">(últ: {lastWeights[ex.exercise_name] || '--'})</span>
                        </label>
                        <input 
                          type="number" 
                          value={ex.weight}
                          onChange={(e) => updateExercise(idx, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-full bg-primary/10 border border-primary/20 rounded-xl py-3 text-center text-sm font-bold text-primary outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* Checkboxes e Lixeira */}
                    <div className="flex-[1.5] min-w-[200px] flex items-center justify-between bg-on-surface/5 rounded-xl p-2 border border-[var(--glass-border)] h-[46px]">
                      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar px-1 max-w-full">
                        {Array.from({ length: ex.sets || 0 }).map((_, setIdx) => (
                          <button
                            key={setIdx}
                            onClick={() => toggleSet(idx, setIdx)}
                            className={`min-w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
                              ex.completed_sets?.[setIdx] 
                                ? 'bg-primary border-primary text-surface shadow-md shadow-primary/30' 
                                : 'bg-surface border-[var(--glass-border)] text-transparent hover:border-primary/50'
                            }`}
                          >
                            <Check size={16} strokeWidth={4} className={ex.completed_sets?.[setIdx] ? 'text-surface' : 'text-transparent'} />
                          </button>
                        ))}
                      </div>
                      
                      <button 
                        onClick={() => removeExercise(idx)}
                        className="p-2 ml-2 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-[var(--glass-border)] grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="editorial-label text-xs">AVALIAÇÃO DO TREINO</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setRating(s)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all ${
                        rating >= s ? 'bg-primary text-surface shadow-lg shadow-primary/20' : 'bg-on-surface/5 text-on-surface/40 hover:bg-on-surface/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="editorial-label text-xs">NOTAS ADICIONAIS</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Como você se sentiu? Alguma observação sobre as cargas?"
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 text-sm outline-none focus:border-primary/50 resize-none h-24"
                />
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-[var(--glass-border)] bg-on-surface/[0.02] flex flex-col gap-4">
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl text-center">
                Erro: {errorMsg}
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button 
                onClick={onClose} 
                className="px-8 py-3 rounded-2xl border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface/5 transition-all"
              >
                DESCARTAR
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-10 py-3 rounded-2xl bg-primary text-surface text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {saving ? (
                  <Clock className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                FINALIZAR E SALVAR
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-[200] bg-primary flex flex-col items-center justify-center text-surface text-center p-8"
              >
                <motion.div 
                  initial={{ scale: 0.5, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="w-24 h-24 bg-surface text-primary rounded-full flex items-center justify-center mx-auto shadow-2xl">
                    <Save size={48} />
                  </div>
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tight">Treino Finalizado!</h2>
                    <p className="text-sm font-bold opacity-70 mt-2 uppercase tracking-widest">Sua performance foi registrada com sucesso.</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default WorkoutSessionModal;
