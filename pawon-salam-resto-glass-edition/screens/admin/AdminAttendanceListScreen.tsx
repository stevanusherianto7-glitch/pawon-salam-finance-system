
import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { colors } from '../../theme/colors';
import { AttendanceStatus, UserRole } from '../../types';
import { Loader2, User, CheckCircle } from 'lucide-react';

type FilterType = 'WEEK' | 'MONTH';

export const AdminAttendanceListScreen = () => {
  const { employees, fetchEmployees } = useEmployeeStore();
  const { history, fetchHistory, isLoading } = useAttendanceStore();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('MONTH');

  useEffect(() => {
    if (employees.length === 0) {
      fetchEmployees();
    }
  }, []);

  useEffect(() => {
    // Set default selected employee to the first one in the list
    if (employees.length > 0 && !selectedEmployeeId) {
      const firstEmployee = employees.find(e => e.role !== UserRole.BUSINESS_OWNER);
      if (firstEmployee) {
        setSelectedEmployeeId(firstEmployee.id);
      }
    }
  }, [employees]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchHistory(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const filteredHistory = history.filter((log) => {
    const [year, month, day] = log.date.split('-').map(Number);
    const logDate = new Date(year, month - 1, day);
    const now = new Date();
    
    if (filterType === 'WEEK') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return logDate >= oneWeekAgo && logDate <= now;
    }
    if (filterType === 'MONTH') {
        return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Show all users in the filter bar, except Business Owner
  const monitoredEmployees = employees.filter(e => e.role !== UserRole.BUSINESS_OWNER);

  return (
    <div className="bg-gray-50 h-full flex flex-col">
       {/* Header from screenshot - Employee list is removed from here */}
       <div className="pt-12 pb-6 px-6 rounded-b-[2.5rem] shadow-lg relative flex-shrink-0 overflow-hidden" style={{ background: colors.gradientMain }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-1 font-heading">Monitoring Absensi</h2>
              <p className="text-white/80 text-sm">Validasi kehadiran & performa harian</p>
            </div>
       </div>
       
       {/* Content Area */}
       <div className="px-5 py-5 flex-1 flex flex-col overflow-hidden">
            
            {/* Employee Selector (Vertical List) */}
            <div className="mb-4 flex-shrink-0">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">Pilih Karyawan</h3>
                <div className="space-y-2 h-48 overflow-y-auto pr-2 border-b border-gray-100 pb-2">
                    {employees.length === 0 && (
                        <div className="text-gray-400 text-xs p-2">Memuat karyawan...</div>
                    )}
                    {monitoredEmployees.map(emp => {
                        const isSelected = selectedEmployeeId === emp.id;
                        return (
                            <button 
                                key={emp.id}
                                onClick={() => setSelectedEmployeeId(emp.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                    isSelected 
                                    ? 'bg-orange-50 border-orange-200 shadow-sm' 
                                    : 'bg-white border-gray-100 hover:bg-gray-50'
                                }`}
                            >
                                <img src={emp.avatarUrl} className="w-9 h-9 rounded-full bg-gray-200 object-cover flex-shrink-0" alt={emp.name}/>
                                <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-orange-800' : 'text-gray-800'}`}>
                                        {emp.name}
                                    </span>
                                    <p className="text-xs text-gray-500 truncate">{emp.department}</p>
                                </div>
                                {isSelected && <CheckCircle size={18} className="text-orange-500 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Time Filter */}
            <div className="bg-gray-100 p-1 rounded-full flex my-4 shadow-inner flex-shrink-0">
                 <button 
                    onClick={() => setFilterType('WEEK')} 
                    className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
                        filterType === 'WEEK' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                    }`}>
                     Minggu Ini
                 </button>
                 <button 
                    onClick={() => setFilterType('MONTH')} 
                    className={`flex-1 py-2 text-sm font-bold rounded-full transition-all ${
                        filterType === 'MONTH' ? 'bg-white shadow text-orange-600' : 'text-gray-500'
                    }`}>
                     Bulan Ini
                 </button>
            </div>

            {/* List or Empty State */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm">Memuat data absensi...</span>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 font-medium">
                        <p>Belum ada data absensi.</p>
                        <p className="text-xs mt-1">Tidak ada catatan untuk periode ini.</p>
                    </div>
                ) : (
                    <div className="w-full space-y-3">
                        {filteredHistory.map(log => (
                            <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center animate-fade-in">
                                <div>
                                    <p className="font-bold text-gray-800">{new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Check In: <span className="font-medium">{new Date(log.checkInTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                                        {log.checkOutTime && ` • Check Out: `}
                                        {log.checkOutTime && <span className="font-medium">{new Date(log.checkOutTime).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>}
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.status === AttendanceStatus.LATE ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{log.status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};