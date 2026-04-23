import React, { useState } from "react";
import { X, Activity, Plus, Trash2, Save, Dumbbell, Clock } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

interface WorkoutLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workout: { exercises: Exercise[], duration: number }) => void;
}

const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({ isOpen, onClose, onSave }) => {
  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: 0, reps: 0, weight: 0 }]);
  const [duration, setDuration] = useState(45);

  if (!isOpen) return null;

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 0, reps: 0, weight: 0 }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: keyof Exercise, value: string | number) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], [field]: value };
    setExercises(newExercises);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ exercises, duration });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <GlassCard className="h-full flex flex-col p-0 border-primary/30 shadow-2xl relative">
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl text-primary">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Registrar Treino</h3>
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Controle de Vitalidade</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-on-surface/5 border border-[var(--glass-border)]">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-primary opacity-60" />
                <span className="text-xs font-bold opacity-60 uppercase tracking-widest">Duração da Sessão (min)</span>
              </div>
              <input 
                type="number" 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="w-20 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 text-center font-bold text-primary outline-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">EXERCÍCIOS</h4>
                <button 
                  type="button" 
                  onClick={addExercise}
                  className="flex items-center gap-2 text-[10px] font-bold text-primary hover:opacity-70 transition-all"
                >
                  <Plus size={14} /> ADICIONAR
                </button>
              </div>

              {exercises.map((ex, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)] space-y-4 group relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">NOME DO EXERCÍCIO</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Supino Reto"
                        value={ex.name}
                        onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                        className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-primary/50"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-center block">SÉRIES</label>
                        <input 
                          type="number" 
                          value={ex.sets}
                          onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value) || 0)}
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-2 py-2.5 text-center text-sm font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-center block">REPS</label>
                        <input 
                          type="number" 
                          value={ex.reps}
                          onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value) || 0)}
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-2 py-2.5 text-center text-sm font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest text-center block">PESO (KG)</label>
                        <input 
                          type="number" 
                          value={ex.weight}
                          onChange={(e) => updateExercise(idx, 'weight', parseInt(e.target.value) || 0)}
                          className="w-full bg-primary/5 border border-primary/20 rounded-xl px-2 py-2.5 text-center text-sm font-bold text-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  {exercises.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeExercise(idx)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500/10 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-red-500/20"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </form>

          <div className="p-6 border-t border-[var(--glass-border)] bg-on-surface/[0.02] flex justify-end gap-3">
            <button onClick={onClose} type="button" className="px-6 py-2 rounded-full border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest">CANCELAR</button>
            <button 
              onClick={handleSubmit} 
              className="px-8 py-2 rounded-full bg-primary text-surface text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Save size={14} /> SALVAR TREINO
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default WorkoutLogModal;
