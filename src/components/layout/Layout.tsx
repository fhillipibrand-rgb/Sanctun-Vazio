import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Sun, Moon, ChevronLeft, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Controla se está visível no Desktop ou aberta no Mobile
  const [isMobile, setIsMobile] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const { signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.body.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.body.classList.remove("light");
    }
  }, [theme]);

  return (
    <div className="flex h-screen w-full overflow-hidden relative bg-surface">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/10 blur-[100px] rounded-full" />
      </div>

      {/* Floating Controls (Theme Toggle & Mobile Menu) */}
      <div className="fixed top-6 right-6 z-40 flex gap-3">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-12 h-12 bg-surface-container-high rounded-xl flex items-center justify-center border border-[var(--glass-border)] shadow-lg transition-all"
        >
          {theme === "dark" ? <Sun size={20} className="text-primary" /> : <Moon size={20} className="text-primary" />}
        </motion.button>

        {isMobile && (
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(true)}
            className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all text-surface"
          >
            <Menu size={24} />
          </motion.button>
        )}
      </div>

      {/* Sidebar - Desktop (Static) and Mobile (Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Background Overlay (Mobile only) */}
            {isMobile && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              />
            )}
            
            {/* Sidebar Container */}
            <motion.div
              initial={isMobile ? { x: -320 } : { width: 0, opacity: 0 }}
              animate={isMobile ? { x: 0 } : { width: 320, opacity: 1 }}
              exit={isMobile ? { x: -320 } : { width: 0, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`${isMobile ? 'fixed top-0 left-0 h-full' : 'relative h-full'} z-50 overflow-hidden bg-surface shadow-2xl shrink-0`}
            >
              <Sidebar 
                onClose={() => setIsSidebarOpen(false)} 
                onSignOut={signOut}
                isCollapsible={!isMobile}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Sidebar Toggle for Desktop (when closed) */}
      {!isSidebarOpen && !isMobile && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-6 left-6 z-40 w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all text-surface hover:scale-110"
        >
          <Zap size={24} fill="currentColor" />
        </motion.button>
      )}

      <main className="flex-1 overflow-y-auto p-6 md:p-12 relative h-full">
        {/* Background Orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
