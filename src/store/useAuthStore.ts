import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

type SignUpInput = {
  email: string;
  password: string;
  ownerName: string;
  petName: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type ProfileUpdateInput = Partial<
  Pick<Profile, 'owner_name' | 'pet_name' | 'pet_breed' | 'pet_age' | 'neighborhood' | 'avatar_url'>
>;

type AuthState = {
  initialized: boolean;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<{ error: string | null }>;
  signIn: (input: SignInInput) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: ProfileUpdateInput) => Promise<{ error: string | null }>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  initialized: false,
  session: null,
  profile: null,
  loading: false,
  error: null,

  initialize: async () => {
    if (get().initialized) return;

    try {
      const { data } = await supabase.auth.getSession();
      set({ session: data.session });
      if (data.session) {
        await get().refreshProfile();
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        set({ session });
        if (session) {
          await get().refreshProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch (err) {
      // Sin .env configurado todavía (ver .env.example): arrancamos
      // igual como usuario no autenticado en vez de romper la app.
      console.warn('No se pudo inicializar Supabase Auth:', err);
    } finally {
      set({ initialized: true });
    }
  },

  refreshProfile: async () => {
    const userId = get().session?.user.id;
    if (!userId) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) set({ profile: data });
  },

  signUp: async ({ email, password, ownerName, petName }) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { owner_name: ownerName, pet_name: petName } },
    });
    set({ loading: false, error: error?.message ?? null });
    return { error: error?.message ?? null };
  },

  signIn: async ({ email, password }) => {
    set({ loading: true, error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false, error: error?.message ?? null });
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },

  updateProfile: async (patch) => {
    const userId = get().session?.user.id;
    if (!userId) return { error: 'No hay sesión activa.' };

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select()
      .single();

    if (error) return { error: error.message };
    if (data) set({ profile: data });
    return { error: null };
  },
}));
