
import React, { useEffect, useState, useRef } from 'react';
import { colors } from '../../theme/colors';
import { performanceApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Camera, TrendingUp, Users, Filter, Download, AlertCircle, Crown, Award, ChevronRight, Banknote, Calendar, Trophy } from 'lucide-react';
import { DashboardAnalytics, EmployeeOfTheMonth, UserRole } from '../../types';
import { PeriodFilter } from '../../components/PeriodFilter';

interface Props {
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

const ActionCard = ({ onClick, icon: Icon, title, subtitle, colorClass }: any) => (
    <button onClick={onClick} className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex flex-col items-start gap-1.5 active:scale-95 transition-all hover:shadow-md h-full">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass} bg-opacity-10`}>
            <Icon size={16} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div className="text-left">
            <h4 className="font-bold text-xs text-gray-800 leading-tight">{title}</h4>
            <p className="text-[9px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
    </button>
);

export const HRPerformanceDashboardScreen: React.FC<Props> = ({ onNavigate }) => {
    const { user, logout, isImpersonating, updateUser } = useAuthStore();
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [eotm, setEotm] = useState<EmployeeOfTheMonth | null>(null);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => fileInputRef.current?.click();
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => updateUser({ avatarUrl: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const [statsRes, eotmRes] = await Promise.all([
                performanceApi.getDashboardStats(month, year),
                performanceApi.getEmployeeOfTheMonth(month, year)
            ]);
            if (statsRes.success && statsRes.data) setAnalytics(statsRes.data);
            if (eotmRes.success && eotmRes.data) setEotm(eotmRes.data);
            setLoading(false);
        };
        loadData();
    }, [month, year]);

    const handlePeriodChange = (period: { month: number; year: number }) => {
        setMonth(period.month);
        setYear(period.year);
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen overflow-y-auto">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {/* === HEADER COMPACT === */}
            <div className="pt-8 pb-12 px-4 rounded-b-[2rem] relative overflow-hidden" style={{ background: colors.gradientMain }}>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
                <div className="relative flex items-center gap-3">
                    <div className="relative shrink-0">
                        <img src={user?.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md" />
                        <button onClick={handleAvatarClick} className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm"><Camera size={8} className="text-orange-600" /></button>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-orange-100 uppercase tracking-widest">Admin Panel</p>
                        <h2 className="text-base font-bold text-white truncate">{user?.name}</h2>
                        <span className="text-[9px] text-white font-medium bg-white/20 px-1.5 py-0.5 rounded-full border border-white/20">{getRoleDisplayName(user?.role || UserRole.ADMIN)}</span>
                    </div>
                    <button onClick={logout} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm border border-white/10"><LogOut size={14} /></button>
                </div>
            </div>

            <div className="px-4 -mt-10 relative z-10 space-y-4">
                {/* Filter */}
                <div className={`sticky ${isImpersonating ? 'top-12' : 'top-0'} z-20 bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center`}>
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase"><Filter size={12} /> Periode</div>
                    <PeriodFilter onPeriodChange={handlePeriodChange} />
                </div>

                {/* BENTO GRID ACTIONS */}
                <div className="grid grid-cols-2 gap-3">
                    <ActionCard onClick={() => onNavigate && onNavigate('payslipList')} icon={Banknote} title="Payroll" subtitle="Slip Gaji" colorClass="bg-green-500 text-white" />
                    <ActionCard onClick={() => onNavigate && onNavigate('shiftScheduler')} icon={Calendar} title="Shift" subtitle="Scheduling" colorClass="bg-blue-500 text-white" />
                    <ActionCard onClick={() => onNavigate && onNavigate('hrSpCoachingForm')} icon={AlertCircle} title="Input SP" subtitle="Coaching" colorClass="bg-red-500 text-white" />
                    <ActionCard onClick={() => onNavigate && onNavigate('hrTrendReport')} icon={TrendingUp} title="Tren" subtitle="Analisa" colorClass="bg-yellow-500 text-white" />
                </div>

                {loading ? (
                    <div className="py-10 text-center text-gray-400 text-xs">Memuat analisa...</div>
                ) : !analytics ? (
                    <div className="py-10 text-center text-gray-400 text-xs">Data tidak tersedia.</div>
                ) : (
                    <>
                        {eotm && (
                            <button onClick={() => onNavigate && onNavigate('certificate')} className="w-full bg-white rounded-xl p-2.5 border border-orange-100 shadow-sm flex items-center justify-between relative overflow-hidden active:scale-98">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 to-orange-500"></div>
                                <div className="flex items-center gap-2.5 pl-2">
                                    <img src={eotm.avatarUrl} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
                                    <div>
                                        <p className="text-[8px] font-bold text-orange-500 uppercase tracking-wider">Top Performance</p>
                                        <p className="font-bold text-xs text-gray-800">{eotm.name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-base font-bold text-gray-800">{eotm.avgScore}</span>
                                    <span className="text-[8px] text-gray-400 block">Score</span>
                                </div>
                            </button>
                        )}

                        {/* Combined Stats */}
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm flex divide-x divide-gray-100">
                            <div className="flex-1 text-center">
                                <p className="text-[8px] text-gray-400 uppercase font-bold">Avg FOH</p>
                                <p className="text-base font-bold text-blue-600">{analytics.fohAverage}</p>
                            </div>
                            <div className="flex-1 text-center">
                                <p className="text-[8px] text-gray-400 uppercase font-bold">Avg BOH</p>
                                <p className="text-base font-bold text-orange-600">{analytics.bohAverage}</p>
                            </div>
                        </div>

                        <button className="w-full py-2.5 border border-gray-200 rounded-xl text-gray-500 text-[10px] font-bold flex items-center justify-center gap-1.5 active:bg-gray-50">
                            <Download size={12} /> Export Laporan Lengkap (PDF)
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
