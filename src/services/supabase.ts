import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE_CONFIG = 'emeeting_gov_supabase_config';

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isConnected: boolean;
}

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        supabaseUrl: parsed.supabaseUrl || envUrl,
        supabaseAnonKey: parsed.supabaseAnonKey || envKey,
        isConnected: Boolean(parsed.isConnected && (parsed.supabaseUrl || envUrl))
      };
    }
  } catch (e) {
    console.error('Failed to parse Supabase config', e);
  }

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    isConnected: Boolean(envUrl && envKey)
  };
};

export const saveSupabaseConfig = (config: SupabaseConfig) => {
  localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(config));
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  if (cachedClient && lastUsedUrl === config.supabaseUrl && lastUsedKey === config.supabaseAnonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
    lastUsedUrl = config.supabaseUrl;
    lastUsedKey = config.supabaseAnonKey;
    return cachedClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    if (!url.startsWith('https://')) {
      return { success: false, message: 'URL mestilah bermula dengan https:// dan merupakan Project URL Supabase yang sah' };
    }
    const tempClient = createClient(url, key);
    // Simple ping query
    const { error } = await tempClient.from('meetings').select('id').limit(1);
    
    // Even if table does not exist yet (code 42P01), connection to Supabase itself succeeded!
    if (error && error.code !== '42P01' && error.message.includes('FetchError')) {
      return { success: false, message: `Gagal menyambung ke Supabase: ${error.message}` };
    }

    return { 
      success: true, 
      message: 'Sambungan ke Supabase berjaya! (Sedia untuk menyelaraskan data mengikut piawaian keselamatan RLS)' 
    };
  } catch (err: any) {
    return { success: false, message: `Ralat sambungan: ${err?.message || 'Tidak dapat berhubung dengan pelayan'}` };
  }
};

/**
 * Complete SQL Migration script for Supabase Database
 * Includes Row Level Security (RLS) policies matching the administrative hierarchy!
 */
export const GENERATE_SUPABASE_SQL_SCRIPT = `-- ==============================================================================
-- Sistem Pengurusan & Minit Mesyuarat Rasmi (e-Mesyuarat Zone)
-- Skema PostgreSQL / Supabase & Dasar Keselamatan Peringkat Baris (RLS)
-- Kawalan Akses Mengikut Hierarki: Mukim -> Daerah -> Negeri / Pusat
-- ==============================================================================

-- 1. Jadual profil pengguna sistem dan peranan (Users & Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('tambon_admin', 'district_admin', 'province_admin', 'central_admin')),
  role_title TEXT NOT NULL,
  province_id TEXT NOT NULL,
  province_name TEXT NOT NULL,
  district_id TEXT,
  district_name TEXT,
  tambon_id TEXT,
  tambon_name TEXT,
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Jadual kategori mesyuarat (Meeting Categories)
CREATE TABLE IF NOT EXISTS public.meeting_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  badge_color TEXT DEFAULT 'bg-blue-100 text-blue-800 border-blue-200',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Jadual data utama mesyuarat (Meetings)
CREATE TABLE IF NOT EXISTS public.meetings (
  id TEXT PRIMARY KEY,
  meeting_number TEXT NOT NULL, -- cth: 1/2026
  title TEXT NOT NULL,
  category_id TEXT REFERENCES public.meeting_categories(id),
  category_name TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue TEXT NOT NULL,
  province_id TEXT NOT NULL,
  province_name TEXT NOT NULL,
  district_id TEXT NOT NULL,
  district_name TEXT NOT NULL,
  tambon_id TEXT NOT NULL,
  tambon_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  total_eligible INT NOT NULL DEFAULT 0,
  required_quorum INT NOT NULL DEFAULT 0,
  is_quorum_met BOOLEAN NOT NULL DEFAULT FALSE,
  chairman_name TEXT NOT NULL,
  chairman_position TEXT NOT NULL,
  secretary_name TEXT NOT NULL,
  secretary_position TEXT NOT NULL,
  checker_name TEXT,
  checker_position TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'completed', 'published')),
  created_by_id TEXT NOT NULL,
  created_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Jadual ahli kuorum dan kehadiran mesyuarat (Meeting Attendees)
CREATE TABLE IF NOT EXISTS public.meeting_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT REFERENCES public.meetings(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL,
  full_name TEXT NOT NULL,
  position TEXT NOT NULL,
  role_in_meeting TEXT NOT NULL,
  organization TEXT,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave', 'proxy')),
  proxy_name TEXT,
  proxy_position TEXT,
  leave_reason TEXT,
  note TEXT,
  signed_time TIME,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Jadual agenda mesyuarat dan keputusan/ketetapan (Meeting Agendas)
CREATE TABLE IF NOT EXISTS public.meeting_agendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT REFERENCES public.meetings(id) ON DELETE CASCADE,
  agenda_number TEXT NOT NULL, -- cth: 1, 2, 3.1
  title TEXT NOT NULL,
  details TEXT,
  resolution TEXT,
  resolution_type TEXT CHECK (resolution_type IN ('acknowledged', 'approved', 'rejected', 'postponed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Indeks (Indexes) untuk mempercepatkan carian data
CREATE INDEX IF NOT EXISTS idx_meetings_tambon ON public.meetings(tambon_id);
CREATE INDEX IF NOT EXISTS idx_meetings_district ON public.meetings(district_id);
CREATE INDEX IF NOT EXISTS idx_meetings_province ON public.meetings(province_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_attendees_meeting ON public.meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_agendas_meeting ON public.meeting_agendas(meeting_id);

-- ==============================================================================
-- Dasar Keselamatan Peringkat Baris (Row-Level Security: RLS) Mengikut Hierarki
-- ==============================================================================
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agendas ENABLE ROW LEVEL SECURITY;

-- 1) Pentadbir Mukim (tambon_admin): Baca dan sunting hanya data mukim sendiri
-- 2) Pentadbir Daerah (district_admin): Baca dan sunting semua mukim di bawah daerah sendiri
-- 3) Pentadbir Negeri / Pusat (province_admin / central_admin): Akses gambaran penuh secara masa nyata

-- Polisi capaian paparan mesyuarat (SELECT Policy)
CREATE POLICY "meetings_select_policy" ON public.meetings
FOR SELECT TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('central_admin', 'province_admin')
  OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'district_admin' AND district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid()))
  OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'tambon_admin' AND tambon_id = (SELECT tambon_id FROM public.profiles WHERE id = auth.uid()))
);

-- Polisi perekodan mesyuarat baharu (INSERT Policy)
CREATE POLICY "meetings_insert_policy" ON public.meetings
FOR INSERT TO authenticated
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('central_admin')
  OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'district_admin' AND district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid()))
  OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'tambon_admin' AND tambon_id = (SELECT tambon_id FROM public.profiles WHERE id = auth.uid()))
);

-- Polisi pengemaskinian mesyuarat (UPDATE Policy)
CREATE POLICY "meetings_update_policy" ON public.meetings
FOR UPDATE TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('central_admin')
  OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'district_admin' AND district_id = (SELECT district_id FROM public.profiles WHERE id = auth.uid()))
  OR ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'tambon_admin' AND tambon_id = (SELECT tambon_id FROM public.profiles WHERE id = auth.uid()))
);
`;
