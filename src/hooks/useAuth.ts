import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  full_name: string;
  avatar_url: string;
  accepted_terms_at?: string | null;
}

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fail-safe: Forçar descarregamento após 5s para evitar tela branca
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) console.warn("⚠️ Auth timeout reached. Forcing load state...");
        return false;
      });
    }, 5000);

    // Buscar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
      clearTimeout(timer);
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
      clearTimeout(timer);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, accepted_terms_at')
        .eq('id', userId)
        .single();
      
      if (data) {
        setProfile(data);
        
        if (!data.full_name && user?.email) {
          const derivedName = user.email
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
          
          await supabase.from('profiles').update({ full_name: derivedName }).eq('id', userId);
          setProfile({ ...data, full_name: derivedName });
        }
      } else if (!error) {
        const derivedName = user?.email?.split('@')[0] || "Explorador";
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({ id: userId, full_name: derivedName })
          .select()
          .single();
        if (newProfile) setProfile(newProfile);
      }
    } catch (err) {
      console.error("Falha ao buscar perfil:", err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, profile, loading, signOut, refreshProfile: () => user && fetchProfile(user.id) };
};
