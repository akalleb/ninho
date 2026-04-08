import axios from 'axios';
import { supabase } from '../supabase';

const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8021';
const clientBaseUrl = '/api/proxy';
const serverBaseUrl = process.env.INTERNAL_API_URL || backendBaseUrl;

const api = axios.create({
  baseURL: typeof window === 'undefined' ? serverBaseUrl : clientBaseUrl,
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
