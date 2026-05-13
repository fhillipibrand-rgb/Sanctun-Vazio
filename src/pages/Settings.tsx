import React, { useState, useEffect } from "react";
import { User, Camera, Save, ArrowLeft, Loader2, Mail, Phone, MapPin, Lock, HelpCircle, Database, Zap, AlignLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import GlassCard from "../components/ui/GlassCard";

const Settings = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState<{ 
    full_name: string; 
    avatar_url: string;
    email: string;
    phone: string;
    address: string;
    accepted_terms_at: string | null;
  }>({
    full_name: "",
    avatar_url: "",
    email: "",
    phone: "",
    address: "",
    accepted_terms_at: null,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url, email, phone, address, accepted_terms_at")
      .eq("id", user?.id)
      .single();

    if (!error && data) {
      setProfile({
        full_name: data.full_name || "",
        avatar_url: data.avatar_url || "",
        email: data.email || user?.email || "",
        phone: data.phone || "",
        address: data.address || "",
        accepted_terms_at: data.accepted_terms_at || null,
      });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Você deve selecionar uma imagem para o upload.");
      }

      const file = event.target.files[0];

      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const MAX_SIZE_MB = 5;
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.');
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`Arquivo muito grande. Máximo permitido: ${MAX_SIZE_MB}MB.`);
      }

      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const fileName = `${user?.id}/${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      refreshProfile?.();
      setProfile({ ...profile, avatar_url: publicUrl });
      alert("Foto de perfil atualizada com sucesso!");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ 
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address
      })
      .eq("id", user?.id);

    if (error) alert(error.message);
    else {
      alert("Perfil atualizado!");
      refreshProfile?.();
    }
    setLoading(false);
  };

  const handleGenerateTestData = async () => {
    if (!user) return;
    if (!confirm("Isso criará 10 projetos, 100 tarefas, 1000 subtarefas e outros dados no seu usuário. Deseja continuar?")) return;

    setLoading(true);
    try {
      const projects = [];
      const projectIcons = ["Rocket", "Target", "Briefcase", "Code", "Zap", "Shield", "Globe", "Award", "Database", "Terminal"];
      const projectColors = ["#5e9eff", "#a855f7", "#00f5a0", "#ff6b6b", "#f5a623", "#3b82f6", "#ec4899", "#8b5cf6", "#10b981", "#f43f5e"];

      for (let i = 1; i <= 10; i++) {
        const { data: proj, error: projErr } = await supabase.from('projects').insert([{
          user_id: user.id,
          name: `Projeto Estratégico ${i.toString().padStart(2, '0')}`,
          description: `Escopo detalhado para o projeto de expansão número ${i}. Foco em resultados trimestrais.`,
          color: projectColors[i-1],
          icon: projectIcons[i-1],
          status: i % 3 === 0 ? 'Andamento' : 'Planejamento',
          priority: i % 4 === 0 ? 'Crítica' : 'Média'
        }]).select().single();

        if (proj) projects.push(proj);
      }

      for (const proj of projects) {
        for (let j = 1; j <= 10; j++) {
          const subtasks = Array.from({ length: 10 }, (_, k) => ({
            id: Math.random().toString(36).substring(2, 11),
            title: `Sub-etapa ${k + 1} da Tarefa ${j}`,
            is_completed: false
          }));

          await supabase.from('tasks').insert([{
            user_id: user.id,
            project_id: proj.id,
            title: `Tarefa ${j} do ${proj.name}`,
            energy_level: j % 3 === 0 ? 'high' : 'medium',
            is_critical: proj.priority === 'Crítica',
            status: 'todo',
            is_completed: false,
            subtasks: subtasks
          }]);
        }
      }

      const events = [];
      for (let i = 1; i <= 10; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        date.setHours(9 + i, 0, 0, 0);

        events.push({
          user_id: user.id,
          title: `Reunião de Alinhamento ${i}`,
          location: `Sala de Conferência ${i}`,
          start_time: date.toISOString()
        });
      }
      await supabase.from('events').insert(events);

      const nutritionLogs = [];
      const meals = ["Café da Manhã", "Almoço", "Lanche", "Jantar"];
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        for (const meal of meals) {
          nutritionLogs.push({
             user_id: user.id,
             meal_type: meal,
             food_name: "Refeição Equilibrada (Mock)",
             calories: 450,
             protein: 30,
             carbs: 50,
             fat: 15,
             logged_at: date.toISOString()
          });
        }
      }
      await supabase.from('nutrition_logs').insert(nutritionLogs);

      alert("🚀 ECOSSISTEMA GERADO COM SUCESSO!\n\n10 Projetos, 100 Tarefas, 1000 Subtarefas e dados de agenda/nutrição foram inseridos.");
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar dados. Verifique o console.");
    }
    setLoading(false);
  };

  const avatarUrl = React.useMemo(() => {
    if (profile.avatar_url && profile.avatar_url.trim() !== '') {
      return profile.avatar_url;
    }
    return `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.id || profile.full_name || 'sanctum')}&backgroundColor=3b5bdb,4c6ef5,748ffc&textColor=ffffff`;
  }, [profile.avatar_url, user?.id, profile.full_name]);

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      <header className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-on-surface/5 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="display-lg">Configurações</h2>
      </header>

      <GlassCard className="p-8 space-y-10" orb>
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] shadow-2xl relative">
              <img 
                key={avatarUrl}
                src={avatarUrl} 
                alt="Avatar" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('dicebear')) {
                    target.src = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(profile.full_name || 'user')}&backgroundColor=3b5bdb&textColor=ffffff`;
                  }
                }}
              />
              {loading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-surface rounded-xl flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera size={20} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleUpload} 
                disabled={loading}
              />
            </label>
          </div>
          <div className="text-center">
            <p className="editorial-label text-primary">FOTO DE PERFIL</p>
            <p className="text-xs text-on-surface-variant opacity-60 mt-1">Troque sua imagem de exibição</p>
          </div>
        </div>

        <form onSubmit={updateProfile} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="editorial-label text-[10px] opacity-60 ml-1">NOME COMPLETO</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  placeholder="Seu nome"
                  className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="editorial-label text-[10px] opacity-60 ml-1">E-MAIL DE CONTATO</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  placeholder="seu@email.com"
                  className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="editorial-label text-[10px] opacity-60 ml-1">TELEFONE</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="tel" 
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="editorial-label text-[10px] opacity-60 ml-1">ENDEREÇO</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  value={profile.address}
                  onChange={(e) => setProfile({...profile, address: e.target.value})}
                  placeholder="Cidade, Estado"
                  className="w-full bg-on-surface/[0.03] border border-[var(--glass-border)] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-medium text-sm"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-on-surface text-surface font-bold text-sm tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-on-surface/5"
          >
            {loading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
            {!loading && <Save size={18} />}
          </button>
        </form>
      </GlassCard>

      <div className="pt-8 border-t border-[var(--glass-border)] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                <Database size={12} /> Testes de Sistema
              </p>
              <p className="text-[11px] opacity-40">Gere dados fictícios para sua conta.</p>
            </div>
            <button 
              onClick={handleGenerateTestData}
              disabled={loading}
              className="px-4 py-2 bg-primary text-surface rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-40"
            >
              Gerar Ecossistema
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-on-surface/[0.02] border border-[var(--glass-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-primary opacity-60" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Tutorial do Sistema</p>
                <p className="text-[11px] opacity-40">Reveja o tour guiado.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('has_completed_tour');
                window.location.reload();
              }}
              className="px-4 py-2 bg-on-surface/5 hover:bg-on-surface/10 border border-[var(--glass-border)] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              Reiniciar Tour
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--glass-border)] opacity-40">
           <div className="flex items-center gap-6">
              <Link to="/terms" className="text-[9px] uppercase tracking-widest hover:opacity-100 transition-opacity">Termos</Link>
              <Link to="/privacy" className="text-[9px] uppercase tracking-widest hover:opacity-100 transition-opacity">Privacidade</Link>
           </div>
           <p className="text-[9px] uppercase tracking-[0.2em]">
             Sincronizado via Supabase Cloud
           </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
