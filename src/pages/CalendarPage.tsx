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
  
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
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

  // Lógica do Calendário Grid (Mês)
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderMonthView = () => {
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

    return (
      <div className="grid grid-cols-7 border-collapse">
        {cells}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(viewDate);
    startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-px bg-[var(--glass-border)] overflow-hidden">
        {weekDays.map((day, idx) => {
          const dateStr = day.toDateString();
          const isToday = new Date().toDateString() === dateStr;
          const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === dateStr);
          
          return (
            <div key={idx} className="min-h-[400px] bg-surface/50 p-4 space-y-4">
              <div className="text-center pb-4 border-b border-[var(--glass-border)]">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                <p className={`text-2xl font-bold mt-1 ${isToday ? 'text-primary' : ''}`}>{day.getDate()}</p>
              </div>
              <div className="space-y-2">
                {dayEvents.map((event, eIdx) => (
                  <div 
                    key={eIdx}
                    className={`p-2 rounded-xl text-[10px] font-bold border transition-all ${
                      event.isProjectDeadline ? 'bg-secondary/5 border-secondary/30' : 'bg-primary/5 border-primary/20'
                    }`}
                    style={event.isProjectDeadline ? { color: event.color, borderColor: `${event.color}30` } : {}}
                  >
                    <div className="flex items-center gap-1.5 opacity-60 mb-1">
                      <Clock size={10} />
                      {new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter(e => new Date(e.start_time).toDateString() === viewDate.toDateString());
    
    return (
      <div className="p-8 space-y-6 min-h-[400px]">
        <div className="flex items-center gap-4 border-b border-[var(--glass-border)] pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex flex-col items-center justify-center border border-primary/20">
            <span className="text-[10px] font-bold opacity-40 uppercase">{viewDate.toLocaleDateString('pt-BR', { month: 'short' })}</span>
            <span className="text-2xl font-bold text-primary">{viewDate.getDate()}</span>
          </div>
          <div>
            <h4 className="text-2xl font-bold">{viewDate.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase()}</h4>
            <p className="text-sm opacity-40">{dayEvents.length} compromissos agendados</p>
          </div>
        </div>

        <div className="space-y-4">
          {dayEvents.length > 0 ? dayEvents.map((event, idx) => (
            <div key={idx} className="flex gap-6 group">
              <div className="w-20 pt-1 text-right">
                <span className="text-xs font-bold opacity-40">{new Date(event.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex-1 pb-6 border-l-2 border-[var(--glass-border)] pl-6 relative">
                <div className="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-primary" />
                <div className={`p-4 rounded-2xl border transition-all ${
                  event.isProjectDeadline ? 'bg-secondary/5 border-secondary/30' : 'bg-on-surface/[0.03] border-[var(--glass-border)]'
                }`} style={event.isProjectDeadline ? { color: event.color, borderColor: `${event.color}30` } : {}}>
                  <h5 className="font-bold">{event.title}</h5>
                  {event.location && (
                    <div className="flex items-center gap-1.5 text-[10px] opacity-40 mt-2">
                      <MapPin size={12} /> {event.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center opacity-20 italic">Nenhum compromisso para este dia.</div>
          )}
        </div>
      </div>
    );
  };

  const nextView = () => {
    const newDate = new Date(viewDate);
    if (viewMode === 'month') newDate.setMonth(viewDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(viewDate.getDate() + 7);
    else newDate.setDate(viewDate.getDate() + 1);
    setViewDate(newDate);
  };

  const prevView = () => {
    const newDate = new Date(viewDate);
    if (viewMode === 'month') newDate.setMonth(viewDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(viewDate.getDate() - 7);
    else newDate.setDate(viewDate.getDate() - 1);
    setViewDate(newDate);
  };

  const upcomingEvents = events
    .filter(e => new Date(e.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="flex items-start justify-between gap-6 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2 opacity-60">
            <Calendar size={12} className="text-primary" />
            <p className="editorial-label !tracking-[0.2em]">PRODUTIVIDADE & TEMPO</p>
          </div>
          <h2 className="display-lg">Agenda Visual</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-surface/50 border border-[var(--glass-border)] rounded-full p-1">
            {(['day', 'week', 'month'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all uppercase tracking-widest ${
                  viewMode === mode ? 'bg-primary text-surface shadow-md' : 'text-on-surface/50 hover:bg-on-surface/5'
                }`}
              >
                {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-surface rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">NOVO COMPROMISSO</span>
          </button>
        </div>
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
            {/* Header do Calendário */}
            <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between bg-on-surface/[0.02]">
               <h3 className="text-xl font-bold uppercase tracking-tight">
                 {viewMode === 'month' 
                   ? viewDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
                   : viewMode === 'week'
                   ? `Semana de ${viewDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`
                   : viewDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
                 }
               </h3>
               <div className="flex items-center gap-1">
                 <button onClick={prevView} className="p-2 hover:bg-on-surface/5 rounded-lg transition-all"><ChevronLeft size={20} /></button>
                 <button onClick={() => setViewDate(new Date())} className="px-3 py-1.5 text-[10px] font-bold border border-[var(--glass-border)] rounded-md hover:bg-on-surface/5 transition-all uppercase tracking-widest">Hoje</button>
                 <button onClick={nextView} className="p-2 hover:bg-on-surface/5 rounded-lg transition-all"><ChevronRight size={20} /></button>
               </div>
            </div>

            {/* Visualização de Dias da Semana (apenas para Mês) */}
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 border-b border-[var(--glass-border)] bg-on-surface/[0.01]">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="py-3 text-center text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]">
                    {day}
                  </div>
                ))}
              </div>
            )}

            {/* Conteúdo da View */}
            <div className="border-collapse">
              {viewMode === 'month' && renderMonthView()}
              {viewMode === 'week' && renderWeekView()}
              {viewMode === 'day' && renderDayView()}
            </div>
          </GlassCard>
        </div>

        {/* Lateral de Próximos Compromissos */}
        <div className="space-y-6">
          <GlassCard className="p-6 border border-[var(--glass-border)] bg-surface-variant/30 h-full flex flex-col">
            <h4 className="editorial-label mb-6 text-primary flex items-center justify-between">
              PRÓXIMOS COMPROMISSOS 
              <span className="opacity-40">{upcomingEvents.length} TOTAL</span>
            </h4>
            
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event, i) => {
                  const eventDate = new Date(event.start_time);
                  const isToday = eventDate.toDateString() === new Date().toDateString();
                  const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                  
                  return (
                    <div key={i} className={`p-4 rounded-2xl border space-y-3 group transition-all cursor-pointer ${
                      event.isProjectDeadline ? 'bg-secondary/5 border-secondary/30 hover:bg-secondary/10' : 'bg-on-surface/[0.03] border-[var(--glass-border)] hover:bg-primary/5'
                    }`} onClick={() => {
                      setViewDate(eventDate);
                      setViewMode('day');
                    }}>
                      <div className="flex items-start justify-between">
                         <h5 className="font-bold text-sm leading-tight flex-1">
                           {event.title}
                         </h5>
                         {isToday ? (
                           <span className="text-[8px] font-bold bg-primary text-surface px-1.5 py-0.5 rounded uppercase ml-2 animate-pulse">Hoje</span>
                         ) : isTomorrow ? (
                           <span className="text-[8px] font-bold border border-primary/40 text-primary px-1.5 py-0.5 rounded uppercase ml-2">Amanhã</span>
                         ) : null}
                      </div>
                      <div className="flex items-center gap-3 opacity-60 text-[10px] font-medium flex-wrap">
                         <span className="flex items-center gap-1.5"><Clock size={12} /> {eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                         {!isToday && !isTomorrow && <span className="flex items-center gap-1.5"><Calendar size={12} /> {eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>}
                         {event.isProjectDeadline && <span className="text-secondary font-bold uppercase text-[8px] tracking-widest border border-secondary/30 px-1.5 py-0.5 rounded">Projeto</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 opacity-20">
                   <p className="editorial-label text-[10px]">NENHUM COMPROMISSO FUTURO</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
               <p className="text-[10px] opacity-30 italic leading-relaxed">
                 Clique em um compromisso para visualizá-lo em destaque no calendário.
               </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
