export const config = {
  apiBase: import.meta.env.VITE_API_BASE || 'https://contentgen.up.railway.app',
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://ifmlinqbztysxhmidkfa.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbWxpbnFienR5c3hobWlka2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjAzMDQsImV4cCI6MjA3NjEzNjMwNH0.mfszYWUzVF0AkGR7tIT6l2vn8_QtIW0QTlV_JBFPre8'
  }
};

