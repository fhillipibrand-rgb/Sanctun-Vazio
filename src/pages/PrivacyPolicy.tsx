import React from "react";
import { Shield, ArrowLeft, Lock, Eye, Database, Scale } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-surface p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4 mb-12">
          <Link to={-1 as any} className="p-2 hover:bg-on-surface/5 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="display-lg text-4xl">Política de Privacidade</h1>
            <p className="editorial-label opacity-60 tracking-[0.2em] mt-2">LGPD & PROTEÇÃO DE DADOS</p>
          </div>
        </header>

        <GlassCard className="p-8 md:p-12 space-y-12" orb>
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Shield size={24} />
              <h2 className="text-2xl font-bold">1. Compromisso com a Privacidade</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              O Sanctum está comprometido em proteger a sua privacidade e garantir que seus dados pessoais sejam tratados com transparência, segurança e em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <Database size={24} />
              <h2 className="text-2xl font-bold">2. Dados que Coletamos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-on-surface/[0.03] border border-[var(--glass-border)]">
                <h3 className="font-bold mb-2">Dados de Cadastro</h3>
                <p className="text-sm opacity-60">E-mail, nome, senha e informações de perfil que você fornece voluntariamente.</p>
              </div>
              <div className="p-6 rounded-2xl bg-on-surface/[0.03] border border-[var(--glass-border)]">
                <h3 className="font-bold mb-2">Dados de Uso</h3>
                <p className="text-sm opacity-60">Informações sobre como você utiliza as funcionalidades (tarefas, finanças, hábitos).</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Eye size={24} />
              <h2 className="text-2xl font-bold">3. Finalidade do Tratamento</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              Utilizamos seus dados exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm opacity-70 ml-4">
              <li>Fornecer e manter as funcionalidades do sistema;</li>
              <li>Sincronizar suas informações entre dispositivos através do Supabase;</li>
              <li>Melhorar a experiência do usuário e personalizar o conteúdo;</li>
              <li>Garantir a segurança da sua conta e prevenir fraudes.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Lock size={24} />
              <h2 className="text-2xl font-bold">4. Segurança e Armazenamento</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              Seus dados são armazenados de forma criptografada nos servidores do Supabase (infraestrutura AWS). Implementamos medidas rigorosas de segurança para proteger suas informações contra acessos não autorizados ou perda de dados.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Scale size={24} />
              <h2 className="text-2xl font-bold">5. Seus Direitos (LGPD)</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              Como titular dos dados, você tem o direito de:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm opacity-70 ml-4">
              <li>Confirmar a existência de tratamento de dados;</li>
              <li>Acessar e corrigir seus dados pessoais;</li>
              <li>Solicitar a exclusão definitiva da sua conta e de todos os dados associados;</li>
              <li>Revogar o consentimento a qualquer momento.</li>
            </ul>
          </section>

          <footer className="pt-12 border-t border-[var(--glass-border)] text-center">
            <p className="text-xs opacity-40 uppercase tracking-widest">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </footer>
        </GlassCard>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
