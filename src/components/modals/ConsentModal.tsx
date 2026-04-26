import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Check, ArrowRight, Lock, ExternalLink } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { supabase } from "../../lib/supabase";
import { Link } from "react-router-dom";

interface ConsentModalProps {
  isOpen: boolean;
  userId: string;
  onAccept: () => void;
}

const ConsentModal = ({ isOpen, userId, onAccept }: ConsentModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          accepted_terms_at: new Date().toISOString() 
        })
        .eq("id", userId);

      if (error) throw error;
      onAccept();
    } catch (err) {
      console.error("Erro ao registrar aceite:", err);
      alert("Não foi possível registrar seu aceite. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg"
          >
            <GlassCard className="p-8 md:p-10 border border-primary/20 shadow-2xl" orb>
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                  <Shield size={40} className="animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="display-sm text-3xl font-bold tracking-tight">Privacidade & Transparência</h2>
                  <p className="text-sm opacity-60 leading-relaxed">
                    Atualizamos nossos protocolos de segurança e privacidade para estarmos em total conformidade com a <strong>LGPD</strong>.
                  </p>
                </div>

                <div className="w-full space-y-4 pt-4">
                  <div className="p-4 rounded-2xl bg-on-surface/[0.03] border border-[var(--glass-border)] flex items-start gap-4 text-left">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary shrink-0">
                      <Lock size={18} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest">Proteção Total</p>
                      <p className="text-[10px] opacity-50">Seus dados são criptografados e você tem controle total sobre eles.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-6 py-2">
                    <Link to="/terms" target="_blank" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
                      Termos de Uso <ExternalLink size={10} />
                    </Link>
                    <Link to="/privacy" target="_blank" className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
                      Privacidade <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>

                <div className="w-full pt-6 space-y-4">
                  <button
                    onClick={handleAccept}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-primary text-surface font-bold text-sm tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? "PROCESSANDO..." : (
                      <>
                        CONCORDO E CONTINUAR
                        <Check size={18} />
                      </>
                    )}
                  </button>
                  
                  <p className="text-[9px] opacity-40 uppercase tracking-[0.2em]">
                    Ao clicar, você confirma que leu e aceitou as nossas políticas.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConsentModal;
