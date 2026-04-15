import { Home, Wallet, CheckSquare, Calendar, Zap, LogOut, Plus, HelpCircle, Settings, ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  onClose: () => void;
  onSignOut: () => void;
  isCollapsible?: boolean;
}

const Sidebar = ({ onClose, onSignOut, isCollapsible }: SidebarProps) => {
  const location = useLocation();
  
  const menuItems = [
    { id: "/", icon: Home, label: "INÍCIO" },
    { id: "/tasks", icon: CheckSquare, label: "TAREFAS" },
    { id: "/finance", icon: Wallet, label: "FINANÇAS" },
    { id: "/calendar", icon: Calendar, label: "CALENDÁRIO" },
    { id: "/focus", icon: Zap, label: "FOCO" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-[320px] h-full flex flex-col p-8 border-r border-[var(--glass-border)] bg-surface/90 backdrop-blur-2xl shrink-0 shadow-2xl relative">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Zap className="text-surface" size={20} fill="currentColor" />
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

      <nav className="flex-1 space-y-2">
        <p className="editorial-label mb-4 px-6 opacity-50">NAVEGAÇÃO</p>
        {menuItems.map((item) => (
          <Link 
            key={item.id}
            to={item.id}
            onClick={!isCollapsible ? onClose : undefined}
            className={`sidebar-item ${isActive(item.id) ? "active" : ""}`}
          >
            <item.icon size={20} strokeWidth={isActive(item.id) ? 2.5 : 2} />
            <span className="editorial-label tracking-widest">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-6">
        <button className="w-full py-4 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-surface editorial-label tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
          <Plus size={18} />
          CAPTURA RÁPIDA
        </button>
        
        <div className="pt-6 border-t border-[var(--glass-border)] space-y-2">
          <Link to="/settings" onClick={!isCollapsible ? onClose : undefined} className="sidebar-item !py-2">
            <Settings size={18} />
            <span className="editorial-label text-[10px]">CONFIGURAÇÕES</span>
          </Link>
          <div className="sidebar-item !py-2">
            <HelpCircle size={18} />
            <span className="editorial-label text-[10px]">AJUDA</span>
          </div>
          <button 
            onClick={onSignOut}
            className="sidebar-item !py-2 w-full text-left"
          >
            <LogOut size={18} />
            <span className="editorial-label text-[10px]">SAIR</span>
          </button>
        </div>

        {/* Versão do App */}
        <div className="pt-4 mt-2 flex items-center gap-2 opacity-30">
          <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
            <Zap size={8} className="text-primary" fill="currentColor" />
          </div>
          <span className="text-[9px] font-mono tracking-widest">SANCTUM v2.0 · MODO PROFUNDO</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
