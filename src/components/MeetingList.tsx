import React, { useState, useMemo } from 'react';
import { Meeting } from '../types';
import { useAuth } from '../context/AuthContext';
import { canUserEditMeeting } from '../services/storage';
import { formatThaiDate } from '../utils/thaiDateUtils';
import { exportMeetingsToExcel } from '../utils/exportUtils';
import { showDeleteConfirm, showSuccessToast } from '../utils/alerts';
import {
  FileText,
  Search,
  Plus,
  FileSpreadsheet,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  Lock,
  ShieldCheck
} from 'lucide-react';

interface MeetingListProps {
  meetings: Meeting[];
  onViewMeeting: (meeting: Meeting) => void;
  onEditMeeting: (meeting: Meeting) => void;
  onDeleteMeeting: (meetingId: string) => void;
  onNewMeeting: () => void;
}

export const MeetingList: React.FC<MeetingListProps> = ({
  meetings,
  onViewMeeting,
  onEditMeeting,
  onDeleteMeeting,
  onNewMeeting,
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'tambon' | 'district' | 'province'>('all');
  const [quorumFilter, setQuorumFilter] = useState<'all' | 'met' | 'not_met'>('all');

  const isTambonUser = currentUser?.role === 'tambon_admin';

  // Filter meetings by search query and criteria
  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      // Search text
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matches =
          m.title.toLowerCase().includes(query) ||
          m.meetingNumber.toLowerCase().includes(query) ||
          m.tambonName.toLowerCase().includes(query) ||
          m.districtName.toLowerCase().includes(query) ||
          m.categoryName.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Meeting Level
      if (levelFilter !== 'all') {
        const lvl = m.meetingLevel || 'tambon';
        if (lvl !== levelFilter) return false;
      }

      // Category
      if (categoryFilter !== 'all' && m.categoryId !== categoryFilter) {
        return false;
      }

      // Quorum
      if (quorumFilter === 'met' && !m.isQuorumMet) return false;
      if (quorumFilter === 'not_met' && m.isQuorumMet) return false;

      return true;
    });
  }, [meetings, searchTerm, levelFilter, categoryFilter, quorumFilter]);

  const handleExportAllToExcel = () => {
    const filename = isTambonUser
      ? `Laporan_Mesyuarat_Mukim_${currentUser.tambonName}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `Laporan_Mesyuarat_Rasmi_${new Date().toISOString().split('T')[0]}.xlsx`;
    exportMeetingsToExcel(filteredMeetings, filename);
    showSuccessToast('Berjaya', 'Laporan Excel telah dieksport dengan jayanya.');
  };

  const handleDelete = async (meeting: Meeting) => {
    const confirmed = await showDeleteConfirm(meeting.title);
    if (confirmed) {
      onDeleteMeeting(meeting.id);
      showSuccessToast('Berjaya Dipadam', 'Rekod minit mesyuarat telah dipadamkan.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Tambon Admin Specific Jurisdiction Banner */}
      {isTambonUser && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">
                Sistem Mesyuarat: Mukim {currentUser.tambonName} (Daerah {currentUser.districtName}, Negeri {currentUser.provinceName})
              </h3>
              <p className="text-xs text-emerald-100 font-light mt-0.5">
                Akses Pegawai Tadbir Mukim: Memaparkan dan merekodkan data di bawah tanggungjawab mukim anda sahaja secara telus dan tepat.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex px-3 py-1 bg-white/15 rounded-full text-xs font-medium border border-white/20">
            {filteredMeetings.length} Rekod
          </span>
        </div>
      )}

      {/* Top Banner and Quick Actions */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {isTambonUser
              ? `Senarai Rekod Mesyuarat Mukim ${currentUser.tambonName}`
              : 'Senarai Rekod Minit Mesyuarat Rasmi'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isTambonUser
              ? `Merekod, menyemak kehadiran kuorum dan menjana laporan minit PDF/Excel bagi Mukim ${currentUser.tambonName}`
              : 'Semakan kehadiran kuorum, merekod agenda mesyuarat dan menjana laporan rasmi kerajaan'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportAllToExcel}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium shadow-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Eksport Excel (.xlsx)</span>
          </button>

          <button
            onClick={onNewMeeting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Rekod Mesyuarat Baharu</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อการประชุม, เลขที่, ตำบล, อำเภอ หรือมติที่ประชุม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Meeting Level filter */}
          <div>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="all">ทุกระดับการประชุม</option>
              <option value="tambon">ระดับตำบล (ปลัดตำบล 1 คน 1 ตำบล)</option>
              <option value="district">ระดับอำเภอ (เลขาอำเภอ)</option>
              <option value="province">ระดับจังหวัด (เลขาจังหวัด)</option>
            </select>
          </div>

          {/* Quorum filter */}
          <div>
            <select
              value={quorumFilter}
              onChange={(e) => setQuorumFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">ทุกสถานะองค์ประชุม</option>
              <option value="met">ครบองค์ประชุมเท่านั้น</option>
              <option value="not_met">ไม่ครบองค์ประชุม</option>
            </select>
          </div>

          {/* Result Counter */}
          <div className="flex items-center justify-end text-xs text-slate-500">
            <span>
              พบ <strong>{filteredMeetings.length}</strong> จาก {meetings.length} รายการ
            </span>
          </div>
        </div>
      </div>

      {/* Meeting Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredMeetings.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-base font-bold text-slate-700">
              ยังไม่มีบันทึกการประชุมในระบบ (ระบบว่างพร้อมสำหรับการเริ่มบันทึกข้อมูลจริง)
            </h3>
            <p className="text-xs text-slate-500 max-w-lg mx-auto mt-2 leading-relaxed">
              {currentUser?.role === 'tambon_admin' && (
                <span>
                  เข้าสู่ระบบในฐานะ <strong>ปลัดอำเภอประจำตำบล {currentUser.tambonName}</strong> (ดูแล 1 คน 1 ตำบล) คุณสามารถเริ่มบันทึกการประชุมของตำบลคุณได้ทันที
                </span>
              )}
              {currentUser?.role === 'district_admin' && (
                <span>
                  เข้าสู่ระบบในฐานะ <strong>เลขาอำเภอ / ผู้รับผิดชอบระดับอำเภอ {currentUser.districtName}</strong> คุณสามารถบันทึกการประชุมระดับอำเภอ และติดตามตำบลในอำเภอ
                </span>
              )}
              {currentUser?.role === 'province_admin' && (
                <span>
                  เข้าสู่ระบบในฐานะ <strong>เลขาระดับจังหวัด {currentUser.provinceName}</strong> คุณสามารถบันทึกการประชุมระดับจังหวัด และติดตามภาพรวมทั้งจังหวัด
                </span>
              )}
              {currentUser?.role === 'central_admin' && (
                <span>
                  เข้าสู่ระบบในฐานะ <strong>แอดมินส่วนกลาง (Central Admin)</strong> สามารถจัดการปลัดประจำตำบล, เลขาอำเภอ, เลขาจังหวัด, บันทึกการประชุมทุกระดับ และตั้งค่า API ของ Supabase ได้อย่างสมบูรณ์
                </span>
              )}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={onNewMeeting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ เริ่มบันทึกการประชุมรายการแรก</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-28">เลขที่ประชุม</th>
                  <th className="py-3 px-4 min-w-[280px]">ชื่อการประชุม / ระดับการประชุม</th>
                  <th className="py-3 px-4 min-w-[150px]">หน่วยงาน / พื้นที่</th>
                  <th className="py-3 px-4 min-w-[140px]">วันและเวลา</th>
                  <th className="py-3 px-4 text-center min-w-[120px]">ผู้เข้าร่วม</th>
                  <th className="py-3 px-4 text-center min-w-[110px]">องค์ประชุม</th>
                  <th className="py-3 px-4 text-center min-w-[180px]">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMeetings.map((meeting) => {
                  const presentCount = meeting.attendees.filter(
                    (a) => a.status === 'present' || a.status === 'proxy'
                  ).length;
                  const canEdit = currentUser ? canUserEditMeeting(currentUser, meeting) : false;
                  const lvl = meeting.meetingLevel || 'tambon';

                  return (
                    <tr
                      key={meeting.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-blue-600">
                        {meeting.meetingNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {meeting.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {lvl === 'tambon' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                              ระดับตำบล
                            </span>
                          )}
                          {lvl === 'district' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-bold">
                              ระดับอำเภอ
                            </span>
                          )}
                          {lvl === 'province' && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-bold">
                              ระดับจังหวัด
                            </span>
                          )}
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {meeting.categoryName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {meeting.agendas.length} วาระ
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-medium text-slate-800 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          Mukim {meeting.tambonName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Daerah {meeting.districtName}, Negeri {meeting.provinceName}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{formatThaiDate(meeting.meetingDate)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{meeting.startTime} - {meeting.endTime}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-slate-800">
                          {presentCount} / {meeting.totalEligible}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {meeting.totalEligible > 0
                            ? Math.round((presentCount / meeting.totalEligible) * 100)
                            : 0}
                          % Hadir
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            meeting.isQuorumMet
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {meeting.isQuorumMet ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Cukup
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Kurang
                            </>
                          )}
                        </span>
                      </td>

                      {/* Action buttons with RBAC permission check */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewMeeting(meeting)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition-colors cursor-pointer"
                            title="Buka Paparan Penuh PDF Minit Mesyuarat"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            PDF
                          </button>

                          {canEdit ? (
                            <>
                              <button
                                onClick={() => onEditMeeting(meeting)}
                                className="p-1 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Kemaskini Rekod Mesyuarat"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(meeting)}
                                className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Padam Rekod Mesyuarat"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <span
                              className="text-[10px] text-slate-400 flex items-center gap-0.5 px-1 py-0.5 bg-slate-50 rounded"
                              title="Hanya paparan sahaja (luar bidang kuasa anda)"
                            >
                              <Lock className="w-3 h-3" />
                              Lihat Sahaja
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
