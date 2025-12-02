import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, DollarSign, TrendingUp, TrendingDown, Calendar, Plus, Download, Filter, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { financeApi, mockExportApi } from '../../services/api';
import { colors } from '../../theme/colors';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';
import { FinanceInputModal } from '../../components/features/FinanceInputModal';
import { useNotificationStore } from '../../store/notificationStore';

interface FinanceDashboardProps {
    onNavigate?: (screen: string) => void;
}

export const FinanceDashboardScreen: React.FC<FinanceDashboardProps> = ({ onNavigate }) => {
    const { user, logout } = useAuthStore();
    const { showNotification } = useNotificationStore();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
    const [showInputModal, setShowInputModal] = useState(false);

    // KPI States
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [netProfit, setNetProfit] = useState(0);
    const [cashBalance, setCashBalance] = useState(0);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setLoading(true);
        const res = await financeApi.getTransactions();
        if (res.success && res.data) {
            // Filter by month/year of selected date for the list
            const filtered = res.data.filter((t: any) => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === selectedDate.getMonth() &&
                    tDate.getFullYear() === selectedDate.getFullYear();
            });

            setTransactions(filtered);

            // Calculate KPIs (Based on ALL time or Monthly? Usually Monthly for Dashboard, but Balance is All Time)
            // For this demo, let's calculate Monthly KPIs
            const revenue = filtered.filter((t: any) => t.type === 'IN').reduce((sum: number, t: any) => sum + t.amount, 0);
            const expense = filtered.filter((t: any) => t.type === 'OUT').reduce((sum: number, t: any) => sum + t.amount, 0);

            setTotalRevenue(revenue);
            setTotalExpense(expense);
            setNetProfit(revenue - expense);

            // Mock Balance (Starting + Net Profit of current view)
            setCashBalance(150000000 + (revenue - expense));
        }
        setLoading(false);
    };

    const handleExport = async () => {
        const res = await mockExportApi.exportExcel('Laporan Keuangan');
        if (res.success) {
            showNotification(res.message, 'success');
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const getFilteredTransactions = () => {
        if (filterType === 'ALL') return transactions;
        return transactions.filter(t => t.type === filterType);
    };

    return (
        <div className="pb-32 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="pt-8 pb-16 px-4 rounded-b-[2.5rem] relative overflow-hidden bg-[#0B0F19] shadow-2xl">
                <div className="absolute top-[-50%] left-1/2 transform -translate-x-1/2 w-[150%] h-[100%] bg-gradient-to-b from-emerald-600/20 via-emerald-900/5 to-transparent blur-3xl rounded-full pointer-events-none"></div>
                <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

                <div className="relative z-10">
                    <div className="bg-gradient-to-br from-gray-900/90 to-black/80 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl relative group overflow-hidden">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/10 shadow-inner">
                                    <img src={user?.avatarUrl} alt="Avatar" className="w-14 h-14 rounded-xl object-cover shadow-lg" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[8px] font-bold text-emerald-400 uppercase tracking-widest backdrop-blur-sm">
                                        Finance Manager
                                    </span>
                                </div>
                                <h2 className="text-lg font-black text-white leading-tight tracking-tight mb-0.5">{user?.name}</h2>
                                <p className="text-[10px] font-medium text-gray-400">Kelola Keuangan Resto</p>
                            </div>
                            <button onClick={logout} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 border border-white/5 hover:text-white transition-all shadow-lg backdrop-blur-sm">
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="px-4 -mt-12 relative z-10 space-y-4">

                {/* KPI CARDS */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Revenue */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingUp size={48} className="text-green-600" /></div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pemasukan (Bulan Ini)</p>
                        <h3 className="text-lg font-black text-gray-800">{formatCurrency(totalRevenue)}</h3>
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full">
                            <ArrowUpRight size={10} /> +12.5%
                        </div>
                    </div>

                    {/* Expense */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10"><TrendingDown size={48} className="text-red-600" /></div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Pengeluaran (Bulan Ini)</p>
                        <h3 className="text-lg font-black text-gray-800">{formatCurrency(totalExpense)}</h3>
                        <div className="flex items-center gap-1 mt-2 text-[10px] font-bold text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded-full">
                            <ArrowDownRight size={10} /> +5.2%
                        </div>
                    </div>
                </div>

                {/* Net Profit & Balance */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Net Profit (Laba Bersih)</p>
                                <h3 className="text-2xl font-black text-emerald-400">{formatCurrency(netProfit)}</h3>
                            </div>
                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                <Wallet size={20} className="text-emerald-400" />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                            <div>
                                <p className="text-[9px] text-gray-400">Saldo Kas (Estimasi)</p>
                                <p className="text-sm font-bold text-white">{formatCurrency(cashBalance)}</p>
                            </div>
                            <button className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-lg shadow-lg transition-colors">
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>

                {/* FILTERS & ACTIONS */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        <GlassDatePicker
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>
                    <button className="p-3 bg-white text-gray-600 rounded-xl border border-gray-200 shadow-sm hover:bg-gray-50">
                        <Filter size={18} />
                    </button>
                    <button
                        onClick={() => setShowInputModal(true)}
                        className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {/* TRANSACTION LIST */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-sm">Riwayat Transaksi</h3>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setFilterType('ALL')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${filterType === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => setFilterType('IN')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${filterType === 'IN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                                Masuk
                            </button>
                            <button
                                onClick={() => setFilterType('OUT')}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${filterType === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}
                            >
                                Keluar
                            </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            <div className="p-8 text-center text-xs text-gray-400">Loading transactions...</div>
                        ) : getFilteredTransactions().length === 0 ? (
                            <div className="p-8 text-center text-xs text-gray-400">Belum ada transaksi bulan ini.</div>
                        ) : (
                            getFilteredTransactions().map((trx, index) => (
                                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2.5 rounded-xl ${trx.type === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                            {trx.type === 'IN' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-gray-800">{trx.desc}</p>
                                            <p className="text-[10px] text-gray-400">{trx.date} • {trx.outlet}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-xs ${trx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                        {trx.type === 'IN' ? '+' : '-'} {formatCurrency(trx.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <button
                            onClick={handleExport}
                            className="text-[10px] font-bold text-gray-500 flex items-center justify-center gap-1 hover:text-gray-800 mx-auto"
                        >
                            <Download size={12} /> Download Laporan Lengkap
                        </button>
                    </div>
                </div>
            </div>

            <FinanceInputModal
                isOpen={showInputModal}
                onClose={() => setShowInputModal(false)}
                onSuccess={() => {
                    loadData();
                    showNotification('Transaksi berhasil disimpan!', 'success');
                }}
            />
        </div>
    );
};
