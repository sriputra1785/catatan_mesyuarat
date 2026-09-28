import React, { useState, useMemo } from 'react';
import { Meeting } from '../types';
import { useAuth } from '../context/AuthContext';
import { PROVINCES, DISTRICTS, TAMBONS, MEETING_CATEGORIES } from '../data/thaiAdministrativeData';
import { exportMeetingsToExcel } from '../utils/exportUtils';
import { MALAY_MONTHS } from '../utils/thaiDateUtils';
import { showSuccessToast } from '../utils/alerts';
import {
  Users,
  CheckCircle,
  FileSpreadsheet,
  Building,
  TrendingUp,
  Filter,
  Eye,
  CalendarCheck,
  Award
} from 'lucide-react';

interface DashboardProps {
  meetings: Meeting[];
  onViewMeeting: (meeting: Meeting) => void;
  onNewMeeting: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  meetings,
  onViewMeeting,
  onNewMeeting,
}) => {
  const { currentUser } = useAuth();

  // Filters state
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [filterDistrictId, setFilterDistrictId] = useState<string>(
    currentUser?.districtId || 'all'
  );
  const [filterTambonId, setFilterTambonId] = useState<string>(
    currentUser?.tambonId || 'all'
  );
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');

  const isTambonLocked = currentUser?.role === 'tambon_admin';
  const isDistrictLocked = currentUser?.role === 'tambon_admin' || currentUser?.role === 'district_admin';

  // Filtered Meetings calculation
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // Date filter
      if (selectedYear !== 'all') {
        if (!m.meetingDate.startsWith(selectedYear)) return false;
      }
      if (selectedMonth !== 'all') {
        const parts = m.meetingDate.split('-');
        if (parts[1] !== selectedMonth) return false;
      }

      // District filter
      if (filterDistrictId !== 'all' && m.districtId !== filterDistrictId) {
        return false;
      }

      // Tambon filter
      if (filterTambonId !== 'all' && m.tambonId !== filterTambonId) {
        return false;
      }

      // Category filter
      if (filterCategoryId !== 'all' && m.categoryId !== filterCategoryId) {
        return false;
      }

      return true;
    });
  }, [meetings, selectedYear, selectedMonth, filterDistrictId, filterTambonId, filterCategoryId]);

  // Overall statistics
  const stats = useMemo(() => {
    const totalMeetings = filteredMeetings.length;
    let totalEligibleAll = 0;
    let totalPresentAll = 0;
    let quorumMetCount = 0;
    let leaveCount = 0;
    let absentCount = 0;
    let proxyCount = 0;

    filteredMeetings.forEach((m) => {
      totalEligibleAll += m.totalEligible;
      if (m.isQuorumMet) quorumMetCount += 1;

      m.attendees.forEach((a) => {
        if (a.status === 'present') totalPresentAll += 1;
        if (a.status === 'proxy') proxyCount += 1;
        if (a.status === 'leave') leaveCount += 1;
        if (a.status === 'absent') absentCount += 1;
      });
    });

    const averageAttendanceRate =
      totalEligibleAll > 0
        ? Math.round(((totalPresentAll + proxyCount) / totalEligibleAll) * 100)
        : 0;

    const quorumPercentage =
      totalMeetings > 0 ? Math.round((quorumMetCount / totalMeetings) * 100) : 0;

    // Tambon breakdown
    const tambonMap: { [id: string]: { name: string; count: number; present: number; eligible: number } } = {};
    filteredMeetings.forEach((m) => {
      if (!tambonMap[m.tambonId]) {
        tambonMap[m.tambonId] = { name: m.tambonName, count: 0, present: 0, eligible: 0 };
      }
      tambonMap[m.tambonId].count += 1;
      tambonMap[m.tambonId].eligible += m.totalEligible;
      m.attendees.forEach((a) => {
        if (a.status === 'present' || a.status === 'proxy') {
          tambonMap[m.tambonId].present += 1;
        }
      });
    });

    // Category breakdown
    const categoryCounts: { [name: string]: number } = {};
    filteredMeetings.forEach((m) => {
      categoryCounts[m.categoryName] = (categoryCounts[m.categoryName] || 0) + 1;
    });

    return {
      totalMeetings,
      totalEligibleAll,
      totalPresentAll: totalPresentAll + proxyCount,
      leaveCount,
      absentCount,
      averageAttendanceRate,
      quorumMetCount,
      quorumPercentage,
      tambonStats: Object.values(tambonMap),
      categoryCounts
    };
  }, [filteredMeetings]);

  const handleExportSummaryExcel = () => {
    exportMeetingsToExcel(
      filteredMeetings,
      `Statistik_Mesyuarat_${selectedYear}_${selectedMonth !== 'all' ? selectedMonth : 'Tahunan'}.xlsx`
    );
    showSuccessToast('Berjaya', 'Statistik mesyuarat telah dieksport ke fail Excel.');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner with Real-time Central Insight */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">
                Papan Pemuka Eksekutif Masa Nyata (Real-time)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
              Papan Pemuka Statistik Mesyuarat & Analisis Kuorum
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-normal">
              Analisis kekerapan mesyuarat, peratusan pematuhan kuorum mengikut peraturan,
              serta pemantauan prestasi secara telus di semua peringkat pentadbiran.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportSummaryExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Eksport Statistik Excel
            </button>
            <button
              onClick={onNewMeeting}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              + Rekod Mesyuarat
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-3">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Penapis Data Eksekutif (Filter Bar)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Year */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Tahun</option>
              <option value="2026">2026 (Semasa)</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Setahun (Semua Bulan)</option>
              {MALAY_MONTHS.map((name, idx) => {
                const val = (idx + 1).toString().padStart(2, '0');
                return (
                  <option key={val} value={val}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Daerah</label>
            <select
              disabled={isDistrictLocked}
              value={filterDistrictId}
              onChange={(e) => {
                setFilterDistrictId(e.target.value);
                setFilterTambonId('all');
              }}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {!isDistrictLocked && <option value="all">Semua Daerah</option>}
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  Daerah {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tambon */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Mukim</label>
            <select
              disabled={isTambonLocked}
              value={filterTambonId}
              onChange={(e) => setFilterTambonId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {!isTambonLocked && <option value="all">Semua Mukim</option>}
              {TAMBONS.filter(
                (t) => filterDistrictId === 'all' || t.districtId === filterDistrictId
              ).map((t) => (
                <option key={t.id} value={t.id}>
                  Mukim {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Kategori Mesyuarat</label>
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Semua Kategori</option>
              {MEETING_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Meetings */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Bilangan Sesi Mesyuarat</p>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalMeetings}
            </span>
            <span className="text-xs font-medium text-slate-500">Sesi</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Direkodkan lengkap mengikut format rasmi
          </p>
        </div>

        {/* Average Attendance Rate */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Purata Kehadiran Ahli</p>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.averageAttendanceRate}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({stats.totalPresentAll}/{stats.totalEligibleAll} orang)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, stats.averageAttendanceRate)}%` }}
            />
          </div>
        </div>

        {/* Quorum Compliance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Pematuhan Kuorum Sah</p>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.quorumPercentage}%
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({stats.quorumMetCount}/{stats.totalMeetings} sesi)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-purple-700">
            Melebihi separuh daripada jumlah ahli kuorum
          </p>
        </div>

        {/* Absentee & Leave stats */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">Statistik Cuti / Tidak Hadir</p>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <div>
              <span className="text-xl font-bold text-amber-700">{stats.leaveCount}</span>
              <span className="text-[11px] text-slate-500 ml-1">orang (cuti)</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-xl font-bold text-rose-600">{stats.absentCount}</span>
              <span className="text-[11px] text-slate-500 ml-1">orang (tidak hadir)</span>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Semakan surat pelepasan dan rekod ketidakhadiran
          </p>
        </div>
      </div>

      {/* Middle Section: Category Distribution & Tambon Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            Pecahan Mengikut Kategori Mesyuarat
          </h3>
          <p className="text-xs text-slate-500">
            Peratusan sesi mesyuarat mengikut portfolio tindakan
          </p>

          <div className="space-y-2.5 pt-2">
            {MEETING_CATEGORIES.map((cat) => {
              const count = stats.categoryCounts[cat.name] || 0;
              const percent = stats.totalMeetings > 0 ? Math.round((count / stats.totalMeetings) * 100) : 0;

              return (
                <div key={cat.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700 truncate max-w-[220px]">
                      {cat.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      {count} kali ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tambon Performance in District (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Statistik Mesyuarat & Kehadiran Mengikut Mukim
              </h3>
              <p className="text-xs text-slate-500">
                Perbandingan penglibatan dan keaktifan setiap mukim/daerah
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Mukim</th>
                  <th className="py-2.5 px-3 text-center">Bil. Mesyuarat</th>
                  <th className="py-2.5 px-3 text-center">Purata Kuorum</th>
                  <th className="py-2.5 px-3 text-right">Kadar Hadir (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.tambonStats.length > 0 ? (
                  stats.tambonStats.map((item, idx) => {
                    const rate = item.eligible > 0 ? Math.round((item.present / item.eligible) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          Mukim {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-medium">
                          {item.count} kali
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {item.eligible} orang
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              rate >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : rate >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Tiada rekod mesyuarat mengikut penapis yang dipilih
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Meetings Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              Rekod Mesyuarat Terkini Dalam Kawasan Tanggungjawab
            </h3>
            <p className="text-xs text-slate-500">
              Klik untuk melihat paparan dokumen minit mesyuarat dan cetak PDF
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">No. Mesyuarat</th>
                <th className="py-2.5 px-3 min-w-[200px]">Tajuk Mesyuarat</th>
                <th className="py-2.5 px-3">Mukim / Daerah</th>
                <th className="py-2.5 px-3">Tarikh / Masa</th>
                <th className="py-2.5 px-3 text-center">Kehadiran Kuorum</th>
                <th className="py-2.5 px-3 text-center">Status Kuorum</th>
                <th className="py-2.5 px-3 text-center">Laporan PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMeetings.slice(0, 5).map((m) => {
                const present = m.attendees.filter((a) => a.status === 'present' || a.status === 'proxy').length;
                return (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-blue-600">
                      {m.meetingNumber}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800 max-w-[240px] truncate">
                      {m.title}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      Mukim {m.tambonName} (Daerah {m.districtName})
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {m.meetingDate} ({m.startTime})
                    </td>
                    <td className="py-2.5 px-3 text-center font-medium">
                      {present} / {m.totalEligible} orang
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          m.isQuorumMet
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {m.isQuorumMet ? 'Cukup Kuorum' : 'Kurang'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => onViewMeeting(m)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Buka / PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
