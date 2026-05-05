import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  History, 
  Sprout, 
  Heart, 
  Moon, 
  Sun, 
  Search,
  Plus,
  Calendar,
  Filter,
  Trash2,
  ChevronRight,
  TrendingUp,
  Brain,
  Download
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface SpiritualEntry {
  id: string;
  date: string;
  type: string;
  title: string;
  content: string;
  mood: string;
  duration_minutes: number;
}

const Spirituality = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'journal' | 'new' | 'insights'>('new');
  const [entries, setEntries] = useState<SpiritualEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    type: 'reflection',
    title: '',
    content: '',
    mood: 'peace',
    duration_minutes: 10
  });

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user]);

  const fetchEntries = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('spiritual_entries')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setEntries(data);
    setLoading(false);
  };

  const exportToCSV = () => {
    if (entries.length === 0) return;
    
    const headers = ["Data", "Tipo", "Estado de Espírito", "Duração (min)", "Conteúdo"];
    const rows = entries.map(entry => [
      new Date(entry.date).toLocaleDateString('pt-BR'),
      entry.type,
      entry.mood,
      entry.duration_minutes.toString(),
      `"${entry.content.replace(/"/g, '""')}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `espiritualidade_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    if (!user || !newEntry.content) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('spiritual_entries')
      .insert({
        ...newEntry,
        user_id: user.id,
        date: new Date().toISOString().split('T')[0]
      });

    if (!error) {
      setNewEntry({
        type: 'reflection',
        title: '',
        content: '',
        mood: 'peace',
        duration_minutes: 10
      });
      fetchEntries();
      setActiveTab('journal');
    }
    setSaving(false);
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'peace': return 'text-primary';
      case 'gratitude': return 'text-secondary';
      case 'revelation': return 'text-yellow-400';
      case 'struggle': return 'text-red-400';
      default: return 'text-on-surface/40';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
          <Sparkles size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">INTROSPECÇÃO & ALMA</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Espiritualidade</h2>
            <p className="text-on-surface-variant opacity-60 max-w-2xl text-sm leading-relaxed mt-2">
              Silencie o mundo exterior e registre sua jornada de crescimento espiritual e autoconhecimento.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              disabled={entries.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-on-surface/5 hover:bg-on-surface/10 border border-[var(--glass-border)] rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
            >
              <Download size={14} /> EXPORTAR CSV
            </button>
            <button 
              onClick={() => setActiveTab('new')}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> NOVA ENTRADA
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-4 p-1 bg-on-surface/5 rounded-2xl w-fit">
        {(['new', 'journal', 'insights'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-surface text-primary shadow-sm' 
                : 'text-on-surface/40 hover:text-on-surface/60'
            }`}
          >
            {tab === 'new' ? 'Novo Registro' : tab === 'journal' ? 'Diário' : 'Insights'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'new' && (
          <motion.div 
            key="new"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl"
          >
            <GlassCard className="p-8 border-primary/20 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="editorial-label text-xs">TIPO DE REGISTRO</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['prayer', 'meditation', 'gratitude', 'reflection', 'dream'].map((t) => (
                      <button
                        key={t}
                        onClick={() => setNewEntry({...newEntry, type: t})}
                        className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                          newEntry.type === t ? 'bg-primary/10 border-primary text-primary' : 'bg-on-surface/5 border-transparent text-on-surface/40'
                        }`}
                      >
                        {t === 'prayer' ? 'Oração' : t === 'meditation' ? 'Meditação' : t === 'gratitude' ? 'Gratidão' : t === 'reflection' ? 'Reflexão' : 'Sonho'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="editorial-label text-xs">ESTADO DE ESPÍRITO</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['peace', 'gratitude', 'revelation', 'struggle'].map((m) => (
                      <button
                        key={m}
                        onClick={() => setNewEntry({...newEntry, mood: m})}
                        className={`py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all border ${
                          newEntry.mood === m ? 'bg-primary/10 border-primary text-primary' : 'bg-on-surface/5 border-transparent text-on-surface/40'
                        }`}
                      >
                        {m === 'peace' ? 'Paz' : m === 'gratitude' ? 'Grato' : m === 'revelation' ? 'Clareza' : 'Luta'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="editorial-label text-xs">CONTEÚDO</label>
                <textarea 
                  value={newEntry.content}
                  onChange={e => setNewEntry({...newEntry, content: e.target.value})}
                  className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-3xl p-8 text-base outline-none focus:border-primary/50 transition-all min-h-[300px] resize-none italic"
                  placeholder="O que está em seu coração hoje?"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleSave}
                  disabled={saving || !newEntry.content}
                  className="px-12 py-4 bg-primary text-surface rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {saving ? "SALVANDO..." : "REGISTRAR NO DIÁRIO"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'journal' && (
          <motion.div 
            key="journal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {entries.length > 0 ? (
              <div className="relative border-l border-[var(--glass-border)] ml-4 pl-12 space-y-12">
                {entries.map((entry, idx) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[53px] top-0 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.5)]" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
                        <span className="text-primary">{new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        <span className="opacity-20">•</span>
                        <span className="opacity-40">{entry.type}</span>
                        <span className="opacity-20">•</span>
                        <span className={getMoodColor(entry.mood)}>{entry.mood}</span>
                      </div>
                      <GlassCard className="p-8 border-on-surface/5 hover:border-primary/20 transition-all">
                        <p className="text-lg leading-relaxed opacity-80 italic">"{entry.content}"</p>
                      </GlassCard>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center opacity-20 border-2 border-dashed border-on-surface/10 rounded-3xl">
                <p className="editorial-label text-xs">Seu diário espiritual está vazio.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div 
            key="insights"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <GlassCard className="p-8 text-center space-y-4">
              <Sprout size={32} className="mx-auto text-primary" />
              <div>
                <p className="editorial-label text-xs">CONSISTÊNCIA ATUAL</p>
                <h3 className="text-4xl font-bold mt-1">{entries.length} dias</h3>
              </div>
            </GlassCard>
            <GlassCard className="p-8 text-center space-y-4">
              <Brain size={32} className="mx-auto text-primary" />
              <div>
                <p className="editorial-label text-xs">TIPO MAIS FREQUENTE</p>
                <h3 className="text-4xl font-bold mt-1 uppercase text-sm">Reflexão</h3>
              </div>
            </GlassCard>
            <GlassCard className="p-8 text-center space-y-4">
              <TrendingUp size={32} className="mx-auto text-primary" />
              <div>
                <p className="editorial-label text-xs">ESTADO PREDOMINANTE</p>
                <h3 className="text-4xl font-bold mt-1 uppercase text-sm text-primary">Paz</h3>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Spirituality;
