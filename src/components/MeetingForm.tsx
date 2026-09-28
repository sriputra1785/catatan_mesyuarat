import React, { useState, useEffect } from 'react';
import { Meeting, MeetingAttendee, MeetingAgenda, OtherParticipant, AttendanceStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  PROVINCES,
  DISTRICTS,
  TAMBONS,
  MEETING_CATEGORIES,
} from '../data/thaiAdministrativeData';
import { getStoredCommittees } from '../services/storage';
import {
  Save,
  Plus,
  Trash2,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock4,
  UserCheck,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface MeetingFormProps {
  initialMeeting?: Meeting | null;
  onSave: (meeting: Meeting) => void;
  onCancel: () => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({
  initialMeeting,
  onSave,
  onCancel,
}) => {
  const { currentUser } = useAuth();

  // Location Hierarchy states (conditioned by user role)
  const [provinceId, setProvinceId] = useState(
    initialMeeting?.provinceId || currentUser?.provinceId || PROVINCES[0].id
  );
  const [districtId, setDistrictId] = useState(
    initialMeeting?.districtId || currentUser?.districtId || DISTRICTS[0].id
  );
  const [tambonId, setTambonId] = useState(
    initialMeeting?.tambonId || currentUser?.tambonId || TAMBONS[0].id
  );

  // Form Fields
  const [meetingNumber, setMeetingNumber] = useState(
    initialMeeting?.meetingNumber || `1/${new Date().getFullYear()}`
  );
  const [title, setTitle] = useState(
    initialMeeting?.title || ''
  );
  const [categoryId, setCategoryId] = useState(
    initialMeeting?.categoryId || MEETING_CATEGORIES[0].id
  );
  const [meetingDate, setMeetingDate] = useState(
    initialMeeting?.meetingDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(initialMeeting?.startTime || '09:30');
  const [endTime, setEndTime] = useState(initialMeeting?.endTime || '12:00');
  const [venue, setVenue] = useState(
    initialMeeting?.venue || 'Dewan Mesyuarat Utama Pejabat Mukim'
  );
  const [organizer, setOrganizer] = useState(
    initialMeeting?.organizer || ''
  );

  // Quorum & Attendees
  const [attendees, setAttendees] = useState<MeetingAttendee[]>(() => {
    if (initialMeeting?.attendees?.length) {
      return initialMeeting.attendees;
    }
    const committee = getStoredCommittees();
    return committee.map((m) => ({
      memberId: m.id,
      fullName: `${m.title} ${m.firstName} ${m.lastName}`.trim(),
      position: m.position,
      roleInMeeting: m.roleInMeeting,
      organization: m.organization,
      status: 'present' as AttendanceStatus,
      proxyName: '',
      proxyPosition: '',
      leaveReason: '',
      note: '',
      signedTime: '09:15'
    }));
  });

  const [otherParticipants, setOtherParticipants] = useState<OtherParticipant[]>(
    initialMeeting?.otherParticipants || []
  );

  // Agendas in Malay
  const [agendas, setAgendas] = useState<MeetingAgenda[]>(() => {
    if (initialMeeting?.agendas?.length) {
      return initialMeeting.agendas;
    }
    return [
      {
        id: 'ag-1',
        agendaNumber: '1',
        title: 'Perutusan Pengerusi Mesyuarat',
        details: 'Pengerusi merakamkan ucapan alu-aluan dan membentangkan perkara penting...',
        resolution: 'Majlis mesyuarat mengambil maklum.',
        resolutionType: 'acknowledged'
      },
      {
        id: 'ag-2',
        agendaNumber: '2',
        title: 'Pengesahan Minit Mesyuarat Yang Lalu',
        details: 'Setiausaha membentangkan minit mesyuarat sesi lalu untuk pertimbangan dan pengesahan...',
        resolution: 'Minit mesyuarat disahkan sebulat suara tanpa sebarang pindaan.',
        resolutionType: 'approved'
      },
      {
        id: 'ag-3',
        agendaNumber: '3',
        title: 'Perkara Untuk Pertimbangan & Kelulusan',
        details: 'Keterangan terperinci mengenai perkara yang dikemukakan untuk tindakan dan kelulusan...',
        resolution: 'Majlis mesyuarat bersetuju meluluskan permohonan secara sebulat suara.',
        resolutionType: 'approved'
      },
      {
        id: 'ag-4',
        agendaNumber: '4',
        title: 'Hal-Hal Lain',
        details: 'Sebarang perkara berbangkit atau cadangan baharu daripada ahli mesyuarat...',
        resolution: 'Majlis mesyuarat mengambil maklum untuk tindakan penyelarasan.',
        resolutionType: 'acknowledged'
      }
    ];
  });

  // Officers
  const [chairmanName, setChairmanName] = useState(
    initialMeeting?.chairmanName || 'Tuan Pradit Sawãngnet'
  );
  const [chairmanPosition, setChairmanPosition] = useState(
    initialMeeting?.chairmanPosition || 'Pengerusi Majlis Mukim'
  );
  const [secretaryName, setSecretaryName] = useState(
    initialMeeting?.secretaryName || currentUser?.name || 'Encik Somkiat Abdullah'
  );
  const [secretaryPosition, setSecretaryPosition] = useState(
    initialMeeting?.secretaryPosition || currentUser?.roleTitle || 'Pegawai Tadbir Mukim (Setiausaha Mesyuarat)'
  );
  const [checkerName, setCheckerName] = useState(
    initialMeeting?.checkerName || 'Encik Wichai Thonglor'
  );
  const [checkerPosition, setCheckerPosition] = useState(
    initialMeeting?.checkerPosition || 'Naib Pengerusi Majlis Mukim'
  );

  // Auto-set organizer based on tambon
  useEffect(() => {
    const t = TAMBONS.find((item) => item.id === tambonId);
    if (t && !initialMeeting) {
      setOrganizer(t.adminOfficeName);
      if (!title) {
        setTitle(`Mesyuarat Berkala ${t.adminOfficeName}`);
      }
    }
  }, [tambonId, initialMeeting]);

  const isTambonLocked = currentUser?.role === 'tambon_admin';
  const isDistrictLocked = currentUser?.role === 'tambon_admin' || currentUser?.role === 'district_admin';

  // Calculate quorum numbers
  const totalEligible = attendees.length;
  const requiredQuorum = Math.floor(totalEligible / 2) + 1;
  const presentCount = attendees.filter(
    (a) => a.status === 'present' || a.status === 'proxy'
  ).length;
  const isQuorumMet = presentCount >= requiredQuorum;

  // Change attendee status
  const handleStatusChange = (index: number, newStatus: AttendanceStatus) => {
    const updated = [...attendees];
    updated[index] = {
      ...updated[index],
      status: newStatus,
      signedTime: (newStatus === 'present' || newStatus === 'proxy') ? (updated[index].signedTime || startTime) : undefined
    };
    setAttendees(updated);
  };

  const handleUpdateAttendee = (index: number, field: keyof MeetingAttendee, value: string) => {
    const updated = [...attendees];
    updated[index] = { ...updated[index], [field]: value };
    setAttendees(updated);
  };

  const handleAddCustomAttendee = () => {
    const newAttendee: MeetingAttendee = {
      memberId: `custom-mem-${Date.now()}`,
      fullName: 'Nama Ahli Baharu',
      position: 'Ahli Jawatankuasa',
      roleInMeeting: 'member',
      organization: organizer || 'Majlis Komuniti',
      status: 'present',
      signedTime: startTime
    };
    setAttendees([...attendees, newAttendee]);
  };

  const handleRemoveAttendee = (index: number) => {
    const updated = attendees.filter((_, idx) => idx !== index);
    setAttendees(updated);
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated = attendees.map((a) => ({
      ...a,
      status,
      signedTime: (status === 'present' || status === 'proxy') ? startTime : undefined
    }));
    setAttendees(updated);
  };

  // Agenda handlers
  const handleAddAgenda = () => {
    const nextNum = (agendas.length + 1).toString();
    const newAg: MeetingAgenda = {
      id: `ag-${Date.now()}`,
      agendaNumber: nextNum,
      title: `Agenda ${nextNum}: (Nyatakan Tajuk Perkara)`,
      details: '',
      resolution: 'Majlis mesyuarat mengambil maklum.',
      resolutionType: 'acknowledged'
    };
    setAgendas([...agendas, newAg]);
  };

  const handleUpdateAgenda = (index: number, field: keyof MeetingAgenda, value: any) => {
    const updated = [...agendas];
    updated[index] = { ...updated[index], [field]: value };
    setAgendas(updated);
  };

  const handleRemoveAgenda = (index: number) => {
    const updated = agendas.filter((_, idx) => idx !== index);
    setAgendas(updated);
  };

  // Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedProv = PROVINCES.find((p) => p.id === provinceId) || PROVINCES[0];
    const selectedDist = DISTRICTS.find((d) => d.id === districtId) || DISTRICTS[0];
    const selectedTam = TAMBONS.find((t) => t.id === tambonId) || TAMBONS[0];
    const selectedCat = MEETING_CATEGORIES.find((c) => c.id === categoryId) || MEETING_CATEGORIES[0];

    const meetingToSave: Meeting = {
      id: initialMeeting?.id || `meet-${Date.now()}`,
      meetingNumber: meetingNumber.trim(),
      title: title.trim(),
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      meetingDate,
      startTime,
      endTime,
      venue: venue.trim(),
      provinceId: selectedProv.id,
      provinceName: selectedProv.name,
      districtId: selectedDist.id,
      districtName: selectedDist.name,
      tambonId: selectedTam.id,
      tambonName: selectedTam.name,
      organizer: organizer.trim() || selectedTam.adminOfficeName,
      totalEligible,
      requiredQuorum,
      isQuorumMet,
      attendees,
      otherParticipants,
      agendas,
      chairmanName: chairmanName.trim(),
      chairmanPosition: chairmanPosition.trim(),
      secretaryName: secretaryName.trim(),
      secretaryPosition: secretaryPosition.trim(),
      checkerName: checkerName?.trim(),
      checkerPosition: checkerPosition?.trim(),
      status: 'completed',
      createdAt: initialMeeting?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdById: currentUser?.id || 'unknown',
      createdByName: currentUser?.name || 'Pegawai'
    };

    onSave(meetingToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-16 font-sans">
      {/* Top action header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {initialMeeting ? 'Kemaskini Minit Mesyuarat' : 'Rekod Minit Mesyuarat Baharu (e-Mesyuarat)'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Nyatakan butiran mesyuarat, semak kehadiran ahli kuorum dan rekod ketetapan agenda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Minit Mesyuarat
          </button>
        </div>
      </div>

      {/* Jurisdiction notice */}
      {isTambonLocked && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 rounded-xl flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Bidang Kuasa Mukim:</strong> Anda sedang merekod data di bawah tanggungjawab <strong>Mukim {currentUser?.tambonName}, Daerah {currentUser?.districtName}</strong> (Akses terhad untuk mukim sendiri).
          </span>
        </div>
      )}

      {/* Section 1: Basic Meeting Information & Category */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          1. Maklumat Am & Kategori Mesyuarat
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Bil. / No. Mesyuarat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={meetingNumber}
              onChange={(e) => setMeetingNumber(e.target.value)}
              placeholder="1/2026"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tajuk Mesyuarat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Mesyuarat Majlis Tindakan Pembangunan Mukim Sesi 1/2026"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kategori / Jenis Mesyuarat <span className="text-rose-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {MEETING_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Agensi / Penganjur <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={organizer}
              onChange={(e) => setOrganizer(e.target.value)}
              placeholder="Contoh: Pejabat Pentadbiran Mukim"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tarikh Mesyuarat <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={meetingDate}
              onChange={(e) => setMeetingDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Masa Mula <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Masa Tamat <span className="text-rose-500">*</span>
            </label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Tempat Mesyuarat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder="Contoh: Bilik Gerakan Pejabat Daerah"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Geographic location selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Negeri
            </label>
            <select
              disabled={isDistrictLocked || isTambonLocked}
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 disabled:opacity-75 focus:outline-none"
            >
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Daerah
            </label>
            <select
              disabled={isDistrictLocked || isTambonLocked}
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 disabled:opacity-75 focus:outline-none"
            >
              {DISTRICTS.filter((d) => d.provinceId === provinceId).map((d) => (
                <option key={d.id} value={d.id}>
                  Daerah {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Mukim (Kawasan Tanggungjawab)
            </label>
            <select
              disabled={isTambonLocked}
              value={tambonId}
              onChange={(e) => setTambonId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 disabled:opacity-75 focus:outline-none"
            >
              {TAMBONS.filter((t) => t.districtId === districtId).map((t) => (
                <option key={t.id} value={t.id}>
                  Mukim {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Quorum & Attendees Checklist */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              2. Semakan Kehadiran Kuorum Mesyuarat (Quorum Attendance)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tandakan status kehadiran setiap ahli kuorum (Hadir / Bersebab / Tidak Hadir / Wakil Hadir)
            </p>
          </div>

          {/* Quorum status indicator badge */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">
              Jumlah Kuorum: <strong>{totalEligible}</strong> orang | Had Minima: <strong>{requiredQuorum}</strong> orang
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                isQuorumMet
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
              }`}
            >
              {isQuorumMet ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Cukup Kuorum ({presentCount}/{totalEligible})
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Tidak Cukup Kuorum ({presentCount}/{totalEligible})
                </>
              )}
            </span>
          </div>
        </div>

        {/* Quick Batch Select Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-600 mr-1">Tanda Status Semua:</span>
            <button
              type="button"
              onClick={() => handleMarkAll('present')}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium cursor-pointer"
            >
              Semua Hadir
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('leave')}
              className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-medium cursor-pointer"
            >
              Semua Bersebab
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll('absent')}
              className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-medium cursor-pointer"
            >
              Semua Tidak Hadir
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddCustomAttendee}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg font-medium cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Ahli Kuorum
          </button>
        </div>

        {/* Attendee Checklist Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">Bil.</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Nama Penuh</th>
                  <th className="py-2.5 px-3 min-w-[160px]">Jawatan</th>
                  <th className="py-2.5 px-3 min-w-[240px]">Status Kehadiran</th>
                  <th className="py-2.5 px-3 min-w-[150px]">Masa / Butiran Wakil / Sebab Cuti</th>
                  <th className="py-2.5 px-2 w-10 text-center">Batal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendees.map((att, idx) => (
                  <tr
                    key={att.memberId || idx}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      att.status === 'absent' ? 'bg-rose-50/30' : att.status === 'leave' ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-center text-slate-500 font-medium">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      <input
                        type="text"
                        value={att.fullName}
                        onChange={(e) => handleUpdateAttendee(idx, 'fullName', e.target.value)}
                        className="w-full px-2 py-1 rounded-md border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white bg-transparent"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-slate-600">
                      <input
                        type="text"
                        value={att.position}
                        onChange={(e) => handleUpdateAttendee(idx, 'position', e.target.value)}
                        className="w-full px-2 py-1 rounded-md border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white bg-transparent text-xs"
                      />
                    </td>

                    {/* Radio toggles */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <label
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                            att.status === 'present'
                              ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={att.status === 'present'}
                            onChange={() => handleStatusChange(idx, 'present')}
                            className="sr-only"
                          />
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Hadir
                        </label>

                        <label
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                            att.status === 'proxy'
                              ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={att.status === 'proxy'}
                            onChange={() => handleStatusChange(idx, 'proxy')}
                            className="sr-only"
                          />
                          <UserCheck className="w-3.5 h-3.5" />
                          Wakil
                        </label>

                        <label
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                            att.status === 'leave'
                              ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={att.status === 'leave'}
                            onChange={() => handleStatusChange(idx, 'leave')}
                            className="sr-only"
                          />
                          <Clock4 className="w-3.5 h-3.5" />
                          Cuti
                        </label>

                        <label
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs cursor-pointer transition-colors ${
                            att.status === 'absent'
                              ? 'bg-rose-600 text-white border-rose-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={att.status === 'absent'}
                            onChange={() => handleStatusChange(idx, 'absent')}
                            className="sr-only"
                          />
                          <XCircle className="w-3.5 h-3.5" />
                          Tidak Hadir
                        </label>
                      </div>
                    </td>

                    {/* Additional info */}
                    <td className="py-2.5 px-3">
                      {att.status === 'present' && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <input
                            type="time"
                            value={att.signedTime || ''}
                            onChange={(e) => handleUpdateAttendee(idx, 'signedTime', e.target.value)}
                            className="px-1.5 py-0.5 text-xs rounded border border-slate-200"
                          />
                        </div>
                      )}
                      {att.status === 'proxy' && (
                        <input
                          type="text"
                          placeholder="Nama Wakil + Jawatan"
                          value={att.proxyName || ''}
                          onChange={(e) => handleUpdateAttendee(idx, 'proxyName', e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border border-blue-300 bg-blue-50/40 text-blue-900 placeholder-blue-400"
                        />
                      )}
                      {att.status === 'leave' && (
                        <input
                          type="text"
                          placeholder="Sebab cuti/pelepasan rasmi"
                          value={att.leaveReason || ''}
                          onChange={(e) => handleUpdateAttendee(idx, 'leaveReason', e.target.value)}
                          className="w-full px-2 py-1 text-xs rounded border border-amber-300 bg-amber-50/40 text-amber-900 placeholder-amber-400"
                        />
                      )}
                      {att.status === 'absent' && (
                        <span className="text-[11px] text-rose-500 italic">
                          Tidak hadir tanpa makluman
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveAttendee(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                        title="Padam Ahli"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 3: Agendas & Resolutions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              3. Agenda Mesyuarat & Ketetapan / Keputusan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekod tajuk perkara, ringkasan perbincangan dan keputusan mesyuarat secara teratur
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAgenda}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Agenda
          </button>
        </div>

        <div className="space-y-4">
          {agendas.map((agenda, index) => (
            <div
              key={agenda.id || index}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-xs">
                    Agenda {agenda.agendaNumber}
                  </span>
                  <input
                    type="text"
                    required
                    value={agenda.title}
                    onChange={(e) => handleUpdateAgenda(index, 'title', e.target.value)}
                    placeholder="Tajuk Agenda Mesyuarat..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveAgenda(index)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Padam agenda ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Keterangan & Perbincangan Ahli Mesyuarat
                </label>
                <textarea
                  rows={2}
                  value={agenda.details}
                  onChange={(e) => handleUpdateAgenda(index, 'details', e.target.value)}
                  placeholder="Keterangan pembentangan, soalan, dan ulasan daripada ahli mesyuarat..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Ketetapan / Keputusan Mesyuarat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={agenda.resolution}
                    onChange={(e) => handleUpdateAgenda(index, 'resolution', e.target.value)}
                    placeholder="Contoh: Majlis mesyuarat meluluskan cadangan / Majlis mengambil maklum"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Jenis Keputusan
                  </label>
                  <select
                    value={agenda.resolutionType}
                    onChange={(e) => handleUpdateAgenda(index, 'resolutionType', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
                  >
                    <option value="approved">Diluluskan / Bersetuju</option>
                    <option value="acknowledged">Diambil Maklum</option>
                    <option value="rejected">Ditolak / Tidak Diluluskan</option>
                    <option value="postponed">Ditangguhkan</option>
                    <option value="pending">Menunggu Maklumat Lanjut</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Officers Signatures */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
          <UserCheck className="w-4 h-4 text-blue-600" />
          4. Pegawai Bertanggungjawab & Pengesahan Tandatangan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-blue-800 uppercase">Pengerusi Mesyuarat</h4>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Nama Penuh</label>
              <input
                type="text"
                required
                value={chairmanName}
                onChange={(e) => setChairmanName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Jawatan</label>
              <input
                type="text"
                required
                value={chairmanPosition}
                onChange={(e) => setChairmanPosition(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-blue-800 uppercase">Pencatat / Setiausaha Mesyuarat</h4>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Nama Penuh</label>
              <input
                type="text"
                required
                value={secretaryName}
                onChange={(e) => setSecretaryName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Jawatan</label>
              <input
                type="text"
                required
                value={secretaryPosition}
                onChange={(e) => setSecretaryPosition(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-blue-800 uppercase">Penyemak Minit Mesyuarat</h4>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Nama Penuh</label>
              <input
                type="text"
                value={checkerName}
                onChange={(e) => setCheckerName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-600 mb-0.5">Jawatan</label>
              <input
                type="text"
                value={checkerPosition}
                onChange={(e) => setCheckerPosition(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Simpan Minit Mesyuarat
        </button>
      </div>
    </form>
  );
};
