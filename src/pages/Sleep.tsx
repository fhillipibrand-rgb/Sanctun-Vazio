import React, { useState, useEffect } from "react";
import { 
  Moon, 
  Clock, 
  Sun, 
  TrendingUp, 
  Settings, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Download,
  Share2,
  ChevronRight
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import SleepLogModal from "../components/modals/SleepLogModal";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface SleepLog {
  id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  duration_hours: number;
  quality: number;
}

interface SleepSettings {
  target_bedtime: string;
  target_wake_time: string;
  target_duration_hours: number;
}

const Sleep = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'monitor' | 'settings' | 'history'>('monitor');
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [settings, setSettings] = useState<SleepSettings>({
    target_bedtime: "23:00",
    target_wake_time: "07:00",
    target_duration_hours: 8
  });
  const [loading, setLoading] = useState(true);
  const [showSleepModal, setShowSleepModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const { data: logsData } = await supabase
      .from('sleep_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);
    
    const { data: settingsData } = await supabase
      .from('sleep_settings')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (logsData) setLogs(logsData);
    if (settingsData) setSettings(settingsData);
    setLoading(false);
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 4) return 'text-secondary';
    if (quality >= 3) return 'text-primary';
    return 'text-red-400';
  };

  const exportToCSV = () => {
    if (logs.length === 0) return;
    
    const headers = ["Data", "Dormir", "Acordar", "Duração (h)", "Qualidade (1-5)"];
    const rows = logs.map(log => [
      new Date(log.date).toLocaleDateString('pt-BR'),
      new Date(log.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      new Date(log.wake_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      log.duration_hours.toFixed(1),
      log.quality.toString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sono_relatorio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
          <Moon size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">REPARAÇÃO & DESCANSO</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Qualidade do Sono</h2>
            <p className="text-on-surface-variant opacity-60 max-w-2xl text-sm leading-relaxed mt-2">
              Sincronize seu ritmo circadiano e acompanhe a eficiência do seu descanso para uma vida mais produtiva.
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
              onClick={() => setShowSleepModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={16} /> REGISTRAR NOITE
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="flex gap-4 p-1 bg-on-surface/5 rounded-2xl w-fit">
        {(['monitor', 'history', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-surface text-primary shadow-sm' 
                : 'text-on-surface/40 hover:text-on-surface/60'
            }`}
          >
            {tab === 'monitor' ? 'Monitoramento' : tab === 'history' ? 'Histórico' : 'Preferências'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-30 editorial-label animate-pulse">
          ANALISANDO PADRÕES DE SONO...
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'monitor' && (
            <motion.div 
              key="monitor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="p-8 md:col-span-2 flex flex-col justify-between border-primary/20 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden group">
                  <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Moon size={180} />
                  </div>
                  <div>
                    <p className="editorial-label text-xs mb-1">MÉDIA DE DURAÇÃO</p>
                    <h3 className="text-5xl font-bold tracking-tighter">7h 45m</h3>
                    <p className="text-[10px] font-bold text-secondary mt-2 flex items-center gap-1 uppercase">
                      <TrendingUp size={12} /> +12% vs. semana anterior
                    </p>
                  </div>
                  <div className="mt-12 h-20 flex items-end gap-1.5">
                    {[65, 80, 45, 90, 70, 85, 95].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-primary/20 rounded-t-lg relative group/bar"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-lg transition-all duration-1000 group-hover/bar:brightness-125" style={{ height: '70%' }} />
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <GlassCard className="p-6 text-center space-y-3">
                    <Clock size={24} className="mx-auto text-primary" />
                    <div>
                      <p className="editorial-label text-[9px]">META DIÁRIA</p>
                      <h4 className="text-2xl font-bold font-mono">{settings.target_duration_hours}h</h4>
                    </div>
                  </GlassCard>
                  <GlassCard className="p-6 text-center space-y-3">
                    <Sun size={24} className="mx-auto text-yellow-400" />
                    <div>
                      <p className="editorial-label text-[9px]">HORÁRIO ACORDAR</p>
                      <h4 className="text-2xl font-bold font-mono">{settings.target_wake_time}</h4>
                    </div>
                  </GlassCard>
                  <GlassCard className="p-6 text-center space-y-3">
                    <CheckCircle2 size={24} className="mx-auto text-secondary" />
                    <div>
                      <p className="editorial-label text-[9px]">CONSISTÊNCIA</p>
                      <h4 className="text-2xl font-bold">85%</h4>
                    </div>
                  </GlassCard>
                  <GlassCard className="p-6 text-center space-y-3">
                    <AlertCircle size={24} className="mx-auto text-primary" />
                    <div>
                      <p className="editorial-label text-[9px]">EFICIÊNCIA</p>
                      <h4 className="text-2xl font-bold">92%</h4>
                    </div>
                  </GlassCard>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard className="p-8 md:col-span-2">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="editorial-label text-xs">ÚLTIMOS 7 DIAS</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[9px] font-bold uppercase opacity-40">Duração</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-[9px] font-bold uppercase opacity-40">Qualidade</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64 flex items-end gap-4">
                    {/* Gráfico de barras combinadas virá aqui */}
                    {[1,2,3,4,5,6,7].map(i => (
                      <div key={i} className="flex-1 space-y-2">
                        <div className="w-full bg-primary/10 rounded-xl relative h-48 overflow-hidden group">
                          <div className="absolute bottom-0 w-full bg-primary/40 rounded-xl transition-all duration-1000 group-hover:bg-primary" style={{ height: `${Math.random() * 80 + 20}%` }} />
                          <div className="absolute bottom-0 w-full bg-secondary/60 rounded-xl transition-all duration-1000 group-hover:bg-secondary" style={{ height: `${Math.random() * 40}%` }} />
                        </div>
                        <p className="text-[8px] font-mono font-bold opacity-30 text-center uppercase">Dia {i}</p>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-8 space-y-6">
                  <h4 className="editorial-label text-xs">INSIGHTS DE IA</h4>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-xs leading-relaxed italic opacity-80">
                      "Você dormiu 45 minutos a mais que a média. Sua produtividade no dia seguinte aumentou em 15%."
                    </div>
                    <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10 text-xs leading-relaxed italic opacity-80">
                      "Consistência excelente! Você manteve seu horário de acordar por 6 dias seguidos."
                    </div>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="w-full py-3 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                      VER RELATÓRIO COMPLETO <ChevronRight size={14} />
                    </button>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {logs.map((log) => (
                <GlassCard key={log.id} className="p-6 flex items-center justify-between border-on-surface/5 hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{new Date(log.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-xl font-bold font-mono">{log.duration_hours.toFixed(1)}h</p>
                    </div>
                    <div className="h-8 w-px bg-on-surface/10" />
                    <div>
                      <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest mb-1">HORÁRIOS</p>
                      <p className="text-sm font-mono font-bold opacity-60">
                        {new Date(log.bedtime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                        <span className="mx-2 opacity-20">→</span> 
                        {new Date(log.wake_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] font-bold opacity-30 uppercase tracking-widest mb-1">QUALIDADE</p>
                      <span className={`text-sm font-bold ${getQualityColor(log.quality)}`}>
                        {log.quality === 5 ? 'Excelente' : log.quality === 4 ? 'Boa' : 'Regular'}
                      </span>
                    </div>
                    <button className="p-3 hover:bg-on-surface/5 rounded-2xl transition-all">
                      <Share2 size={18} className="opacity-30" />
                    </button>
                  </div>
                </GlassCard>
              ))}
              {logs.length === 0 && (
                <div className="py-20 text-center opacity-20 border-2 border-dashed border-on-surface/10 rounded-3xl">
                  <p className="editorial-label text-xs">Nenhum registro de sono encontrado.</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl"
            >
              <GlassCard className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="editorial-label text-xs">HORÁRIO DE DORMIR ALVO</label>
                    <input 
                      type="time" 
                      value={settings.target_bedtime}
                      onChange={e => setSettings({...settings, target_bedtime: e.target.value})}
                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-6 text-2xl font-bold font-mono outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="editorial-label text-xs">HORÁRIO DE ACORDAR ALVO</label>
                    <input 
                      type="time" 
                      value={settings.target_wake_time}
                      onChange={e => setSettings({...settings, target_wake_time: e.target.value})}
                      className="w-full bg-on-surface/5 border border-[var(--glass-border)] rounded-2xl p-6 text-2xl font-bold font-mono outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="editorial-label text-xs">META DE DURAÇÃO (HORAS)</label>
                  <input 
                    type="range" 
                    min="4" 
                    max="12" 
                    step="0.5"
                    value={settings.target_duration_hours}
                    onChange={e => setSettings({...settings, target_duration_hours: parseFloat(e.target.value)})}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xl font-bold font-mono">
                    <span className="opacity-30">4h</span>
                    <span className="text-primary">{settings.target_duration_hours}h</span>
                    <span className="opacity-30">12h</span>
                  </div>
                </div>
                <button className="w-full py-4 bg-primary text-surface rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  SALVAR PREFERÊNCIAS
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <SleepLogModal 
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onSave={fetchData}
      />
    </div>
  );
};

export default Sleep;
