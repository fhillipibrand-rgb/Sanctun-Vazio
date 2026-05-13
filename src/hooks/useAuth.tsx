import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

export interface Profile {
  full_name: string;
  avatar_url: string;
  accepted_terms_at?: string | null;
  has_completed_tour?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, accepted_terms_at, has_completed_tour')
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) console.warn("⚠️ Auth timeout reached. Forcing load state...");
        return false;
      });
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      const demoEnabled = import.meta.env.VITE_DEMO_ENABLED === 'true';
      const params = new URLSearchParams(window.location.search);
      
      if (demoEnabled && params.get('demo') === 'musk') {
        const demoUser = { id: 'd892ae4b-9921-4f44-be4e-3ad6eacf3674', email: 'elon.musk@sanctum.app' };
        const demoSession = { access_token: 'demo-token', user: demoUser };
        setSession(demoSession as any);
        setUser(demoUser as any);
        fetchProfile(demoUser.id);
        setLoading(false);
        clearTimeout(timer);
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
      clearTimeout(timer);
    });

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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
