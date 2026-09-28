import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_USERS } from '../data/thaiAdministrativeData';
import { ShieldCheck, UserCheck, ArrowRight, AlertCircle, Lock, Building2, MapPin, Database } from 'lucide-react';

interface LoginPageProps {
  onOpenSupabaseConfig: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onOpenSupabaseConfig }) => {
  const { login, loginWithCredentials } = useAuth();
  const [identifierInput, setIdentifierInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const logoutNotice = sessionStorage.getItem('emeeting_logout_notice');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งาน (Username) หรืออีเมลราชการ');
      return;
    }
    const success = await loginWithCredentials(identifierInput, passwordInput);
    if (!success) {
      setErrorMessage('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง (สำหรับแอดมินส่วนกลางใช้ user: admin / password: 1785)');
    } else {
      sessionStorage.removeItem('emeeting_logout_notice');
    }
  };

  const handleFillAdmin = () => {
    setIdentifierInput('admin');
    setPasswordInput('1785');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-radial from-blue-900/30 via-slate-900/80 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-4 shadow-xl">
            <Building2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Sistem Pengurusan & Minit Mesyuarat Rasmi
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
            Sistem Maklumat Kawalan Kuorum, Minit Mesyuarat, Laporan Eksekutif dan Papan Pemuka Peringkat Mukim, Daerah dan Negeri
          </p>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Keselamatan Tinggi (Log Keluar Automatik 30 Minit)
            </span>
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Sedia Hubung Supabase / GitHub Pages
            </span>
          </div>
        </div>

        {logoutNotice && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pemberitahuan Keselamatan Sesi:</p>
              <p>{logoutNotice}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct credentials form */}
          <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-400" />
              Log Masuk Akaun Pengguna
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              กรอกข้อมูลเพื่อลงชื่อเข้าใช้งานระบบตามระดับสิทธิ์ที่ได้รับมอบหมาย
            </p>

            {/* Quick Helper for Central Admin login */}
            <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/40 rounded-xl p-3 mb-5 text-xs shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-blue-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    บัญชีแอดมินส่วนกลาง (Central Admin)
                  </div>
                  <div className="font-mono text-[11px] text-slate-300 mt-1">
                    user: <b className="text-white font-bold bg-slate-800 px-1 rounded">admin</b> &nbsp; pass: <b className="text-white font-bold bg-slate-800 px-1 rounded">1785</b>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  กรอกอัตโนมัติ
                </button>
              </div>
            </div>

            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  ชื่อผู้ใช้งาน หรือ อีเมล (Username / Email)
                </label>
                <input
                  type="text"
                  value={identifierInput}
                  onChange={(e) => setIdentifierInput(e.target.value)}
                  placeholder="admin หรือ ชื่อผู้ใช้ปลัด เช่น nongsaharai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="1785 หรือ รหัสผ่านของคุณ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              {errorMessage && (
                <div className="text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                เข้าสู่ระบบ (Log Masuk)
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={onOpenSupabaseConfig}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" />
                Tetapan Supabase
              </button>
              <span className="text-slate-500">v2.4 LTS</span>
            </div>
          </div>

          {/* Quick Role-based login selector */}
          <div className="lg:col-span-7 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Pilih Akses Segera Mengikut Peranan (Hierarki Kuasa)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uji kawalan had akses mengikut struktur pentadbiran
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {DEMO_USERS.map((user) => {
                let badgeClass = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                let roleLabel = 'Peringkat Mukim (Hanya Mukim Sendiri)';
                let roleDescription = `Log masuk terus memaparkan senarai rekod Mukim ${user.tambonName} sahaja, tiada akses tetapan lain.`;

                if (user.role === 'district_admin') {
                  badgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  roleLabel = 'Peringkat Daerah (Lihat & Urus Semua Mukim)';
                  roleDescription = `Boleh melihat dan mengurus semua mukim dalam Daerah ${user.districtName}.`;
                } else if (user.role === 'central_admin' || user.role === 'province_admin') {
                  badgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                  roleLabel = 'Peringkat Negeri / Pusat (Gambaran Penuh Masa Nyata)';
                  roleDescription = 'Akses pemantauan menyeluruh secara telus untuk semua daerah dan mukim.';
                }

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      sessionStorage.removeItem('emeeting_logout_notice');
                      login(user);
                    }}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/70 hover:border-blue-500/50 transition-all cursor-pointer group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-sm text-slate-200 shrink-0 overflow-hidden">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors truncate">
                            {user.name}
                          </span>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full border ${badgeClass} font-medium`}>
                            {roleLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5 truncate">
                          {user.roleTitle}
                        </p>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {user.department} ({roleDescription})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600/30 group-hover:bg-blue-600 text-blue-300 group-hover:text-white text-xs font-medium transition-all"
                    >
                      Masuk
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-slate-900/40 rounded-xl border border-slate-700/50 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">
                Syarat Kawalan Akses Mengikut Permintaan:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong className="text-slate-200">Pegawai Tadbir Mukim:</strong> Merekod & mengurus mukim masing-masing sahaja</li>
                <li><strong className="text-slate-200">Pentadbir Daerah:</strong> Memantau & menyunting semua mukim di bawah daerahnya</li>
                <li><strong className="text-slate-200">Pentadbir Negeri/Pusat:</strong> Melihat keseluruhan secara langsung melalui Papan Pemuka</li>
                <li><strong className="text-slate-200">Eksport Laporan:</strong> Semua tahap boleh menjana laporan Excel atau PDF</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
