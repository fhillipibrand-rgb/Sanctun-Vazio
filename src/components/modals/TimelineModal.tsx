import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Calendar, Wallet, CheckCircle2, Heart, Clock, Loader2, Target, Plus
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import GlassCard from "../ui/GlassCard";

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO string for sorting
  category: 'Tarefas' | 'Finanças' | 'Hábitos' | 'Calendário';
  icon: any;
  color: string;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ isOpen, onClose }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'Todos' | 'Tarefas' | 'Finanças' | 'Hábitos' | 'Calendário'>('Todos');

  useEffect(() => {
    if (isOpen) {
      fetchGlobalTimeline();
    }
  }, [isOpen]);

  const fetchGlobalTimeline = async () => {
    setLoading(true);
    
    try {
      const combinedEvents: TimelineEvent[] = [];

      // 1. Fetch Tasks (Created and Completed)
      const { data: tasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(50);
      tasks?.forEach(t => {
        // Tarefa Criada
        combinedEvents.push({
          id: `task-new-${t.id}`,
          title: `Nova Tarefa: ${t.title}`,
          description: t.description || 'Tarefa adicionada ao backlog.',
          timestamp: t.created_at,
          category: 'Tarefas',
          icon: Plus,
          color: 'text-primary'
        });
        
        // Tarefa Concluída
        if (t.is_completed && t.completed_at) {
          combinedEvents.push({
            id: `task-done-${t.id}`,
            title: `Concluiu Tarefa: ${t.title}`,
            description: 'Tarefa finalizada com sucesso.',
            timestamp: t.completed_at,
            category: 'Tarefas',
            icon: CheckCircle2,
            color: 'text-primary'
          });
        }
      });

      // 2. Fetch Finances
      const { data: txs } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50);
      txs?.forEach(tx => {
        combinedEvents.push({
          id: `tx-${tx.id}`,
          title: `${tx.type === 'income' ? 'Recebeu' : 'Gastou'}: ${tx.name}`,
          description: `Valor: R$ ${tx.amount}`,
          timestamp: tx.created_at,
          category: 'Finanças',
          icon: Wallet,
          color: tx.type === 'income' ? 'text-secondary' : 'text-red-400'
        });
      });

      // 3. Fetch Habits Logs
      const { data: habits } = await supabase.from('habits_logs').select('*').order('created_at', { ascending: false }).limit(50);
      habits?.forEach(h => {
        let title = 'Hábito Registrado';
        let desc = 'Registro realizado.';
        
        if (h.type === 'exercise') {
          title = `Treino: ${h.value?.title || 'Exercício'}`;
          desc = `${h.value?.sets || 0} séries x ${h.value?.reps || 0} reps`;
        } else if (h.type === 'sleep') {
          title = 'Registro de Sono';
          desc = `Qualidade: ${h.value?.quality || 0}%`;
        } else if (h.type === 'gratitude') {
          title = 'Diário Espiritual';
          desc = 'Registro de gratidão adicionado.';
        } else if (h.type === 'reading') {
          title = `Leitura: ${h.value?.title || 'Livro'}`;
          desc = `Páginas: ${h.value?.progress} / ${h.value?.total}`;
        }

        combinedEvents.push({
          id: `habit-${h.id}`,
          title,
          description: desc,
          timestamp: h.created_at || new Date(`${h.date}T12:00:00`).toISOString(), // fallback
          category: 'Hábitos',
          icon: Heart,
          color: 'text-purple-400'
        });
      });

      // 4. Fetch Calendar Events
      const { data: calEvents } = await supabase.from('events').select('*').order('created_at', { ascending: false }).limit(50);
      calEvents?.forEach(e => {
        combinedEvents.push({
          id: `evt-${e.id}`,
          title: `Agendou: ${e.title}`,
          description: `Para o dia ${new Date(e.start_time).toLocaleDateString('pt-BR')}`,
          timestamp: e.created_at,
          category: 'Calendário',
          icon: Calendar,
          color: 'text-blue-400'
        });
      });

      // Sort all combined events by timestamp descending
      combinedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setEvents(combinedEvents);
    } catch (err) {
      console.error("Error fetching global timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'Todos' ? events : events.filter(e => e.category === filter);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-3xl max-h-[85vh] flex flex-col"
          >
            <GlassCard className="flex flex-col p-0 overflow-hidden border-on-surface/10 h-full">
              {/* Header */}
              <div className="p-6 border-b border-[var(--glass-border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-on-surface/5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-on-surface/10 rounded-xl">
                    <Clock size={24} className="text-on-surface" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Linha do Tempo Global</h3>
                    <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mt-0.5">HISTÓRICO COMPLETO DE ATIVIDADES</p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="absolute top-6 right-6 p-2 hover:bg-on-surface/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 border-b border-[var(--glass-border)] overflow-x-auto flex gap-2">
                {['Todos', 'Tarefas', 'Finanças', 'Hábitos', 'Calendário'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                      filter === f 
                        ? 'bg-on-surface text-surface shadow-md' 
                        : 'bg-on-surface/5 hover:bg-on-surface/10 text-on-surface/60'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Timeline List */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative">
                {loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    <p className="editorial-label text-xs tracking-widest">SINCRONIZANDO DADOS...</p>
                  </div>
                ) : filteredEvents.length > 0 ? (
                  <div className="relative border-l-2 border-on-surface/10 ml-4 md:ml-6 space-y-8 pb-4">
                    {filteredEvents.map((evt, idx) => (
                      <motion.div 
                        key={evt.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                        className="relative pl-8 md:pl-10 group"
                      >
                        {/* Timeline Node */}
                        <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-xl bg-surface border-2 border-[var(--glass-border)] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-on-surface/30 transition-all ${evt.color}`}>
                          <evt.icon size={14} />
                        </div>
                        
                        <div className="bg-on-surface/[0.03] hover:bg-on-surface/[0.06] border border-[var(--glass-border)] p-4 md:p-5 rounded-2xl transition-all cursor-default">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                            <h4 className="font-bold text-sm leading-tight tracking-tight">{evt.title}</h4>
                            <span className="text-[10px] font-mono opacity-50 shrink-0">
                              {new Date(evt.timestamp).toLocaleString('pt-BR', { 
                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-xs opacity-60 leading-relaxed">{evt.description}</p>
                          <span className="inline-block mt-3 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-on-surface/5 opacity-50">
                            {evt.category}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20">
                    <Target size={48} className="mb-4" />
                    <p className="editorial-label text-xs tracking-widest text-center">NENHUMA ATIVIDADE ENCONTRADA</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TimelineModal;
