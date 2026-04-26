import React, { useState, useEffect } from "react";
import { User, Camera, Save, ArrowLeft, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import GlassCard from "../components/ui/GlassCard";

const Settings = () => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
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
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload da imagem para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // 3. Atualizar tabela de perfis
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

  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-12">
      <header className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-on-surface/5 rounded-xl transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="display-lg">Configurações</h2>
      </header>

      <GlassCard className="p-8 space-y-10" orb>
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-[var(--glass-border)] shadow-2xl relative">
              <img 
                src={profile.avatar_url || `https://picsum.photos/seed/${user?.id}/200/200`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
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
            {/* Nome Completo */}
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

            {/* Email */}
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

            {/* Telefone */}
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

            {/* Endereço */}
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-6">
              <Link to="/terms" className="editorial-label text-[9px] opacity-40 hover:opacity-100 transition-opacity">Termos de Uso</Link>
              <Link to="/privacy" className="editorial-label text-[9px] opacity-40 hover:opacity-100 transition-opacity">Política de Privacidade</Link>
           </div>
           <p className="text-[9px] text-on-surface-variant opacity-40 uppercase tracking-[0.2em]">
             Sincronizado via Supabase Cloud
           </p>
        </div>
        
        <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Lock size={12} /> Proteção de Dados (LGPD)
          </p>
          <p className="text-[11px] opacity-60 leading-relaxed">
            Seus dados são criptografados em repouso e em trânsito. Você possui total controle sobre suas informações, podendo solicitar a exportação ou exclusão total dos seus dados a qualquer momento através do suporte.
          </p>
          {profile.accepted_terms_at && (
            <p className="text-[9px] mt-4 opacity-40 uppercase tracking-widest font-bold">
              Termos aceitos em: {new Date(profile.accepted_terms_at).toLocaleDateString('pt-BR')} às {new Date(profile.accepted_terms_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
