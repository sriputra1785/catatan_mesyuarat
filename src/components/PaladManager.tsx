import React, { useState } from 'react';
import { UserProfile, Province, District, Tambon } from '../types';
import { PROVINCES, DISTRICTS, TAMBONS } from '../data/thaiAdministrativeData';
import { getStoredUsers, savePaladUser, deletePaladUser } from '../services/storage';
import { showDeleteConfirm, showSuccessToast, showInfoToast } from '../utils/alerts';
import {
  UserPlus,
  Search,
  MapPin,
  Building2,
  Key,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Users,
  Filter,
  Sparkles,
  Lock,
  ChevronRight
} from 'lucide-react';

interface PaladManagerProps {
  onSwitchUser: (userId: string) => void;
}

export const PaladManager: React.FC<PaladManagerProps> = ({ onSwitchUser }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => getStoredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'tambon_admin' | 'district_admin' | 'province_admin'>('all');
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>('all');
  const [showPasswordMap, setShowPasswordMap] = useState<{ [userId: string]: boolean }>({});
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form states
  const [formRole, setFormRole] = useState<'tambon_admin' | 'district_admin' | 'province_admin'>('tambon_admin');
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRoleTitle, setFormRoleTitle] = useState('ปลัดอำเภอประจำตำบล (ผู้รับผิดชอบ 1 คน 1 ตำบล)');
  const [formProvinceId, setFormProvinceId] = useState('prov-30');
  const [formDistrictId, setFormDistrictId] = useState('dist-3021');
  const [formTambonId, setFormTambonId] = useState('tam-302104');
  const [formDepartment, setFormDepartment] = useState('ที่ทำการปกครองตำบลหนองสาหร่าย');
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active');

  const refreshUsers = () => {
    setUsers(getStoredUsers());
  };

  // Only officers (tambon admins, district admins, province admins)
  const paladList = users.filter(u => u.role === 'tambon_admin' || u.role === 'district_admin' || u.role === 'province_admin');

  // Filtered by search, role, and district
  const filteredPalads = paladList.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.tambonName && user.tambonName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.districtName && user.districtName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRoleFilter === 'all' || user.role === selectedRoleFilter;

    const matchesDistrict =
      selectedDistrictFilter === 'all' || user.districtId === selectedDistrictFilter;

    return matchesSearch && matchesRole && matchesDistrict;
  });

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleOpenAddModal = (roleType: 'tambon_admin' | 'district_admin' | 'province_admin' = 'tambon_admin') => {
    setEditingUser(null);
    setFormRole(roleType);
    setFormName('');
    setFormUsername('');
    setFormPassword('1234');
    setFormEmail('');
    setFormPhone('');
    
    if (roleType === 'tambon_admin') {
      setFormRoleTitle('ปลัดอำเภอประจำตำบล (ผู้รับผิดชอบ 1 คน 1 ตำบล)');
      setFormDepartment('ที่ทำการปกครองตำบล');
    } else if (roleType === 'district_admin') {
      setFormRoleTitle('เลขาอำเภอ / ผู้รับผิดชอบบันทึกการประชุมระดับอำเภอ');
      setFormDepartment('ที่ทำการปกครองอำเภอ');
    } else {
      setFormRoleTitle('เลขาระดับจังหวัด / ผู้รับผิดชอบบันทึกการประชุมระดับจังหวัด');
      setFormDepartment('สำนักงานจังหวัด (ศาลากลางจังหวัด)');
    }

    setFormProvinceId('prov-30');
    setFormDistrictId('dist-3021');
    setFormTambonId('tam-302104');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormRole((user.role as any) || 'tambon_admin');
    setFormName(user.name);
    setFormUsername(user.username || '');
    setFormPassword(user.password || '1234');
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRoleTitle(user.roleTitle || 'ปลัดอำเภอประจำตำบล');
    setFormProvinceId(user.provinceId || 'prov-30');
    setFormDistrictId(user.districtId || 'dist-3021');
    setFormTambonId(user.tambonId || 'tam-302104');
    setFormDepartment(user.department || '');
    setFormStatus(user.status || 'active');
    setIsModalOpen(true);
  };

  const handleSavePalad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim()) {
      alert('กรุณากรอกชื่อ-นามสกุล และชื่อผู้ใช้งาน (Username)');
      return;
    }

    const selectedProv = PROVINCES.find(p => p.id === formProvinceId);
    const selectedDist = DISTRICTS.find(d => d.id === formDistrictId);
    const selectedTam = TAMBONS.find(t => t.id === formTambonId);

    const updatedUser: UserProfile = {
      id: editingUser ? editingUser.id : `user-officer-${Date.now()}`,
      name: formName.trim(),
      username: formUsername.trim().toLowerCase(),
      password: formPassword.trim() || '1234',
      email: formEmail.trim() || `${formUsername.trim().toLowerCase()}@gov.th`,
      phone: formPhone.trim(),
      role: formRole,
      roleTitle: formRoleTitle.trim(),
      provinceId: formProvinceId,
      provinceName: selectedProv ? selectedProv.name : 'Nakhon Ratchasima',
      districtId: formRole !== 'province_admin' ? formDistrictId : undefined,
      districtName: formRole !== 'province_admin' ? (selectedDist ? selectedDist.name : 'Pak Chong') : undefined,
      tambonId: formRole === 'tambon_admin' ? formTambonId : undefined,
      tambonName: formRole === 'tambon_admin' ? (selectedTam ? selectedTam.name : 'Nong Saharai') : undefined,
      department: formDepartment.trim() || (selectedTam ? selectedTam.adminOfficeName : 'ที่ทำการปกครอง'),
      status: formStatus,
      avatarUrl: editingUser?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    };

    await savePaladUser(updatedUser);
    refreshUsers();
    setIsModalOpen(false);
    showSuccessToast(
      editingUser ? 'บันทึกการแก้ไขเรียบร้อยแล้ว' : 'บันทึกข้อมูลเจ้าหน้าที่สำเร็จ',
      `เจ้าหน้าที่ ${updatedUser.name} (${updatedUser.roleTitle}) ได้รับการบันทึกลงระบบแล้ว`
    );
  };

  const handleDeletePalad = async (user: UserProfile) => {
    const confirmed = await showDeleteConfirm(`ปลัด ${user.name} (ตำบล ${user.tambonName})`);
    if (confirmed) {
      await deletePaladUser(user.id);
      refreshUsers();
      showSuccessToast('ลบรายการเรียบร้อย', 'ข้อมูลถูกนำออกจากระบบแล้ว');
    }
  };

  // Districts available under selected province
  const availableDistricts = DISTRICTS.filter(d => d.provinceId === formProvinceId);
  // Tambons available under selected district
  const availableTambons = TAMBONS.filter(t => t.districtId === formDistrictId);

  // Statistics
  const totalTambons = TAMBONS.length;
  const assignedTambonIds = new Set(paladList.map(u => u.tambonId).filter(Boolean));
  const assignedCount = assignedTambonIds.size;
  const unassignedCount = Math.max(0, totalTambons - assignedCount);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              ส่วนกลางควบคุมการกระจายอำนาจการบริหาร (Central Governance)
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-400" />
              จัดการปลัดและเจ้าหน้าที่ดูแลประจำตำบล
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              กำหนดและแต่งตั้งปลัดอำเภอ / เจ้าหน้าที่ผู้ประสานงานประจำแต่ละตำบล พร้อมมอบหมายชื่อผู้ใช้ (Username) และรหัสผ่านสำหรับลงชื่อเข้าใช้งานระบบ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              + แต่งตั้ง / เพิ่มปลัดใหม่
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">ตำบลทั้งหมดในระบบ</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalTambons} ตำบล</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-emerald-400 font-medium">ตำบลที่มีปลัดดูแลแล้ว</div>
            <div className="text-xl font-bold text-emerald-300 mt-0.5">{assignedCount} ตำบล</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-amber-400 font-medium">ตำบลที่ยังว่าง</div>
            <div className="text-xl font-bold text-amber-300 mt-0.5">{unassignedCount} ตำบล</div>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
            <div className="text-[11px] text-blue-400 font-medium">จำนวนปลัด / เจ้าหน้าที่</div>
            <div className="text-xl font-bold text-blue-300 mt-0.5">{paladList.length} ท่าน</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, ตำบล, อำเภอ, ชื่อผู้ใช้..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Role pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setSelectedRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedRoleFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({paladList.length})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('tambon_admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedRoleFilter === 'tambon_admin'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ปลัดตำบล (1 คน 1 ตำบล)
            </button>
            <button
              onClick={() => setSelectedRoleFilter('district_admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedRoleFilter === 'district_admin'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เลขาอำเภอ
            </button>
            <button
              onClick={() => setSelectedRoleFilter('province_admin')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedRoleFilter === 'province_admin'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เลขาจังหวัด
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDistrictFilter}
              onChange={(e) => setSelectedDistrictFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">ทุกอำเภอในจังหวัด</option>
              {DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>อำเภอ {d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Palad List Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPalads.map((user) => {
          const isShowPass = showPasswordMap[user.id] || false;

          return (
            <div
              key={user.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between relative group"
            >
              <div>
                {/* Header card with status & role badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  {user.role === 'tambon_admin' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      ตำบล {user.tambonName || 'ยังไม่กำหนด'} (1 คน 1 ตำบล)
                    </span>
                  )}
                  {user.role === 'district_admin' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      อำเภอ {user.districtName || 'ยังไม่กำหนด'} (เลขาอำเภอ)
                    </span>
                  )}
                  {user.role === 'province_admin' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      จังหวัด {user.provinceName || 'ยังไม่กำหนด'} (เลขาจังหวัด)
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      user.status !== 'inactive'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status !== 'inactive' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {user.status !== 'inactive' ? 'พร้อมปฏิบัติงาน' : 'ระงับชั่วคราว'}
                  </span>
                </div>

                {/* Profile info */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
                    alt={user.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                      {user.name}
                    </h3>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      {user.roleTitle}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      อำเภอ{user.districtName}, จังหวัด{user.provinceName}
                    </p>
                  </div>
                </div>

                {/* Login Credentials Box */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5 text-xs text-slate-600 mb-4 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">ชื่อผู้ใช้ (Username):</span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {user.username || '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">รหัสผ่าน (Password):</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {isShowPass ? (user.password || '1234') : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={isShowPass ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        {isShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  {user.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{user.department}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSwitchUser(user.id)}
                  title="สลับมุมมองเข้าใช้งานในฐานะปลัดท่านนี้"
                  className="flex-1 py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  เข้าดูในมุมมองตำบลนี้
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(user)}
                    title="แก้ไขข้อมูลปลัด"
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePalad(user)}
                    title="ลบ / ยกเลิกการมอบหมาย"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredPalads.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">ไม่พบรายชื่อปลัดที่ตรงกับคำค้นหา</h3>
            <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหา หรือกดปุ่มแต่งตั้งปลัดประจำตำบลใหม่</p>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Palad */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold">
                    {editingUser ? 'แก้ไขข้อมูลปลัดประจำตำบล' : 'แต่งตั้งและมอบหมายปลัดประจำตำบล'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    กำหนดพื้นที่รับผิดชอบและรหัสผ่านสำหรับเข้าสู่ระบบ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePalad} className="p-6 space-y-4 text-xs sm:text-sm">
              {/* Role Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ประเภทเจ้าหน้าที่ผู้บันทึกการประชุม <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('tambon_admin');
                      setFormRoleTitle('ปลัดอำเภอประจำตำบล (ผู้รับผิดชอบ 1 คน 1 ตำบล)');
                      setFormDepartment('ที่ทำการปกครองตำบล');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formRole === 'tambon_admin'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">ปลัดประจำตำบล</div>
                    <div className="text-[10px] text-slate-500 font-normal">ดูแล 1 คน 1 ตำบล</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('district_admin');
                      setFormRoleTitle('เลขาอำเภอ / ผู้รับผิดชอบบันทึกการประชุมระดับอำเภอ');
                      setFormDepartment('ที่ทำการปกครองอำเภอ');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formRole === 'district_admin'
                        ? 'bg-blue-50 border-blue-500 text-blue-900 ring-2 ring-blue-500/20 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">เลขาอำเภอ</div>
                    <div className="text-[10px] text-slate-500 font-normal">บันทึกระดับอำเภอ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormRole('province_admin');
                      setFormRoleTitle('เลขาระดับจังหวัด / ผู้รับผิดชอบบันทึกการประชุมระดับจังหวัด');
                      setFormDepartment('สำนักงานจังหวัด (ศาลากลางจังหวัด)');
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      formRole === 'province_admin'
                        ? 'bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-500/20 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs">เลขาจังหวัด</div>
                    <div className="text-[10px] text-slate-500 font-normal">บันทึกระดับจังหวัด</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="เช่น นายสมเกียรติ อับดุลเลาะห์"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ตำแหน่ง / บทบาทหน้าที่ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formRoleTitle}
                    onChange={(e) => setFormRoleTitle(e.target.value)}
                    placeholder="เช่น ปลัดอำเภอประจำตำบล"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    เบอร์โทรศัพท์ติดต่อ
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Jurisdiction assignment */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5 text-blue-800">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  พื้นที่รับผิดชอบที่ต้องการมอบหมาย:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">จังหวัด</label>
                    <select
                      value={formProvinceId}
                      onChange={(e) => setFormProvinceId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs cursor-pointer"
                    >
                      {PROVINCES.map(p => (
                        <option key={p.id} value={p.id}>จังหวัด {p.name}</option>
                      ))}
                    </select>
                  </div>

                  {formRole !== 'province_admin' && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">อำเภอ</label>
                      <select
                        value={formDistrictId}
                        onChange={(e) => {
                          setFormDistrictId(e.target.value);
                          const firstTam = TAMBONS.find(t => t.districtId === e.target.value);
                          if (firstTam) setFormTambonId(firstTam.id);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs cursor-pointer"
                      >
                        {availableDistricts.map(d => (
                          <option key={d.id} value={d.id}>อำเภอ {d.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formRole === 'tambon_admin' && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        ตำบลที่ดูแล (ปลัด 1 คน 1 ตำบล) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formTambonId}
                        onChange={(e) => setFormTambonId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-400 bg-emerald-50/50 text-xs font-semibold text-emerald-900 cursor-pointer"
                      >
                        {availableTambons.map(t => {
                          const isAlreadyAssigned = paladList.some(
                            u => u.role === 'tambon_admin' && u.tambonId === t.id && u.id !== editingUser?.id
                          );
                          return (
                            <option key={t.id} value={t.id}>
                              ตำบล {t.name} {isAlreadyAssigned ? '(มีปลัดดูแลแล้ว)' : '(ว่าง)'}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">สังกัด / ที่ทำการ</label>
                  <input
                    type="text"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="เช่น ที่ทำการปกครองตำบล / อำเภอ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Login credentials */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-blue-600" />
                  บัญชีผู้ใช้งานสำหรับลงชื่อเข้าใช้ (Login Credentials):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      ชื่อผู้ใช้ (Username) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="เช่น nongsaharai"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="เช่น 1234"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">อีเมลราชการ</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="เช่น palad.nongsaharai@gov.my"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {editingUser ? 'บันทึกการแก้ไข' : 'บันทึกและแต่งตั้งปลัด'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
