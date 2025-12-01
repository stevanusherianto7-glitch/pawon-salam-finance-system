




import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { LogOut, Calendar, ClipboardList, TrendingUp, DollarSign, Utensils, Megaphone, Users, ChevronRight, Clock, UserPlus, Eye, Banknote, Camera, CheckSquare, TrendingDown, PieChart, AlertTriangle, Activity, Star, Crown, Filter, Download, Award, Trophy, FilePlus, Settings } from 'lucide-react';
import { attendanceApi, employeeApi, jobdeskApi, performanceApi, ownerApi } from '../../services/api';
import { AttendanceLog, AttendanceStatus, UserRole, Employee, EmployeeArea, OwnerDashboardData, TrendData, DashboardAnalytics, EmployeeOfTheMonth } from '../../types';
import { colors } from '../../theme/colors';
import { useNotificationStore } from '../../store/notificationStore';
import { PeriodFilter } from '../../components/PeriodFilter';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';

interface AdminDashboardProps {
    onNavigate?: (screen: string) => void;
}

const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
        case UserRole.RESTAURANT_MANAGER: return 'Restaurant Manager';
        case UserRole.HR_MANAGER: return 'HR Manager';
        case UserRole.FINANCE_MANAGER: return 'Finance Manager';
        case UserRole.MARKETING_MANAGER: return 'Marketing Manager';
        case UserRole.BUSINESS_OWNER: return 'Business Owner';
        case UserRole.SUPER_ADMIN: return 'Super Admin';
        default: return 'Admin';
    }
};

export const AdminDashboardScreen: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const { user, logout, impersonateByPhone, isLoading: authLoading, isImpersonating, updateUser } = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { employees, fetchEmployees } = useEmployeeStore();
    const { showSpecialNotification } = useNotificationStore();

    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [targetPhone, setTargetPhone] = useState('');
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [eotm, setEotm] = useState<EmployeeOfTheMonth | null>(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const isManagerWithPerformanceView = user && [UserRole.HR_MANAGER, UserRole.RESTAURANT_MANAGER, UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER, UserRole.BUSINESS_OWNER].includes(user.role);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (employees.length === 0) await fetchEmployees();

            if (isManagerWithPerformanceView) {
                const [statsRes, eotmRes] = await Promise.all([
                    performanceApi.getDashboardStats(month, year),
                    performanceApi.getEmployeeOfTheMonth(month, year)
                ]);
                if (statsRes.success && statsRes.data) setAnalytics(statsRes.data);
                if (eotmRes.success && eotmRes.data) setEotm(eotmRes.data);
            } else {
                const [logsRes] = await Promise.all([attendanceApi.getAllToday()]);
                if (logsRes?.success && logsRes.data) setLogs(logsRes.data);
            }

            const birthdayRes = await employeeApi.getBirthdays();
            if (birthdayRes.success && birthdayRes.data?.length) {
                const othersBday = user ? birthdayRes.data.filter(e => e.id !== user.id) : birthdayRes.data;

                if (othersBday.length > 0) {
                    const othersIds = othersBday.map(e => e.id);
                    const isDismissed = useNotificationStore.getState().checkBirthdayDismissal(othersIds);

                    if (!isDismissed) {
                        const names = othersBday.map(e => e.name.split(' ')[0]).join(' & ');
                        const message = othersBday.length > 1 ? `🎂 Hari ini ${names} berulang tahun!` : `🎂 Hari ini ${names} berulang tahun! Ucapkan selamat!`;
                        showSpecialNotification(message, 'birthday', { employeeIds: othersIds });
                    }
                }
            }
            setLoading(false);
        }
        loadData();
    }, [user, month, year]);

    const handleAvatarClick = () => fileInputRef.current?.click();
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => updateUser({ avatarUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const handleImpersonate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!targetPhone) return;
        const result = await impersonateByPhone(targetPhone);
        if (!result.success) alert(result.message || 'Gagal masuk sebagai user tersebut.');
        else setTargetPhone('');
    };

    const stats = {
        present: logs.filter(l => l.status === AttendanceStatus.PRESENT).length,
        late: logs.filter(l => l.status === AttendanceStatus.LATE).length,
    };

    const handlePeriodChange = (period: { month: number; year: number }) => {
        setMonth(period.month);
        setYear(period.year);
    };

    return (
        <div className="pb-32 bg-gray-50 min-h-screen">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {user?.role === UserRole.BUSINESS_OWNER ? (
                <div className="pt-10 pb-20 px-4 rounded-b-[3rem] relative overflow-hidden bg-[#0B0F19] shadow-2xl">
                    <div className="absolute top-[-50%] left-1/2 transform -translate-x-1/2 w-[150%] h-[100%] bg-gradient-to-b from-amber-600/20 via-amber-900/5 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                    <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0F19]/80 to-[#0B0F19] pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="bg-gradient-to-br from-gray-900/90 to-black/80 backdrop-blur-xl rounded-2xl p-4 border border-amber-500/20 shadow-xl relative group overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50"></div>
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <div className="p-[2px] rounded-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-700 shadow-lg shadow-amber-900/40">
                                        <img src={user?.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover border-2 border-black cursor-pointer" onClick={handleAvatarClick} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Crown size={12} className="text-amber-400 fill-amber-400/20" />
                                        <p className="text-[9px] font-bold text-amber-500 uppercase tracking-[0.2em]">Executive</p>
                                    </div>
                                    <p className="text-base font-bold text-white leading-tight">{user?.name}</p>
                                </div>
                                <button onClick={logout} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 border border-white/5"><LogOut size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="pt-10 pb-20 px-4 rounded-b-[2.5rem] relative overflow-hidden" style={{ background: colors.gradientMain }}>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
                    <div className="relative bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0" onClick={handleAvatarClick}>
                                <img src={user?.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full border-2 border-white object-cover bg-white/20" />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm"><Camera size={10} className="text-orange-600" /></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-orange-100 uppercase tracking-widest">Admin Panel</p>
                                <h2 className="text-lg font-bold text-white truncate">{user?.name}</h2>
                                <span className="text-[9px] text-white font-medium bg-white/20 px-2 py-0.5 rounded-full border border-white/20">{getRoleDisplayName(user?.role || UserRole.ADMIN)}</span>
                            </div>
                            <button onClick={logout} className="p-2 bg-black/20 hover:bg-black/30 rounded-full text-white backdrop-blur-sm border border-white/10"><LogOut size={16} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONTENT --- */}
            {user?.role === UserRole.BUSINESS_OWNER ? (
                <div className="px-4 -mt-16 relative z-10 space-y-4">
                    {/* BENTO GRID MENU - PREMIUM GLASS STYLE */}
                    <div className="grid grid-cols-2 gap-3">
                        <PremiumGlassCard title="Keuangan" subtitle="Laporan Finansial" icon={DollarSign} onClick={() => onNavigate && onNavigate('reportFinancial')} themeColor="green" />
                        <PremiumGlassCard title="Pendapatan" subtitle="Grafik Mingguan" icon={Activity} onClick={() => onNavigate && onNavigate('reportRevenueCost')} themeColor="blue" />
                        <PremiumGlassCard title="Operasional" subtitle="Efisiensi Resto" icon={Utensils} onClick={() => onNavigate && onNavigate('reportOperational')} themeColor="orange" />
                        <PremiumGlassCard title="Kinerja Tim" subtitle="Analisa SDM" icon={Users} onClick={() => onNavigate && onNavigate('reportHR')} themeColor="purple" />
                        <PremiumGlassCard title="Monitoring Harian" subtitle="Checklist & Jobdesk Staff" icon={Eye} onClick={() => onNavigate && onNavigate('hrDailyMonitorHub')} themeColor="teal" />
                    </div>

                    {/* Performance Summary */}
                    <div className="space-y-3">
                        {eotm && (
                            <div onClick={() => onNavigate && onNavigate('certificate')} className="bg-gradient-to-br from-white to-amber-100 rounded-2xl p-4 border border-amber-200/50 flex items-center justify-between cursor-pointer active:scale-98 transition-transform hover:shadow-xl hover:-translate-y-1">
                                <div className="flex items-center gap-4">
                                    <img src={eotm.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-orange-100" />
                                    <div>
                                        <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Employee of the Month</p>
                                        <p className="font-bold text-base text-gray-800">{eotm.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Download Sertifikat</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <span className="text-xl font-bold text-gray-800">{eotm.avgScore}</span>
                                        <span className="text-[10px] text-gray-400 block -mt-1">Score</span>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-300" />
                                </div>
                            </div>
                        )}

                        {analytics && (
                            <div className="bg-white/80 backdrop-blur-lg p-3 rounded-2xl border border-white/50 shadow-md flex items-center justify-between">
                                <div className="flex-1 text-center border-r border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Rata-rata FOH</p>
                                    <p className="text-xl font-bold text-blue-600">{analytics.fohAverage}</p>
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Rata-rata BOH</p>
                                    <p className="text-xl font-bold text-orange-600">{analytics.bohAverage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : user?.role === UserRole.SUPER_ADMIN ? (
                <div className="px-5 -mt-12 relative z-30 space-y-4">
                    {/* COMPACT IMPERSONATE BOX */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-xs flex items-center gap-2"><Users size={14} /> Impersonate User</h3>
                            <div className="bg-green-500/20 px-2 py-0.5 rounded text-[9px] font-bold border border-green-500/30 text-green-300">Active</div>
                        </div>
                        <form onSubmit={handleImpersonate} className="flex flex-col gap-2">
                            <input type="text" placeholder="Nomor HP" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-500/50 text-white placeholder-white/30" value={targetPhone} onChange={(e) => setTargetPhone(e.target.value)} />
                            <button type="submit" disabled={authLoading || targetPhone.length < 8} className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-bold text-xs shadow-lg disabled:opacity-50">LOGIN AS USER</button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">System Tools</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <PremiumGlassCard title="Kelola User" subtitle="Database Staff" icon={Users} onClick={() => onNavigate && onNavigate('adminEmployees')} themeColor="purple" />
                            <PremiumGlassCard title="System" subtitle="App Config" icon={Settings} onClick={() => onNavigate && onNavigate('systemSettings')} themeColor="teal" />
                            <PremiumGlassCard title="Audit Logs" subtitle="Riwayat Aksi" icon={ClipboardList} onClick={() => onNavigate && onNavigate('auditLogs')} themeColor="blue" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-4 -mt-8 relative z-10 space-y-4">
                    <div className={`sticky ${isImpersonating ? 'top-12' : 'top-0'} z-20 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center`}>
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase"><Filter size={12} /> Periode</div>
                        <PeriodFilter onPeriodChange={handlePeriodChange} />
                    </div>

                    {/* Quick Actions Grid - PREMIUM GLASS STYLE */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 text-xs uppercase tracking-wider">Menu Utama</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {user?.role === UserRole.HR_MANAGER && <>
                                <PremiumGlassCard title="Payroll" subtitle="Slip Gaji" icon={Banknote} onClick={() => onNavigate && onNavigate('payslipList')} themeColor="green" />
                                <PremiumGlassCard title="Shift" subtitle="Penjadwalan Staff" icon={Calendar} onClick={() => onNavigate && onNavigate('shiftScheduler')} themeColor="blue" />
                                <PremiumGlassCard title="SP/Coach" subtitle="Catatan HR" icon={Users} onClick={() => onNavigate && onNavigate('hrSpCoachingForm')} themeColor="red" />
                                <PremiumGlassCard title="Cuti" subtitle="Izin Karyawan" icon={FilePlus} onClick={() => onNavigate && onNavigate('adminLeaveRequest')} themeColor="teal" />
                                <PremiumGlassCard title="Monitoring Harian" subtitle="Checklist & Jobdesk" icon={Eye} onClick={() => onNavigate && onNavigate('hrDailyMonitorHub')} themeColor="purple" />
                            </>}
                            {user?.role === UserRole.RESTAURANT_MANAGER && <>
                                <PremiumGlassCard title="Checklist" subtitle="Performa Harian" icon={CheckSquare} onClick={() => onNavigate && onNavigate('dailyChecklistList')} themeColor="orange" />
                                <PremiumGlassCard title="Shift" subtitle="Jadwal Staff" icon={Calendar} onClick={() => onNavigate && onNavigate('shiftScheduler')} themeColor="blue" />
                                <PremiumGlassCard title="Cuti" subtitle="Input Izin" icon={FilePlus} onClick={() => onNavigate && onNavigate('adminLeaveRequest')} themeColor="teal" />
                                <PremiumGlassCard title="Monitoring" subtitle="Laporan Staff" icon={AlertTriangle} onClick={() => onNavigate && onNavigate('jobdeskMonitor')} themeColor="red" />
                            </>}
                            {user?.role === UserRole.FINANCE_MANAGER && <>
                                <PremiumGlassCard title="Insentif" subtitle="Bonus & Lembur" icon={Banknote} onClick={() => onNavigate && onNavigate('financePanel')} themeColor="green" />
                                <PremiumGlassCard title="Review" subtitle="Cek Slip Gaji" icon={ClipboardList} onClick={() => onNavigate && onNavigate('payslipList')} themeColor="blue" />
                            </>}
                            {user?.role === UserRole.MARKETING_MANAGER && <>
                                <PremiumGlassCard title="Campaign" subtitle="Promosi & Iklan" icon={Megaphone} onClick={() => onNavigate && onNavigate('marketingPanel')} themeColor="purple" />
                            </>}
                        </div>
                    </div>

                    {/* Stats & Reports */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onNavigate && onNavigate('hrTrendReport')} className="p-3 bg-yellow-50 text-yellow-800 rounded-xl text-[10px] font-bold border border-yellow-100 flex items-center justify-center gap-2 hover:bg-yellow-100 shadow-sm">
                                <TrendingUp size={14} /> Laporan Tren
                            </button>
                            <button onClick={() => onNavigate && onNavigate('hrTopPerformance')} className="p-3 bg-purple-50 text-purple-800 rounded-xl text-[10px] font-bold border border-purple-100 flex items-center justify-center gap-2 hover:bg-purple-100 shadow-sm">
                                <Users size={14} /> Top Performance
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-4 text-xs text-gray-400">Loading stats...</div>
                        ) : (
                            <>
                                {eotm && (
                                    <div onClick={() => onNavigate && onNavigate('certificate')} className="bg-gradient-to-br from-white to-amber-100 rounded-2xl p-4 border border-amber-200/50 flex items-center justify-between cursor-pointer active:scale-98 transition-transform hover:shadow-xl hover:-translate-y-1">
                                        <div className="flex items-center gap-4">
                                            <img src={eotm.avatarUrl} className="w-12 h-12 rounded-full object-cover border-2 border-orange-100 bg-gray-200" />
                                            <div>
                                                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Employee of the Month</p>
                                                <p className="font-bold text-base text-gray-800">{eotm.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">Download Sertifikat</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <span className="text-xl font-bold text-gray-800">{eotm.avgScore}</span>
                                                <span className="text-[10px] text-gray-400 block -mt-1">Score</span>
                                            </div>
                                            <ChevronRight size={20} className="text-gray-300" />
                                        </div>
                                    </div>
                                )}

                                {analytics && (
                                    <div className="bg-white/80 backdrop-blur-lg p-3 rounded-xl border border-white/50 shadow-md flex divide-x divide-white/50">
                                        <div className="flex-1 text-center">
                                            <p className="text-[9px] text-gray-400 uppercase font-bold">Avg FOH</p>
                                            <p className="text-lg font-bold text-blue-600">{analytics.fohAverage}</p>
                                        </div>
                                        <div className="flex-1 text-center">
                                            <p className="text-[9px] text-gray-400 uppercase font-bold">Avg BOH</p>
                                            <p className="text-lg font-bold text-orange-600">{analytics.bohAverage}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};