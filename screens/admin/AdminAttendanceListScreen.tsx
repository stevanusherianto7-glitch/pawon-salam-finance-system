
import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { colors } from '../../theme/colors';
import { AttendanceStatus, UserRole } from '../../types';
import { attendanceApi } from '../../services/api';
import { Loader2, User, CheckCircle, Calendar, Clock, MapPin, Search, ChevronRight, Filter } from 'lucide-react';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

export const AdminAttendanceListScreen = () => {
    const { employees, fetchEmployees } = useEmployeeStore();
    const { history, fetchHistory, isLoading } = useAttendanceStore();

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [topAttendance, setTopAttendance] = useState<any[]>([]);

    useEffect(() => {
        if (employees.length === 0) {
            fetchEmployees();
        }
        // Fetch Top Attendance
        const loadTopAttendance = async () => {
            try {
                // We need to cast attendanceApi to any because we just added the method and TS might not know it yet 
                // if the interface isn't updated. But since we are in the same project, it should be fine if types are inferred.
                // However, to be safe with the tool usage:
                const response = await (attendanceApi as any).getTopAttendance();
                if (response.success) {
                    setTopAttendance(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch top attendance", error);
            }
        };
        loadTopAttendance();

        // Real-time clock
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
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

        // Always filter by selected date (Real-time / Daily view)
        return logDate.getDate() === selectedDate.getDate() &&
            logDate.getMonth() === selectedDate.getMonth() &&
            logDate.getFullYear() === selectedDate.getFullYear();
    });

    // Show all users in the filter bar, except Business Owner
    const monitoredEmployees = employees
        .filter(e => e.role !== UserRole.BUSINESS_OWNER)
        .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans bg-gray-50">
            <BackgroundPattern />

            {/* Header - Glass Style */}
            <div className="relative z-10 pt-10 pb-6 px-6 rounded-b-[2.5rem] shadow-lg overflow-hidden" style={{ background: colors.gradientMain }}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-extrabold text-white mb-1 leading-tight">Monitoring Absensi</h2>
                        <p className="text-white/80 text-xs font-medium tracking-wide">Validasi kehadiran & performa harian</p>
                    </div>
                    <div className="text-right text-white">
                        <p className="text-2xl font-black tracking-tighter">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 px-5 -mt-4 flex-1 flex flex-col pb-24">

                {/* BEST ATTENDANCE WIDGET (New Feature) */}
                {topAttendance.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 shadow-xl mb-5 text-white relative overflow-hidden animate-fade-in-down">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

                        <div className="flex items-center gap-2 mb-3 relative z-10">
                            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <CheckCircle size={16} className="text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold leading-none">Performa Terbaik</h3>
                                <p className="text-[10px] text-white/70">Staff dengan absensi 100% (Bulan Ini)</p>
                            </div>
                        </div>

                        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide relative z-10">
                            {topAttendance.map((emp, index) => (
                                <div key={emp.id} className="flex-shrink-0 flex items-center gap-2 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 min-w-[140px]">
                                    <div className="relative">
                                        <img src={emp.avatarUrl} className="w-8 h-8 rounded-full border border-white/50" alt={emp.name} />
                                        <div className="absolute -top-1 -right-1 bg-yellow-400 text-[8px] font-bold text-yellow-900 px-1 rounded-full shadow-sm">
                                            #{index + 1}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate">{emp.name.split(' ')[0]}</p>
                                        <p className="text-[9px] text-white/60 truncate">{emp.department}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Employee Selector Section */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-white/50 mb-4">
                    <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari karyawan..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-transparent outline-none text-xs font-bold text-gray-700 w-full placeholder:font-medium"
                        />
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {monitoredEmployees.map(emp => {
                            const isSelected = selectedEmployeeId === emp.id;
                            return (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedEmployeeId(emp.id)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all min-w-[90px] ${isSelected
                                        ? 'bg-orange-50 border-orange-200 shadow-md scale-105'
                                        : 'bg-white border-gray-100 hover:bg-gray-50 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <div className={`relative p-0.5 rounded-full ${isSelected ? 'bg-gradient-to-tr from-orange-400 to-red-400' : 'bg-gray-200'}`}>
                                        <img src={emp.avatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-white" alt={emp.name} />
                                        {isSelected && <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white rounded-full w-3 h-3"></div>}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-[10px] font-bold truncate w-full max-w-[80px] ${isSelected ? 'text-gray-800' : 'text-gray-500'}`}>{emp.name.split(' ')[0]}</p>
                                        <p className="text-[8px] text-gray-400 truncate max-w-[80px]">{emp.role.replace('_', ' ')}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Filter & Stats */}
                <div className="flex flex-col gap-3 mb-4 px-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-extrabold text-gray-800">Riwayat Kehadiran</h3>
                            <p className="text-[10px] text-gray-500 font-bold">{selectedEmployee?.name}</p>
                        </div>
                        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-orange-200">
                            Harian
                        </div>
                    </div>

                    {/* Glass Date Picker - Always Visible & Light Theme */}
                    <div className="animate-fade-in-down">
                        <GlassDatePicker
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                            placeholder="Pilih Tanggal Absensi"
                            theme="light"
                        />
                    </div>
                </div>

                {/* Attendance List */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <Loader2 size={24} className="animate-spin text-orange-500" />
                            <span className="text-xs font-bold mt-2">Memuat data...</span>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-3 shadow-sm border border-white/40">
                                <Calendar size={24} className="text-gray-300" />
                            </div>
                            <p className="text-gray-600 font-bold text-sm">Tidak ada data</p>
                            <p className="text-xs text-gray-400 mt-1">Belum ada catatan absensi untuk periode ini.</p>
                        </div>
                    ) : (
                        filteredHistory.map(log => (
                            <div key={log.id} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-white/60 flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-300">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${log.status === AttendanceStatus.LATE ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                                    }`}>
                                    <Clock size={20} strokeWidth={2.5} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-extrabold text-gray-800 text-sm">
                                            {new Date(log.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </h4>
                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${log.status === AttendanceStatus.LATE ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {log.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">Masuk</p>
                                                <p className="text-xs font-bold text-gray-700">{new Date(log.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        {log.checkOutTime && (
                                            <>
                                                <div className="w-px h-6 bg-gray-200"></div>
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                    <div>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Pulang</p>
                                                        <p className="text-xs font-bold text-gray-700">{new Date(log.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};