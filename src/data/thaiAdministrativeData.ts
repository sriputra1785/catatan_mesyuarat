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
    id: 'user-central-1',
    username: 'admin',
    password: '1785',
    name: 'แอดมินส่วนกลาง (Central Admin)',
    email: 'admin@gov.th',
    role: 'central_admin',
    roleTitle: 'ผู้ดูแลระบบส่วนกลาง (Central Administrator)',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    department: 'ศูนย์ปฏิบัติการและประสานงานระบบส่วนกลาง',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '044-210-999',
    status: 'active'
  },
  {
    id: 'user-tambon-1',
    username: 'nongsaharai',
    password: '1234',
    name: 'นายสมเกียรติ อับดุลเลาะห์ (ปลัดตำบลหนองสาหร่าย)',
    email: 'palad.nongsaharai@gov.th',
    role: 'tambon_admin',
    roleTitle: 'ปลัดอำเภอประจำตำบลหนองสาหร่าย (ผู้รับผิดชอบ 1 คน 1 ตำบล)',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    tambonId: 'tam-302104',
    tambonName: 'Nong Saharai',
    department: 'ที่ทำการปกครองตำบลหนองสาหร่าย',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '081-234-5678',
    status: 'active'
  },
  {
    id: 'user-tambon-2',
    username: 'khanongphra',
    password: '1234',
    name: 'นางกัลซอม ฮาชิม (ปลัดตำบลขนงพระ)',
    email: 'palad.khanongphra@gov.th',
    role: 'tambon_admin',
    roleTitle: 'ปลัดอำเภอประจำตำบลขนงพระ (ผู้รับผิดชอบ 1 คน 1 ตำบล)',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    tambonId: 'tam-302105',
    tambonName: 'Khanong Phra',
    department: 'ที่ทำการปกครองตำบลขนงพระ',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '089-876-5432',
    status: 'active'
  },
  {
    id: 'user-district-1',
    username: 'pakchong',
    password: '1234',
    name: 'นายอดิศร อุษมาน (เลขาอำเภอปากช่อง)',
    email: 'sec.pakchong@gov.th',
    role: 'district_admin',
    roleTitle: 'เลขาอำเภอ / ผู้รับผิดชอบบันทึกการประชุมระดับอำเภอ',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    districtId: 'dist-3021',
    districtName: 'Pak Chong',
    department: 'ที่ทำการปกครองอำเภอปากช่อง',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '044-311-234',
    status: 'active'
  },
  {
    id: 'user-province-1',
    username: 'secprovince',
    password: '1234',
    name: 'นางสาวพิมพ์นภัส วรศักดิ์ (เลขาระดับจังหวัด)',
    email: 'sec.province@gov.th',
    role: 'province_admin',
    roleTitle: 'เลขาระดับจังหวัด / ผู้รับผิดชอบบันทึกการประชุมระดับจังหวัด',
    provinceId: 'prov-30',
    provinceName: 'Nakhon Ratchasima',
    department: 'สำนักงานจังหวัดนครราชสีมา (ศาลากลางจังหวัด)',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phone: '044-242-011',
    status: 'active'
  }
];

export const DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI: CommitteeMember[] = [];

export const INITIAL_MEETINGS: Meeting[] = [];
