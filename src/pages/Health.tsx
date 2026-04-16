import React, { useState } from "react";
import { 
  Activity, 
  Pill, 
  Plus, 
  Minus, 
  AlertCircle, 
  ClipboardList, 
  PhoneCall, 
  ExternalLink,
  Calendar,
  ShieldAlert,
  Search,
  ChevronRight,
  Stethoscope
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_HEALTH } from "../lib/mockData";

const Health = () => {
  const [meds, setMeds] = useState(MOCK_HEALTH.meds);
  const exams = MOCK_HEALTH.exams;
  const contacts = MOCK_HEALTH.emergencyContacts;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 pt-4">
      <header className="space-y-2">
        <div className="flex items-center gap-2 opacity-50">
          <Activity size={12} className="text-red-400" />
          <p className="editorial-label !tracking-[0.2em]">GESTÃO E SEGURANÇA</p>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Saúde & Longevidade</h2>
        <p className="text-on-surface-variant opacity-60 max-w-2xl text-sm leading-relaxed">
          Sua saúde é o seu maior ativo. Monitore medicamentos, agende exames e tenha 
          contatos de segurança sempre à mão.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Controle de Medicamentos */}
        <GlassCard className="p-8 border-red-400/20 col-span-1 lg:col-span-2 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-red-400 font-bold tracking-widest text-[10px] editorial-label">
              <Pill size={14} /> CONTROLE DE ESTOQUE
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl transition-all text-[10px] font-bold tracking-widest uppercase">
              <Plus size={14} /> NOVO ITEM
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {meds.map((med) => {
              const isLowStock = med.stock <= med.minStock;
              return (
                <div key={med.id} className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 ${isLowStock ? 'bg-red-400/5 border-red-400/20' : 'bg-on-surface/[0.03] border-[var(--glass-border)]'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-base tracking-tight">{med.name}</h4>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest mt-0.5">{med.dosage} • {med.frequency}</p>
                    </div>
                    {isLowStock && (
                      <div className="p-1.5 bg-red-400/10 text-red-500 rounded-lg animate-pulse">
                        <AlertCircle size={14} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className={`text-2xl font-mono font-bold leading-none ${isLowStock ? 'text-red-400' : ''}`}>{med.stock}</span>
                      <span className="text-[9px] opacity-30 font-bold uppercase tracking-tighter">unidades rest.</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="w-10 h-10 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl flex items-center justify-center transition-all"><Minus size={16} /></button>
                      <button className="w-10 h-10 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl flex items-center justify-center transition-all"><Plus size={16} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {meds.some(m => m.stock <= m.minStock) && (
            <div className="mt-8 p-5 rounded-3xl bg-red-400 text-surface shadow-lg shadow-red-400/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ShieldAlert size={24} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest">Ação Necessária</p>
                  <p className="text-[11px] opacity-80">Você tem itens críticos que precisam de reposição imediata.</p>
                </div>
              </div>
              <button className="p-3 bg-surface text-red-400 rounded-2xl hover:scale-110 transition-transform shadow-md">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </GlassCard>

        {/* Contatos de Emergência */}
        <GlassCard className="p-8 border-orange-400/20 flex flex-col h-full bg-gradient-to-br from-orange-400/[0.03] to-transparent">
          <div className="flex items-center gap-3 text-orange-400 font-bold tracking-widest text-[10px] editorial-label mb-8">
            <PhoneCall size={14} /> EMERGÊNCIA RÁPIDA
          </div>
          
          <div className="space-y-4 flex-1">
            {contacts.map((contact) => (
              <a 
                key={contact.name}
                href={`tel:${contact.phone}`}
                className="block p-5 rounded-3xl border border-orange-400/20 bg-orange-400/5 group hover:bg-orange-400/10 transition-all hover:scale-[1.02] active:scale-95"
              >
                <div className="flex justify-between items-center">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase text-orange-400 tracking-widest opacity-60 mb-0.5">{contact.relation}</p>
                    <h4 className="font-bold text-lg truncate group-hover:text-orange-400 transition-colors">{contact.name}</h4>
                    <p className="font-mono text-xs opacity-40 mt-1">{contact.phone}</p>
                  </div>
                  <div className="w-10 h-10 bg-orange-400 text-surface rounded-2xl flex items-center justify-center shadow-lg shadow-orange-400/20 group-hover:rotate-12 transition-all">
                    <PhoneCall size={18} />
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-8 p-4 bg-on-surface/5 rounded-2xl border border-[var(--glass-border)] opacity-60 italic text-[10px] leading-relaxed text-center">
            Clique no contato para iniciar a chamada imediatamente do seu dispositivo.
          </div>
        </GlassCard>

        {/* Registro de Exames */}
        <GlassCard orb className="p-8 lg:col-span-3 border-teal-400/20 bg-gradient-to-br from-teal-400/[0.03] to-transparent relative overflow-hidden group mt-2">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-1000">
            <Stethoscope size={280} className="text-teal-400" />
          </div>
          <div className="relative z-10 w-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-teal-400 font-bold tracking-widest text-[10px] editorial-label">
                <ClipboardList size={20} /> REGISTRO DE EXAMES
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                <input type="text" placeholder="Buscar exame..." className="bg-on-surface/5 border border-[var(--glass-border)] rounded-full py-2 pl-10 pr-6 text-xs outline-none focus:border-teal-400/50 transition-all min-w-[240px]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map((exam) => (
                <div key={exam.id} className="p-5 rounded-3xl bg-on-surface/[0.03] border border-[var(--glass-border)] hover:border-teal-400/30 transition-all group flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-teal-400/10 text-teal-400 rounded-2xl flex flex-col items-center justify-center">
                      <Calendar size={18} />
                      <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">MAR</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-base">{exam.title}</h4>
                      <p className="text-xs opacity-40">{exam.lab} • {exam.date}</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-[10px] font-bold text-teal-400 opacity-0 group-hover:opacity-100 transition-all px-4 py-2 bg-teal-400/10 rounded-full">
                    <span>VER LAUDO</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            <button className="mt-8 w-full py-4 border-2 border-dashed border-teal-400/20 rounded-3xl text-teal-400/50 hover:text-teal-400 hover:border-teal-400/40 hover:bg-teal-400/5 transition-all text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2">
              <Plus size={16} /> ANEXAR NOVO EXAME
            </button>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Health;
