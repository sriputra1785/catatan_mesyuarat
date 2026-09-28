import { Meeting, CommitteeMember, MeetingCategory, UserProfile } from '../types';
import { INITIAL_MEETINGS, DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI, MEETING_CATEGORIES, DEMO_USERS } from '../data/thaiAdministrativeData';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  MEETINGS: 'emeeting_gov_meetings',
  COMMITTEES: 'emeeting_gov_committees',
  CATEGORIES: 'emeeting_gov_categories',
  USERS: 'emeeting_gov_users',
  MOCK_PURGED: 'emeeting_gov_mock_purged_v2'
};

// Initialize Storage: Ensure mock meetings are removed and clean blank state is established
export const initializeStorage = () => {
  // One-time automatic purge of previous mock meetings from user's browser localStorage
  if (localStorage.getItem(STORAGE_KEYS.MOCK_PURGED) !== 'true') {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COMMITTEES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOCK_PURGED, 'true');
  }

  if (!localStorage.getItem(STORAGE_KEYS.MEETINGS)) {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(INITIAL_MEETINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMITTEES)) {
    localStorage.setItem(STORAGE_KEYS.COMMITTEES, JSON.stringify(DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(MEETING_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEMO_USERS));
  }
};

/**
 * ล้างข้อมูลจำลองทั้งหมดและรีเซ็ตเป็นข้อมูลว่างจริง (Zero mock data)
 */
export const purgeAllMockData = () => {
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.COMMITTEES, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.MOCK_PURGED, 'true');
};

export const getStoredMeetings = (): Meeting[] => {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading meetings from storage:', e);
    return [];
  }
};

export const saveStoredMeetings = (meetings: Meeting[]) => {
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
};

/**
 * กรองบันทึกการประชุมตาม 3 ระดับและบทบาทผู้ใช้งาน:
 * 1. ระดับตำบล (ปลัดประจำตำบล): ดูแล 1 คน 1 ตำบล และเห็นเฉพาะการประชุมระดับตำบลของตำบลตนเองเท่านั้น!
 * 2. ระดับอำเภอ (เลขาอำเภอ): บันทึกการประชุมระดับอำเภอ และติดตามการประชุมของตำบลต่างๆ ในอำเภอ
 * 3. ระดับจังหวัด (เลขาระดับจังหวัด): บันทึกการประชุมระดับจังหวัด และติดตามภาพรวมทั้งจังหวัด
 * 4. แอดมินส่วนกลาง (Central Admin): ดูแลและจัดการได้ทุกระดับ
 */
export const getMeetingsForUser = (user: UserProfile, allMeetings?: Meeting[]): Meeting[] => {
  const meetings = allMeetings || getStoredMeetings();

  if (user.role === 'central_admin') {
    return meetings;
  }

  if (user.role === 'province_admin') {
    // เลขาระดับจังหวัด: เห็นการประชุมระดับจังหวัด และการประชุมทุกอำเภอ/ตำบลในจังหวัดตนเอง
    return meetings.filter(m => m.provinceId === user.provinceId);
  }

  if (user.role === 'district_admin') {
    // เลขาอำเภอ: เห็นการประชุมระดับอำเภอของตนเอง และการประชุมระดับตำบลในอำเภอ
    return meetings.filter(m => m.districtId === user.districtId);
  }

  if (user.role === 'tambon_admin') {
    // ปลัดประจำตำบล: ดูแล 1 คน 1 ตำบลอย่างเข้มงวด เห็นเฉพาะตำบลที่ตนเองรับผิดชอบเท่านั้น!
    return meetings.filter(m => m.tambonId === user.tambonId);
  }

  return [];
};

/**
 * ตรวจสอบสิทธิ์การแก้ไขหรือลบการประชุม:
 * - ปลัดตำบล: แก้ไขได้เฉพาะการประชุมในตำบลที่ตนเองรับผิดชอบ
 * - เลขาอำเภอ: แก้ไขได้เฉพาะการประชุมระดับอำเภอ หรือในอำเภอของตนเอง
 * - เลขาจังหวัด: แก้ไขได้เฉพาะการประชุมระดับจังหวัด หรือในจังหวัดของตนเอง
 * - แอดมินส่วนกลาง: แก้ไขได้ทุกรายการ
 */
export const canUserEditMeeting = (user: UserProfile, meeting: Meeting): boolean => {
  if (user.role === 'central_admin') return true;
  if (user.role === 'province_admin') return meeting.provinceId === user.provinceId;
  if (user.role === 'district_admin') return meeting.districtId === user.districtId;
  if (user.role === 'tambon_admin') return meeting.tambonId === user.tambonId;
  return false;
};

export const saveMeeting = async (meeting: Meeting): Promise<Meeting> => {
  const meetings = getStoredMeetings();
  const existingIdx = meetings.findIndex(m => m.id === meeting.id);

  let updatedList: Meeting[];
  if (existingIdx >= 0) {
    updatedList = [...meetings];
    updatedList[existingIdx] = { ...meeting, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [{ ...meeting, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...meetings];
  }

  saveStoredMeetings(updatedList);

  // If Supabase is connected, attempt sync in background
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('meetings').upsert({
        id: meeting.id,
        meeting_number: meeting.meetingNumber,
        title: meeting.title,
        meeting_level: meeting.meetingLevel || 'tambon',
        category_id: meeting.categoryId,
        category_name: meeting.categoryName,
        meeting_date: meeting.meetingDate,
        start_time: meeting.startTime,
        end_time: meeting.endTime,
        venue: meeting.venue,
        province_id: meeting.provinceId,
        province_name: meeting.provinceName,
        district_id: meeting.districtId,
        district_name: meeting.districtName,
        tambon_id: meeting.tambonId,
        tambon_name: meeting.tambonName,
        organizer: meeting.organizer,
        total_eligible: meeting.totalEligible,
        required_quorum: meeting.requiredQuorum,
        is_quorum_met: meeting.isQuorumMet,
        attendees: meeting.attendees || [],
        agendas: meeting.agendas || [],
        other_participants: meeting.otherParticipants || [],
        chairman_name: meeting.chairmanName,
        chairman_position: meeting.chairmanPosition,
        secretary_name: meeting.secretaryName,
        secretary_position: meeting.secretaryPosition,
        checker_name: meeting.checkerName,
        checker_position: meeting.checkerPosition,
        status: meeting.status,
        created_by_id: meeting.createdById,
        created_by_name: meeting.createdByName,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase sync skipped or failed (local state preserved):', err);
    }
  }

  return meeting;
};

export const deleteMeeting = async (meetingId: string): Promise<boolean> => {
  const meetings = getStoredMeetings();
  const filtered = meetings.filter(m => m.id !== meetingId);
  saveStoredMeetings(filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('meetings').delete().eq('id', meetingId);
    } catch (err) {
      console.warn('Supabase delete skipped:', err);
    }
  }
  return true;
};

export const getStoredCommittees = (): CommitteeMember[] => {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMITTEES);
    return raw ? JSON.parse(raw) : DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI;
  } catch (e) {
    return DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI;
  }
};

export const saveStoredCommittees = (members: CommitteeMember[]) => {
  localStorage.setItem(STORAGE_KEYS.COMMITTEES, JSON.stringify(members));
};

export const getStoredCategories = (): MeetingCategory[] => {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return raw ? JSON.parse(raw) : MEETING_CATEGORIES;
  } catch (e) {
    return MEETING_CATEGORIES;
  }
};

export const saveStoredCategories = (categories: MeetingCategory[]) => {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
};

export const fetchMeetingsFromSupabase = async (): Promise<Meeting[] | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('meeting_date', { ascending: false });

    if (error || !data) {
      console.warn('Failed to fetch from Supabase:', error);
      return null;
    }

    const mappedMeetings: Meeting[] = data.map((row: any) => ({
      id: row.id,
      meetingNumber: row.meeting_number,
      title: row.title,
      meetingLevel: (row.meeting_level as any) || 'tambon',
      categoryId: row.category_id || '',
      categoryName: row.category_name,
      meetingDate: row.meeting_date,
      startTime: row.start_time?.slice(0, 5) || '09:00',
      endTime: row.end_time?.slice(0, 5) || '12:00',
      venue: row.venue,
      provinceId: row.province_id,
      provinceName: row.province_name,
      districtId: row.district_id,
      districtName: row.district_name,
      tambonId: row.tambon_id,
      tambonName: row.tambon_name,
      organizer: row.organizer,
      totalEligible: row.total_eligible || 0,
      requiredQuorum: row.required_quorum || 0,
      isQuorumMet: Boolean(row.is_quorum_met),
      attendees: Array.isArray(row.attendees) ? row.attendees : [],
      agendas: Array.isArray(row.agendas) ? row.agendas : [],
      otherParticipants: Array.isArray(row.other_participants) ? row.other_participants : [],
      chairmanName: row.chairman_name,
      chairmanPosition: row.chairman_position,
      secretaryName: row.secretary_name,
      secretaryPosition: row.secretary_position,
      checkerName: row.checker_name || '',
      checkerPosition: row.checker_position || '',
      status: row.status || 'completed',
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      createdById: row.created_by_id || 'system',
      createdByName: row.created_by_name || 'Pentadbir'
    }));

    if (mappedMeetings.length > 0) {
      saveStoredMeetings(mappedMeetings);
    }

    return mappedMeetings;
  } catch (err) {
    console.error('Error fetching meetings from Supabase:', err);
    return null;
  }
};

export const getStoredUsers = (): UserProfile[] => {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    let users: UserProfile[] = raw ? JSON.parse(raw) : DEMO_USERS;
    
    // Ensure admin user (username: 'admin', password: '1785') is always present and updated
    const adminIdx = users.findIndex(u => u.username === 'admin' || u.role === 'central_admin');
    const defaultAdmin = DEMO_USERS.find(u => u.username === 'admin') || DEMO_USERS[0];
    if (adminIdx >= 0) {
      users[adminIdx] = {
        ...users[adminIdx],
        username: 'admin',
        password: users[adminIdx].password || '1785',
        role: 'central_admin'
      };
    } else {
      users.unshift(defaultAdmin);
    }

    return users;
  } catch (e) {
    return DEMO_USERS;
  }
};

export const saveStoredUsers = (users: UserProfile[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const savePaladUser = async (user: UserProfile): Promise<UserProfile> => {
  const users = getStoredUsers();
  const existingIdx = users.findIndex(u => u.id === user.id);
  let updatedList: UserProfile[];
  if (existingIdx >= 0) {
    updatedList = [...users];
    updatedList[existingIdx] = user;
  } else {
    updatedList = [...users, user];
  }
  saveStoredUsers(updatedList);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.name,
        email: user.email,
        role: user.role,
        role_title: user.roleTitle,
        province_id: user.provinceId,
        province_name: user.provinceName,
        district_id: user.districtId || null,
        district_name: user.districtName || null,
        tambon_id: user.tambonId || null,
        tambon_name: user.tambonName || null,
        department: user.department,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Supabase profile sync skipped:', err);
    }
  }
  return user;
};

export const deletePaladUser = async (userId: string): Promise<boolean> => {
  const users = getStoredUsers();
  const filtered = users.filter(u => u.id !== userId);
  saveStoredUsers(filtered);

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('profiles').delete().eq('id', userId);
    } catch (err) {
      console.warn('Supabase profile delete skipped:', err);
    }
  }
  return true;
};


