import { useState, useEffect, createContext, useContext } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Sun, Moon, Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../hooks/useAuth";

// Contexto para compartilhar controles de layout com páginas filhas
export interface LayoutContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  isMobile: boolean;
}

export const LayoutContext = createContext<LayoutContextType>({
  isSidebarOpen: true,
  toggleSidebar: () => {},
  theme: "dark",
  toggleTheme: () => {},
  isMobile: false,
});

export const useLayout = () => useContext(LayoutContext);

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  const toggleSidebar = () => setIsSidebarOpen((v) => !v);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <LayoutContext.Provider value={{ isSidebarOpen, toggleSidebar, theme, toggleTheme, isMobile }}>
      <div className="flex h-screen w-full overflow-hidden relative bg-surface">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-purple-500/10 blur-[100px] rounded-full" />
        </div>

        {/* Mobile Menu Button (bottom-right) */}
        {isMobile && !isSidebarOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 transition-all text-surface"
          >
            <Menu size={24} />
          </motion.button>
        )}

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
    </LayoutContext.Provider>
  );
};

export default Layout;
