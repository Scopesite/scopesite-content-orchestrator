import { createClient } from "@supabase/supabase-js";

// Extract Supabase URL from DATABASE_URL or use SUPABASE_URL
function getSupabaseUrl(): string {
  if (process.env.SUPABASE_URL) {
    return process.env.SUPABASE_URL;
  }
  
  // Parse from DATABASE_URL: postgres://postgres:pass@db.XXX.supabase.co:6543/postgres
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    const match = dbUrl.match(/db\.([^.]+)\.supabase\.co/);
    if (match) {
      return `https://${match[1]}.supabase.co`;
    }
  }
  
  throw new Error("Missing SUPABASE_URL or DATABASE_URL");
}

const SUPABASE_URL = getSupabaseUrl();
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error("Missing SUPABASE_SERVICE_KEY");
  process.exit(1);
}

// Use service role key for backend operations (bypasses RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types for type safety
export interface Post {
  id: string;
  orchestrator_id: string;
  workspace_id: string;
  contentstudio_post_id?: string | null;
  title?: string | null;
  body: string;
  scheduled_at: string;
  timezone: string;
  requested_channels: string[];
  mapped_accounts: string[];
  media: Array<{ url: string; alt?: string }>;
  first_comment: Record<string, string>;
  tags: string[];
  link?: string | null;
  utm: Record<string, string>;
  status: "pending" | "scheduled" | "published" | "failed" | "cancelled";
  error_message?: string | null;
  retry_count: number;
  last_retry_at?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface WebhookEvent {
  id: string;
  source: string;
  event_type?: string | null;
  payload: any;
  contentstudio_post_id?: string | null;
  post_id?: string | null;
  received_at: string;
  processed: boolean;
  processed_at?: string | null;
  error?: string | null;
}

