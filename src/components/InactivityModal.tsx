import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Clock, RefreshCw, LogOut } from 'lucide-react';

export const InactivityModal: React.FC = () => {
  const { showInactivityWarning, secondsRemaining, extendSession, logout } = useAuth();

  if (!showInactivityWarning) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Peringatan Had Masa Sesi (Keselamatan)
            </h3>
            <p className="text-xs text-slate-500">
              Dasar Keselamatan Sistem Maklumat Awam
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-900 mb-2 leading-relaxed">
            Tiada sebarang aktiviti dikesan selama hampir 30 minit. Bagi mengelakkan capaian tanpa kebenaran, sistem akan <span className="font-semibold text-rose-600">log keluar secara automatik</span> dalam masa:
          </p>
          <div className="flex items-center justify-center gap-2 py-2">
            <Clock className="w-6 h-6 text-rose-600 animate-spin" />
            <span className="text-3xl font-extrabold tracking-wider text-rose-600 font-mono">
              {timeFormatted}
            </span>
            <span className="text-sm font-medium text-rose-700">minit</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={extendSession}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Sambung Sesi (30 Minit)
          </button>
          <button
            onClick={() => logout('Pengguna memilih untuk log keluar.')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Log Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
