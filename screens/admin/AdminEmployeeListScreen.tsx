
import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { Plus, Search, User, Mail, Phone, Briefcase, X, Save, Shield, Edit2, Eye, KeyRound, Calendar } from 'lucide-react';
import { Employee, UserRole, EmployeeArea } from '../../types';
import { adminApi } from '../../services/api';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

export const AdminEmployeeListScreen = () => {
  const { user, startImpersonation } = useAuthStore();
  const { employees, fetchEmployees, addEmployee, updateEmployee, isLoading } = useEmployeeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '', // Added birthDate
    pin: '', // Added PIN field
    department: '',
    role: UserRole.EMPLOYEE,
    area: EmployeeArea.FOH,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset form when opening for Add
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', birthDate: '', pin: '123456', department: '', role: UserRole.EMPLOYEE, area: EmployeeArea.FOH });
    setIsModalOpen(true);
  };

  // Populate form when opening for Edit
  const handleOpenEdit = (emp: Employee) => {
    if (user?.role !== UserRole.SUPER_ADMIN) {
      alert("Akses Ditolak: Hanya Super Admin yang dapat mengedit data user.");
      return;
    }
    setEditingId(emp.id);
    setFormData({
      name: emp.name,
      email: emp.email,
      phone: emp.phone || '',
      birthDate: emp.birthDate || '', // Populate birthDate
      pin: '', // Don't show existing PIN for security, allow overwrite
      department: emp.department,
      role: emp.role,
      area: emp.area,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const isConfirmed = window.confirm(
      editingId
        ? "Apakah anda yakin ingin menyimpan perubahan data karyawan ini?"
        : "Apakah anda yakin ingin menambahkan karyawan baru?"
    );

    if (!isConfirmed) return;

    let success = false;
    // Clean up empty PIN if editing so we don't overwrite with empty string
    const payload = { ...formData };
    if (editingId && !payload.pin) {
      delete (payload as any).pin;
    }

    if (editingId) {
      success = await updateEmployee(editingId, payload);
    } else {
      success = await addEmployee(payload);
    }

    if (success) {
      alert(editingId ? 'Data karyawan berhasil diperbarui!' : 'Karyawan berhasil ditambahkan!');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', birthDate: '', pin: '', department: '', role: UserRole.EMPLOYEE, area: EmployeeArea.FOH });
      setEditingId(null);
    } else {
      alert('Gagal menyimpan data. Cek kembali inputan.');
    }
  };

  // IMPERSONATION HANDLER
  const handleViewAs = async (targetUser: Employee) => {
    if (user?.role !== UserRole.SUPER_ADMIN) return;

    const confirm = window.confirm(`View app as ${targetUser.name}? You will see exactly what they see.`);
    if (confirm) {
      // 1. Log audit in backend
      await adminApi.logImpersonationStart(user.id, targetUser.id);

      // 2. Switch Context
      startImpersonation(targetUser);
    }
  };

  return (
    <div className="bg-gray-50 pb-24 min-h-screen">
      {/* Header Wrapper - FIXED LAYOUT */}
      <div className="relative">
        {/* Background Header */}
        <div
          className="pt-8 pb-14 px-6 rounded-b-[2.5rem] relative overflow-hidden shadow-md z-10"
          style={{ background: colors.gradientMain }}
        >
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-1">Data Pengguna</h2>
            <p className="text-white/80 text-sm">Kelola user & impersonasi akses</p>
          </div>
        </div>

        {/* Search Bar - MOVED OUTSIDE header to prevent clipping, using negative margin to pull up */}
        <div className="px-6 -mt-7 relative z-20">
          <div className="bg-white rounded-xl flex items-center px-4 py-3 border border-gray-200 shadow-lg">
            <Search size={20} className="text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Cari nama atau divisi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-700 min-w-0"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 space-y-2">
        {/* Add Button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-white active:scale-95 transition-transform shadow-sm hover:shadow-md"
            style={{ background: colors.primary }}
          >
            <Plus size={14} /> Tambah User
          </button>
        </div>

        {/* List - COMPACT MODE */}
        {isLoading && employees.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Memuat data...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Search size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">Tidak ada data ditemukan</p>
          </div>
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-3 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
              {/* Avatar Compact */}
              <div className="relative flex-shrink-0">
                <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full bg-gray-200 object-cover border border-gray-100" />
                {emp.role === UserRole.ADMIN && (
                  <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border border-white">
                    <Shield size={8} className="text-white fill-current" />
                  </div>
                )}
              </div>

              {/* Info Compact */}
              <div className="flex-1 min-w-0 pr-16">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-800 truncate text-sm leading-tight">{emp.name}</h3>
                </div>
                <p className="text-[10px] text-gray-500 truncate mt-0.5">{emp.department}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <a href={`tel:${emp.phone}`} className="flex items-center text-[10px] text-gray-400 hover:text-orange-500">
                    <Phone size={9} className="mr-1" /> {emp.phone || '-'}
                  </a>
                </div>
              </div>

              {/* ACTIONS Compact */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                {/* VIEW AS BUTTON (SUPER ADMIN ONLY) */}
                {user?.role === UserRole.SUPER_ADMIN && emp.id !== user.id && (
                  <button
                    onClick={() => handleViewAs(emp)}
                    className="p-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100"
                    title={`View as ${emp.name}`}
                  >
                    <Eye size={14} />
                  </button>
                )}

                {user?.role === UserRole.SUPER_ADMIN && (
                  <button
                    onClick={() => handleOpenEdit(emp)}
                    className="p-1.5 rounded-full bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors border border-gray-100"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- ADD/EDIT USER MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden border border-gray-200 shadow-2xl">
            <div className="px-5 py-3 border-b flex justify-between items-center" style={{ backgroundColor: colors.primarySoft }}>
              <h3 className="font-bold text-base" style={{ color: colors.textMain }}>
                {editingId ? 'Edit Data User' : 'Tambah User Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-black/5">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Lengkap</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                  <User size={16} className="text-gray-400 mr-2" />
                  <input required type="text" className="flex-1 bg-transparent outline-none text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Email (Login Super Admin)</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                  <Mail size={16} className="text-gray-400 mr-2" />
                  <input required type="email" className="flex-1 bg-transparent outline-none text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">No. HP (Login Staff)</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  <input required type="tel" className="flex-1 bg-transparent outline-none text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Tanggal Lahir</label>
                <GlassDatePicker
                  selectedDate={formData.birthDate ? new Date(formData.birthDate) : undefined}
                  onChange={(date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    setFormData({ ...formData, birthDate: dateStr });
                  }}
                  placeholder="Pilih Tanggal Lahir"
                />
              </div>

              {/* SECURITY SECTION */}
              <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-orange-600 uppercase flex items-center gap-1">
                    <KeyRound size={12} /> PIN Keamanan (Login)
                  </label>
                  <div className="flex items-center border rounded-lg px-3 py-2 bg-white focus-within:border-orange-500 transition-colors">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder={editingId ? "Biarkan kosong jika tidak diubah" : "Buat PIN baru (Default: 123456)"}
                      className="flex-1 bg-transparent outline-none text-sm tracking-widest font-bold text-gray-700"
                      value={formData.pin}
                      onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  {editingId && <p className="text-[9px] text-orange-400 mt-1">*Isi hanya jika ingin mereset PIN karyawan.</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Jabatan/Divisi</label>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:border-orange-500 transition-colors">
                  <Briefcase size={16} className="text-gray-400 mr-2" />
                  <input required type="text" className="flex-1 bg-transparent outline-none text-sm" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Role</label>
                  <select
                    className="w-full border rounded-lg px-2 py-2 bg-gray-50 text-xs outline-none h-[38px]"
                    value={formData.role}
                    onChange={e => {
                      const newRole = e.target.value as UserRole;
                      // Auto-set area to MANAGEMENT if role is not EMPLOYEE
                      let newArea = formData.area;
                      if (newRole !== UserRole.EMPLOYEE) {
                        newArea = EmployeeArea.MANAGEMENT;
                      }
                      setFormData({ ...formData, role: newRole, area: newArea });
                    }}
                  >
                    <option value={UserRole.EMPLOYEE}>Staff</option>
                    <option value={UserRole.RESTAURANT_MANAGER}>Restaurant Manager</option>
                    <option value={UserRole.HR_MANAGER}>HR Manager</option>
                    <option value={UserRole.FINANCE_MANAGER}>Finance Manager</option>
                    <option value={UserRole.MARKETING_MANAGER}>Marketing Manager</option>
                    <option value={UserRole.BUSINESS_OWNER}>Business Owner</option>
                    <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Area</label>
                  <select className="w-full border rounded-lg px-2 py-2 bg-gray-50 text-xs outline-none h-[38px]" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value as EmployeeArea })}>
                    <option value={EmployeeArea.FOH}>FOH (Front of House)</option>
                    <option value={EmployeeArea.BOH}>BOH (Back of House)</option>
                    <option value={EmployeeArea.MANAGEMENT}>Management</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full mt-4 py-2.5 rounded-xl font-bold text-white flex justify-center items-center active:scale-95 transition-all text-sm shadow-lg" style={{ background: colors.gradientMain }}>
                {isLoading ? 'Menyimpan...' : <><Save size={16} className="mr-2" /> {editingId ? 'Simpan Perubahan' : 'Simpan Data'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
