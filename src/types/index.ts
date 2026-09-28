export type UserRole = 'tambon_admin' | 'district_admin' | 'province_admin' | 'central_admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string; // cth: 'Pegawai Tadbir Mukim', 'Penolong Pegawai Daerah', 'Setiausaha Kerajaan Negeri / Pentadbir Pusat'
  provinceId: string;
  provinceName: string;
  districtId?: string; // Pilihan jika peringkat negeri atau pusat
  districtName?: string;
  tambonId?: string; // Pilihan jika peringkat daerah, negeri atau pusat
  tambonName?: string;
  department: string;
  avatarUrl?: string;
}

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  provinceId: string;
  name: string;
  code: string;
}

export interface Tambon {
  id: string;
  districtId: string;
  provinceId: string;
  name: string;
  code: string;
  postalCode: string;
  adminOfficeName: string; // cth: 'Pejabat Pentadbiran Mukim Nong Saharai'
}

export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'proxy';

export interface CommitteeMember {
  id: string;
  title: string; // Tuan, Puan, Encik, Cik
  firstName: string;
  lastName: string;
  position: string; // cth: 'Pengerusi Majlis Mukim', 'Naib Pengerusi', 'Ketua Kampung Zon 1', 'Wakil Komuniti'
  roleInMeeting: 'chairman' | 'vice_chairman' | 'member' | 'secretary' | 'assistant_secretary';
  organization: string;
  phone?: string;
  isPermanent: boolean;
}

export interface MeetingAttendee {
  memberId: string;
  fullName: string;
  position: string;
  roleInMeeting: string;
  organization: string;
  status: AttendanceStatus;
  proxyName?: string;
  proxyPosition?: string;
  leaveReason?: string;
  note?: string;
  signedTime?: string;
}

export interface OtherParticipant {
  id: string;
  fullName: string;
  position: string;
  organization: string;
  note?: string;
}

export interface MeetingAgenda {
  id: string;
  agendaNumber: string; // cth: '1', '2.1', '3'
  title: string; // cth: 'Perutusan Pengerusi Mesyuarat'
  details: string; // Keterangan dan perbincangan mesyuarat
  resolution: string; // Ketetapan / keputusan mesyuarat cth: 'Majlis mesyuarat mengambil maklum'
  resolutionType: 'acknowledged' | 'approved' | 'rejected' | 'postponed' | 'pending';
}

export interface MeetingCategory {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  iconName?: string;
}

export interface Meeting {
  id: string;
  meetingNumber: string; // Bilangan cth: '1/2026'
  title: string; // Tajuk mesyuarat cth: 'Mesyuarat Majlis Tindakan Pembangunan Mukim'
  categoryId: string;
  categoryName: string;
  meetingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  venue: string; // Tempat mesyuarat
  provinceId: string;
  provinceName: string;
  districtId: string;
  districtName: string;
  tambonId: string;
  tambonName: string;
  organizer: string; // Penganjur cth: 'Pejabat Pentadbiran Mukim'
  
  // Kehadiran & Kuorum
  totalEligible: number; // Jumlah ahli kuorum yang layak
  requiredQuorum: number; // Jumlah minimum untuk memenuhi kuorum mesyuarat
  attendees: MeetingAttendee[];
  otherParticipants: OtherParticipant[]; // Peserta jemputan lain
  isQuorumMet: boolean; // Adakah cukup kuorum
 
  // Kandungan Minit Mesyuarat
  agendas: MeetingAgenda[];
  
  // Pegawai Mesyuarat
  chairmanName: string;
  chairmanPosition: string;
  secretaryName: string;
  secretaryPosition: string;
  checkerName?: string;
  checkerPosition?: string;

  status: 'draft' | 'completed' | 'published';
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdByName: string;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  monthName: string; // cth: 'September 2026'
  totalMeetings: number;
  totalAttendeesPresent: number;
  totalAttendeesEligible: number;
  averageAttendanceRate: number;
  quorumMetPercentage: number;
  byCategory: { [categoryName: string]: number };
}
