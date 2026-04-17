import React, { useState, useEffect } from "react";
import { Calendar, ChevronRight, ChevronLeft, Plus, MapPin, Clock } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

const CalendarPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", location: "", start_time: "" });
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    // Busca eventos normais
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .order('start_time', { ascending: true });

    // Busca projetos para extrair deadlines
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .not('deadline', 'is', null);

    if (eventsError || projectsError) {
      console.error("Erro ao buscar dados do calendário:", eventsError || projectsError);
    } else {
      // Converte projetos em eventos virtuais
      const projectEvents = (projectsData || []).map(p => ({
        id: `proj-${p.id}`,
        title: `ENTREGA: ${p.name}`,
        start_time: p.deadline,
        isProjectDeadline: true,
        color: p.color
      }));

      setEvents([...(eventsData || []), ...projectEvents]);
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

  // Lógica do Calendário Grid
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderGrid = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = startDayOfMonth(year, month);
    
    const cells = [];
    
    // Empty cells for padding
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-on-surface/[0.01] border border-[var(--glass-border)] opacity-20" />);
    }
    
    // Real day cells
    for (let day = 1; day <= daysCount; day++) {
      const dateStr = new Date(year, month, day).toDateString();
      const isToday = new Date().toDateString() === dateStr;
      const isSelected = selectedDate.toDateString() === dateStr;
      
      const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === dateStr);
      
      cells.push(
        <div 
          key={day} 
          onClick={() => {
              setSelectedDate(new Date(year, month, day));
              // if clicking a day with events, scroll or show list? For now just select.
          }}
          className={`h-24 md:h-32 border border-[var(--glass-border)] p-2 transition-all cursor-pointer group hover:bg-on-surface/[0.05] relative ${
            isSelected ? 'bg-primary/5 border-primary/40' : ''
          }`}
        >
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
            isToday ? 'bg-primary text-surface' : 'opacity-40'
          }`}>
            {day}
          </span>
          
          <div className="mt-2 space-y-1 overflow-hidden">
            {dayEvents.slice(0, 2).map((event, idx) => (
              <div 
                key={idx} 
                className={`text-[9px] truncate px-1.5 py-0.5 rounded font-bold ${
                  event.isProjectDeadline ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-primary/20 text-primary'
                }`}
                style={event.isProjectDeadline ? { color: event.color, backgroundColor: `${event.color}20`, borderColor: `${event.color}40` } : {}}
              >
                {event.isProjectDeadline && "🚀 "}{event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-[8px] opacity-40 font-bold px-1">+{dayEvents.length - 2} mais</div>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="flex items-start justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 opacity-60">
            <Calendar size={12} className="text-primary" />
            <p className="editorial-label !tracking-[0.2em]">PRODUTIVIDADE & TEMPO</p>
          </div>
          <h2 className="display-lg">Agenda Visual</h2>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
        >
          <Plus size={18} />
          NOVO COMPROMISSO
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          {isAdding && (
            <GlassCard className="p-6 border-primary/30 border-2">
              <form onSubmit={handleAddEvent} className="space-y-4">
                 <h4 className="editorial-label text-xs mb-4">AGENDAR COMPROMISSO</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="editorial-label text-[10px] opacity-60">TÍTULO</label>
                     <input 
                       type="text" 
                       value={newEvent.title}
                       onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
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
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 rounded-full border border-[var(--glass-border)] text-xs font-bold">CANCELAR</button>
                  <button type="submit" className="px-6 py-2 rounded-full bg-primary text-surface text-xs font-bold">SALVAR</button>
                </div>
              </form>
            </GlassCard>
          )}

          <GlassCard className="p-0 overflow-hidden border border-[var(--glass-border)] bg-surface-variant/10">
            {/* Header do Calendário Grid */}
            <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-on-surface/[0.02]">
               <h3 className="text-xl font-bold uppercase tracking-tight">
                 {viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
               </h3>
               <div className="flex items-center gap-1">
                 <button onClick={prevMonth} className="p-2 hover:bg-on-surface/5 rounded-lg transition-all"><ChevronLeft size={20} /></button>
                 <button onClick={() => setViewDate(new Date())} className="px-3 py-1.5 text-[10px] font-bold border border-[var(--glass-border)] rounded-md hover:bg-on-surface/5 transition-all uppercase tracking-widest">Hoje</button>
                 <button onClick={nextMonth} className="p-2 hover:bg-on-surface/5 rounded-lg transition-all"><ChevronRight size={20} /></button>
               </div>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-7 border-b border-[var(--glass-border)] bg-on-surface/[0.01]">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="py-3 text-center text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de Dias */}
            <div className="grid grid-cols-7 border-collapse">
              {renderGrid()}
            </div>
          </GlassCard>
        </div>

        {/* Lateral de Compromissos do Dia Escolhido */}
        <div className="space-y-6">
          <GlassCard className="p-6 border border-[var(--glass-border)] bg-surface-variant/30 h-full">
            <h4 className="editorial-label mb-6 text-primary flex items-center justify-between">
              COMPROMISSOS 
              <span className="opacity-40">{selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).toUpperCase()}</span>
            </h4>
            
            <div className="space-y-4">
              {events.filter(e => new Date(e.start_time).toDateString() === selectedDate.toDateString()).length > 0 ? (
                events.filter(e => new Date(e.start_time).toDateString() === selectedDate.toDateString()).map((event, i) => (
                  <div key={i} className={`p-4 rounded-2xl border space-y-3 group transition-all ${
                    event.isProjectDeadline ? 'bg-secondary/5 border-secondary/30 hover:bg-secondary/10' : 'bg-on-surface/[0.03] border-[var(--glass-border)] hover:bg-primary/5'
                  }`}>
                    <div className="flex items-start justify-between">
                       <h5 className="font-bold text-sm leading-tight">
                         {event.isProjectDeadline && <span className="text-[10px] text-secondary mr-2">PROJETO</span>}
                         {event.title}
                       </h5>
                       <Clock size={14} className="opacity-20 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-3 opacity-60 text-[10px] font-medium">
                       <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                       {event.location && <span className="flex items-center gap-1.5"><MapPin size={12} /> {event.location}</span>}
                       {event.isProjectDeadline && <span className="text-secondary font-bold">MARCO ESTRATÉGICO</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 opacity-20">
                   <p className="editorial-label text-[10px]">NENHUM COMPROMISSO</p>
                </div>
              )}
            </div>

            <div className="mt-12 pt-8 border-t border-[var(--glass-border)]">
               <h4 className="editorial-label mb-4 opacity-40">PRÓXIMAS 24H</h4>
                {events.filter(e => {
                  const day = new Date(e.start_time);
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  return day > new Date() && day < tomorrow;
                }).slice(0, 2).map((e, i) => (
                  <div key={i} className="flex items-center gap-3 mb-3">
                     <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                     <span className="text-[10px] font-bold truncate flex-1">{e.title}</span>
                     <span className="text-[9px] opacity-40">{new Date(e.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
