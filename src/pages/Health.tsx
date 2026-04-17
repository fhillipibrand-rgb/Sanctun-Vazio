import React, { useState, useEffect } from "react";
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
  Stethoscope,
  Trash2
} from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

interface Med {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  stock: number;
  min_stock: number;
}

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const Health = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [meds, setMeds] = useState<Med[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showMedForm, setShowMedForm] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "", stock: 20, min_stock: 5 });

  useEffect(() => {
    if (user) {
      fetchMeds();
      fetchContacts();
    }
  }, [user]);

  const fetchMeds = async () => {
    const { data } = await supabase.from('health_meds').select('*').order('name');
    if (data) setMeds(data);
    setLoading(false);
  };

  const fetchContacts = async () => {
    const { data } = await supabase.from('health_contacts').select('*').order('name');
    if (data) setContacts(data);
  };

  const updateStock = async (id: string, newStock: number) => {
    const { error } = await supabase.from('health_meds').update({ stock: newStock }).eq('id', id);
    if (!error) {
      setMeds(meds.map(m => m.id === id ? { ...m, stock: newStock } : m));
    }
  };

  const handleAddMed = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('health_meds').insert([{ ...newMed, user_id: user?.id }]).select().single();
    if (!error && data) {
      setMeds([...meds, data]);
      setNewMed({ name: "", dosage: "", frequency: "", stock: 20, min_stock: 5 });
      setShowMedForm(false);
    }
  };

  const handleDeleteMed = async (id: string) => {
    const { error } = await supabase.from('health_meds').delete().eq('id', id);
    if (!error) setMeds(meds.filter(m => m.id !== id));
  };

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

      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-30 editorial-label animate-pulse">SINCRONIZANDO DADOS VITAIS...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Controle de Medicamentos */}
          <GlassCard className="p-8 border-red-400/20 col-span-1 lg:col-span-2 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-red-400 font-bold tracking-widest text-[10px] editorial-label">
                <Pill size={14} /> CONTROLE DE ESTOQUE
              </div>
              <button 
                onClick={() => setShowMedForm(!showMedForm)}
                className="flex items-center gap-2 px-4 py-2 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl transition-all text-[10px] font-bold tracking-widest uppercase"
              >
                <Plus size={14} /> {showMedForm ? "FECHAR" : "NOVO ITEM"}
              </button>
            </div>

            <AnimatePresence>
              {showMedForm && (
                <motion.form key="form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} onSubmit={handleAddMed} className="space-y-4 mb-8 p-6 bg-on-surface/5 rounded-3xl overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input type="text" placeholder="Nome do Medicamento" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="bg-transparent border-b border-[var(--glass-border)] py-2 text-sm outline-none focus:border-red-400/50" required />
                    <input type="text" placeholder="Dosagem (ex: 500mg)" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="bg-transparent border-b border-[var(--glass-border)] py-2 text-sm outline-none focus:border-red-400/50" />
                    <input type="text" placeholder="Frequência (ex: 12h em 12h)" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="bg-transparent border-b border-[var(--glass-border)] py-2 text-sm outline-none focus:border-red-400/50" />
                    <input type="number" placeholder="Estoque Inicial" value={newMed.stock} onChange={e => setNewMed({...newMed, stock: parseInt(e.target.value) || 0})} className="bg-transparent border-b border-[var(--glass-border)] py-2 text-sm outline-none focus:border-red-400/50" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-red-400 text-surface rounded-2xl font-bold text-xs uppercase tracking-widest">ADICIONAR AO ESTOQUE</button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {meds.map((med) => {
                const isLowStock = med.stock <= med.min_stock;
                return (
                  <div key={med.id} className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 ${isLowStock ? 'bg-red-400/5 border-red-400/20' : 'bg-on-surface/[0.03] border-[var(--glass-border)]'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-base tracking-tight">{med.name}</h4>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mt-0.5">{med.dosage} • {med.frequency}</p>
                      </div>
                      <div className="flex gap-2">
                        {isLowStock && (
                          <div className="p-1.5 bg-red-400/10 text-red-500 rounded-lg animate-pulse">
                            <AlertCircle size={14} />
                          </div>
                        )}
                        <button onClick={() => handleDeleteMed(med.id)} className="opacity-20 hover:opacity-100 hover:text-red-400 transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <span className={`text-2xl font-mono font-bold leading-none ${isLowStock ? 'text-red-400' : ''}`}>{med.stock}</span>
                        <span className="text-[9px] opacity-30 font-bold uppercase tracking-tighter">unidades rest.</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => updateStock(med.id, Math.max(0, med.stock - 1))} className="w-10 h-10 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl flex items-center justify-center transition-all"><Minus size={16} /></button>
                        <button onClick={() => updateStock(med.id, med.stock + 1)} className="w-10 h-10 bg-on-surface/5 hover:bg-on-surface/10 rounded-xl flex items-center justify-center transition-all"><Plus size={16} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {meds.length === 0 && !showMedForm && (
                <div className="col-span-2 py-10 text-center opacity-20 text-[10px] font-bold uppercase tracking-widest">Nenhum medicamento registrado</div>
              )}
            </div>

            {meds.some(m => m.stock <= m.min_stock) && (
              <div className="mt-8 p-5 rounded-3xl bg-red-400 text-surface shadow-lg shadow-red-400/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ShieldAlert size={24} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest">Ação Necessária</p>
                    <p className="text-[11px] opacity-80">Você tem itens críticos que precisam de reposição imediata.</p>
                  </div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Contatos de Emergência */}
          <GlassCard className="p-8 border-orange-400/20 flex flex-col h-full bg-gradient-to-br from-orange-400/[0.03] to-transparent">
            <div className="flex items-center gap-3 text-orange-400 font-bold tracking-widest text-[10px] editorial-label mb-8">
              <PhoneCall size={14} /> EMERGÊNCIA RÁPIDA
            </div>
            
            <div className="space-y-4 flex-1">
              {contacts.length > 0 ? contacts.map((contact) => (
                <a 
                  key={contact.id}
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
              )) : (
                <div className="text-center py-10 opacity-20 text-[10px] font-bold uppercase">Nenhum contato salvo</div>
              )}
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default Health;
