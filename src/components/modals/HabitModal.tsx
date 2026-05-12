import React, { useState, useEffect } from "react";
import { X, Save, Target, Sparkles, BookOpen, Dumbbell, Zap, Clock, Trash2, CalendarDays, Flame } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion } from "motion/react";

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  active_days?: number[];
  reminder_time?: string;
  target_frequency?: number;
  manual_streak?: number;
}

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Omit<Habit, 'id'> | Habit) => void;
  onDelete?: (id: string) => void;
  editingHabit?: Habit | null;
}

const ICONS = [
  { name: 'target', icon: Target },
  { name: 'sparkles', icon: Sparkles },
  { name: 'book', icon: BookOpen },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'zap', icon: Zap },
  { name: 'clock', icon: Clock }
];

const COLORS = [
  { name: 'text-primary', label: 'Verde Sanctum' },
  { name: 'text-purple-400', label: 'Roxo Foco' },
  { name: 'text-blue-400', label: 'Azul Intelecto' },
  { name: 'text-orange-400', label: 'Laranja Força' },
  { name: 'text-yellow-400', label: 'Amarelo Energia' },
  { name: 'text-cyan-400', label: 'Ciano Leveza' },
];

const DAYS_OF_WEEK = [
  { id: 0, label: 'D' },
  { id: 1, label: 'S' },
  { id: 2, label: 'T' },
  { id: 3, label: 'Q' },
  { id: 4, label: 'Q' },
  { id: 5, label: 'S' },
  { id: 6, label: 'S' },
];

const HabitModal: React.FC<HabitModalProps> = ({ isOpen, onClose, onSave, onDelete, editingHabit }) => {
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("target");
  const [selectedColor, setSelectedColor] = useState("text-primary");
  const [activeDays, setActiveDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState("");
  const [targetFrequency, setTargetFrequency] = useState(1);
  const [manualStreak, setManualStreak] = useState(0);

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setSelectedIcon(editingHabit.icon);
      setSelectedColor(editingHabit.color);
      setActiveDays(editingHabit.active_days || [0, 1, 2, 3, 4, 5, 6]);
      setReminderTime(editingHabit.reminder_time || "");
      setTargetFrequency(editingHabit.target_frequency || 1);
      setManualStreak(editingHabit.manual_streak || 0);
    } else {
      setTitle("");
      setSelectedIcon("target");
      setSelectedColor("text-primary");
      setActiveDays([0, 1, 2, 3, 4, 5, 6]);
      setReminderTime("");
      setTargetFrequency(1);
      setManualStreak(0);
    }
  }, [editingHabit, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    if (activeDays.length === 0) {
      alert("Selecione pelo menos um dia da semana.");
      return;
    }

    const data = { 
      title, 
      icon: selectedIcon, 
      color: selectedColor, 
      active_days: activeDays,
      reminder_time: reminderTime || undefined,
      target_frequency: targetFrequency,
      manual_streak: manualStreak 
    };

    if (editingHabit) {
      onSave({ ...data, id: editingHabit.id });
    } else {
      onSave(data);
    }
    onClose();
  };


  const toggleDay = (dayId: number) => {
    setActiveDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId].sort()
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden"
      >
        <GlassCard className="p-0 border-primary/30 shadow-2xl">
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Target size={20} />
              </div>
              <h3 className="text-xl font-bold tracking-tight">
                {editingHabit ? 'Editar Hábito' : 'Novo Hábito'}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-full transition-all">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                   NOME DO HÁBITO
                </label>
                <input 
                  type="text" 
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/50"
                  placeholder="Ex: Leitura Matinal"
                  required
                />
              </div>
              
              <div className="space-y-1.5 pt-2">
                <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2 mb-2">
                  <CalendarDays size={10} /> FREQUÊNCIA (DIAS DA SEMANA)
                </label>
                <div className="flex gap-2 justify-between">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = activeDays.includes(day.id);
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                          isSelected 
                            ? 'bg-primary text-surface shadow-lg shadow-primary/20 scale-105' 
                            : 'bg-on-surface/5 text-on-surface/40 hover:bg-on-surface/10'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={10} /> HORÁRIO DEFINIDO
                  </label>
                  <input 
                    type="time" 
                    value={reminderTime}
                    onChange={e => setReminderTime(e.target.value)}
                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/50 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <Zap size={10} /> META DIÁRIA
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    max="100"
                    value={targetFrequency}
                    onChange={e => setTargetFrequency(parseInt(e.target.value) || 1)}
                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/50 text-on-surface"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest flex items-center gap-2">
                    <Flame size={10} /> AJUSTE DE OFENSIVA
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={manualStreak}
                    onChange={e => setManualStreak(parseInt(e.target.value) || 0)}
                    className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-primary/50 text-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                    ÍCONE
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {ICONS.map((ico) => (
                      <button
                        key={ico.name}
                        type="button"
                        onClick={() => setSelectedIcon(ico.name)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          selectedIcon === ico.name 
                            ? 'bg-primary text-surface shadow-lg shadow-primary/20 scale-110' 
                            : 'bg-on-surface/5 text-on-surface/40 hover:bg-on-surface/10'
                        }`}
                      >
                        <ico.icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                    COR
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${c.name} ${
                          selectedColor === c.name 
                            ? 'bg-current shadow-[0_0_12px_rgba(var(--primary),0.5)] scale-110' 
                            : 'bg-current/20 hover:scale-105'
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--glass-border)] flex justify-between items-center gap-3">
              {editingHabit && onDelete ? (
                <button 
                  type="button"
                  onClick={() => {
                    if (window.confirm('Tem certeza que deseja excluir este hábito?')) {
                      onDelete(editingHabit.id);
                      onClose();
                    }
                  }}
                  className="p-2 hover:bg-red-400/10 text-red-400 rounded-xl transition-all"
                  title="Excluir hábito"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                <div /> // Spacer
              )}
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="px-6 py-2 rounded-xl border border-[var(--glass-border)] text-[10px] font-bold uppercase tracking-widest hover:bg-on-surface/5"
                >
                  CANCELAR
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 rounded-xl bg-primary text-surface text-[10px] font-bold tracking-widest uppercase flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                >
                  <Save size={14} />
                  SALVAR
                </button>
              </div>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default HabitModal;
