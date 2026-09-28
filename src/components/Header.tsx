import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../data/thaiAdministrativeData';
import {
  Building2,
  Clock,
  LogOut,
  Shield,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Users,
  Database,
  PlusCircle,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'meetings' | 'committees' | 'supabase';
  onSelectTab: (tab: 'dashboard' | 'meetings' | 'committees' | 'supabase') => void;
  onNewMeeting: () => void;
  onOpenSupabaseConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onNewMeeting,
  onOpenSupabaseConfig,
}) => {
  const { currentUser, logout, switchUser, secondsRemaining, extendSession } = useAuth();

  if (!currentUser) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timerDisplay = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  const isLowTime = secondsRemaining <= 300; // Under 5 minutes

  // Format jurisdiction label in Malay
  let jurisdictionLabel = '';
  let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';

  if (currentUser.role === 'tambon_admin') {
    jurisdictionLabel = `Peringkat Mukim: Mukim ${currentUser.tambonName} (Daerah ${currentUser.districtName})`;
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  } else if (currentUser.role === 'district_admin') {
    jurisdictionLabel = `Peringkat Daerah: Daerah ${currentUser.districtName} (Negeri ${currentUser.provinceName})`;
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-300';
  } else {
    jurisdictionLabel = `Peringkat Negeri / Pusat: Negeri ${currentUser.provinceName} (Gambaran Keseluruhan)`;
    badgeColor = 'bg-purple-50 text-purple-800 border-purple-300';
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print font-sans">
      {/* Top Banner with Gov Branding & Session Countdown */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-300">
              Sistem Pengurusan e-Mesyuarat Zone | Pentadbiran Kerajaan
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">
              {currentUser.department}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto logout countdown timer */}
            <div
              onClick={extendSession}
              title="Klik untuk menyambung masa sesi selama 30 minit lagi"
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] cursor-pointer transition-colors ${
                isLowTime
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Sesi Aktif:</span>
              <span className="font-mono font-bold">{timerDisplay} min</span>
              <RefreshCw className="w-3 h-3 ml-0.5 opacity-70 hover:opacity-100" />
            </div>

            {/* Quick Switch Persona Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 cursor-pointer"
              >
                <Shield className="w-3 h-3 text-amber-400" />
                <span className="max-w-[140px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              <div className="absolute right-0 top-full mt-1 w-72 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 py-2 hidden group-hover:block hover:block z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  Tukar Peranan Pengguna (Uji Akses)
                </div>
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => switchUser(user.id)}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      user.id === currentUser.id ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{user.roleTitle}</p>
                    </div>
                    {user.id === currentUser.id && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
                <div className="pt-1.5 mt-1 border-t border-slate-100 px-3">
                  <button
                    onClick={() => logout()}
                    className="w-full text-left text-xs text-rose-600 hover:text-rose-700 py-1 font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Keluar (Logout)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Current User Role Banner */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Sistem Pengurusan & Minit Mesyuarat Rasmi
                </h1>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                  <MapPin className="w-3 h-3" />
                  {jurisdictionLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log Masuk Sebagai: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.roleTitle})
              </p>
            </div>
          </div>

          {/* Action buttons & tabs */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={onNewMeeting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Rekod Mesyuarat Baharu</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation (Conditional based on role: Tambon Admin only sees meetings view) */}
        <div className="flex items-center gap-1 mt-3 border-t border-slate-100 pt-2 overflow-x-auto text-xs sm:text-sm font-medium">
          {currentUser.role !== 'tambon_admin' && (
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                currentTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Papan Pemuka Statistik Eksekutif
            </button>
          )}

          <button
            onClick={() => onSelectTab('meetings')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              currentTab === 'meetings'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            {currentUser.role === 'tambon_admin' 
              ? `Rekod Mesyuarat Mukim ${currentUser.tambonName} & Eksport PDF/Excel`
              : 'Senarai Rekod Mesyuarat & Eksport PDF/Excel'}
          </button>

          <button
            onClick={() => onSelectTab('committees')}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              currentTab === 'committees'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Jawatankuasa Kuorum Tetap
          </button>

          {currentUser.role !== 'tambon_admin' && (
            <button
              onClick={() => onSelectTab('supabase')}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                currentTab === 'supabase'
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4" />
              Tetapan Supabase & GitHub Pages
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
