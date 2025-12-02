

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, FileText, ChevronDown, Send, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { colors } from '../../theme/colors';
import { LeaveType, LeaveStatus } from '../../types';
import { useLeaveStore } from '../../store/leaveStore';
import { useAuthStore } from '../../store/authStore';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

interface LeaveRequestScreenProps {
  onBack: () => void;
}

export const LeaveRequestScreen: React.FC<LeaveRequestScreenProps> = ({ onBack }) => {
  const { user } = useAuthStore();
  const { requests, isLoading, fetchRequests, submitRequest } = useLeaveStore();

  const [formData, setFormData] = useState({
    type: LeaveType.SICK,
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    if (user) {
      fetchRequests(user.id);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic validation
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert('Tanggal selesai tidak boleh sebelum tanggal mulai.');
      return;
    }

    const success = await submitRequest({
      employeeId: user.id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason
    });

    if (success) {
      alert('Pengajuan izin berhasil dikirim!');
      setFormData({ type: LeaveType.SICK, startDate: '', endDate: '', reason: '' });
    } else {
      alert('Gagal mengirim pengajuan.');
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 text-green-600 text-[10px] font-bold border border-green-100">
            <CheckCircle2 size={10} /> Disetujui
          </span>
        );
      case LeaveStatus.REJECTED:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-bold border border-red-100">
            <XCircle size={10} /> Ditolak
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 text-orange-600 text-[10px] font-bold border border-orange-100">
            <Clock size={10} /> Menunggu
          </span>
        );
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
    <div className="bg-gray-50 pb-24 relative">
      {/* Header */}
      <div
        className="px-6 pt-10 pb-10 rounded-b-[2.5rem] shadow-md relative z-0 overflow-hidden"
        style={{ background: colors.gradientMain }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-2">
            <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold">Pengajuan Izin</h2>
          </div>
          <p className="text-orange-100 text-xs pl-11 opacity-90">Isi formulir untuk mengajukan cuti atau izin.</p>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-6">

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-orange-50">
          <form onSubmit={handleSubmit} className="space-y-3">

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
                <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Dari Tanggal</label>
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
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Alasan / Keterangan</label>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Jelaskan alasan pengajuan anda secara detail..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-colors text-xs resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 mt-1"
              style={{ background: colors.gradientMain, boxShadow: colors.shadowOrange }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} /> <span className="text-xs">Kirim Pengajuan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* HISTORY SECTION */}
        <div>
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm">
            <FileText size={18} className="text-orange-500" /> Riwayat Pengajuan
          </h3>

          <div className="space-y-2.5">
            {isLoading && requests.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">Memuat riwayat...</div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <p className="text-[10px]">Belum ada riwayat pengajuan.</p>
              </div>
            ) : (
              requests.map((item) => (
                <div key={item.id} className="bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-2 active:scale-98 transition-transform">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${item.type === LeaveType.SICK ? 'text-red-600' : item.type === LeaveType.ANNUAL ? 'text-blue-600' : 'text-gray-700'}`}>
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <Calendar size={10} />
                    <span>
                      {new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(item.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mt-0.5">
                    <p className="text-[10px] text-gray-600 italic line-clamp-2">"{item.reason}"</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
