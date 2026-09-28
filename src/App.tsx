import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Meeting } from './types';
import {
  getStoredMeetings,
  saveMeeting,
  deleteMeeting,
  getMeetingsForUser,
  canUserEditMeeting
} from './services/storage';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { MeetingList } from './components/MeetingList';
import { MeetingForm } from './components/MeetingForm';
import { OfficialPdfPreview } from './components/OfficialPdfPreview';
import { CommitteeManager } from './components/CommitteeManager';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { InactivityModal } from './components/InactivityModal';
import { DEMO_USERS } from './data/thaiAdministrativeData';
import { showMeetingSavedSuccess, showInfoToast } from './utils/alerts';
import { Shield, Sparkles, Building2, MapPin } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, isAuthenticated, switchUser } = useAuth();

  // Navigation and Modal states: Tambon Admin defaults strictly to 'meetings'
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'meetings' | 'committees' | 'supabase'>(() => {
    return currentUser?.role === 'tambon_admin' ? 'meetings' : 'dashboard';
  });
  const [allMeetings, setAllMeetings] = useState<Meeting[]>(() => getStoredMeetings());
  const [activeMeetingForPdf, setActiveMeetingForPdf] = useState<Meeting | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Sync state whenever storage changes or on mount
  const refreshMeetings = () => {
    setAllMeetings(getStoredMeetings());
  };

  useEffect(() => {
    refreshMeetings();
  }, []);

  // When switching user or logging in, enforce Tambon Admin to 'meetings' view only
  useEffect(() => {
    if (currentUser?.role === 'tambon_admin') {
      setCurrentTab('meetings');
      setIsSupabaseModalOpen(false);
    }
  }, [currentUser]);

  // Filter meetings strictly for the current user's role and jurisdiction
  // For Tambon Admin: strictly limited to their own tambon!
  const userVisibleMeetings = currentUser
    ? getMeetingsForUser(currentUser, allMeetings)
    : [];

  const handleSaveMeeting = async (meeting: Meeting) => {
    await saveMeeting(meeting);
    refreshMeetings();
    setIsCreatingMeeting(false);
    setEditingMeeting(null);

    // Modern SweetAlert2 Prompt: View PDF or return to list
    const viewPdf = await showMeetingSavedSuccess(meeting.meetingNumber);
    if (viewPdf) {
      setActiveMeetingForPdf(meeting);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    await deleteMeeting(meetingId);
    refreshMeetings();
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setIsCreatingMeeting(false);
  };

  const handleStartNewMeeting = () => {
    setEditingMeeting(null);
    setIsCreatingMeeting(true);
  };

  const handleSwitchUserWithNotification = (userId: string) => {
    switchUser(userId);
    const target = DEMO_USERS.find(u => u.id === userId);
    if (target) {
      if (target.role === 'tambon_admin') {
        showInfoToast(`Akses Pegawai Mukim: Mukim ${target.tambonName}`, 'Memaparkan data mukim sendiri sahaja mengikut bidang kuasa');
      } else if (target.role === 'district_admin') {
        showInfoToast(`Akses Pegawai Daerah: Daerah ${target.districtName}`, 'Boleh melihat dan mengurus semua mukim dalam daerah');
      } else {
        showInfoToast('Akses Pentadbir Pusat / Negeri', 'Capaian data penuh secara masa nyata bagi semua kawasan');
      }
    }
  };

  if (!isAuthenticated || !currentUser) {
    return (
      <>
        <LoginPage onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)} />
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  const isTambonUser = currentUser.role === 'tambon_admin';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Global Inactivity Modal (30 min auto-logout warning) */}
      <InactivityModal />

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setIsCreatingMeeting(false);
          setEditingMeeting(null);
          if (tab === 'supabase') {
            if (!isTambonUser) {
              setIsSupabaseModalOpen(true);
            }
          } else {
            setCurrentTab(tab);
          }
        }}
        onNewMeeting={handleStartNewMeeting}
        onOpenSupabaseConfig={() => {
          if (!isTambonUser) setIsSupabaseModalOpen(true);
        }}
      />

      {/* Quick Role-Switch Pill Bar for instant testing */}
      <div className="bg-white border-b border-slate-200 py-1.5 px-4 shadow-2xs no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 shrink-0 font-medium">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Uji Tukar Peranan (Role Switcher):</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {DEMO_USERS.map((u) => {
              const isCurrent = u.id === currentUser.id;
              let roleShort = 'Pegawai Mukim (Nong Saharai)';
              if (u.id === 'user-tambon-2') roleShort = 'Pegawai Mukim (Khanong Phra)';
              if (u.role === 'district_admin') roleShort = 'Pegawai Daerah (Pak Chong)';
              if (u.role === 'central_admin') roleShort = 'Pentadbir Negeri / Pusat';

              return (
                <button
                  key={u.id}
                  onClick={() => handleSwitchUserWithNotification(u.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-white' : 'bg-slate-400'}`} />
                  {roleShort}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {isCreatingMeeting || editingMeeting ? (
          <MeetingForm
            initialMeeting={editingMeeting}
            onSave={handleSaveMeeting}
            onCancel={() => {
              setIsCreatingMeeting(false);
              setEditingMeeting(null);
            }}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && !isTambonUser && (
              <Dashboard
                meetings={userVisibleMeetings}
                onViewMeeting={(m) => setActiveMeetingForPdf(m)}
                onNewMeeting={handleStartNewMeeting}
              />
            )}

            {currentTab === 'meetings' && (
              <MeetingList
                meetings={userVisibleMeetings}
                onViewMeeting={(m) => setActiveMeetingForPdf(m)}
                onEditMeeting={handleEditMeeting}
                onDeleteMeeting={handleDeleteMeeting}
                onNewMeeting={handleStartNewMeeting}
              />
            )}

            {currentTab === 'committees' && <CommitteeManager />}
          </>
        )}
      </main>

      {/* Official PDF Preview & Print Modal */}
      {activeMeetingForPdf && (
        <OfficialPdfPreview
          meeting={activeMeetingForPdf}
          onClose={() => setActiveMeetingForPdf(null)}
        />
      )}

      {/* Supabase & GitHub Pages Configuration Modal (Available only to District and Central Admins) */}
      {!isTambonUser && (
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Sistem Pengurusan & Minit Mesyuarat Rasmi (e-Mesyuarat Zone) | Mengikut Piawaian Tadbir Urus Awam
          </p>
          <div className="flex items-center gap-4">
            {!isTambonUser && (
              <>
                <button
                  onClick={() => setIsSupabaseModalOpen(true)}
                  className="hover:text-blue-600 transition-colors cursor-pointer"
                >
                  Tetapan Pangkalan Data Supabase & GitHub Pages
                </button>
                <span>•</span>
              </>
            )}
            <span>Log Keluar Automatik 30 Minit (Aktif)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
