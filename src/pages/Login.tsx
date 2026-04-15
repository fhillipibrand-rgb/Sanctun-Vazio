import React, { useState } from "react";
import { motion } from "motion/react";
import { Zap, Mail, Lock, LogIn, ChevronRight, Github } from "lucide-react";
import { supabase } from "../lib/supabase";
import GlassCard from "../components/ui/GlassCard";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0], // Nome padrão simples
            }
          }
        });
        if (error) throw error;
        alert("Verifique seu e-mail para confirmar o cadastro!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-surface">
      {/* Background Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-secondary/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 mx-auto mb-6">
            <Zap className="text-surface" size={32} fill="currentColor" />
          </div>
          <h1 className="display-lg text-4xl mb-2">Santuário</h1>
          <p className="editorial-label opacity-60 tracking-[0.2em]">MODO PROFUNDO • AUTENTICAÇÃO</p>
        </div>

        <GlassCard className="p-8 border border-[var(--glass-border)] shadow-2xl" orb>
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="editorial-label text-[10px] opacity-60 ml-1">E-MAIL</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="editorial-label text-[10px] opacity-60 ml-1">SENHA</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-xs font-medium text-center bg-red-400/10 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-primary text-surface font-bold text-sm tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "PROCESSANDO..." : isSignUp ? "CRIAR CONTA" : "ENTRAR"}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-[var(--glass-border)]" />
            <span className="editorial-label text-[8px] opacity-30">OU CONTINUAR COM</span>
            <div className="h-[1px] flex-1 bg-[var(--glass-border)]" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-3 rounded-xl bg-on-surface/[0.03] border border-[var(--glass-border)] flex items-center justify-center gap-2 hover:bg-on-surface/[0.06] transition-colors"
            >
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] font-bold text-black font-serif italic">G</div>
              <span className="text-[10px] font-bold">GOOGLE</span>
            </button>
            <button 
              onClick={handleGithubLogin}
              className="w-full py-3 rounded-xl bg-on-surface/[0.03] border border-[var(--glass-border)] flex items-center justify-center gap-2 hover:bg-on-surface/[0.06] transition-colors"
            >
              <Github size={16} />
              <span className="text-[10px] font-bold">GITHUB</span>
            </button>
          </div>

          <p className="mt-10 text-center text-xs text-on-surface-variant opacity-60">
            {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"} {" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-bold text-primary hover:underline underline-offset-4"
            >
              {isSignUp ? "Entrar agora" : "Começar gratuitamente"}
            </button>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
