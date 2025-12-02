
import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { LogOut, Calendar, ClipboardList, TrendingUp, DollarSign, Utensils, Megaphone, Users, ChevronRight, Clock, UserPlus, Eye, Banknote, Camera, CheckSquare, TrendingDown, PieChart, AlertTriangle, Activity, Star, Crown, Filter, Download, Award, Trophy, FilePlus, Settings, Package } from 'lucide-react';
import { attendanceApi, employeeApi, jobdeskApi, performanceApi, ownerApi } from '../../services/api';
import { AttendanceLog, AttendanceStatus, UserRole, Employee, EmployeeArea, OwnerDashboardData, TrendData, DashboardAnalytics, EmployeeOfTheMonth } from '../../types';
import { colors } from '../../theme/colors';
import { useNotificationStore } from '../../store/notificationStore';
import { PeriodFilter } from '../../components/PeriodFilter';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';
import { StockOpnameModal } from '../../components/features/StockOpnameModal';

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
    const [showStockOpname, setShowStockOpname] = useState(false);

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
                <div className="pt-8 pb-16 px-4 rounded-b-[2.5rem] relative overflow-hidden bg-[#0B0F19] shadow-2xl">
                    <div className="absolute top-[-50%] left-1/2 transform -translate-x-1/2 w-[150%] h-[100%] bg-gradient-to-b from-amber-600/20 via-amber-900/5 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                    <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B0F19]/80 to-[#0B0F19] pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Main Header Card - Premium Dark Glass */}
                        <div className="bg-gradient-to-br from-gray-900/90 to-black/80 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl relative group overflow-hidden">
                            {/* Decorative Shine */}
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-50"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-700"></div>

                            <div className="flex items-center gap-4">
                                {/* Inner Profile Box - Magic Glass */}
                                <div className="relative shrink-0">
                                    <div className="p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 shadow-inner group-hover:border-amber-500/30 transition-colors duration-500">
                                        <img src={user?.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-xl object-cover shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300" onClick={handleAvatarClick} />
                                    </div>
                                    {/* Crown Icon floating */}
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-300 to-amber-600 p-1 rounded-full shadow-lg border border-amber-200 animate-pulse-slow">
                                        <Crown size={8} className="text-white fill-white" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-[8px] font-bold text-amber-400 uppercase tracking-widest backdrop-blur-sm">
                                            Executive
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-black text-white leading-tight tracking-tight mb-0.5 drop-shadow-md">{user?.name}</h2>
                                    <p className="text-[10px] font-medium text-gray-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
                                        Business Owner
                                    </p>
                                </div>

                                <button onClick={logout} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 border border-white/5 hover:text-white transition-all hover:scale-105 active:scale-95 shadow-lg backdrop-blur-sm group/btn">
                                    <LogOut size={18} className="group-hover/btn:text-red-400 transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="pt-8 pb-16 px-4 rounded-b-[2rem] relative overflow-hidden" style={{ background: colors.gradientMain }}>
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
                    <div className="relative bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-3.5 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="relative shrink-0" onClick={handleAvatarClick}>
                                <img src={user?.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white object-cover bg-white/20" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm"><Camera size={8} className="text-orange-600" /></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[9px] font-bold text-orange-100 uppercase tracking-widest">Admin Panel</p>
                                <h2 className="text-base font-bold text-white truncate">{user?.name}</h2>
                                <span className="text-[9px] text-white font-medium bg-white/20 px-2 py-0.5 rounded-full border border-white/20">{getRoleDisplayName(user?.role || UserRole.ADMIN)}</span>
                            </div>
                            <button onClick={logout} className="p-1.5 bg-black/20 hover:bg-black/30 rounded-full text-white backdrop-blur-sm border border-white/10"><LogOut size={14} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CONTENT --- */}
            {user?.role === UserRole.BUSINESS_OWNER ? (
                <div className="px-4 -mt-12 relative z-10 space-y-3">
                    {/* BENTO GRID MENU - PREMIUM GLASS STYLE */}
                    <div className="grid grid-cols-2 gap-2">
                        <PremiumGlassCard variant="compact" title="Laporan" subtitle="Input: Finance Manager" icon={DollarSign} onClick={() => onNavigate && onNavigate('reportFinancial')} themeColor="green" />
                        <PremiumGlassCard variant="compact" title="Tren Pendapatan" subtitle="System Calculation" icon={Activity} onClick={() => onNavigate && onNavigate('reportRevenueCost')} themeColor="blue" />
                        <PremiumGlassCard variant="compact" title="Operasional" subtitle="Input: Resto Manager" icon={Utensils} onClick={() => onNavigate && onNavigate('reportOperational')} themeColor="orange" />
                        <PremiumGlassCard variant="compact" title="Kinerja Tim" subtitle="Input: HR Manager" icon={Users} onClick={() => onNavigate && onNavigate('reportHR')} themeColor="purple" />
                        <PremiumGlassCard variant="compact" title="Monitoring Harian" subtitle="Input: Resto Manager" icon={Eye} onClick={() => onNavigate && onNavigate('hrDailyMonitorHub')} themeColor="teal" />
                        <PremiumGlassCard variant="compact" title="Marketing" subtitle="Input: Marketing Manager" icon={Megaphone} onClick={() => onNavigate && onNavigate('reportMarketing')} themeColor="pink" />
                    </div>

                    {/* Performance Summary */}
                    <div className="space-y-2.5">
                        {eotm && (
                            <div onClick={() => onNavigate && onNavigate('certificate')} className="bg-gradient-to-r from-amber-50 to-white rounded-xl p-2.5 border border-amber-100 flex items-center justify-between cursor-pointer active:scale-98 transition-transform shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={eotm.avatarUrl} className="w-7 h-7 rounded-full object-cover border border-orange-200" />
                                        <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white text-[8px] px-1 rounded-full font-bold">★</div>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wider">Employee of the Month</p>
                                        <p className="font-bold text-xs text-gray-800">{eotm.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-800">{eotm.avgScore}</span>
                                    <span className="text-[8px] text-gray-400 block -mt-0.5">Score</span>
                                </div>
                            </div>
                        )}

                        {analytics && (
                            <div className="bg-white/80 backdrop-blur-lg p-2.5 rounded-2xl border border-white/50 shadow-md flex items-center justify-between">
                                <div className="flex-1 text-center border-r border-gray-100">
                                    <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Rata-rata FOH</p>
                                    <p className="text-lg font-bold text-blue-600">{analytics.fohAverage}</p>
                                </div>
                                <div className="flex-1 text-center">
                                    <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Rata-rata BOH</p>
                                    <p className="text-lg font-bold text-orange-600">{analytics.bohAverage}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : user?.role === UserRole.SUPER_ADMIN ? (
                <div className="px-5 -mt-10 relative z-30 space-y-3">
                    {/* COMPACT IMPERSONATE BOX */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-2.5">
                            <h3 className="font-bold text-xs flex items-center gap-2"><Users size={14} /> Impersonate User</h3>
                            <div className="bg-green-500/20 px-2 py-0.5 rounded text-[9px] font-bold border border-green-500/30 text-green-300">Active</div>
                        </div>
                        <form onSubmit={handleImpersonate} className="flex flex-col gap-2">
                            <input type="text" placeholder="Nomor HP" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-500/50 text-white placeholder-white/30" value={targetPhone} onChange={(e) => setTargetPhone(e.target.value)} />
                            <button type="submit" disabled={authLoading || targetPhone.length < 8} className="w-full bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-bold text-xs shadow-lg disabled:opacity-50">LOGIN AS USER</button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-2.5 text-xs uppercase tracking-wider">System Tools</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <PremiumGlassCard title="Kelola User" subtitle="Database Staff" icon={Users} onClick={() => onNavigate && onNavigate('adminEmployees')} themeColor="purple" />
                            <PremiumGlassCard title="System" subtitle="App Config" icon={Settings} onClick={() => onNavigate && onNavigate('systemSettings')} themeColor="teal" />
                            <PremiumGlassCard title="Audit Logs" subtitle="Riwayat Aksi" icon={ClipboardList} onClick={() => onNavigate && onNavigate('auditLogs')} themeColor="blue" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="px-4 -mt-6 relative z-10 space-y-3">
                    <div className={`sticky ${isImpersonating ? 'top-12' : 'top-0'} z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center`}>
                        <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase"><Filter size={12} /> Periode</div>
                        <PeriodFilter onPeriodChange={handlePeriodChange} />
                    </div>

                    {/* Quick Actions Grid - PREMIUM GLASS STYLE */}
                    <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-2.5 text-xs uppercase tracking-wider">Menu Utama</h3>
                        <div className="grid grid-cols-2 gap-2">
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
                                <PremiumGlassCard title="Stock Opname" subtitle="Input Stok Fisik" icon={Package} onClick={() => setShowStockOpname(true)} themeColor="green" />
                            </>}
                            {user?.role === UserRole.FINANCE_MANAGER && <>
                                <PremiumGlassCard title="Input Keuangan" subtitle="Tambah Transaksi" icon={DollarSign} onClick={() => onNavigate && onNavigate('financeInput')} themeColor="green" />
                                <PremiumGlassCard title="Laporan" subtitle="Cek Laporan" icon={ClipboardList} onClick={() => onNavigate && onNavigate('reportFinancial')} themeColor="blue" />
                            </>}
                            {user?.role === UserRole.MARKETING_MANAGER && <>
                                <PremiumGlassCard title="Campaign" subtitle="Promosi & Iklan" icon={Megaphone} onClick={() => onNavigate && onNavigate('marketingPanel')} themeColor="purple" />
                            </>}
                        </div>
                    </div>

                    {/* Stats & Reports */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => onNavigate && onNavigate('hrTrendReport')} className="p-2.5 bg-yellow-50 text-yellow-800 rounded-xl text-[10px] font-bold border border-yellow-100 flex items-center justify-center gap-2 hover:bg-yellow-100 shadow-sm">
                                <TrendingUp size={14} /> Laporan Tren
                            </button>
                            <button onClick={() => onNavigate && onNavigate('hrTopPerformance')} className="p-2.5 bg-purple-50 text-purple-800 rounded-xl text-[10px] font-bold border border-purple-100 flex items-center justify-center gap-2 hover:bg-purple-100 shadow-sm">
                                <Users size={14} /> Top Performance
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-4 text-xs text-gray-400">Loading stats...</div>
                        ) : (
                            <>
                                {eotm && (
                                    <div onClick={() => onNavigate && onNavigate('certificate')} className="bg-gradient-to-br from-white to-amber-100 rounded-2xl p-3.5 border border-amber-200/50 flex items-center justify-between cursor-pointer active:scale-98 transition-transform hover:shadow-xl hover:-translate-y-1">
                                        <div className="flex items-center gap-3">
                                            <img src={eotm.avatarUrl} className="w-10 h-10 rounded-full object-cover border-2 border-orange-100 bg-gray-200" />
                                            <div>
                                                <p className="text-[9px] font-bold text-orange-600 uppercase tracking-wider">Employee of the Month</p>
                                                <p className="font-bold text-sm text-gray-800">{eotm.name}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Download Sertifikat</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-gray-800">{eotm.avgScore}</span>
                                                <span className="text-[9px] text-gray-400 block -mt-1">Score</span>
                                            </div>
                                            <ChevronRight size={18} className="text-gray-300" />
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

            {/* Render Modal at the end */}
            <StockOpnameModal
                isOpen={showStockOpname}
                onClose={() => setShowStockOpname(false)}
                isReadOnly={false}
            />
        </div>
    );
};