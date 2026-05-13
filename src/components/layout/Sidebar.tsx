import { useState } from "react";
import { 
  Home, Wallet, CheckSquare, Calendar, Zap, LogOut, Plus, HelpCircle, 
  Settings, ChevronLeft, LayoutList, Target, Activity, PieChart, 
  Clock, Utensils, TrendingUp, Dumbbell,
  BookOpen, Sun, Moon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useLayout } from "./Layout";
import { useAuth } from "../../hooks/useAuth";

interface SidebarProps {
  onClose: () => void;
  onSignOut: () => void;
  onQuickCapture?: () => void;
  isCollapsible?: boolean;
}

const Sidebar = ({ onClose, onSignOut, onQuickCapture, isCollapsible }: SidebarProps) => {
  const location = useLocation();
  const { isSidebarOpen, openOnboarding, theme, toggleTheme } = useLayout();
  const { profile, user } = useAuth();
  const [collapsedSections, setCollapsedSections] = useState<string[]>(['DESENVOLVIMENTO', 'CONTROLE FINANCEIRO']);

  // Gera avatar com fallback elegante via DiceBear
  const getAvatar = () => {
    if (profile?.avatar_url && profile.avatar_url.trim() !== '') {
      return profile.avatar_url;
    }
    const seed = user?.id || profile?.full_name || 'sanctum';
    return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=3b5bdb,4c6ef5,748ffc&textColor=ffffff&fontSize=42&fontWeight=600`;
  };

  const avatarUrl = getAvatar();
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';
  
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
    <aside className={`h-full w-full flex flex-col border-r border-[var(--glass-border)] bg-surface/95 backdrop-blur-3xl shrink-0 shadow-2xl relative overflow-hidden ${isSidebarOpen ? 'p-8' : 'p-4 items-center'}`}>
      {/* Header Area */}
      <div className={`flex items-center justify-between mb-12 w-full ${!isSidebarOpen ? 'flex-col gap-6' : ''}`}>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-primary/20 shrink-0 border border-white/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="editorial-display text-lg leading-tight text-white">Sanctum</h1>
              <p className="editorial-label text-[9px] text-primary uppercase tracking-widest font-bold">Modo Profundo</p>
            </motion.div>
          )}
        </div>

        <div className={`flex items-center ${isSidebarOpen ? 'gap-2' : 'flex-col gap-3'}`}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-white"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.div>
          </button>

          {/* Collapse Button */}
          <button 
            onClick={isSidebarOpen ? onClose : () => window.dispatchEvent(new CustomEvent('sanctum:toggle-sidebar', { detail: { open: true } }))}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white"
          >
            <ChevronLeft size={20} className={`transition-transform duration-500 ${!isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>


      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto w-full space-y-8 sidebar-nav-scroll overflow-x-hidden">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-3 w-full">
            {isSidebarOpen && (
              <p className="px-6 editorial-label opacity-30 tracking-[0.3em] text-[9px] uppercase font-bold text-white mb-4">
                {section.title}
              </p>
            )}

            <div className="space-y-2 w-full">
              {section.items.map((item) => {
                const active = isActive(item.id);
                return (
                  <Link 
                    key={item.id}
                    to={item.id}
                    className={`relative flex items-center transition-all duration-300 group
                      ${isSidebarOpen 
                        ? `px-6 py-3 rounded-2xl gap-4 ${active ? 'bg-primary/10 text-primary' : 'text-white/40 hover:bg-white/5 hover:text-white'}` 
                        : `h-12 w-12 mx-auto justify-center rounded-xl ${active ? 'text-primary' : 'text-white/40 hover:text-white'}`
                      }`}
                  >
                    {active && !isSidebarOpen && (
                      <motion.div 
                        layoutId="active-pill-mini"
                        className="absolute inset-0 bg-primary/20 rounded-xl z-0"
                        style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
                      />
                    )}

                    <div className={`relative z-10 flex items-center justify-center ${active && !isSidebarOpen ? 'drop-shadow-[0_0_8px_#3b82f6] scale-110' : ''}`}>
                      <item.icon size={isSidebarOpen ? 20 : 22} strokeWidth={active ? 2.5 : 2} />
                    </div>

                    {isSidebarOpen && (
                      <span className="editorial-label tracking-widest text-[11px] font-bold relative z-10">
                        {item.label}
                      </span>
                    )}

                    {!isSidebarOpen && active && (
                      <div className="absolute -left-4 w-1.5 h-6 bg-primary rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                    )}

                    {/* Tooltip */}
                    {!isSidebarOpen && (
                      <div className="absolute left-16 px-4 py-2 bg-surface border border-white/10 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none translate-x-[-10px] group-hover:translate-x-0 transition-all z-[100] whitespace-nowrap shadow-2xl">
                        <p className="editorial-label text-[10px] tracking-widest text-white font-bold uppercase">{item.label}</p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div className={`mt-auto pt-6 border-t border-white/5 space-y-6 w-full ${!isSidebarOpen ? 'items-center' : ''}`}>
        <button 
          onClick={onQuickCapture}
          className={`w-full rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all ${isSidebarOpen ? 'py-4' : 'h-12 w-12 mx-auto'}`}
        >
          <Plus size={isSidebarOpen ? 18 : 24} />
          {isSidebarOpen && <span className="editorial-label tracking-widest font-bold">CAPTURA</span>}
        </button>

        <div className="space-y-2 w-full">
          <button 
            onClick={openOnboarding}
            className={`w-full rounded-xl transition-all flex items-center group ${isSidebarOpen ? 'py-2 px-6 gap-3 text-white/40 hover:text-white hover:bg-white/5' : 'h-10 justify-center text-white/40 hover:text-white'}`}
          >
            <HelpCircle size={isSidebarOpen ? 16 : 20} />
            {isSidebarOpen && <span className="editorial-label text-[10px] tracking-widest font-bold">AJUDA</span>}
          </button>

          <Link to="/settings" className={`flex items-center transition-all group ${isSidebarOpen ? 'px-6 py-2 gap-3 text-white/40 hover:text-white hover:bg-white/5' : 'h-10 justify-center text-white/40 hover:text-white'}`}>
            <Settings size={isSidebarOpen ? 16 : 20} />
            {isSidebarOpen && <span className="editorial-label text-[10px] font-bold tracking-widest uppercase">Ajustes</span>}
          </Link>
          
          <button 
            onClick={onSignOut}
            className={`w-full flex items-center transition-all group ${isSidebarOpen ? 'px-6 py-2 gap-3 text-red-400/60 hover:text-red-400 hover:bg-red-500/5' : 'h-10 justify-center text-red-400/60 hover:text-red-400'}`}
          >
            <LogOut size={isSidebarOpen ? 16 : 20} />
            {isSidebarOpen && <span className="editorial-label text-[10px] font-bold tracking-widest uppercase">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
