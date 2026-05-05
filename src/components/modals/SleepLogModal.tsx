import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Clock, Save } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface SleepLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const SleepLogModal = ({ isOpen, onClose, onSave }: SleepLogModalProps) => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState(4);
  const [saving, setSaving] = useState(false);

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${bedtime}`);
    let end = new Date(`2000-01-01T${wakeTime}`);
    
    if (end < start) {
      end = new Date(`2000-01-02T${wakeTime}`);
    }
    
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const duration_hours = calculateDuration();
    
    // Create combined timestamp strings assuming timezone is local
    const bedtimeStr = new Date(`${date}T${bedtime}:00`).toISOString();
    // If wake time is less than bedtime, it means they woke up the next day
    const isNextDay = parseInt(wakeTime.split(':')[0]) < parseInt(bedtime.split(':')[0]);
    const wakeDate = new Date(date);
    if (isNextDay) {
      wakeDate.setDate(wakeDate.getDate() + 1);
    }
    const wakeDateString = wakeDate.toISOString().split('T')[0];
    const wakeTimeStr = new Date(`${wakeDateString}T${wakeTime}:00`).toISOString();

    const { error } = await supabase
      .from('sleep_logs')
      .upsert({
        user_id: user.id,
        date: date,
        bedtime: bedtimeStr,
        wake_time: wakeTimeStr,
        duration_hours,
        quality
      }, { onConflict: 'user_id,date' });

    setSaving(false);
    if (!error) {
      onSave();
      onClose();
    } else {
      console.error("Error saving sleep log", error);
      alert("Erro ao salvar log de sono.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                  <Moon size={200} className="text-primary" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Moon size={24} />
                      </div>
                      <div>
                        <p className="editorial-label text-[10px] text-primary">REPARAÇÃO & DESCANSO</p>
                        <h2 className="text-2xl font-bold tracking-tight">Registrar Noite</h2>
                      </div>
                    </div>
                    <button 
                      onClick={onClose}
                      className="p-2 hover:bg-on-surface/5 rounded-full transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="editorial-label text-xs mb-2 block">DATA DA NOITE (Início)</label>
                      <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 text-sm outline-none focus:border-primary/50 transition-all font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="editorial-label text-xs mb-2 block">DORMIR</label>
                        <input 
                          type="time"
                          value={bedtime}
                          onChange={(e) => setBedtime(e.target.value)}
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 text-xl font-bold outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="editorial-label text-xs mb-2 block">ACORDAR</label>
                        <input 
                          type="time"
                          value={wakeTime}
                          onChange={(e) => setWakeTime(e.target.value)}
                          className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-4 text-xl font-bold outline-none focus:border-primary/50 transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <label className="editorial-label text-xs block">DURAÇÃO CALCULADA</label>
                        <span className="text-xl font-mono font-bold text-primary">{calculateDuration().toFixed(1)}h</span>
                      </div>
                    </div>

                    <div>
                      <label className="editorial-label text-xs mb-2 block">QUALIDADE DO SONO (1-5)</label>
                      <input 
                        type="range"
                        min="1"
                        max="5"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs opacity-50 mt-1 px-1">
                        <span>Péssima</span>
                        <span>Boa</span>
                        <span>Excelente</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-4 bg-primary text-surface rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving ? 'SALVANDO...' : (
                        <>
                          <Save size={16} /> REGISTRAR NOITE
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SleepLogModal;
