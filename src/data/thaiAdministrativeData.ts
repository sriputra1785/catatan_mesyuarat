import { Province, District, Tambon, MeetingCategory, UserProfile, CommitteeMember, Meeting } from '../types';

export const PROVINCES: Province[] = [
  { id: 'prov-30', code: '30', name: 'Nakhon Ratchasima' },
  { id: 'prov-50', code: '50', name: 'Chiang Mai' },
  { id: 'prov-40', code: '40', name: 'Khon Kaen' }
];

export const DISTRICTS: District[] = [
  // Daerah di bawah Negeri Nakhon Ratchasima
  { id: 'dist-3001', provinceId: 'prov-30', code: '3001', name: 'Mueang Nakhon Ratchasima' },
  { id: 'dist-3021', provinceId: 'prov-30', code: '3021', name: 'Pak Chong' },
  { id: 'dist-3023', provinceId: 'prov-30', code: '3023', name: 'Sikhiu' },
  
  // Chiang Mai
  { id: 'dist-5001', provinceId: 'prov-50', code: '5001', name: 'Mueang Chiang Mai' },
  { id: 'dist-5002', provinceId: 'prov-50', code: '5002', name: 'Mae Rim' },

  // Khon Kaen
  { id: 'dist-4001', provinceId: 'prov-40', code: '4001', name: 'Mueang Khon Kaen' }
];

export const TAMBONS: Tambon[] = [
  // Mukim di bawah Daerah Pak Chong
  { id: 'tam-302101', districtId: 'dist-3021', provinceId: 'prov-30', code: '302101', name: 'Pak Chong', postalCode: '30130', adminOfficeName: 'Majlis Perbandaran Pak Chong' },
  { id: 'tam-302104', districtId: 'dist-3021', provinceId: 'prov-30', code: '302104', name: 'Nong Saharai', postalCode: '30130', adminOfficeName: 'Pejabat Pentadbiran Mukim Nong Saharai' },
  { id: 'tam-302105', districtId: 'dist-3021', provinceId: 'prov-30', code: '302105', name: 'Khanong Phra', postalCode: '30130', adminOfficeName: 'Pejabat Pentadbiran Mukim Khanong Phra' },
  { id: 'tam-302106', districtId: 'dist-3021', provinceId: 'prov-30', code: '302106', name: 'Mu Si', postalCode: '30130', adminOfficeName: 'Pejabat Pentadbiran Mukim Mu Si' },

  // Mueang
  { id: 'tam-300101', districtId: 'dist-3001', provinceId: 'prov-30', code: '300101', name: 'Nai Mueang', postalCode: '30000', adminOfficeName: 'Majlis Bandaraya Nakhon Ratchasima' },
  { id: 'tam-300102', districtId: 'dist-3001', provinceId: 'prov-30', code: '300102', name: 'Pho Klang', postalCode: '30000', adminOfficeName: 'Majlis Perbandaran Pho Klang' },

  // Sikhiu
  { id: 'tam-302301', districtId: 'dist-3023', provinceId: 'prov-30', code: '302301', name: 'Sikhiu', postalCode: '30140', adminOfficeName: 'Majlis Perbandaran Sikhiu' },

  // Mae Rim
  { id: 'tam-500201', districtId: 'dist-5002', provinceId: 'prov-50', code: '500201', name: 'Rim Tai', postalCode: '50180', adminOfficeName: 'Majlis Perbandaran Rim Tai' }
];

export const MEETING_CATEGORIES: MeetingCategory[] = [
  { id: 'cat-council', name: 'Mesyuarat Majlis Mukim / Tempatan', description: 'Mesyuarat Sidang Biasa dan Khas Majlis Perbandaran / Mukim', badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'cat-district-heads', name: 'Mesyuarat Ketua Jabatan Daerah', description: 'Mesyuarat bulanan ketua-ketua jabatan kerajaan dan agensi peringkat daerah', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'cat-village-leaders', name: 'Mesyuarat Penghulu & Ketua Kampung', description: 'Mesyuarat berkala taklimat dasar dan pemantauan keselamatan komuniti', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'cat-development', name: 'Mesyuarat Jawatankuasa Tindakan Pembangunan', description: 'Penilaian pelan tindakan pembangunan sosioekonomi dan peruntukan bajet', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'cat-disaster', name: 'Mesyuarat Pengurusan Bencana & Kecemasan', description: 'Kesiapsiagaan menghadapi bencana banjir, ribut dan kecemasan awam', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'cat-internal', name: 'Mesyuarat Pentadbiran & Pengurusan Dalaman', description: 'Penyelarasan urusan operasi dalaman pejabat dan semakan prestasi', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'user-tambon-1',
    name: 'Encik Somkiat Abdullah',
    email: 'penghulu.nongsaharai@gov.my',
    role: 'tambon_admin',
    roleTitle: 'Penghulu / Pegawai Tadbir Mukim Nong Saharai',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    tambonId: 'tam-302104',
    tambonName: 'Nong Saharai',
    department: 'Pejabat Pentadbiran Mukim Nong Saharai',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-tambon-2',
    name: 'Puan Kalsom Hashim',
    email: 'penghulu.khanongphra@gov.my',
    role: 'tambon_admin',
    roleTitle: 'Penghulu / Pegawai Tadbir Mukim Khanong Phra',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    tambonId: 'tam-302105',
    tambonName: 'Khanong Phra',
    department: 'Pejabat Pentadbiran Mukim Khanong Phra',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-district-1',
    name: 'Tuan Haji Adisorn Othman',
    email: 'pegawai.daerah.pakchong@gov.my',
    role: 'district_admin',
    roleTitle: 'Pegawai Daerah / Pentadbir Daerah Pak Chong',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    department: 'Pejabat Daerah Pak Chong',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-central-1',
    name: 'Dato\' Seri Dr. Kiattisak Rahman',
    email: 'suk.negeri@gov.my',
    role: 'central_admin',
    roleTitle: 'Setiausaha Kerajaan Negeri / Pentadbir Pusat',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    department: 'Pejabat Setiausaha Kerajaan Negeri',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];

export const DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI: CommitteeMember[] = [
  { id: 'mem-1', title: 'Tuan', firstName: 'Pradit', lastName: 'Sawãngnet', position: 'Pengerusi Majlis Mukim', roleInMeeting: 'chairman', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-2', title: 'Encik', firstName: 'Wichai', lastName: 'Thonglor', position: 'Naib Pengerusi Majlis Mukim', roleInMeeting: 'vice_chairman', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-3', title: 'Encik', firstName: 'Somkiat', lastName: 'Abdullah', position: 'Pegawai Tadbir (Setiausaha Mesyuarat)', roleInMeeting: 'secretary', organization: 'Pejabat Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-4', title: 'Encik', firstName: 'Boonlert', lastName: 'Charoensuk', position: 'Ketua Kampung Zon 1', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-5', title: 'Puan', firstName: 'Duangjai', lastName: 'Kaewmanee', position: 'Ketua Kampung Zon 2', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-6', title: 'Encik', firstName: 'Amnat', lastName: 'Promjak', position: 'Ketua Kampung Zon 3', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-7', title: 'Encik', firstName: 'Chalermchai', lastName: 'Sriwiset', position: 'Ketua Kampung Zon 4', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-8', title: 'Cik', firstName: 'Pimpa', lastName: 'Rattanachai', position: 'Wakil Wanita Komuniti Zon 5', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-9', title: 'Encik', firstName: 'Suthep', lastName: 'Kongthon', position: 'Ketua Kampung Zon 6', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-10', title: 'Encik', firstName: 'Thawatchai', lastName: 'Jaidee', position: 'Wakil Belia Mukim Zon 7', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-11', title: 'Puan', firstName: 'Somsri', lastName: 'Mongkolsap', position: 'Ketua Kampung Zon 8', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true },
  { id: 'mem-12', title: 'Encik', firstName: 'Chatchawan', lastName: 'Poemphon', position: 'Ketua Kampung Zon 9', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', isPermanent: true }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'meet-2026-001',
    meetingNumber: '1/2026',
    title: 'Mesyuarat Majlis Tindakan Pembangunan Mukim Nong Saharai Penggal Pertama Tahun 2026',
    categoryId: 'cat-council',
    categoryName: 'Mesyuarat Majlis Mukim / Tempatan',
    meetingDate: '2026-09-15',
    startTime: '09:30',
    endTime: '12:30',
    venue: 'Dewan Mesyuarat Utama Pejabat Mukim Nong Saharai',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    tambonId: 'tam-302104',
    tambonName: 'Nong Saharai',
    organizer: 'Pejabat Pentadbiran Mukim Nong Saharai',
    totalEligible: 12,
    requiredQuorum: 7,
    isQuorumMet: true,
    attendees: [
      { memberId: 'mem-1', fullName: 'Tuan Pradit Sawãngnet', position: 'Pengerusi Majlis Mukim', roleInMeeting: 'chairman', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:15' },
      { memberId: 'mem-2', fullName: 'Encik Wichai Thonglor', position: 'Naib Pengerusi Majlis', roleInMeeting: 'vice_chairman', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:20' },
      { memberId: 'mem-3', fullName: 'Encik Somkiat Abdullah', position: 'Pegawai Tadbir (Setiausaha)', roleInMeeting: 'secretary', organization: 'Pejabat Mukim Nong Saharai', status: 'present', signedTime: '09:00' },
      { memberId: 'mem-4', fullName: 'Encik Boonlert Charoensuk', position: 'Ketua Kampung Zon 1', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:22' },
      { memberId: 'mem-5', fullName: 'Puan Duangjai Kaewmanee', position: 'Ketua Kampung Zon 2', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:25' },
      { memberId: 'mem-6', fullName: 'Encik Amnat Promjak', position: 'Ketua Kampung Zon 3', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:18' },
      { memberId: 'mem-7', fullName: 'Encik Chalermchai Sriwiset', position: 'Ketua Kampung Zon 4', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:28' },
      { memberId: 'mem-8', fullName: 'Cik Pimpa Rattanachai', position: 'Wakil Wanita Zon 5', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'leave', leaveReason: 'Tugasan rasmi luar daerah (Surat pelepasan dilampirkan)' },
      { memberId: 'mem-9', fullName: 'Encik Suthep Kongthon', position: 'Ketua Kampung Zon 6', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:26' },
      { memberId: 'mem-10', fullName: 'Encik Thawatchai Jaidee', position: 'Wakil Belia Zon 7', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'present', signedTime: '09:20' },
      { memberId: 'mem-11', fullName: 'Puan Somsri Mongkolsap', position: 'Ketua Kampung Zon 8', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'proxy', proxyName: 'Encik Pongsak Mongkolsap', proxyPosition: 'Wakil Zon 8', signedTime: '09:14' },
      { memberId: 'mem-12', fullName: 'Encik Chatchawan Poemphon', position: 'Ketua Kampung Zon 9', roleInMeeting: 'member', organization: 'Majlis Mukim Nong Saharai', status: 'absent', note: 'Tidak hadir tanpa makluman' }
    ],
    otherParticipants: [
      { id: 'part-1', fullName: 'Tuan Theerapol Pattanakul', position: 'Yang Dipertua Perbandaran', organization: 'Majlis Tempatan' },
      { id: 'part-2', fullName: 'Puan Supaporn Choochai', position: 'Pegawai Kewangan', organization: 'Bahagian Kewangan Mukim' },
      { id: 'part-3', fullName: 'Encik Akaradech Bamrungsri', position: 'Jurutera Awam Mukim', organization: 'Bahagian Teknikal & Kejuruteraan' }
    ],
    agendas: [
      {
        id: 'ag-1',
        agendaNumber: '1',
        title: 'Perutusan Pengerusi Mesyuarat',
        details: 'Pengerusi merakamkan ucapan penghargaan kepada semua ahli yang hadir dan membentangkan surat arahan penting daripada Pejabat Daerah mengenai langkah persediaan pelan mitigasi kemarau serta bekalan air bersih.',
        resolution: 'Majlis mesyuarat mengambil maklum dan bersetuju menyelaras tindakan segera di peringkat zon kampung.',
        resolutionType: 'acknowledged'
      },
      {
        id: 'ag-2',
        agendaNumber: '2',
        title: 'Pengesahan Minit Mesyuarat Yang Lalu',
        details: 'Setiausaha membentangkan Minit Mesyuarat Sidang Ke-4 Tahun 2025 yang diadakan pada 18 Disember 2025 untuk semakan dan pengesahan.',
        resolution: 'Minit mesyuarat disahkan sebulat suara tanpa sebarang pindaan.',
        resolutionType: 'approved'
      },
      {
        id: 'ag-3',
        agendaNumber: '3',
        title: 'Perkara Untuk Pertimbangan: Cadangan Bajet Tambahan Pembinaan Jalan Perhubungan Zon 3 dan Loji Rawatan Air Zon 7',
        details: 'Pegawai Tadbir membentangkan justifikasi permohonan peruntukan bajet pembangunan tambahan sebanyak RM 320,000 bagi mengatasi masalah jalan perhubungan dan kemudahan bekalan asas penduduk.',
        resolution: 'Majlis mesyuarat meluluskan permohonan peruntukan secara sebulat suara pada bacaan pertama.',
        resolutionType: 'approved'
      },
      {
        id: 'ag-4',
        agendaNumber: '4',
        title: 'Hal-Hal Lain: Program Pesta Warisan Kebudayaan dan Promosi Pelancongan Komuniti Mukim',
        details: 'Wakil Zon 2 mencadangkan kerjasama antara persatuan belia dan pengusaha tempatan bagi penganjuran festival tahunan.',
        resolution: 'Jawatankuasa Pembangunan Komuniti dipertanggungjawabkan untuk mengadakan sesi libat urus bersama penduduk.',
        resolutionType: 'acknowledged'
      }
    ],
    chairmanName: 'Tuan Pradit Sawãngnet',
    chairmanPosition: 'Pengerusi Majlis Mukim Nong Saharai',
    secretaryName: 'Encik Somkiat Abdullah',
    secretaryPosition: 'Pegawai Tadbir Mukim (Setiausaha Mesyuarat)',
    checkerName: 'Encik Wichai Thonglor',
    checkerPosition: 'Naib Pengerusi Majlis Mukim',
    status: 'completed',
    createdAt: '2026-09-15T13:00:00Z',
    updatedAt: '2026-09-15T15:30:00Z',
    createdById: 'user-tambon-1',
    createdByName: 'Encik Somkiat Abdullah'
  },
  {
    id: 'meet-2026-002',
    meetingNumber: '9/2026',
    title: 'Mesyuarat Berkala Ketua-Ketua Jabatan dan Penghulu Mukim Peringkat Daerah Pak Chong Bulan September 2026',
    categoryId: 'cat-district-heads',
    categoryName: 'Mesyuarat Ketua Jabatan Daerah',
    meetingDate: '2026-09-02',
    startTime: '09:00',
    endTime: '12:00',
    venue: 'Dewan Jubli Perak, Pejabat Daerah Pak Chong',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    tambonId: 'tam-302101',
    tambonName: 'Pak Chong',
    organizer: 'Pejabat Daerah Pak Chong',
    totalEligible: 20,
    requiredQuorum: 11,
    isQuorumMet: true,
    attendees: [
      { memberId: 'head-1', fullName: 'Tuan Haji Adisorn Othman', position: 'Pegawai Daerah Pak Chong', roleInMeeting: 'chairman', organization: 'Pejabat Daerah Pak Chong', status: 'present', signedTime: '08:45' },
      { memberId: 'head-2', fullName: 'Supt. Pongsiri Boonyuen', position: 'Ketua Polis Daerah', roleInMeeting: 'member', organization: 'Ibu Pejabat Polis Daerah', status: 'present', signedTime: '08:50' },
      { memberId: 'head-3', fullName: 'Dr. Suthiphong Charoenmit', position: 'Pengarah Hospital Daerah', roleInMeeting: 'member', organization: 'Hospital Pak Chong', status: 'proxy', proxyName: 'Dr. Nalinee Wanich', proxyPosition: 'Timbalan Pengarah Klinikal', signedTime: '08:55' },
      { memberId: 'head-4', fullName: 'Encik Somkiat Abdullah', position: 'Pegawai Tadbir Mukim Nong Saharai', roleInMeeting: 'member', organization: 'Pejabat Mukim Nong Saharai', status: 'present', signedTime: '08:52' },
      { memberId: 'head-5', fullName: 'Puan Kalsom Hashim', position: 'Pegawai Tadbir Mukim Khanong Phra', roleInMeeting: 'member', organization: 'Pejabat Mukim Khanong Phra', status: 'present', signedTime: '08:58' },
      { memberId: 'head-6', fullName: 'Encik Sompong Chairat', position: 'Penghulu Mukim Mu Si', roleInMeeting: 'member', organization: 'Kesatuan Penghulu Daerah', status: 'present', signedTime: '08:40' },
      { memberId: 'head-7', fullName: 'Encik Wichian Mangmee', position: 'Pegawai Pertanian Daerah', roleInMeeting: 'member', organization: 'Jabatan Pertanian Daerah', status: 'present', signedTime: '08:59' },
      { memberId: 'head-8', fullName: 'Puan Penpak Darawan', position: 'Pegawai Kesihatan Daerah', roleInMeeting: 'member', organization: 'Pejabat Kesihatan Daerah', status: 'present', signedTime: '08:48' },
      { memberId: 'head-9', fullName: 'Encik Rangsan Saensuk', position: 'Pegawai Kemajuan Masyarakat', roleInMeeting: 'member', organization: 'Jabatan Kemajuan Masyarakat', status: 'present', signedTime: '08:55' },
      { memberId: 'head-10', fullName: 'Encik Prawit Songtham', position: 'Ketua Penolong Pegawai Daerah (Setiausaha)', roleInMeeting: 'secretary', organization: 'Pejabat Daerah', status: 'present', signedTime: '08:30' }
    ],
    otherParticipants: [],
    agendas: [
      {
        id: 'ag-d-1',
        agendaNumber: '1',
        title: 'Penyampaian Sijil Penghargaan Kampung Contoh & Selamat Tahun 2026',
        details: 'Pegawai Daerah menyempurnakan upacara penyampaian sijil penghargaan kepada penghulu dan ketua kampung yang mencapai penarafan cemerlang.',
        resolution: 'Majlis mesyuarat merakamkan tahniah kepada semua penerima anugerah.',
        resolutionType: 'acknowledged'
      },
      {
        id: 'ag-d-2',
        agendaNumber: '2',
        title: 'Penyelarasan Sistem e-Mesyuarat Berpusat Berdasarkan Garis Panduan Negeri',
        details: 'Pegawai Daerah menegaskan kewajipan semua pejabat mukim dan pihak berkuasa tempatan merekod kehadiran kuorum mesyuarat secara masa nyata (real-time) bagi memastikan ketelusan tadbir urus.',
        resolution: 'Semua agensi diwajibkan mematuhi prosedur pelaporan sistem e-Mesyuarat sepenuhnya.',
        resolutionType: 'approved'
      }
    ],
    chairmanName: 'Tuan Haji Adisorn Othman',
    chairmanPosition: 'Pegawai Daerah Pak Chong',
    secretaryName: 'Encik Prawit Songtham',
    secretaryPosition: 'Ketua Penolong Pegawai Daerah (Pengurusan)',
    status: 'completed',
    createdAt: '2026-09-02T13:30:00Z',
    updatedAt: '2026-09-02T16:00:00Z',
    createdById: 'user-district-1',
    createdByName: 'Tuan Haji Adisorn Othman'
  }
];
