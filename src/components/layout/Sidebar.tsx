import { useState } from "react";
import { 
  Home, Wallet, CheckSquare, Calendar, Zap, LogOut, Plus, HelpCircle, 
  Settings, ChevronLeft, FolderKanban, Target, Activity, PieChart, 
  Clock, Utensils, TrendingUp, LayoutList, ChevronDown 
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
  const { openOnboarding, isLiveMode, setIsLiveMode } = useLayout();
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
    <aside className="w-[320px] h-full flex flex-col p-8 border-r border-[var(--glass-border)] bg-surface/90 backdrop-blur-2xl shrink-0 shadow-2xl relative">
      <div className="flex items-center justify-between mb-12">
        <div id="tour-sidebar-header" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 shrink-0">
            <img src="/logo.png" alt="Sanctum Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="editorial-display text-lg leading-tight">Sanctum</h1>
            <p className="editorial-label text-[9px] text-primary">MODO PROFUNDO</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-on-surface/5 rounded-lg transition-colors text-on-surface-variant group flex items-center"
        >
          {isCollapsible ? <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> : <LogOut size={20} className="rotate-180" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2 scrollbar-thin">
        {menuSections.map((section, idx) => {
          const isCollapsed = collapsedSections.includes(section.title);
          const hasActionableItems = section.title !== "PRINCIPAL";
          
          return (
            <div 
              key={idx} 
              className="space-y-2"
              id={`tour-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <button 
                onClick={() => hasActionableItems && toggleSection(section.title)}
                className={`w-full flex items-center justify-between px-6 mb-2 group/header ${hasActionableItems ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <p 
                  className="editorial-label opacity-50 tracking-widest text-[9px] group-hover/header:opacity-100 transition-opacity"
                >
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

              <AnimatePresence initial={false}>
                {!isCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="overflow-hidden space-y-2"
                  >
                    {section.items.map((item) => (
                      <Link 
                        key={item.id}
                        to={item.id}
                        id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={!isCollapsible ? onClose : undefined}
                        className={`sidebar-item ${isActive(item.id) ? "active" : ""}`}
                      >
                        <item.icon size={20} strokeWidth={isActive(item.id) ? 2.5 : 2} />
                        <span 
                          className="editorial-label tracking-widest"
                        >
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-6">
        <button 
          onClick={onQuickCapture}
          className="w-full py-4 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-surface editorial-label tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={18} />
          CAPTURA RÁPIDA
        </button>
        
        <div className="pt-6 border-t border-[var(--glass-border)] space-y-3">
          <button 
            onClick={openOnboarding}
            className="w-full py-3 px-6 rounded-xl bg-on-surface/5 hover:bg-on-surface/10 transition-all flex items-center gap-3 group"
          >
            <HelpCircle size={18} className="text-primary group-hover:scale-110 transition-transform" />
            <span className="editorial-label text-[11px] tracking-widest font-bold">GUIA DE USO</span>
          </button>

          <div className="space-y-1">
            <Link to="/settings" onClick={!isCollapsible ? onClose : undefined} className="sidebar-item !py-1.5 opacity-60 hover:opacity-100">
              <Settings size={14} />
              <span className="editorial-label text-[9px]">CONFIGURAÇÕES</span>
            </Link>
            <button 
              onClick={onSignOut}
              className="sidebar-item !py-1.5 w-full text-left opacity-60 hover:opacity-100 text-red-400 hover:text-red-500"
            >
              <LogOut size={14} />
              <span className="editorial-label text-[9px]">SAIR</span>
            </button>
          </div>
        </div>


        <div className="pt-4 mt-2 flex items-center gap-2 opacity-30">
          <div className="w-4 h-4 rounded flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-[9px] font-mono tracking-widest">SANCTUM v2.0 · MODO PROFUNDO</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
