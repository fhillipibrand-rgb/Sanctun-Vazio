import React from "react";
import { FileText, ArrowLeft, Gavel, UserCheck, AlertCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-surface p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center gap-4 mb-12">
          <Link to={-1 as any} className="p-2 hover:bg-on-surface/5 rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="display-lg text-4xl">Termos de Uso</h1>
            <p className="editorial-label opacity-60 tracking-[0.2em] mt-2">CONTRATO DE UTILIZAÇÃO</p>
          </div>
        </header>

        <GlassCard className="p-8 md:p-12 space-y-12" orb>
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-secondary">
              <Gavel size={24} />
              <h2 className="text-2xl font-bold">1. Aceitação dos Termos</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              Ao acessar ou utilizar o Sanctum, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-secondary">
              <UserCheck size={24} />
              <h2 className="text-2xl font-bold">2. Cadastro e Responsabilidade</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              Você é responsável por manter a confidencialidade de sua conta e senha, e por todas as atividades que ocorram sob sua conta. O Sanctum destina-se ao uso pessoal e estratégico para produtividade e gestão.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-secondary">
              <FileText size={24} />
              <h2 className="text-2xl font-bold">3. Propriedade Intelectual</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              O design, código, logotipos e funcionalidades do Sanctum são de propriedade exclusiva. Você mantém a propriedade total dos dados e conteúdos que insere na plataforma (Tarefas, Finanças, etc.), os quais são tratados conforme nossa Política de Privacidade.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-secondary">
              <AlertCircle size={24} />
              <h2 className="text-2xl font-bold">4. Limitação de Responsabilidade</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              O Sanctum é fornecido "como está". Não garantimos que o serviço será ininterrupto ou livre de erros. Não nos responsabilizamos por perdas financeiras ou de produtividade decorrentes do uso do sistema.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-secondary">
              <RefreshCw size={24} />
              <h2 className="text-2xl font-bold">5. Modificações</h2>
            </div>
            <p className="text-on-surface-variant leading-relaxed opacity-80">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações significativas serão comunicadas através da plataforma. O uso continuado do serviço após tais alterações constitui sua aceitação dos novos termos.
            </p>
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

export default TermsOfService;
