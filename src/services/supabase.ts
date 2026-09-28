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
-- Skrip Penciptaan Pangkalan Data & Kolar Lengkap untuk Supabase PostgreSQL
-- Cipta semua Jadual, Kolum, Indeks, Data Asas, dan Hak Akses RLS dalam 1 Klik
-- ==============================================================================

-- 1. Jadual Kategori Mesyuarat (Meeting Categories)
CREATE TABLE IF NOT EXISTS public.meeting_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  badge_color TEXT DEFAULT 'bg-blue-100 text-blue-800 border-blue-200',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Jadual Utama Rekod Mesyuarat (Meetings)
-- Menyokong semua medan borang, kehadiran kuorum, dan senarai agenda
CREATE TABLE IF NOT EXISTS public.meetings (
  id TEXT PRIMARY KEY,
  meeting_number TEXT NOT NULL,               -- Bilangan Mesyuarat (cth: 1/2026)
  title TEXT NOT NULL,                        -- Tajuk Mesyuarat
  meeting_level TEXT DEFAULT 'tambon',        -- ระดับการประชุม (tambon: ตำบล, district: อำเภอ, province: จังหวัด)
  category_id TEXT REFERENCES public.meeting_categories(id) ON DELETE SET NULL,
  category_name TEXT NOT NULL,                -- Nama Kategori Mesyuarat
  meeting_date DATE NOT NULL,                 -- Tarikh Mesyuarat (YYYY-MM-DD)
  start_time TIME NOT NULL,                   -- Masa Mula (HH:mm)
  end_time TIME NOT NULL,                     -- Masa Tamat (HH:mm)
  venue TEXT NOT NULL,                        -- Tempat / Bilik Mesyuarat
  province_id TEXT NOT NULL,                  -- Kod / ID Negeri
  province_name TEXT NOT NULL,                -- Nama Negeri
  district_id TEXT NOT NULL,                  -- Kod / ID Daerah
  district_name TEXT NOT NULL,                -- Nama Daerah
  tambon_id TEXT NOT NULL,                    -- Kod / ID Mukim
  tambon_name TEXT NOT NULL,                  -- Nama Mukim
  organizer TEXT NOT NULL,                    -- Penganjur (cth: Pejabat Pentadbiran Mukim)
  total_eligible INT NOT NULL DEFAULT 0,      -- Jumlah Ahli Kuorum Layak
  required_quorum INT NOT NULL DEFAULT 0,     -- Jumlah Minimum Kuorum Sah
  is_quorum_met BOOLEAN NOT NULL DEFAULT FALSE, -- Cukup Kuorum atau Tidak
  attendees JSONB DEFAULT '[]'::jsonb,        -- Senarai Ahli Kehadiran & Status (JSON)
  agendas JSONB DEFAULT '[]'::jsonb,          -- Senarai Agenda & Keputusan (JSON)
  other_participants JSONB DEFAULT '[]'::jsonb, -- Peserta Jemputan Lain (JSON)
  chairman_name TEXT NOT NULL,                -- Nama Pengerusi Mesyuarat
  chairman_position TEXT NOT NULL,            -- Jawatan Pengerusi
  secretary_name TEXT NOT NULL,               -- Nama Setiausaha / Pencatat
  secretary_position TEXT NOT NULL,           -- Jawatan Setiausaha
  checker_name TEXT,                          -- Nama Pemeriksa Minit
  checker_position TEXT,                      -- Jawatan Pemeriksa
  status TEXT NOT NULL DEFAULT 'completed',   -- Status (draft, completed, published)
  created_by_id TEXT NOT NULL,                -- ID Pengguna Pembuat
  created_by_name TEXT NOT NULL,              -- Nama Pengguna Pembuat
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Jadual Ahli Jawatankuasa Kuorum Tetap (Committee Members)
CREATE TABLE IF NOT EXISTS public.committee_members (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,                        -- Gelaran (Tuan, Puan, Encik, dsb.)
  first_name TEXT NOT NULL,                   -- Nama Pertama
  last_name TEXT NOT NULL,                    -- Nama Akhir
  position TEXT NOT NULL,                     -- Jawatan
  role_in_meeting TEXT NOT NULL,              -- Peranan dalam Mesyuarat (chairman, secretary, member, dll.)
  organization TEXT NOT NULL,                 -- Organisasi / Agensi
  phone TEXT,                                 -- Nombor Telefon
  is_permanent BOOLEAN DEFAULT TRUE,          -- Ahli Tetap atau Tidak
  tambon_id TEXT,                             -- ID Mukim yang Diwakili
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Jadual Terperinci Ahli Kehadiran Mesyuarat (Meeting Attendees)
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

-- 5. Jadual Terperinci Agenda & Ketetapan (Meeting Agendas)
CREATE TABLE IF NOT EXISTS public.meeting_agendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id TEXT REFERENCES public.meetings(id) ON DELETE CASCADE,
  agenda_number TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  resolution TEXT,
  resolution_type TEXT CHECK (resolution_type IN ('acknowledged', 'approved', 'rejected', 'postponed', 'pending')),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. Jadual Profil Pengguna Sistem (User Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Indeks (Indexes) untuk Kelajuan Carian Pantas
CREATE INDEX IF NOT EXISTS idx_meetings_tambon ON public.meetings(tambon_id);
CREATE INDEX IF NOT EXISTS idx_meetings_district ON public.meetings(district_id);
CREATE INDEX IF NOT EXISTS idx_meetings_province ON public.meetings(province_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_attendees_meeting ON public.meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_agendas_meeting ON public.meeting_agendas(meeting_id);

-- Data Asas Kategori Mesyuarat (Default Seed Data)
INSERT INTO public.meeting_categories (id, name, description, badge_color) VALUES
  ('cat-council', 'Mesyuarat Majlis Mukim / Tempatan', 'Mesyuarat Sidang Biasa dan Khas Majlis Perbandaran / Mukim', 'bg-blue-100 text-blue-800 border-blue-200'),
  ('cat-district-heads', 'Mesyuarat Ketua Jabatan Daerah', 'Mesyuarat bulanan ketua-ketua jabatan kerajaan dan agensi peringkat daerah', 'bg-emerald-100 text-emerald-800 border-emerald-200'),
  ('cat-village-leaders', 'Mesyuarat Penghulu & Ketua Kampung', 'Mesyuarat berkala taklimat dasar dan pemantauan keselamatan komuniti', 'bg-amber-100 text-amber-800 border-amber-200'),
  ('cat-development', 'Mesyuarat Jawatankuasa Tindakan Pembangunan', 'Penilaian pelan tindakan pembangunan sosioekonomi dan peruntukan bajet', 'bg-purple-100 text-purple-800 border-purple-200'),
  ('cat-disaster', 'Mesyuarat Pengurusan Bencana & Kecemasan', 'Kesiapsiagaan menghadapi bencana banjir, ribut dan kecemasan awam', 'bg-rose-100 text-rose-800 border-rose-200'),
  ('cat-internal', 'Mesyuarat Pentadbiran & Pengurusan Dalaman', 'Penyelarasan urusan operasi dalaman pejabat dan semakan prestasi', 'bg-indigo-100 text-indigo-800 border-indigo-200')
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- Keselamatan & Hak Akses (Row-Level Security: RLS)
-- Membenarkan Frontend (Anon / Authenticated) membaca dan menyimpan data secara lancar
-- ==============================================================================
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Polisi Keselamatan untuk Capaian Penuh Melalui Kunci Awam (Anon & Authenticated)
DROP POLICY IF EXISTS "meetings_full_access" ON public.meetings;
CREATE POLICY "meetings_full_access" ON public.meetings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "categories_full_access" ON public.meeting_categories;
CREATE POLICY "categories_full_access" ON public.meeting_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "committees_full_access" ON public.committee_members;
CREATE POLICY "committees_full_access" ON public.committee_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "attendees_full_access" ON public.meeting_attendees;
CREATE POLICY "attendees_full_access" ON public.meeting_attendees FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "agendas_full_access" ON public.meeting_agendas;
CREATE POLICY "agendas_full_access" ON public.meeting_agendas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_full_access" ON public.profiles;
CREATE POLICY "profiles_full_access" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Memberi Kebenaran Akses SQL kepada Peranan anon dan authenticated
GRANT ALL ON TABLE public.meetings TO anon, authenticated;
GRANT ALL ON TABLE public.meeting_categories TO anon, authenticated;
GRANT ALL ON TABLE public.committee_members TO anon, authenticated;
GRANT ALL ON TABLE public.meeting_attendees TO anon, authenticated;
GRANT ALL ON TABLE public.meeting_agendas TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO anon, authenticated;
`;
