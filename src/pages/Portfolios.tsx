import React, { useEffect, useState } from "react";
import { FolderKanban, Plus, MoreHorizontal, AlignLeft, Calendar, FileText, ChevronRight, PieChart } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import { MOCK_PORTFOLIOS, MOCK_PROJECTS } from "../lib/mockData";

interface Portfolio {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
  progress: number;
  portfolio_id?: string;
}

const Portfolios = () => {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    if (user) fetchPortfolios();
  }, [user]);

  const fetchPortfolios = async () => {
    setLoading(true);
    // Simulating database fetch, fallback to mock if table doesn't exist
    const { data: portData, error: portError } = await supabase.from("portfolios").select("*").order("created_at", { ascending: false });
    const { data: projData } = await supabase.from("projects").select("id, name, color, portfolio_id");

    if (!portError && portData && portData.length > 0) {
      setPortfolios(portData);
      setProjects(projData || []);
      setUsingMock(false);
    } else {
      setPortfolios(MOCK_PORTFOLIOS);
      setProjects(MOCK_PROJECTS);
      setUsingMock(true);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="space-y-4">
        <div className="flex items-center gap-2 opacity-60">
          <AlignLeft size={12} className="text-primary" />
          <p className="editorial-label !tracking-[0.2em]">{usingMock ? "MOCK DATA" : "VISÃO CORPORATIVA"}</p>
        </div>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Portfólios</h2>
            <p className="text-sm opacity-50 mt-1">Gerencie iniciativas, agrupe projetos e acompanhe o progresso geral.</p>
          </div>
          
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-surface font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Plus size={18} />
            <span className="hidden sm:inline">NOVO PORTFÓLIO</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="py-20 text-center editorial-label opacity-30 animate-pulse">CARREGANDO PORTFÓLIOS...</div>
      ) : portfolios.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-[var(--glass-border)] rounded-3xl">
          <p className="editorial-label opacity-30 text-xs">NENHUM PORTFÓLIO CRIADO</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {portfolios.map(port => {
            const portProjects = projects.filter(p => p.portfolio_id === port.id);
            const overallProgress = portProjects.length > 0 
              ? portProjects.reduce((acc, curr) => acc + (curr.progress || 0), 0) / portProjects.length 
              : 0;

            return (
              <GlassCard key={port.id} className="p-6 border-l-4 group hoverBorder" style={{ borderLeftColor: port.color }}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold font-serif mb-1 group-hover:text-primary transition-colors">{port.name}</h3>
                    <p className="text-xs opacity-50 uppercase tracking-widest editorial-label">{portProjects.length} PROJETOS</p>
                  </div>
                  <button className="p-2 bg-on-surface/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold mb-2">
                       <span className="opacity-50">PROGRESSO GERAL</span>
                       <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                       <motion.div 
                         className="h-full rounded-full" 
                         style={{ backgroundColor: port.color }}
                         initial={{ width: 0 }} 
                         animate={{ width: `${overallProgress}%` }} 
                         transition={{ duration: 1 }}
                       />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-[var(--glass-border)]">
                    <p className="text-[10px] uppercase font-bold tracking-widest editorial-label opacity-40 mb-3">Projetos Ativos</p>
                    {portProjects.length > 0 ? portProjects.map(proj => (
                      <div key={proj.id} className="flex justify-between items-center p-3 rounded-xl bg-on-surface/[0.03] border border-[var(--glass-border)] hover:bg-on-surface/[0.05] transition-colors cursor-pointer group/item">
                         <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: proj.color }} />
                           <span className="text-sm font-medium">{proj.name}</span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-bold opacity-50">{proj.progress || 0}%</span>
                           <ChevronRight size={14} className="opacity-0 group-hover/item:opacity-50 transition-opacity" />
                         </div>
                      </div>
                    )) : (
                      <div className="p-3 text-center opacity-30 text-[10px] uppercase tracking-widest font-bold">Nenhum projeto associado</div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Portfolios;
