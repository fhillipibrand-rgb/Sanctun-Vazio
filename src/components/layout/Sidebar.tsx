import { useState } from "react";
import { 
  Home, Wallet, CheckSquare, Calendar, Zap, LogOut, Plus, HelpCircle, 
  Settings, ChevronLeft, FolderKanban, Target, Activity, PieChart, 
  Clock, Utensils, TrendingUp, LayoutList, ChevronDown, Dumbbell,
  BookOpen, Sparkles, Moon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLayout } from "./Layout";

interface SidebarProps {
  onClose: () => void;
  onSignOut: () => void;
  onQuickCapture?: () => void;
  isCollapsible?: boolean;
}

const Sidebar = ({ onClose, onSignOut, onQuickCapture, isCollapsible }: SidebarProps) => {
  const location = useLocation();
  const { isSidebarOpen, openOnboarding, isLiveMode, setIsLiveMode } = useLayout();
  const [collapsedSections, setCollapsedSections] = useState<string[]>(['DESENVOLVIMENTO', 'CONTROLE FINANCEIRO']);
  
  const menuSections = [
    {
      title: "PRINCIPAL",
      items: [
        { id: "/", icon: Home, label: "DASHBOARD" },
        { id: "/focus", icon: Zap, label: "FOCO" },
      ]
    },
    {
      title: "PRODUTIVIDADE",
      items: [
        { id: "/tasks", icon: CheckSquare, label: "TODAS TAREFAS" },
        { id: "/tasks/projects", icon: LayoutList, label: "PROJETOS" },
        { id: "/calendar", icon: Calendar, label: "CALENDÁRIO" },
      ]
    },
    {
      title: "DESENVOLVIMENTO",
      items: [
        { id: "/habits", icon: Target, label: "HÁBITOS" },
        { id: "/reading", icon: BookOpen, label: "BIBLIOTECA" },
        { id: "/sleep", icon: Moon, label: "SONO & RECUPERAÇÃO" },
        { id: "/spirituality", icon: Sparkles, label: "ESPIRITUALIDADE" },
        { id: "/vitality", icon: Dumbbell, label: "VITALIDADE" },
        { id: "/nutrition", icon: Utensils, label: "DIETA & NUTRIÇÃO" },
        { id: "/health", icon: Activity, label: "GESTÃO DE SAÚDE" },
      ]
    },
    {
      title: "CONTROLE FINANCEIRO",
      items: [
        { id: "/finance", icon: Wallet, label: "BALANÇO MENSAL" },
        { id: "/finance/transactions", icon: Clock, label: "LANÇAMENTOS" },
        { id: "/finance/analytics", icon: PieChart, label: "ANÁLISES" },
        { id: "/investments", icon: TrendingUp, label: "MEUS INVESTIMENTOS" },
        { id: "/goals", icon: Target, label: "MEUS PLANOS" },
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => 
      prev.includes(title) ? prev.filter(s => s !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`h-full flex flex-col border-r border-[var(--glass-border)] bg-surface/90 backdrop-blur-2xl shrink-0 shadow-2xl relative transition-all duration-300 ${isSidebarOpen ? 'p-8 w-[320px]' : 'p-4 w-[84px] items-center'}`}>
      <div className={`flex items-center justify-between mb-12 w-full ${!isSidebarOpen ? 'flex-col gap-8' : ''}`}>
        <div id="tour-sidebar-header" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 shrink-0">
            <img src="/logo.png" alt="Sanctum Logo" className="w-full h-full object-cover" />
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="editorial-display text-lg leading-tight">Sanctum</h1>
              <p className="editorial-label text-[9px] text-primary uppercase tracking-widest font-bold">Modo Profundo</p>
            </motion.div>
          )}
        </div>
        <button 
          onClick={isSidebarOpen ? onClose : () => window.dispatchEvent(new CustomEvent('sanctum:toggle-sidebar', { detail: { open: true } }))}
          className="p-2 hover:bg-on-surface/5 rounded-lg transition-colors text-on-surface-variant group flex items-center"
        >
          {isSidebarOpen ? (
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          ) : (
            <ChevronLeft size={20} className="rotate-180 group-hover:translate-x-1 transition-transform" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2 scrollbar-thin w-full">
        {menuSections.map((section, idx) => {
          const isCollapsed = collapsedSections.includes(section.title) && isSidebarOpen;
          const hasActionableItems = section.title !== "PRINCIPAL";
          
          return (
            <div 
              key={idx} 
              className="space-y-2 w-full"
              id={`tour-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {isSidebarOpen && (
                <button 
                  onClick={() => hasActionableItems && toggleSection(section.title)}
                  className={`w-full flex items-center justify-between px-6 mb-2 group/header ${hasActionableItems ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <p className="editorial-label opacity-50 tracking-widest text-[9px] group-hover/header:opacity-100 transition-opacity uppercase font-bold">
                    {section.title}
                  </p>
                  {hasActionableItems && (
                    <motion.div
                      animate={{ rotate: isCollapsed ? -90 : 0 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    >
                      <ChevronDown size={10} className="opacity-30 group-hover/header:opacity-100 transition-opacity" />
                    </motion.div>
                  )}
                </button>
              )}

              <div className="space-y-2">
                {section.items.map((item) => {
                  const active = isActive(item.id);
                  return (
                    <Link 
                      key={item.id}
                      to={item.id}
                      id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={`relative flex items-center transition-all duration-300 group
                        ${isSidebarOpen 
                          ? `px-6 py-3 rounded-2xl gap-4 ${active ? 'bg-primary/10 text-primary border-white/5' : 'text-on-surface-variant hover:bg-on-surface/5 border-transparent'}` 
                          : `h-14 justify-center ${active ? 'text-primary' : 'text-on-surface-variant hover:text-white'}`
                        }`}
                    >
                      {active && (
                        <motion.div 
                          layoutId="active-pill"
                          className={`absolute ${isSidebarOpen ? 'left-0 w-1 h-1/2' : 'inset-0 w-full h-full'} bg-primary rounded-full z-0`}
                          style={{ 
                            opacity: isSidebarOpen ? 1 : 0.15,
                            boxShadow: !isSidebarOpen ? '0 0 30px rgba(var(--color-primary-rgb), 0.4)' : 'none'
                          }}
                        />
                      )}
                      
                      <div className={`relative z-10 flex items-center justify-center ${active && !isSidebarOpen ? 'drop-shadow-[0_0_8px_rgba(var(--color-primary-rgb),0.8)] scale-110' : ''}`}>
                        <item.icon size={isSidebarOpen ? 20 : 24} strokeWidth={active ? 2.5 : 2} />
                      </div>

                      {isSidebarOpen && (
                        <span className="editorial-label tracking-widest text-[11px] font-bold relative z-10">
                          {item.label}
                        </span>
                      )}

                      {!isSidebarOpen && active && (
                        <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                      )}
                      
                      {/* Tooltip for mini mode */}
                      {!isSidebarOpen && (
                        <div className="absolute left-20 px-4 py-2 bg-surface border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 transition-all z-[100] whitespace-nowrap shadow-2xl">
                          <p className="editorial-label text-[10px] tracking-widest text-white font-bold uppercase">{item.label}</p>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className={`mt-auto space-y-6 w-full ${!isSidebarOpen ? 'items-center' : ''}`}>
        <button 
          onClick={onQuickCapture}
          className={`w-full rounded-2xl bg-gradient-to-br from-primary to-primary-container text-surface flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all ${isSidebarOpen ? 'py-4' : 'h-14'}`}
        >
          <Plus size={isSidebarOpen ? 18 : 24} />
          {isSidebarOpen && <span className="editorial-label tracking-widest font-bold">CAPTURA RÁPIDA</span>}
        </button>
        
        <div className={`pt-6 border-t border-[var(--glass-border)] space-y-3 w-full`}>
          <button 
            onClick={openOnboarding}
            className={`w-full rounded-xl bg-on-surface/5 hover:bg-on-surface/10 transition-all flex items-center group ${isSidebarOpen ? 'py-3 px-6 gap-3' : 'h-14 justify-center'}`}
          >
            <HelpCircle size={isSidebarOpen ? 18 : 22} className="text-primary group-hover:scale-110 transition-transform" />
            {isSidebarOpen && <span className="editorial-label text-[11px] tracking-widest font-bold">GUIA DE USO</span>}
          </button>

          <div className="space-y-1">
            <Link to="/settings" className={`flex items-center transition-all opacity-60 hover:opacity-100 ${isSidebarOpen ? 'px-6 py-2 gap-3' : 'h-10 justify-center'}`}>
              <Settings size={isSidebarOpen ? 14 : 18} />
              {isSidebarOpen && <span className="editorial-label text-[9px] font-bold tracking-widest uppercase">Configurações</span>}
            </Link>
            <button 
              onClick={onSignOut}
              className={`flex items-center transition-all opacity-60 hover:opacity-100 text-red-400 hover:text-red-500 ${isSidebarOpen ? 'px-6 py-2 gap-3' : 'h-10 justify-center'}`}
            >
              <LogOut size={isSidebarOpen ? 14 : 18} />
              {isSidebarOpen && <span className="editorial-label text-[9px] font-bold tracking-widest uppercase">Sair</span>}
            </button>
          </div>
        </div>

        {isSidebarOpen && (
          <div className="pt-4 mt-2 flex items-center gap-2 opacity-30">
            <div className="w-4 h-4 rounded flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-[9px] font-mono tracking-widest">SANCTUM V1.0</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
