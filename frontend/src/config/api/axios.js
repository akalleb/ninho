import axios from 'axios';
import { supabase } from '../supabase';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  if (typeof window === 'undefined') return config;
  try {
    let { data } = await supabase.auth.getSession();
    let token = data?.session?.access_token;
    if (!token) {
      try {
        await supabase.auth.refreshSession();
        const refreshed = await supabase.auth.getSession();
        data = refreshed.data;
        token = data?.session?.access_token;
      } catch (e) {
      }
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
  }
  return config;
});

export default api;
