import React, { useState } from 'react';
import { CommitteeMember } from '../types';
import { getStoredCommittees, saveStoredCommittees } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { showDeleteConfirm, showSuccessToast } from '../utils/alerts';
import { Users, Plus, Trash2, Save, X, UserCheck } from 'lucide-react';

export const CommitteeManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [members, setMembers] = useState<CommitteeMember[]>(() => getStoredCommittees());
  const [isAdding, setIsAdding] = useState(false);

  // New member form
  const [title, setTitle] = useState('Encik');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('Ahli Jawatankuasa');
  const [roleInMeeting, setRoleInMeeting] = useState<CommitteeMember['roleInMeeting']>('member');
  const [organization, setOrganization] = useState(
    currentUser?.department || 'Majlis Pentadbiran Mukim'
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    const newMem: CommitteeMember = {
      id: `mem-${Date.now()}`,
      title,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      position: position.trim(),
      roleInMeeting,
      organization: organization.trim(),
      isPermanent: true
    };

    const updated = [...members, newMem];
    setMembers(updated);
    saveStoredCommittees(updated);
    showSuccessToast('Berjaya', `${newMem.title} ${newMem.firstName} ${newMem.lastName} telah ditambah sebagai ahli kuorum tetap.`);

    // Reset
    setFirstName('');
    setLastName('');
    setIsAdding(false);
  };

  const handleRemoveMember = async (mem: CommitteeMember) => {
    const confirmed = await showDeleteConfirm(`${mem.title} ${mem.firstName} ${mem.lastName}`);
    if (confirmed) {
      const updated = members.filter((m) => m.id !== mem.id);
      setMembers(updated);
      saveStoredCommittees(updated);
      showSuccessToast('Berjaya', 'Rekod ahli telah dipadamkan.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Senarai Ahli Jawatankuasa Kuorum Tetap (Permanent Committee Registry)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar senarai nama ahli majlis atau ketua jabatan tetap untuk semakan kuorum pantas secara automatik
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Ahli Tetap</span>
        </button>
      </div>

      {/* Add New Member Modal/Drawer */}
      {isAdding && (
        <form
          onSubmit={handleAddMember}
          className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-blue-200 pb-2">
            <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Pendaftaran Ahli Jawatankuasa Baharu
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Gelaran</label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="Tuan">Tuan</option>
                <option value="Puan">Puan</option>
                <option value="Cik">Cik</option>
                <option value="Encik">Encik</option>
                <option value="Dato'">Dato'</option>
                <option value="Dr.">Dr.</option>
                <option value="Supt.">Supt.</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Pertama</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nama"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama Keluarga / Bapa</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Nama Bapa / Keluarga"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Peranan Mesyuarat</label>
              <select
                value={roleInMeeting}
                onChange={(e) => setRoleInMeeting(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              >
                <option value="chairman">Pengerusi Mesyuarat</option>
                <option value="vice_chairman">Naib Pengerusi Mesyuarat</option>
                <option value="member">Ahli Jawatankuasa</option>
                <option value="secretary">Setiausaha Mesyuarat</option>
                <option value="assistant_secretary">Penolong Setiausaha</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Jawatan Rasmi</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Contoh: Ketua Kampung Zon 1 / Pegawai Kesihatan"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Jabatan / Agensi / Kawasan</label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Contoh: Majlis Tindakan Komuniti Mukim"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Ahli
            </button>
          </div>
        </form>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Jumlah Kuorum Berdaftar: <strong>{members.length}</strong> orang</span>
          <span>Had Minima Cukup Kuorum (Lebih separuh): <strong>{Math.floor(members.length / 2) + 1}</strong> orang</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">Bil.</th>
                <th className="py-2.5 px-3">Nama Penuh</th>
                <th className="py-2.5 px-3">Jawatan Rasmi</th>
                <th className="py-2.5 px-3">Peranan Mesyuarat</th>
                <th className="py-2.5 px-3">Jabatan / Agensi</th>
                <th className="py-2.5 px-3 text-center w-16">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((mem, idx) => (
                <tr key={mem.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {mem.title} {mem.firstName} {mem.lastName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{mem.position}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                      {mem.roleInMeeting === 'chairman'
                        ? 'Pengerusi'
                        : mem.roleInMeeting === 'vice_chairman'
                        ? 'Naib Pengerusi'
                        : mem.roleInMeeting === 'secretary'
                        ? 'Setiausaha'
                        : 'Ahli Jawatankuasa'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{mem.organization}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleRemoveMember(mem)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 cursor-pointer"
                      title="Padam rekod ahli"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
