

import React, { useEffect, useState } from 'react';
import { usePayrollStore } from '../../store/payrollStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Plus, Filter, Search, DollarSign, CheckCircle2, Clock, FileText, User, Banknote } from 'lucide-react';
import { UserRole, PayslipStatus } from '../../types';

interface Props {
    onBack: () => void;
    onNavigate: (screen: string, params?: any) => void;
}

export const PayslipListScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
    const { user } = useAuthStore();
    const { payslips, fetchPayslips, isLoading } = usePayrollStore();
    const { employees, fetchEmployees } = useEmployeeStore();

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (user) {
            fetchPayslips(user.role, user.id);
            fetchEmployees();
        }
    }, [user]);

    const filteredPayslips = payslips.filter(slip => {
        const emp = employees.find(e => e.id === slip.employeeId);
        const matchesSearch = emp?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
        const matchesPeriod = slip.periodMonth === month && slip.periodYear === year;
        return matchesSearch && matchesPeriod;
    });

    const handleCreate = () => {
        onNavigate('payslipForm', { isNew: true, month, year });
    };

    const handleSelect = (id: string) => {
        onNavigate('payslipForm', { payslipId: id });
    };

    const getStatusBadge = (status: PayslipStatus) => {
        if (status === 'SENT') return <span className="px-2 py-1 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100 flex items-center gap-1"><CheckCircle2 size={10} /> Terkirim</span>;
        if (status === 'READY_TO_SEND') return <span className="px-2 py-1 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1"><CheckCircle2 size={10} /> Siap Kirim</span>;
        return <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 flex items-center gap-1"><Clock size={10} /> Draft</span>;
    };

    return (
        <div className="bg-gray-50 pb-24">
            {/* Header */}
            <div className="pt-8 pb-12 px-4 rounded-b-[2.5rem] shadow-xl relative z-0 overflow-hidden" style={{ background: colors.gradientMain }}>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2.5 text-white mb-2">
                        <button onClick={onBack} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors border border-white/10 backdrop-blur-sm">
                            <ArrowLeft size={18} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10"><Banknote size={16} /></div>
                            <h2 className="text-lg font-bold font-heading">Payroll Management</h2>
                        </div>
                    </div>
                    <p className="text-orange-100 text-[10px] px-1 font-medium">Kelola dan kirim slip gaji karyawan</p>
                </div>
            </div>

            <div className="px-4 space-y-3 -mt-8 relative z-10">
                {/* Filter Card */}
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 space-y-2.5">
                    <div className="flex gap-2">
                        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-gray-50 border rounded-lg px-2.5 py-1.5 text-xs outline-none flex-1">
                            {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}</option>)}
                        </select>
                        <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-gray-50 border rounded-lg px-2.5 py-1.5 text-xs outline-none w-20">
                            <option value={2023}>2023</option>
                            <option value={2024}>2024</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama karyawan..."
                            className="w-full pl-8 p-2 bg-gray-50 border rounded-xl text-xs outline-none focus:border-orange-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Action Bar */}
                {user?.role === UserRole.HR_MANAGER && (
                    <button
                        onClick={handleCreate}
                        className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-transform text-xs"
                    >
                        <Plus size={16} /> Buat Slip Gaji Baru
                    </button>
                )}

                {/* List */}
                <div className="space-y-2.5">
                    {isLoading && payslips.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">Memuat data...</div>
                    ) : filteredPayslips.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                            <FileText size={24} className="mx-auto mb-1.5 opacity-20" />
                            <p className="text-xs">Belum ada data slip gaji untuk periode ini.</p>
                        </div>
                    ) : (
                        filteredPayslips.map(slip => {
                            const emp = employees.find(e => e.id === slip.employeeId);
                            return (
                                <div
                                    key={slip.id}
                                    onClick={() => handleSelect(slip.id)}
                                    className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-98 transition-transform"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden">
                                            {emp?.avatarUrl ? <img src={emp.avatarUrl} className="w-full h-full object-cover" /> : <User size={16} className="text-gray-400" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-xs">{emp?.name || 'Unknown'}</p>
                                            <p className="text-[10px] text-gray-500">{emp?.department}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600 text-xs">Rp {slip.netSalary.toLocaleString('id-ID')}</p>
                                        <div className="flex justify-end mt-0.5">
                                            {getStatusBadge(slip.status)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
