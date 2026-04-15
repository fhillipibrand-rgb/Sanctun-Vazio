import { useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const mockEvents = [
    { summary: "Reunião de Alinhamento Q4", start: { dateTime: new Date(Date.now() + 86400000).toISOString() }, location: "Google Meet" },
    { summary: "Revisão de Design - Santuário", start: { dateTime: new Date(Date.now() + 172800000).toISOString() }, location: "Escritório Central" },
    { summary: "Workshop de Produtividade", start: { dateTime: new Date(Date.now() + 259200000).toISOString() }, location: "Auditório A" },
  ];

  const handleConnectGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      setEvents(mockEvents);
      setIsConnected(true);
      setLoading(false);
    }, 1500);
  };

  const handleConnectICloud = () => {
    alert("Para conectar ao iCloud, você precisará gerar uma Senha de App no site do ID Apple. (Funcionalidade em desenvolvimento)");
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
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <GlassCard className="p-6 border border-[var(--glass-border)] bg-surface-variant/30">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold">Próximos Eventos</h3>
              {!isConnected && (
                <div className="flex gap-3">
                  <button 
                    onClick={handleConnectGoogle}
                    disabled={loading}
                    className="px-4 py-2 rounded-full bg-on-surface text-surface text-xs font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {loading ? "Conectando..." : "Conectar Google"}
                  </button>
                  <button 
                    onClick={handleConnectICloud}
                    className="px-4 py-2 rounded-full border border-[var(--glass-border)] text-xs font-bold flex items-center gap-2 hover:bg-on-surface/5 transition-all"
                  >
                    Conectar iCloud
                  </button>
                </div>
              )}
            </div>

            {isConnected ? (
              <div className="space-y-4">
                {events.map((event: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)] hover:bg-on-surface/[0.04] transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary">
                      <span className="text-[10px] font-bold uppercase">{new Date(event.start.dateTime).toLocaleString('pt-BR', { month: 'short' })}</span>
                      <span className="text-lg font-bold leading-none">{new Date(event.start.dateTime).getDate()}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm md:text-base">{event.summary}</h4>
                      <p className="text-[10px] md:text-xs text-on-surface-variant">
                        {new Date(event.start.dateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {event.location ? ` • ${event.location}` : ""}
                      </p>
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
                <h4 className="text-lg font-bold mb-2">Conecte seu Calendário</h4>
                <p className="text-sm text-on-surface-variant max-w-xs mx-auto mb-8">
                  Sincronize seus eventos do Google ou iCloud para ter uma visão unificada do seu dia.
                </p>
                <div className="flex justify-center gap-4">
                  <button onClick={handleConnectGoogle} disabled={loading} className="px-6 py-3 rounded-full bg-primary text-surface font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50">
                    {loading ? "Iniciando..." : "Google Calendar"}
                  </button>
                  <button onClick={handleConnectICloud} className="px-6 py-3 rounded-full bg-on-surface text-surface font-bold text-sm hover:scale-105 transition-all">
                    iCloud
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 border border-[var(--glass-border)] bg-surface-variant/30">
            <h4 className="editorial-label mb-6">CONFIGURAÇÕES</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Calendar size={16} /></div>
                  <span className="text-xs font-bold">Google Calendar</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-secondary animate-pulse' : 'bg-on-surface/20'}`} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-500/10 flex items-center justify-center text-gray-500"><Calendar size={16} /></div>
                  <span className="text-xs font-bold">iCloud Calendar</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-on-surface/20" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
              <p className="text-[10px] text-on-surface-variant leading-relaxed opacity-60 italic">
                * A conexão com calendários externos é uma funcionalidade em fase de protótipo para demonstrar a possibilidade de integração.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
