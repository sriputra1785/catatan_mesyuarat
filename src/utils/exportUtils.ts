import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Meeting } from '../types';
import { formatThaiDate } from './thaiDateUtils';

/**
 * Export a single meeting or list of meetings to Microsoft Excel (.xlsx) in Bahasa Melayu
 */
export const exportMeetingsToExcel = (meetings: Meeting[], filename = 'Laporan_Ringkasan_Mesyuarat.xlsx') => {
  // 1. Sheet: Ringkasan Mesyuarat
  const summaryRows = meetings.map((m, index) => {
    const presentCount = m.attendees.filter(a => a.status === 'present' || a.status === 'proxy').length;
    const leaveCount = m.attendees.filter(a => a.status === 'leave').length;
    const absentCount = m.attendees.filter(a => a.status === 'absent').length;
    const attendanceRate = m.totalEligible > 0 ? ((presentCount / m.totalEligible) * 100).toFixed(1) : '0';

    return {
      'Bil.': index + 1,
      'No. Mesyuarat': m.meetingNumber,
      'Tajuk Mesyuarat': m.title,
      'Kategori': m.categoryName,
      'Tarikh Mesyuarat': formatThaiDate(m.meetingDate),
      'Masa': `${m.startTime} - ${m.endTime}`,
      'Tempat': m.venue,
      'Mukim': m.tambonName,
      'Daerah': m.districtName,
      'Negeri': m.provinceName,
      'Jumlah Ahli Kuorum': m.totalEligible,
      'Hadir (Orang)': presentCount,
      'Bersebab / Cuti': leaveCount,
      'Tidak Hadir': absentCount,
      'Peratus Kehadiran (%)': `${attendanceRate}%`,
      'Status Kuorum': m.isQuorumMet ? 'Cukup Kuorum' : 'Tidak Cukup Kuorum',
      'Pengerusi Mesyuarat': m.chairmanName,
      'Setiausaha / Pencatat': m.secretaryName
    };
  });

  const wb = XLSX.utils.book_new();
  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Mesyuarat');

  // 2. Sheet: Rekod Kehadiran Kuorum
  const attendeeRows: any[] = [];
  meetings.forEach(m => {
    m.attendees.forEach((att, attIdx) => {
      let statusMalay = 'Hadir';
      if (att.status === 'absent') statusMalay = 'Tidak Hadir';
      if (att.status === 'leave') statusMalay = `Bersebab / Cuti (${att.leaveReason || 'Urusan Rasmi'})`;
      if (att.status === 'proxy') statusMalay = `Wakil Hadir (${att.proxyName || '-'})`;

      attendeeRows.push({
        'No. Mesyuarat': m.meetingNumber,
        'Tajuk Mesyuarat': m.title,
        'Tarikh': formatThaiDate(m.meetingDate),
        'Bil.': attIdx + 1,
        'Nama Penuh': att.fullName,
        'Jawatan': att.position,
        'Peranan Mesyuarat': att.roleInMeeting,
        'Status Kehadiran': statusMalay,
        'Masa Tandatangan': att.signedTime ? `${att.signedTime}` : '-',
        'Catatan': att.note || '-'
      });
    });
  });

  if (attendeeRows.length > 0) {
    const wsAttendees = XLSX.utils.json_to_sheet(attendeeRows);
    XLSX.utils.book_append_sheet(wb, wsAttendees, 'Senarai Kehadiran Kuorum');
  }

  // Download
  XLSX.writeFile(wb, filename);
};

/**
 * Generate PDF document for Meeting Minutes in Bahasa Melayu
 */
export const generateMeetingPDF = (meeting: Meeting) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Setup basic layout
  doc.setFontSize(16);
  doc.text('MINIT MESYUARAT RASMI', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text(meeting.title, 105, 28, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Bil. Mesyuarat: ${meeting.meetingNumber} | Tarikh: ${formatThaiDate(meeting.meetingDate)} | Masa: ${meeting.startTime} - ${meeting.endTime}`, 105, 34, { align: 'center' });
  doc.text(`Tempat: ${meeting.venue} | Mukim ${meeting.tambonName}, Daerah ${meeting.districtName}, Negeri ${meeting.provinceName}`, 105, 40, { align: 'center' });

  // Attendees table
  const attendeesData = meeting.attendees.map((att, i) => [
    (i + 1).toString(),
    att.fullName,
    att.position,
    att.status === 'present' ? 'Hadir' : att.status === 'proxy' ? `Wakil (${att.proxyName || ''})` : att.status === 'leave' ? `Cuti (${att.leaveReason || ''})` : 'Tidak Hadir',
    att.signedTime ? `${att.signedTime}` : '-'
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['Bil.', 'Nama Penuh', 'Jawatan', 'Status Kehadiran', 'Masa']],
    body: attendeesData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });

  // Agendas
  let finalY = (doc as any).lastAutoTable?.finalY || 120;
  if (finalY > 230) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(11);
  doc.text('Agenda & Ketetapan / Keputusan Mesyuarat:', 14, finalY + 10);

  const agendaRows = meeting.agendas.map(ag => [
    `Agenda ${ag.agendaNumber}`,
    ag.title,
    ag.details,
    ag.resolution
  ]);

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Agenda', 'Tajuk Perkara', 'Keterangan & Perbincangan', 'Ketetapan / Keputusan']],
    body: agendaRows,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 45 },
      2: { cellWidth: 65 },
      3: { cellWidth: 48 }
    }
  });

  // Save PDF
  doc.save(`Minit_Mesyuarat_${meeting.meetingNumber.replace(/\//g, '-')}_Mukim_${meeting.tambonName}.pdf`);
};

export const printOfficialMeetingMinutes = () => {
  window.print();
};
