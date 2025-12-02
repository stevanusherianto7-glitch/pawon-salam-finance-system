
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
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-base leading-tight">Input Cuti Karyawan</h2>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5">Pengajuan izin atas nama staff</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-6">

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Employee Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1">
                <User size={10} /> Pilih Karyawan
              </label>

              {/* Simple Search inside Select simulation */}
              <div className="relative">
                {selectedEmployeeId ? (
                  <div
                    onClick={() => setSelectedEmployeeId('')}
                    className="flex items-center justify-between w-full p-2.5 bg-blue-50 border border-blue-200 rounded-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold text-[10px]">
                        {employees.find(e => e.id === selectedEmployeeId)?.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{employees.find(e => e.id === selectedEmployeeId)?.name}</p>
                        <p className="text-[9px] text-gray-500">{employees.find(e => e.id === selectedEmployeeId)?.department}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-blue-600 font-bold">Ubah</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari nama..."
                        className="w-full pl-9 p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:border-orange-500 outline-none"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-xl bg-white shadow-inner">
                      {isLoadingEmps ? (
                        <p className="text-center text-[10px] text-gray-400 py-3">Memuat...</p>
                      ) : filteredEmployees.length === 0 ? (
                        <p className="text-center text-[10px] text-gray-400 py-3">Tidak ditemukan</p>
                      ) : (
                        filteredEmployees.map(emp => (
                          <div
                            key={emp.id}
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className="p-2 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-center gap-2"
                          >
                            <img src={emp.avatarUrl} className="w-5 h-5 rounded-full bg-gray-200 object-cover" />
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-gray-700">{emp.name}</p>
                              <p className="text-[8px] text-gray-400">{emp.department}</p>
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
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Jenis Izin</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-colors font-medium text-xs"
                >
                  <option value={LeaveType.SICK}>🤒 Sakit</option>
                  <option value={LeaveType.ANNUAL}>🌴 Cuti Tahunan</option>
                  <option value={LeaveType.OTHER}>⚡ Lainnya</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Dari</label>
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
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Sampai</label>
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
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Alasan</label>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Keterangan sakit / keperluan..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-colors text-xs resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedEmployeeId}
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              style={{ background: colors.gradientMain }}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <FilePlus size={16} /> Ajukan Izin
                </>
              )}
            </button>
          </form>
        </div>

        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2.5 items-start">
          <FileText size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-[10px] font-bold text-blue-800">Catatan Admin</h4>
            <p className="text-[9px] text-blue-600 mt-0.5">
              Pengajuan ini akan langsung tercatat dengan status <b>PENDING</b> (Menunggu Konfirmasi) atau bisa disesuaikan flow-nya agar langsung <b>APPROVED</b> jika diinginkan (tergantung kebijakan). Saat ini default: Pending.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
