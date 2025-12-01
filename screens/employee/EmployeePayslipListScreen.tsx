import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePayrollStore } from '../../store/payrollStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, DollarSign, ChevronRight, Calendar, Banknote, FileText } from 'lucide-react';

interface Props {
  onBack: () => void;
  onNavigate: (screen: string, params?: any) => void;
}

export const EmployeePayslipListScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
  const { user } = useAuthStore();
  const { payslips, fetchPayslips, isLoading } = usePayrollStore();

  // State for filtering
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      // The mock API returns all payslips, so we fetch once and then filter on the client.
      // In a real app, the API would handle filtering by user ID.
      fetchPayslips(user.role, user.id);
    }
  }, [user]);

  const filteredPayslips = payslips.filter(slip => {
    return slip.employeeId === user?.id &&
      slip.periodYear === selectedYear &&
      slip.isVisibleToEmployee === true; // SECURITY FILTER: Only show what's meant for them
  });

  const handleSelectPayslip = (id: string) => {
    onNavigate('employeePayslipDetail', { payslipId: id });
  };

  return (
    <div className="bg-gray-50 pb-24 min-h-screen">
      {/* Header */}
      <div
        className="pt-8 pb-8 px-4 rounded-b-[2.5rem] shadow-md relative z-0 overflow-hidden"
        style={{ background: colors.gradientMain }}
      >
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-2">
            <button onClick={onBack} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><Banknote size={16} /></div>
              <h2 className="text-lg font-bold">Slip Gaji Saya</h2>
            </div>
          </div>
          <p className="text-orange-100 text-xs pl-10 opacity-90">Riwayat pendapatan Anda di Pawon Salam.</p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-3">
        {/* Filter Card */}
        <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-orange-50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-500 uppercase">Pilih Tahun</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            className="bg-gray-50 border rounded-lg px-2 py-1.5 text-xs outline-none"
          >
            <option value={2023}>2023</option>
            <option value={2024}>2024</option>
          </select>
        </div>

        {/* List */}
        <div className="space-y-2.5">
          {isLoading && payslips.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Memuat riwayat...</div>
          ) : filteredPayslips.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <FileText size={28} className="mx-auto mb-2 opacity-20 text-gray-300" />
              <p className="text-xs font-medium text-gray-500">Tidak ada slip gaji.</p>
              <p className="text-[10px] text-gray-400">Slip gaji untuk tahun {selectedYear} tidak ditemukan.</p>
            </div>
          ) : (
            filteredPayslips.map(slip => (
              <button
                key={slip.id}
                onClick={() => handleSelectPayslip(slip.id)}
                className="w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-left active:scale-98 transition-transform hover:border-orange-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex flex-col items-center justify-center border border-orange-100">
                    <span className="text-[9px] font-bold uppercase">{new Date(0, slip.periodMonth - 1).toLocaleDateString('id-ID', { month: 'short' })}</span>
                    <span className="text-base font-bold">{slip.periodYear}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">Gaji Periode {new Date(0, slip.periodMonth - 1).toLocaleDateString('id-ID', { month: 'long' })}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Total Diterima: <span className="font-bold text-green-600">Rp {slip.netSalary.toLocaleString('id-ID')}</span></p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};