import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, DollarSign, TrendingUp, TrendingDown, Calendar, MapPin, Save } from 'lucide-react';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';
import { financeApi } from '../../services/api';

interface Props {
    onBack: () => void;
}

export const FinanceInputScreen: React.FC<Props> = ({ onBack }) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [date, setDate] = useState(new Date());
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'IN' | 'OUT'>('IN');
    const [outlet, setOutlet] = useState('Jakarta');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        setLoading(true);
        const res = await financeApi.getTransactions();
        if (res.success) {
            setTransactions(res.data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!desc || !amount) return;

        setIsSubmitting(true);
        const newTrx = {
            date: date.toISOString().split('T')[0],
            desc,
            amount: parseInt(amount.replace(/\D/g, '')),
            type,
            outlet
        };

        const res = await financeApi.addTransaction(newTrx);
        if (res.success) {
            // Reset form
            setDesc('');
            setAmount('');
            loadTransactions(); // Reload list
        }
        setIsSubmitting(false);
    };

    const formatCurrency = (val: number) => {
        return `Rp ${val.toLocaleString('id-ID')}`;
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans bg-gray-50">
            <BackgroundPattern />

            {/* Header */}
            <div className="relative z-10 p-4 pt-10 flex items-center gap-3">
                <button onClick={onBack} className="p-2 bg-white/20 rounded-full text-gray-700 hover:bg-white/40 transition-colors backdrop-blur-sm border border-white/20 shadow-sm">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="font-extrabold text-gray-800 text-xl leading-tight">Input Keuangan</h2>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">Finance Manager Dashboard</p>
                </div>
            </div>

            <div className="relative z-10 p-4 space-y-6 max-w-xl mx-auto pb-24">

                {/* Input Form Card */}
                <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-white/50">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Plus size={18} className="text-orange-500" /> Tambah Transaksi
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Date & Outlet Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">Tanggal</label>
                                <GlassDatePicker selectedDate={date} onChange={setDate} theme="light" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">Outlet</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={outlet}
                                        onChange={(e) => setOutlet(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition"
                                    >
                                        <option value="Jakarta">Jakarta</option>
                                        <option value="Bandung">Bandung</option>
                                        <option value="Semarang">Semarang</option>
                                        <option value="Yogyakarta">Yogyakarta</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Type Toggle */}
                        <div className="bg-gray-100 p-1 rounded-xl flex">
                            <button
                                type="button"
                                onClick={() => setType('IN')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'IN' ? 'bg-green-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                <TrendingUp size={16} /> Pemasukan
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('OUT')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${type === 'OUT' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                            >
                                <TrendingDown size={16} /> Pengeluaran
                            </button>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 mb-1 block ml-1">Keterangan</label>
                            <input
                                type="text"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Contoh: Penjualan Harian, Belanja Sayur..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 transition"
                            />
                        </div>

                </div>

                {/* Recent Transactions List */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 ml-1">Riwayat Input</h3>
                    <div className="space-y-3">
                        {loading ? (
                            <div className="text-center py-10 text-gray-400 text-xs">Memuat data...</div>
                        ) : transactions.map((trx, idx) => (
                            <div key={idx} className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl ${trx.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {trx.type === 'IN' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">{trx.desc}</p>
                                        <div className="flex gap-2 text-[10px] text-gray-500 mt-0.5">
                                            <span>{trx.date}</span>
                                            <span className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200">{trx.outlet}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`font-bold ${trx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                    {trx.type === 'IN' ? '+' : '-'} {formatCurrency(trx.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};
