import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Key is missing. Check your environment variables.');
}

const notConfiguredError = () => ({
  data: { session: null, user: null },
  error: { message: 'Supabase não configurado (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).' },
});

const createFallbackClient = () => ({
  auth: {
    signInWithPassword: async () => notConfiguredError(),
    signUp: async () => notConfiguredError(),
    resetPasswordForEmail: async () => ({ error: notConfiguredError().error }),
    exchangeCodeForSession: async () => ({ error: notConfiguredError().error }),
    setSession: async () => ({ error: notConfiguredError().error }),
    updateUser: async () => ({ error: notConfiguredError().error }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null } }),
    refreshSession: async () => ({ data: { session: null } }),
    getUser: async () => ({ data: { user: null } }),
  },
});

const client =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : createFallbackClient();

if (client?.auth && typeof client.auth.signInWithPassword !== 'function' && typeof client.auth.signIn === 'function') {
  client.auth.signInWithPassword = ({ email, password }) => client.auth.signIn({ email, password });
}

export const supabase = client;
