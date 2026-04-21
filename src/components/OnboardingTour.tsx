import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, Sparkles, Layout, CheckCircle2, 
  Wallet, Droplets, Zap, PartyPopper, Bell, User, FolderKanban, 
  Calendar, Target, Utensils, Activity 
} from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  targetId: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

const steps: Step[] = [
  {
    title: "Universo Sanctum",
    description: "Seu centro de comando principal. Explore todas as dimensões da sua produtividade a partir daqui.",
    icon: <Sparkles className="w-8 h-8" />,
    color: "from-secondary/20 to-secondary/5",
    targetId: "tour-sidebar-header",
    position: 'right'
  },
  {
    title: "Modo Foco Profundo",
    description: "Entre em estado de flow com ferramentas de imersão e temporizadores especializados.",
    icon: <Zap className="w-8 h-8" />,
    color: "from-orange-400/20 to-orange-400/5",
    targetId: "sidebar-foco",
    position: 'right'
  },
  {
    title: "Sessão Produtividade",
    description: "Gerencie tarefas, projetos, portfólios e sua agenda com precisão tática.",
    icon: <CheckCircle2 className="w-8 h-8" />,
    color: "from-blue-400/20 to-blue-400/5",
    targetId: "tour-section-produtividade",
    position: 'right'
  },
  {
    title: "Sessão Desenvolvimento",
    description: "Cuide da sua base: hábitos, nutrição e gestão de saúde para alta performance biológica.",
    icon: <Target className="w-8 h-8" />,
    color: "from-green-400/20 to-green-400/5",
    targetId: "tour-section-desenvolvimento",
    position: 'right'
  },
  {
    title: "Sessão Financeira",
    description: "Controle seu balanço, investimentos e planos futuros com clareza matemática.",
    icon: <Wallet className="w-8 h-8" />,
    color: "from-emerald-400/20 to-emerald-400/5",
    targetId: "tour-section-controle-financeiro",
    position: 'right'
  },
  {
    title: "Central de Ações",
    description: "Alertas críticos e notificações importantes para manter seu ritmo ininterrupto.",
    icon: <Bell className="w-8 h-8" />,
    color: "from-red-400/20 to-red-400/5",
    targetId: "tour-notifications",
    position: 'left'
  },
  {
    title: "Gestão de Perfil",
    description: "Configure sua identidade e preferências globais do sistema.",
    icon: <User className="w-8 h-8" />,
    color: "from-primary/20 to-primary/5",
    targetId: "tour-avatar",
    position: 'left'
  }
];

export const OnboardingTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleOpenTour = () => {
      window.dispatchEvent(new CustomEvent('sanctum:toggle-sidebar', { detail: { open: true } }));
      setCurrentStep(0);
      setIsOpen(true);
    };

    window.addEventListener('sanctum:open-tour', handleOpenTour);
    
    const hasCompletedTour = localStorage.getItem('sanctum_tour_completed');
    if (!hasCompletedTour) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('sanctum:toggle-sidebar', { detail: { open: true } }));
        setIsOpen(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('sanctum:open-tour', handleOpenTour);
      };
    }
    
    return () => window.removeEventListener('sanctum:open-tour', handleOpenTour);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    let frameId: number;
    const targetId = steps[currentStep]?.targetId;
    
    const updateTargetRect = () => {
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(prev => {
            if (!prev) return rect;
            if (prev.x === rect.x && prev.y === rect.y && prev.width === rect.width && prev.height === rect.height) {
              return prev;
            }
            return rect;
          });
        } else {
          setTargetRect(null);
        }
      }
      frameId = requestAnimationFrame(updateTargetRect);
    };
    
    frameId = requestAnimationFrame(updateTargetRect);
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, currentStep]);

  useEffect(() => {
    // Limpar destaques anteriores em qualquer mudança de passo ou visibilidade
    const clearHighlights = () => {
      document.querySelectorAll('.tour-highlight-active').forEach(el => {
        el.classList.remove('tour-highlight-active');
      });
    };

    if (isOpen) {
      clearHighlights();
      const targetId = steps[currentStep].targetId;
      const el = document.getElementById(targetId);
      if (el) {
        el.classList.add('tour-highlight-active');
      }
    } else {
      clearHighlights();
    }

    return () => clearHighlights();
  }, [currentStep, isOpen]);



  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem('sanctum_tour_completed', 'true');
  };

  const getActualPosition = () => {
    if (!targetRect) return 'center';
    const step = steps[currentStep];
    const modalWidth = 320;
    const margin = 30;

    let preferredPos = step.position;
    if (preferredPos === 'right' && targetRect.right + modalWidth + margin > window.innerWidth) preferredPos = 'left';
    if (preferredPos === 'left' && targetRect.left - modalWidth - margin < 0) preferredPos = 'bottom';
    
    return preferredPos;
  };

  const getModalStyles = () => {
    if (!targetRect) return { 
      style: { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' },
      pointerOffset: { x: 0, y: 0 }
    };
    
    const actualPos = getActualPosition();
    const margin = 30;
    const modalWidth = 320;
    const modalHeight = 240; // Approx

    let posX = 0;
    let posY = 0;
    let transform = '';

    switch (actualPos) {
      case 'right':
        posX = targetRect.right + margin;
        posY = targetRect.top + targetRect.height / 2;
        transform = 'translateY(-50%)';
        break;
      case 'bottom':
        posX = targetRect.left + targetRect.width / 2;
        posY = targetRect.bottom + margin;
        transform = 'translateX(-50%)';
        break;
      case 'left':
        posX = targetRect.left - modalWidth - margin;
        posY = targetRect.top + targetRect.height / 2;
        transform = 'translateY(-50%)';
        break;
      case 'top':
        posX = targetRect.left + targetRect.width / 2;
        posY = targetRect.top - modalHeight - margin;
        transform = 'translateX(-50%)';
        break;
      default:
        posX = window.innerWidth / 2;
        posY = window.innerHeight / 2;
        transform = 'translate(-50%, -50%)';
    }

    const clampedLeft = Math.max(margin, Math.min(posX, window.innerWidth - modalWidth - margin));
    const clampedTop = Math.max(margin, Math.min(posY, window.innerHeight - modalHeight - margin));

    return {
      style: {
        left: clampedLeft,
        top: clampedTop,
        transform
      },
      pointerOffset: {
        x: posX - clampedLeft,
        y: posY - clampedTop
      }
    };
  };

  const renderPointer = () => {
    if (!targetRect) return null;
    const actualPos = getActualPosition();
    const { pointerOffset } = getModalStyles();
    
    const baseClass = "absolute w-0 h-0 border-transparent border-[10px] z-50";
    let styles = {};

    switch (actualPos) {
      case 'right':
        styles = { left: -20, top: `calc(50% + ${pointerOffset.y}px)`, transform: 'translateY(-50%)', borderRightColor: 'rgb(var(--color-primary-rgb))' };
        break;
      case 'left':
        styles = { right: -20, top: `calc(50% + ${pointerOffset.y}px)`, transform: 'translateY(-50%)', borderLeftColor: 'rgb(var(--color-primary-rgb))' };
        break;
      case 'bottom':
        styles = { top: -20, left: `calc(50% + ${pointerOffset.x}px)`, transform: 'translateX(-50%)', borderBottomColor: 'rgb(var(--color-primary-rgb))' };
        break;
      case 'top':
        styles = { bottom: -20, left: `calc(50% + ${pointerOffset.x}px)`, transform: 'translateX(-50%)', borderTopColor: 'rgb(var(--color-primary-rgb))' };
        break;
    }

    return <div className={baseClass} style={styles} />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
          {/* Spotlight Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-auto">
            <defs>
              <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="15" result="blur" />
                <feFlood floodColor="rgb(var(--color-primary-rgb))" result="color" />
                <feComposite in="color" in2="blur" operator="in" />
                <feComposite in="SourceGraphic" operator="over" />
              </filter>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                {targetRect && (
                  <motion.rect 
                    initial={false}
                    animate={{
                      x: targetRect.x - 8,
                      y: targetRect.y - 8,
                      width: targetRect.width + 16,
                      height: targetRect.height + 16,
                      rx: 16
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                    fill="black"
                  />
                )}
              </mask>
            </defs>

            {/* Glowing Aura Layer behind the spotlight hole */}
            {targetRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: targetRect.x - 4,
                  y: targetRect.y - 4,
                  width: targetRect.width + 8,
                  height: targetRect.height + 8,
                  rx: 18,
                  opacity: [0.4, 0.8, 0.4]
                }}
                transition={{ 
                  x: { type: "spring", damping: 30, stiffness: 300 },
                  y: { type: "spring", damping: 30, stiffness: 300 },
                  width: { type: "spring", damping: 30, stiffness: 300 },
                  height: { type: "spring", damping: 30, stiffness: 300 },
                  opacity: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                fill="rgb(var(--color-primary-rgb))"
                filter="url(#glow-filter)"
              />
            )}

            <rect 
              width="100%" 
              height="100%" 
              fill="rgba(0,0,0,0.85)" 
              mask="url(#spotlight-mask)" 
              className="backdrop-blur-[4px]"
              onClick={handleComplete}
            />
          </svg>

          {/* Modal Container */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                ...(getModalStyles().style as any)
              }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="pointer-events-auto absolute w-full max-w-[280px] md:max-w-[320px] bg-surface border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-visible"
            >
              {/* Ponta / Seta visual */}
              {renderPointer()}

              <div className="relative overflow-hidden rounded-[32px]">
                {/* Header / Background Gradient */}
                <div className={`h-24 w-full bg-gradient-to-br ${steps[currentStep].color} transition-all duration-700 flex items-center justify-center`}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    className="text-primary drop-shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)]"
                  >
                    {steps[currentStep].icon}
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10">
                  <div className="flex gap-1.5 mb-6">
                    {steps.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                          i === currentStep ? 'bg-primary' : 'bg-white/10'
                        }`} 
                      />
                    ))}
                  </div>

                  <motion.div
                    key={`content-${currentStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-white/60 leading-relaxed mb-8 text-[12px] md:text-sm">
                      {steps[currentStep].description}
                    </p>
                  </motion.div>

                  <div className="flex items-center justify-between gap-6 pt-2">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
                        currentStep === 0 ? 'opacity-0 pointer-events-none' : 'opacity-40 hover:opacity-100 hover:text-primary'
                      }`}
                    >
                      <ChevronLeft size={16} /> Voltar
                    </button>

                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-primary text-surface rounded-2xl font-bold text-[10px] tracking-[0.2em] flex items-center gap-2 hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-primary/30"
                    >
                      {currentStep === steps.length - 1 ? "COMEÇAR" : "PRÓXIMO"}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
