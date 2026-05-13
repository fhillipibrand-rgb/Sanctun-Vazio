import React, { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Dumbbell, Clock, Activity, Search } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";

interface ExerciseType {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
}

interface RoutineExercise {
  exercise_name: string;
  exercise_type_id?: string;
  target_sets: number;
  target_reps: number;
  target_weight: number;
  target_rest_seconds: number;
}

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  programId?: string;
}

const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({ isOpen, onClose, onSave, programId }) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [availableExercises, setAvailableExercises] = useState<ExerciseType[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchExerciseTypes();
      // Reset form
      setName("");
      setDescription("");
      setSelectedDays([]);
      setExercises([]);
      setErrorMsg("");
      setShowSearch(false);
    }
  }, [isOpen]);

  const fetchExerciseTypes = async () => {
    const { data } = await supabase.from('workout_exercise_types').select('*').order('name');
    if (data) setAvailableExercises(data);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const addExerciseFromCatalog = (ex: ExerciseType) => {
    setExercises([...exercises, {
      exercise_name: ex.name,
      exercise_type_id: ex.id,
      target_sets: 3,
      target_reps: 10,
      target_weight: 0,
      target_rest_seconds: 90
    }]);
    setShowSearch(false);
    setSearchQuery("");
  };

  const addCustomExercise = () => {
    setExercises([...exercises, {
      exercise_name: "",
      target_sets: 3,
      target_reps: 10,
      target_weight: 0,
      target_rest_seconds: 90
    }]);
    setShowSearch(false);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: any) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!name.trim()) {
      setErrorMsg("O nome da rotina é obrigatório.");
      return;
    }
    
    setSaving(true);
    setErrorMsg("");

    try {
      // 1. Criar Rotina
      const { data: routine, error: routineError } = await supabase
        .from('workout_routines')
        .insert({
          user_id: user.id,
          name,
          description,
          days_of_week: selectedDays,
          program_id: programId || null
        })
        .select()
        .single();

      if (routineError) throw routineError;

      // 2. Adicionar Exercícios (processando customizados primeiro)
      if (exercises.length > 0) {
        // Separa os que não têm ID (novos) para criar no catálogo
        const processedExercises = await Promise.all(exercises.map(async (ex) => {
          if (!ex.exercise_type_id && ex.exercise_name.trim()) {
            // Cria no banco
            const { data: newType } = await supabase
              .from('workout_exercise_types')
              .insert({
                name: ex.exercise_name,
                category: 'Outro',
                muscle_group: 'Geral'
              })
              .select()
              .single();
              
            return {
              ...ex,
              exercise_type_id: newType ? newType.id : null
            };
          }
          return ex;
        }));

        const routineExercises = processedExercises.map((ex, idx) => ({
          routine_id: routine.id,
          exercise_name: ex.exercise_name,
          exercise_type_id: ex.exercise_type_id || null,
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight,
          target_rest_seconds: ex.target_rest_seconds,
          order: idx
        }));

        const { error: exercisesError } = await supabase
          .from('workout_routine_exercises')
          .insert(routineExercises);

        if (exercisesError) throw exercisesError;
      }

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar rotina:", error);
      setErrorMsg(error.message || JSON.stringify(error) || "Erro ao salvar a rotina.");
    } finally {
      setSaving(false);
    }
  };

  const filteredCatalog = availableExercises.filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col"
      >
        <GlassCard className="flex-1 flex flex-col p-0 border-primary/30 shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-primary/5 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                <Dumbbell size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Nova Divisão de Treino</h3>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
                  Monte sua ficha (Ex: Treino A)
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="editorial-label text-xs">NOME DA FICHA</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Treino A - Costas e Bíceps"
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/50"
                />
              </div>
              <div className="space-y-4">
                <label className="editorial-label text-xs">DIAS DA SEMANA (OPCIONAL)</label>
                <div className="flex gap-1 justify-between bg-on-surface/5 p-2 rounded-2xl border border-[var(--glass-border)]">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                        selectedDays.includes(day) ? 'bg-primary text-surface shadow-md' : 'text-on-surface/40 hover:bg-on-surface/10 hover:text-on-surface/80'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-full space-y-4">
                <label className="editorial-label text-xs">DESCRIÇÃO OU FOCO</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Foco em progressão de carga em remadas"
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl px-4 py-3 text-sm outline-none focus:border-primary/50"
                />
              </div>
            </div>

            {/* Exercícios da Rotina em formato de Cards (conforme pedido pelo usuário) */}
            <div className="space-y-6 pt-6 border-t border-[var(--glass-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="editorial-label text-xs">EXERCÍCIOS DA ROTINA</h4>
                  <p className="text-[10px] opacity-40 mt-1">Adicione os movimentos que compõem este treino.</p>
                </div>
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
                >
                  <Plus size={14} /> ADICIONAR
                </button>
              </div>

              <AnimatePresence>
                {showSearch && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-on-surface/5 p-4 rounded-3xl border border-[var(--glass-border)] space-y-4 mb-4">
                      <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Buscar no catálogo..."
                          className="w-full bg-surface border border-[var(--glass-border)] rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-primary/50"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-2">
                        {filteredCatalog.map(ex => (
                          <button 
                            key={ex.id}
                            onClick={() => addExerciseFromCatalog(ex)}
                            className="flex justify-between items-center p-3 rounded-xl hover:bg-surface/50 text-left transition-all border border-transparent hover:border-primary/20"
                          >
                            <div>
                              <p className="font-bold text-sm">{ex.name}</p>
                              <p className="text-[10px] opacity-40 uppercase tracking-widest">{ex.muscle_group}</p>
                            </div>
                            <Plus size={16} className="text-primary opacity-60" />
                          </button>
                        ))}
                        {filteredCatalog.length === 0 && (
                          <div className="p-4 text-center opacity-40 text-xs">Nenhum exercício encontrado no catálogo.</div>
                        )}
                      </div>
                      <button 
                        onClick={addCustomExercise}
                        className="w-full py-3 mt-2 border-2 border-dashed border-primary/20 text-primary rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 transition-all"
                      >
                        + CRIAR EXERCÍCIO LIVRE
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="p-5 rounded-3xl bg-on-surface/[0.03] border border-[var(--glass-border)] relative group hover:border-primary/30 transition-all flex flex-col gap-4">
                    <button 
                      onClick={() => removeExercise(idx)}
                      className="absolute top-4 right-4 p-2 text-red-400/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="pr-10">
                      <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">NOME</label>
                      <input 
                        type="text" 
                        value={ex.exercise_name}
                        onChange={(e) => updateExercise(idx, 'exercise_name', e.target.value)}
                        placeholder="Nome do Exercício"
                        className="w-full bg-transparent border-b border-on-surface/10 py-1 text-sm font-bold outline-none focus:border-primary mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-on-surface/5 p-2 rounded-xl text-center flex flex-col justify-center">
                        <label className="text-[7px] font-bold opacity-40 uppercase tracking-widest mb-1">SÉRIES</label>
                        <input 
                          type="number" 
                          value={ex.target_sets}
                          onChange={(e) => updateExercise(idx, 'target_sets', parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent text-center text-sm font-bold outline-none"
                        />
                      </div>
                      <div className="bg-on-surface/5 p-2 rounded-xl text-center flex flex-col justify-center">
                        <label className="text-[7px] font-bold opacity-40 uppercase tracking-widest mb-1">REPS</label>
                        <input 
                          type="number" 
                          value={ex.target_reps}
                          onChange={(e) => updateExercise(idx, 'target_reps', parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent text-center text-sm font-bold outline-none"
                        />
                      </div>
                      <div className="bg-primary/10 border border-primary/20 p-2 rounded-xl text-center flex flex-col justify-center">
                        <label className="text-[7px] font-bold text-primary uppercase tracking-widest mb-1">KG</label>
                        <input 
                          type="number" 
                          value={ex.target_weight}
                          onChange={(e) => updateExercise(idx, 'target_weight', parseFloat(e.target.value) || 0)}
                          className="w-full bg-transparent text-center text-sm font-bold text-primary outline-none"
                        />
                      </div>
                      <div className="bg-orange-500/10 border border-orange-500/20 p-2 rounded-xl text-center flex flex-col justify-center">
                        <label className="text-[7px] font-bold text-orange-400 uppercase tracking-widest mb-1">PAUSA(s)</label>
                        <input 
                          type="number" 
                          value={ex.target_rest_seconds}
                          onChange={(e) => updateExercise(idx, 'target_rest_seconds', parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent text-center text-sm font-bold text-orange-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {exercises.length === 0 && !showSearch && (
                  <div className="col-span-full py-12 text-center opacity-30 border-2 border-dashed border-on-surface/10 rounded-3xl">
                    <p className="editorial-label text-xs">Sua ficha está vazia. Adicione exercícios acima.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8 border-t border-[var(--glass-border)] bg-on-surface/[0.02] shrink-0">
            {errorMsg && (
              <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl text-center">
                Erro: {errorMsg}
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button 
                onClick={onClose} 
                className="px-8 py-3 rounded-2xl border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface/5 transition-all"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="px-10 py-3 rounded-2xl bg-primary text-surface text-[10px] font-bold tracking-widest uppercase flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <Clock className="animate-spin" size={16} /> : <Save size={16} />}
                CRIAR TREINO
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CreateRoutineModal;
