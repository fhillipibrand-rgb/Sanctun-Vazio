import React from "react";
import { X, Sparkles, Calendar, BookOpen } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";

interface SpiritualLog {
  date: string;
  value: { text: string };
}

interface SpiritualJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SpiritualLog[];
}

const SpiritualJournalModal: React.FC<SpiritualJournalModalProps> = ({ isOpen, onClose, logs }) => {
  if (!isOpen) return null;

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        <GlassCard className="h-full flex flex-col p-0 border-primary/30 shadow-2xl relative">
          {/* Header */}
          <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl text-primary">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Diário Espiritual</h3>
                <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Histórico de Introspecção</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-on-surface/10 rounded-full transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {sortedLogs.length > 0 ? (
              <div className="relative border-l-2 border-[var(--glass-border)] ml-3 pl-8 space-y-12">
                {sortedLogs.map((log, idx) => {
                  const date = new Date(log.date);
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full bg-surface border-2 border-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.3)] z-10" />
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <Calendar size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        
                        <div className="p-5 rounded-2xl bg-on-surface/[0.03] border border-[var(--glass-border)] group-hover:bg-primary/5 transition-all">
                          <p className="text-sm leading-relaxed opacity-80 italic">
                            "{log.value.text}"
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                <BookOpen size={48} className="mb-4" />
                <p className="editorial-label text-xs">O seu diário está vazio. Comece registrando algo hoje!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[var(--glass-border)] bg-on-surface/[0.02] flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-primary text-surface text-[10px] font-bold tracking-widest uppercase hover:scale-105 transition-all"
            >
              CONCLUÍDO
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default SpiritualJournalModal;
