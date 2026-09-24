import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { identifyPurchasesUser } from '@/lib/purchases';
import { forgetEpisodeStreams } from '@/lib/episodes';
import { DEMO_MODE } from '@/lib/demo';

const AuthContext = createContext(null);

// Every visitor always has a session: guests get an anonymous Supabase user,
// so wallets, unlocks and bookmarks live on the server for everyone.
async function ensureSession() {
  if (DEMO_MODE) return null; // demo catalog needs no backend session
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error('Anonymous sign-in failed (enable it in Supabase Auth settings):', error);
    return null;
  }
  return anon.session;
}

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    let active = true;
    ensureSession().then((s) => {
      if (!active) return;
      setSession(s);
      setIsLoadingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event === 'SIGNED_OUT') {
        forgetEpisodeStreams();
        // Supabase warns against awaiting auth calls inside this callback.
        setTimeout(() => ensureSession().then((next) => active && setSession(next)), 0);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    setProfile(data ?? null);
  }, [userId]);

  useEffect(() => {
    refreshProfile();
    forgetEpisodeStreams();
    if (userId) identifyPurchasesUser(userId);
  }, [userId, refreshProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        // No session at all (e.g. demo mode) is treated as a guest too.
        isAnonymous: !user || Boolean(user.is_anonymous),
        isAdmin: profile?.role === 'admin',
        isLoadingAuth,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
