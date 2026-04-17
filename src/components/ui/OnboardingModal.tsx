import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Zap, Target, Wallet, 
  ShieldCheck, ArrowRight, X, ChevronLeft, 
  ChevronRight, CheckCircle2, Layout, Command
} from "lucide-react";
import GlassCard from "./GlassCard";

interface OnboardingModalProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Bem-vindo ao Santuário",
    description: "Sua nova central de Deep Work e vida organizada. Um ecossistema unificado para quem busca clareza mental e performance extrema.",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Captura Inteligente",
    description: "Nunca perca uma ideia. Use o botão global ou atalho CMD+K para registrar tarefas, projetos ou lembretes em segundos, de qualquer lugar.",
    icon: Command,
    color: "text-secondary",
    bg: "bg-secondary/10"
  },
  {
    title: "Projetos e Foco",
    description: "Transforme seus grandes objetivos em tarefas acionáveis. Defina prazos, categorias e prioridades para governar seu tempo.",
    icon: Target,
    color: "text-purple-400",
    bg: "bg-purple-400/10"
  },
  {
    title: "Domínio Financeiro",
    description: "Monitore seu fluxo de caixa, investimentos e metas financeiras com inteligência. O Sanctum cuida do seu patrimônio enquanto você foca na execução.",
    icon: Wallet,
    color: "text-blue-400",
    bg: "bg-blue-400/10"
  },
  {
    title: "Hábitos e Saúde",
    description: "Performance real começa no corpo. Monitore seu sono, hidratação e rituais diários para manter o motor sempre em dia.",
    icon: ShieldCheck,
    color: "text-red-400",
    bg: "bg-red-400/10"
  }
];

const OnboardingModal = ({ onComplete }: OnboardingModalProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("sanctuary_onboarding_done");
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => setIsVisible(true), 1500); // Delay suave para entrar após o dashboard carregar
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setIsVisible(false);
    localStorage.setItem("sanctuary_onboarding_done", "true");
    onComplete();
  };

  if (!isVisible) return null;

  const current = slides[currentSlide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/80 backdrop-blur-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="w-full max-w-2xl"
        >
          <GlassCard className="p-10 md:p-14 border-primary/20 bg-surface/40 overflow-hidden relative">
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-64 h-64 ${current.bg} blur-[100px] rounded-full -mr-20 -mt-20 transition-colors duration-500`} />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className={`w-24 h-24 rounded-3xl ${current.bg} ${current.color} flex items-center justify-center mb-10 shadow-2xl transition-colors duration-500`}>
                <Icon size={48} />
              </div>

              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{current.title}</h2>
              <p className="text-base md:text-lg opacity-60 leading-relaxed max-w-md mx-auto mb-12">
                {current.description}
              </p>

              <div className="flex items-center gap-3 mb-10">
                {slides.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? `w-8 ${current.color} bg-current` : 'w-2 bg-on-surface/10'}`} 
                  />
                ))}
              </div>

              <div className="flex items-center justify-between w-full pt-8 border-t border-[var(--glass-border)]">
                <button 
                  onClick={handleFinish}
                  className="editorial-label text-on-surface/30 hover:text-on-surface transition-colors"
                >
                  PULAR TOUR
                </button>

                <div className="flex items-center gap-4">
                  {currentSlide > 0 && (
                    <button 
                      onClick={() => setCurrentSlide(prev => prev - 1)}
                      className="w-12 h-12 rounded-full border border-[var(--glass-border)] flex items-center justify-center opacity-40 hover:opacity-100 transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  
                  <button 
                    onClick={handleNext}
                    className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-sm bg-on-surface text-surface hover:scale-105 transition-all shadow-xl shadow-on-surface/20`}
                  >
                    {currentSlide === slides.length - 1 ? (
                      <>ESTOU PRONTO <CheckCircle2 size={18} /></>
                    ) : (
                      <>PRÓXIMO <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default OnboardingModal;
