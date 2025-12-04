

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
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 pb-24 relative">
      {/* Header */}
      <div
        className="px-6 pt-10 pb-10 rounded-b-[2.5rem] shadow-2xl shadow-slate-900/10 relative z-0 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-2">
            <button onClick={onBack} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 active:scale-95 transition-all duration-300">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold tracking-tight">Pengajuan Izin</h2>
          </div>
          <p className="text-slate-200 text-xs pl-11 opacity-90 font-medium">Isi formulir untuk mengajukan cuti atau izin.</p>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-6">

        {/* FORM CARD */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 p-4 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Leave Type */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Jenis Izin</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as LeaveType })}
                  className="w-full appearance-none bg-slate-50 border-2 border-slate-200 text-slate-700 py-2.5 px-3 pr-8 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium text-xs"
                >
                  <option value={LeaveType.SICK}>🤒 Sakit</option>
                  <option value={LeaveType.ANNUAL}>🌴 Cuti Tahunan</option>
                  <option value={LeaveType.OTHER}>⚡ Lainnya</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Dari Tanggal</label>
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
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Sampai</label>
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
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Alasan / Keterangan</label>
              <textarea
                required
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Jelaskan alasan pengajuan anda secara detail..."
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-700 py-2.5 px-3 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-xs resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex justify-center items-center gap-2 mt-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm tracking-tight">
            <FileText size={18} className="text-orange-500" /> Riwayat Pengajuan
          </h3>

          <div className="space-y-2.5">
            {isLoading && requests.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">Memuat riwayat...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
                {/* Empty State Illustration */}
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <FileText size={48} className="text-slate-300" strokeWidth={1.5} />
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-2 tracking-tight">Belum Ada Riwayat</h4>
                <p className="text-sm text-slate-500 font-medium">Pengajuan izin Anda akan muncul di sini.</p>
              </div>
            ) : (
              requests.map((item) => (
                <div key={item.id} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-md shadow-slate-200/50 flex flex-col gap-2 hover:shadow-lg hover:-translate-y-0.5 active:scale-98 transition-all duration-300">
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
