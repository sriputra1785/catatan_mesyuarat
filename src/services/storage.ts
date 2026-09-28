import { Meeting, CommitteeMember, MeetingCategory, UserProfile } from '../types';
import { INITIAL_MEETINGS, DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI, MEETING_CATEGORIES } from '../data/thaiAdministrativeData';
import { getSupabaseClient } from './supabase';

const STORAGE_KEYS = {
  MEETINGS: 'emeeting_gov_meetings',
  COMMITTEES: 'emeeting_gov_committees',
  CATEGORIES: 'emeeting_gov_categories',
};

// Initialize Storage with mock seed if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.MEETINGS)) {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(INITIAL_MEETINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMITTEES)) {
    localStorage.setItem(STORAGE_KEYS.COMMITTEES, JSON.stringify(DEFAULT_COMMITTEE_MEMBERS_NONGSAHARAI));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(MEETING_CATEGORIES));
  }
};

export const getStoredMeetings = (): Meeting[] => {
  initializeStorage();
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    return raw ? JSON.parse(raw) : INITIAL_MEETINGS;
  } catch (e) {
    console.error('Error reading meetings from storage:', e);
    return INITIAL_MEETINGS;
  }
};

export const saveStoredMeetings = (meetings: Meeting[]) => {
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
};

/**
 * Tapis rekod mesyuarat mengikut Peranan Pengguna dan Hierarki Pentadbiran:
 * - Pentadbir Mukim (Pegawai Tadbir Mukim): HANYA melihat mesyuarat mukim yang ditugaskan sahaja!
 * - Pentadbir Daerah (Pegawai Daerah / Pentadbir Daerah): melihat mesyuarat semua mukim di bawah daerahnya!
 * - Pentadbir Negeri / Pusat: melihat keseluruhan mesyuarat merentas semua daerah dan mukim secara masa nyata.
 */
export const getMeetingsForUser = (user: UserProfile, allMeetings?: Meeting[]): Meeting[] => {
  const meetings = allMeetings || getStoredMeetings();

  if (user.role === 'central_admin') {
    return meetings;
  }

  if (user.role === 'province_admin') {
    return meetings.filter(m => m.provinceId === user.provinceId);
  }

  if (user.role === 'district_admin') {
    // District Admin can see all tambons within this district
    return meetings.filter(m => m.districtId === user.districtId);
  }

  if (user.role === 'tambon_admin') {
    // Tambon clerk can strictly view ONLY their own tambon!
    return meetings.filter(m => m.tambonId === user.tambonId);
  }

  return [];
};

/**
 * Check if the user is authorized to edit or delete a meeting:
 * - Tambon admin can ONLY edit meetings in their assigned tambon
 * - District admin can edit meetings within their district
 * - Central admin can edit any
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
