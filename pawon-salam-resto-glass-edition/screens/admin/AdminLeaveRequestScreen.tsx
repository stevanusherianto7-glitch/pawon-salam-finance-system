
import React, { useState, useEffect } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useLeaveStore } from '../../store/leaveStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Calendar, FileText, ChevronDown, Send, User, Search, FilePlus } from 'lucide-react';
import { LeaveType, UserRole } from '../../types';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

interface Props {
  onBack: () => void;
}

export const AdminLeaveRequestScreen: React.FC<Props> = ({ onBack }) => {
  const { employees, fetchEmployees, isLoading: isLoadingEmps } = useEmployeeStore();
  const { submitRequest, isLoading: isSubmitting } = useLeaveStore();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    type: LeaveType.SICK,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Filter employees (exclude owners/super admins if necessary, though technically they might need leave too)
  const filteredEmployees = employees.filter(e =>
    e.role !== UserRole.BUSINESS_OWNER &&
    e.role !== UserRole.SUPER_ADMIN &&
    (e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      alert('Mohon pilih karyawan terlebih dahulu.');
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return;
    }

    const success = await submitRequest({
      employeeId: selectedEmployeeId,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason
    });

    if (success) {
      alert('Pengajuan izin karyawan berhasil dibuat!');
      onBack();
    } else {
      alert('Gagal mengirim pengajuan.');
    }
  };

  const getTypeLabel = (type: LeaveType) => {
    switch (type) {
      case LeaveType.SICK: return 'Sakit';
      case LeaveType.ANNUAL: return 'Cuti Tahunan';
      case LeaveType.OTHER: return 'Lainnya';
      default: return type;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg leading-tight">Input Cuti Karyawan</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Pengajuan izin atas nama staff</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Employee Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                <User size={12} /> Pilih Karyawan
              </label>

              {/* Simple Search inside Select simulation */}
              <div className="relative">
                {selectedEmployeeId ? (
                  <div
                    onClick={() => setSelectedEmployeeId('')}
                    className="flex items-center justify-between w-full p-3 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-xs">
                        {employees.find(e => e.id === selectedEmployeeId)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{employees.find(e => e.id === selectedEmployeeId)?.name}</p>
                        <p className="text-[10px] text-gray-500">{employees.find(e => e.id === selectedEmployeeId)?.department}</p>
                      </div>
                    </div>
                    <span className="text-xs text-blue-600 font-bold">Ubah</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari nama..."
                        className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-orange-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-inner">
                      {isLoadingEmps ? (
                        <p className="text-center text-xs text-gray-400 py-4">Memuat...</p>
                      ) : filteredEmployees.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 py-4">Tidak ditemukan</p>
                      ) : (
                        filteredEmployees.map(emp => (
                          <div
                            key={emp.id}
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-3"
                          >
                            <img src={emp.avatarUrl} className="w-6 h-6 rounded-full bg-gray-200 object-cover" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-700">{emp.name}</p>
                              <p className="text-[9px] text-gray-400">{emp.department}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-dashed border-gray-200" />

            {/* Leave Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Jenis Izin</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-colors font-medium text-sm"
                >
                  <option value={LeaveType.SICK}>🤒 Sakit</option>
                  <option value={LeaveType.ANNUAL}>🌴 Cuti Tahunan</option>
                  <option value={LeaveType.OTHER}>⚡ Lainnya</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Dari</label>
                <div className="relative">
                  <GlassDatePicker
                    selectedDate={formData.startDate ? new Date(formData.startDate) : null}
                    onChange={(date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setFormData({ ...formData, startDate: `${year}-${month}-${day}` });
                    }}
                    placeholder="Pilih Tanggal"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Sampai</label>
                <div className="relative">
                  <GlassDatePicker
                    selectedDate={formData.endDate ? new Date(formData.endDate) : null}
                    onChange={(date) => {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      setFormData({ ...formData, endDate: `${year}-${month}-${day}` });
                    }}
                    placeholder="Pilih Tanggal"
                  />
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Alasan</label>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Keterangan sakit / keperluan..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-colors text-sm resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedEmployeeId}
              className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: colors.gradientMain }}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FilePlus size={18} /> Ajukan Izin
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
          <FileText size={20} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-800">Catatan Admin</h4>
            <p className="text-[10px] text-blue-600 mt-1">
              Pengajuan ini akan langsung tercatat dengan status <b>PENDING</b> (Menunggu Konfirmasi) atau bisa disesuaikan flow-nya agar langsung <b>APPROVED</b> jika diinginkan (tergantung kebijakan). Saat ini default: Pending.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
