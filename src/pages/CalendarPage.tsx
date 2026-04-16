import React, { useState, useEffect } from "react";
import { Calendar, ChevronRight, Plus, MapPin, Clock } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const CalendarPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", location: "", start_time: "" });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error("Erro ao buscar eventos:", error);
      if (error.message.includes("relation \"public.events\" does not exist")) {
        alert("ERRO: A tabela 'events' não foi encontrada. Você rodou o código SQL no Supabase?");
      }
    } else if (data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEvent.title || !newEvent.start_time) return;

    const { error } = await supabase
      .from('events')
      .insert([{
        user_id: user.id,
        title: newEvent.title,
        location: newEvent.location,
        start_time: new Date(newEvent.start_time).toISOString()
      }]);

    if (error) {
       console.error("Erro ao salvar evento:", error);
       alert("ERRO AO SALVAR: " + error.message);
    } else {
      fetchEvents();
      setNewEvent({ title: "", location: "", start_time: "" });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 opacity-60">
            <Calendar size={12} className="text-primary" />
            <p className="editorial-label !tracking-[0.2em]">SINCRONIZAÇÃO DE TEMPO</p>
          </div>
          <h2 className="display-lg">Calendário</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={18} />
          NOVO EVENTO
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          {isAdding && (
            <GlassCard className="p-6 border-primary/30 border-2">
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="editorial-label text-[10px] opacity-60">TÍTULO DO EVENTO</label>
                     <input 
                       type="text" 
                       value={newEvent.title}
                       onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                       placeholder="Ex: Reunião de Alinhamento" 
                       className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-3 px-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                       required
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="editorial-label text-[10px] opacity-60">DATA E HORA</label>
                     <input 
                       type="datetime-local" 
                       value={newEvent.start_time}
                       onChange={(e) => setNewEvent({...newEvent, start_time: e.target.value})}
                       className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-3 px-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                       required
                     />
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="editorial-label text-[10px] opacity-60">LOCALIZAÇÃO (OPCIONAL)</label>
                   <input 
                     type="text" 
                     value={newEvent.location}
                     onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                     placeholder="Ex: Google Meet ou Escritório" 
                     className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-xl py-3 px-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                   />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-full border border-[var(--glass-border)] text-xs font-bold">CANCELAR</button>
                  <button type="submit" className="px-6 py-2 rounded-full bg-primary text-surface text-xs font-bold shadow-lg shadow-primary/20">SALVAR EVENTO</button>
                </div>
              </form>
            </GlassCard>
          )}

          <GlassCard className="p-6 border border-[var(--glass-border)] bg-surface-variant/30">
            <h3 className="text-xl font-bold mb-8">Todos os Compromissos</h3>

            {loading ? (
              <div className="py-20 text-center editorial-label opacity-20 animate-pulse">CARREGANDO EVENTOS...</div>
            ) : events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)] hover:bg-on-surface/[0.04] transition-colors group">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                      <span className="text-[10px] font-bold uppercase">{new Date(event.start_time).toLocaleString('pt-BR', { month: 'short' })}</span>
                      <span className="text-xl font-bold leading-none">{new Date(event.start_time).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm md:text-base">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-1 opacity-60">
                         <div className="flex items-center gap-1.5 font-medium text-[10px] md:text-xs">
                           <Clock size={12} />
                           {new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                         </div>
                         {event.location && (
                           <div className="flex items-center gap-1.5 font-medium text-[10px] md:text-xs">
                             <MapPin size={12} />
                             {event.location}
                           </div>
                         )}
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-on-surface-variant opacity-30" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-[var(--glass-border)] rounded-3xl bg-on-surface/[0.01]">
                <div className="w-16 h-16 bg-on-surface/[0.03] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={32} className="opacity-20" />
                </div>
                <h4 className="text-lg font-bold mb-2">Sem Eventos</h4>
                <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                  Seu horizonte está livre. Use o botão no topo para agendar algo novo.
                </p>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 border border-[var(--glass-border)] bg-surface-variant/30">
            <h4 className="editorial-label mb-6">INTEGRAÇÕES</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)] opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Calendar size={16} /></div>
                  <span className="text-xs font-bold">Google Calendar</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-on-surface/20" />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)] opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-500"><Calendar size={16} /></div>
                  <span className="text-xs font-bold">iCloud Calendar</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-on-surface/20" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--glass-border)] opacity-40">
              <p className="text-[10px] leading-relaxed">
                As integrações diretas agora focam em dados persistidos localmente no seu banco de dados privado do Supabase.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
