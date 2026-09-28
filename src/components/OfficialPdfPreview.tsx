import React from 'react';
import { Meeting } from '../types';
import { formatThaiDate } from '../utils/thaiDateUtils';
import { generateMeetingPDF, exportMeetingsToExcel } from '../utils/exportUtils';
import { showSuccessToast } from '../utils/alerts';
import { Printer, Download, FileSpreadsheet, X, CheckCircle, Clock } from 'lucide-react';

interface OfficialPdfPreviewProps {
  meeting: Meeting;
  onClose: () => void;
}

export const OfficialPdfPreview: React.FC<OfficialPdfPreviewProps> = ({ meeting, onClose }) => {
  const presentAttendees = meeting.attendees.filter(
    (a) => a.status === 'present' || a.status === 'proxy'
  );
  const absentAttendees = meeting.attendees.filter(
    (a) => a.status === 'absent' || a.status === 'leave'
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateMeetingPDF(meeting);
    showSuccessToast('Berjaya', `Fail PDF bagi Bil. ${meeting.meetingNumber} telah dimuat turun.`);
  };

  const handleDownloadExcel = () => {
    exportMeetingsToExcel([meeting], `Minit_Mesyuarat_${meeting.meetingNumber.replace(/\//g, '-')}.xlsx`);
    showSuccessToast('Berjaya', `Fail Excel bagi Bil. ${meeting.meetingNumber} telah dimuat turun.`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-sm sm:text-base">
              Paparan Minit Mesyuarat Rasmi (Official Minutes Preview)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
              title="Cetak terus atau simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition-colors border border-slate-700 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Muat Turun PDF</span>
            </button>

            <button
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Eksport Excel</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Paper Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/70">
          {/* A4 Paper simulation */}
          <div className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 shadow-md rounded-lg text-slate-900 border border-slate-200 print:shadow-none print:border-none print:p-0">
            {/* Crest Silhouette Representation */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-2">
                <svg
                  className="w-14 h-14 text-blue-800 fill-current mx-auto"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2L9.5 6.5L4 7.5L8 11.5L7 17L12 14.5L17 17L16 11.5L20 7.5L14.5 6.5L12 2Z" />
                </svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                MINIT MESYUARAT RASMI
              </h1>
              <h2 className="text-lg sm:text-xl font-bold mt-1">
                {meeting.title}
              </h2>
              <p className="text-base font-semibold mt-1">
                Bilangan: {meeting.meetingNumber}
              </p>
              <p className="text-base font-normal mt-1">
                Tarikh: {formatThaiDate(meeting.meetingDate, true)}
              </p>
              <p className="text-base font-normal">
                Tempat: {meeting.venue}, Mukim {meeting.tambonName}, Daerah {meeting.districtName}, Negeri {meeting.provinceName}
              </p>
            </div>

            <hr className="my-6 border-slate-300" />

            {/* Attendance Sections */}
            <div className="space-y-6 text-sm sm:text-base leading-relaxed">
              {/* Ahli Yang Hadir */}
              <div>
                <h3 className="font-bold underline mb-2">
                  AHLI YANG HADIR ({presentAttendees.length} orang daripada {meeting.totalEligible} ahli kuorum)
                </h3>
                <ol className="list-decimal pl-6 space-y-1.5">
                  {presentAttendees.map((att, idx) => (
                    <li key={idx} className="pl-1">
                      <span className="font-semibold">{att.fullName}</span>
                      <span className="text-slate-700 ml-2">- {att.position}</span>
                      {att.status === 'proxy' && (
                        <span className="text-blue-700 ml-2">
                          (Wakil Hadir: {att.proxyName || 'Wakil'} - {att.proxyPosition || '-'})
                        </span>
                      )}
                      {att.signedTime && (
                        <span className="text-slate-500 text-xs ml-2">
                          [Masa Hadir: {att.signedTime}]
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Ahli Yang Tidak Hadir / Bersebab */}
              <div>
                <h3 className="font-bold underline mb-2">
                  TIDAK HADIR / BERSEBAB ({absentAttendees.length} orang)
                </h3>
                {absentAttendees.length > 0 ? (
                  <ol className="list-decimal pl-6 space-y-1.5">
                    {absentAttendees.map((att, idx) => (
                      <li key={idx} className="pl-1">
                        <span className="font-semibold">{att.fullName}</span>
                        <span className="text-slate-700 ml-2">- {att.position}</span>
                        {att.status === 'leave' ? (
                          <span className="text-amber-800 ml-2">
                            (Bersebab: {att.leaveReason || 'Urusan Rasmi'})
                          </span>
                        ) : (
                          <span className="text-rose-700 ml-2">
                            (Tidak hadir tanpa pemberitahuan)
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="pl-6 italic text-slate-600">- Tiada (Semua Ahli Hadir) -</p>
                )}
              </div>

              {/* Turut Hadir */}
              {meeting.otherParticipants && meeting.otherParticipants.length > 0 && (
                <div>
                  <h3 className="font-bold underline mb-2">
                    TURUT HADIR ({meeting.otherParticipants.length} orang)
                  </h3>
                  <ol className="list-decimal pl-6 space-y-1.5">
                    {meeting.otherParticipants.map((part, idx) => (
                      <li key={idx} className="pl-1">
                        <span className="font-semibold">{part.fullName}</span>
                        <span className="text-slate-700 ml-2">- {part.position} ({part.organization})</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Pembukaan Mesyuarat */}
              <div className="pt-2">
                <p>
                  <strong>Masa Mesyuarat Dimulakan:</strong> {meeting.startTime}
                </p>
                <p className="mt-1">
                  Setelah kuorum mesyuarat mencukupi mengikut ketetapan peraturan (kehadiran {presentAttendees.length} daripada {meeting.totalEligible} orang ahli), Pengerusi mengalu-alukan kehadiran semua ahli dan memulakan mesyuarat mengikut susunan agenda seperti berikut:
                </p>
              </div>

              {/* Agendas (Agenda & Ketetapan) */}
              <div className="space-y-6 pt-2">
                {meeting.agendas.map((ag) => (
                  <div key={ag.id} className="border-t border-slate-200 pt-4">
                    <h4 className="font-bold text-base mb-1">
                      AGENDA {ag.agendaNumber}: {ag.title}
                    </h4>

                    {ag.details && (
                      <div className="pl-4 text-slate-800 whitespace-pre-line text-justify mb-2">
                        {ag.details}
                      </div>
                    )}

                    <div className="pl-4 mt-2 p-3 bg-slate-50 border-l-4 border-blue-600 rounded-r-md">
                      <span className="font-bold text-blue-900">Ketetapan / Keputusan Mesyuarat: </span>
                      <span className="text-slate-800">{ag.resolution || 'Majlis mesyuarat mengambil maklum.'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Masa Tamat */}
              <div className="pt-4 border-t border-slate-200">
                <p>
                  <strong>Masa Mesyuarat Ditangguhkan:</strong> {meeting.endTime}
                </p>
              </div>

              {/* Tandatangan Pengesahan */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center">
                <div className="space-y-1">
                  <div className="h-14 border-b border-dashed border-slate-400 max-w-[200px] mx-auto mb-2" />
                  <p className="font-bold">({meeting.secretaryName})</p>
                  <p className="text-xs text-slate-600">{meeting.secretaryPosition}</p>
                  <p className="text-xs text-slate-500 font-semibold">Pencatat / Setiausaha Mesyuarat</p>
                </div>

                <div className="space-y-1">
                  <div className="h-14 border-b border-dashed border-slate-400 max-w-[200px] mx-auto mb-2" />
                  <p className="font-bold">({meeting.chairmanName})</p>
                  <p className="text-xs text-slate-600">{meeting.chairmanPosition}</p>
                  <p className="text-xs text-slate-500 font-semibold">Disahkan Oleh Pengerusi Mesyuarat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
