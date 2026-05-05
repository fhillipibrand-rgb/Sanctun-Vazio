import React, { useState, useEffect } from "react";
import { 
  Dumbbell, 
  Plus, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Play, 
  History,
  Settings,
  MoreVertical,
  Trash2,
  Edit2,
  Download
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import WorkoutSessionModal from "../components/modals/WorkoutSessionModal";
import CreateRoutineModal from "../components/modals/CreateRoutineModal";

interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_name: string;
  target_sets: number;
  target_reps: number;
}

interface Routine {
  id: string;
  name: string;
  description: string;
  days_of_week?: string[]; // Note: db does not have this currently, but we can fake it or omit
  exercises?: RoutineExercise[];
}

interface ExerciseType {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
}

const Vitality = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'routines' | 'history' | 'exercises'>('routines');
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [exercises, setExercises] = useState<ExerciseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRoutine, setShowAddRoutine] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState<{id: string, name: string} | undefined>();
  const [logs, setLogs] = useState<any[]>([]);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseGroup, setNewExerciseGroup] = useState("Geral");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: routinesData } = await supabase.from('workout_routines').select('*').order('created_at');
    const { data: routineExercisesData } = await supabase.from('workout_routine_exercises').select('*').order('order');
    const { data: exercisesData } = await supabase.from('workout_exercise_types').select('*').order('name');
    const { data: logsData } = await supabase.from('workout_sessions').select('*').order('date', { ascending: false });
    
    if (routinesData) {
      const routinesWithExercises = routinesData.map(r => ({
        ...r,
        days_of_week: r.days_of_week || [],
        exercises: routineExercisesData ? routineExercisesData.filter(re => re.routine_id === r.id) : []
      }));
      setRoutines(routinesWithExercises);
    }
    if (exercisesData) setExercises(exercisesData);
    if (logsData) setLogs(logsData);
    setLoading(false);
  };

  const exportToCSV = () => {
    if (logs.length === 0) return;
    
    const headers = ["Data", "Rotina", "Duração (min)", "Volume Total (kg)"];
    const rows = logs.map(log => [
      new Date(log.date).toLocaleDateString('pt-BR'),
      log.routine_name || 'Treino Livre',
      log.duration_minutes || 0,
      log.total_volume || 0
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `treinos_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteRoutine = async (id: string) => {
    const { error } = await supabase.from('workout_routines').delete().eq('id', id);
    if (!error) setRoutines(routines.filter(r => r.id !== id));
  };

  const addExerciseType = async () => {
    if (!newExerciseName.trim()) return;
    const { data, error } = await supabase
      .from('workout_exercise_types')
      .insert({
        name: newExerciseName,
        muscle_group: newExerciseGroup,
        category: 'Força'
      })
      .select()
      .single();
    
    if (data) {
      setExercises([...exercises, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewExerciseName("");
    }
  };

  const deleteExerciseType = async (id: string) => {
    const { error } = await supabase.from('workout_exercise_types').delete().eq('id', id);
    if (!error) setExercises(exercises.filter(e => e.id !== id));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
          <Dumbbell size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">VITALIDADE & PERFORMANCE</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Treino & Movimento</h2>
            <p className="text-on-surface-variant opacity-60 max-w-2xl text-sm leading-relaxed mt-2">
              Construa sua melhor versão através da consistência e progressão de carga.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              disabled={logs.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-on-surface/5 hover:bg-on-surface/10 border border-[var(--glass-border)] rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> EXPORTAR CSV
            </button>
            <button 
              onClick={() => {
                setSelectedRoutine(undefined);
                setShowWorkoutModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> REGISTRAR TREINO
            </button>
            <button 
              onClick={() => setShowAddRoutine(true)}
              className="flex items-center gap-2 px-6 py-3 bg-on-surface/5 hover:bg-on-surface/10 border border-[var(--glass-border)] rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all hidden md:flex"
            >
              <Plus size={14} /> ROTINA
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-4 p-1 bg-on-surface/5 rounded-2xl w-fit">
        {(['routines', 'history', 'exercises'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-surface text-primary shadow-sm' 
                : 'text-on-surface/40 hover:text-on-surface/60'
            }`}
          >
            {tab === 'routines' ? 'Minhas Rotinas' : tab === 'history' ? 'Histórico' : 'Exercícios'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-30 editorial-label animate-pulse">
          SINCRONIZANDO PERFORMANCE...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'routines' && (
              <motion.div 
                key="routines"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {routines.map((routine) => (
                  <GlassCard key={routine.id} className="p-8 border-primary/10 hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <Dumbbell size={24} />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-on-surface/5 rounded-lg transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => deleteRoutine(routine.id)} className="p-2 hover:bg-red-400/10 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{routine.name}</h3>
                    <p className="text-xs text-on-surface-variant opacity-60 mb-6 line-clamp-2">
                      {routine.description || "Nenhuma descrição definida."}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {routine.days_of_week && routine.days_of_week.map(day => (
                        <span key={day} className="px-3 py-1 bg-on-surface/5 rounded-full text-[9px] font-bold uppercase tracking-wider text-primary">
                          {day}
                        </span>
                      ))}
                    </div>

                    {/* Exercícios da Rotina */}
                    {routine.exercises && routine.exercises.length > 0 && (
                      <div className="mb-8 space-y-2">
                        <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">EXERCÍCIOS ({routine.exercises.length})</p>
                        <div className="flex flex-col gap-2">
                          {routine.exercises.slice(0, 3).map(ex => (
                            <div key={ex.id} className="flex justify-between items-center bg-on-surface/5 px-3 py-2 rounded-xl">
                              <span className="text-xs font-bold line-clamp-1">{ex.exercise_name}</span>
                              <span className="text-[10px] opacity-60 font-bold whitespace-nowrap">{ex.target_sets}x{ex.target_reps}</span>
                            </div>
                          ))}
                          {routine.exercises.length > 3 && (
                            <div className="text-center text-[10px] opacity-40 font-bold mt-1">
                              + {routine.exercises.length - 3} exercícios
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => {
                        setSelectedRoutine({ id: routine.id, name: routine.name });
                        setShowWorkoutModal(true);
                      }}
                      className="w-full py-4 bg-primary/10 hover:bg-primary text-primary hover:text-surface rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      <Play size={12} fill="currentColor" /> INICIAR TREINO
                    </button>
                  </GlassCard>
                ))}
                {routines.length === 0 && (
                  <div className="col-span-full py-20 text-center opacity-20 border-2 border-dashed border-on-surface/10 rounded-3xl">
                    <p className="editorial-label text-xs">Nenhuma rotina cadastrada ainda.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div 
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-full space-y-4"
              >
                {logs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {logs.map((log) => (
                      <GlassCard key={log.id} className="p-6 border-on-surface/5 flex justify-between items-center group hover:border-primary/20 transition-all">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md">
                              {new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                            </span>
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                              {log.duration_minutes} MINUTOS
                            </span>
                          </div>
                          <h4 className="font-bold">{log.routine_name || 'Treino Livre'}</h4>
                          {log.notes && (
                            <p className="text-xs opacity-60 mt-2 italic">"{log.notes}"</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex flex-col items-center justify-center p-3 bg-on-surface/5 rounded-xl min-w-[60px]">
                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">NOTA</span>
                            <span className="text-lg font-bold text-primary">{log.rating}</span>
                          </div>
                          {log.total_volume > 0 && (
                            <span className="text-[9px] font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-md">
                              {log.total_volume} KG VOLUME
                            </span>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center opacity-20 border-2 border-dashed border-on-surface/10 rounded-3xl">
                    <History size={48} className="mx-auto mb-4" />
                    <p className="editorial-label text-xs">O histórico de treinos aparecerá aqui após suas sessões.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'exercises' && (
              <motion.div 
                key="exercises"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="col-span-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {/* Novo Exercício Card */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <p className="text-[8px] font-bold text-primary uppercase tracking-widest">NOVO EXERCÍCIO</p>
                    <input 
                      type="text"
                      placeholder="Nome do exercício..."
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    />
                    <select 
                      value={newExerciseGroup}
                      onChange={(e) => setNewExerciseGroup(e.target.value)}
                      className="w-full bg-surface border border-[var(--glass-border)] rounded-xl px-3 py-2 text-xs font-bold outline-none"
                    >
                      {["Geral", "Peito", "Costas", "Pernas", "Ombros", "Braços", "Core", "Cardio"].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    onClick={addExerciseType}
                    disabled={!newExerciseName.trim()}
                    className="w-full py-2 bg-primary text-surface rounded-xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    CADASTRAR
                  </button>
                </div>

                {exercises.map((ex) => (
                  <div key={ex.id} className="p-4 rounded-2xl bg-on-surface/5 border border-[var(--glass-border)] flex flex-col justify-between group transition-all hover:border-primary/20">
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-1">{ex.muscle_group}</p>
                        <button 
                          onClick={() => deleteExerciseType(ex.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:bg-red-400/10 rounded-md transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <h4 className="font-bold text-sm">{ex.name}</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-tighter">{ex.category}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <WorkoutSessionModal
        isOpen={showWorkoutModal}
        onClose={() => setShowWorkoutModal(false)}
        routineId={selectedRoutine?.id}
        routineName={selectedRoutine?.name}
        onSave={fetchData}
      />
      <CreateRoutineModal
        isOpen={showAddRoutine}
        onClose={() => setShowAddRoutine(false)}
        onSave={() => {
          fetchData();
          setShowAddRoutine(false);
        }}
      />
    </div>
  );
};

export default Vitality;
