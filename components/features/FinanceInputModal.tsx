import React, { useState } from 'react';
import { X, DollarSign, Calendar, FileText, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { financeApi } from '../../services/api';
import { GlassDatePicker } from '../ui/GlassDatePicker';

interface FinanceInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const FinanceInputModal: React.FC<FinanceInputModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [type, setType] = useState<'IN' | 'OUT'>('IN');
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [date, setDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !desc) return;

        setLoading(true);
        try {
            const numAmount = parseInt(amount.replace(/\D/g, ''));
            await financeApi.addTransaction({
                date: date.toISOString().split('T')[0],
                type,
                amount: numAmount,
                desc,
                outlet: 'Jakarta' // Default
            });
            onSuccess();
            onClose();
            // Reset form
            setAmount('');
            setDesc('');
            setType('IN');
        } catch (error) {
            console.error("Failed to save transaction", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val) {
            setAmount(new Intl.NumberFormat('id-ID').format(parseInt(val)));
        } else {
            setAmount('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`p-5 flex justify-between items-center ${type === 'IN' ? 'bg-emerald-600' : 'bg-red-600'} transition-colors duration-300`}>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        {type === 'IN' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                        {type === 'IN' ? 'Catat Pemasukan' : 'Catat Pengeluaran'}
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Type Toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType('IN')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'IN' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            PEMASUKAN
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('OUT')}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            PENGELUARAN
                        </button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Nominal (Rp)</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <DollarSign size={16} />
                            </div>
                            <input
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className={`w-full pl-9 pr-4 py-3 bg-gray-50 border rounded-xl font-bold text-lg outline-none focus:ring-2 transition-all ${type === 'IN' ? 'focus:border-emerald-500 focus:ring-emerald-500/20 text-emerald-700' : 'focus:border-red-500 focus:ring-red-500/20 text-red-700'}`}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Keterangan</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <FileText size={16} />
                            </div>
                            <input
                                type="text"
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Contoh: Penjualan Harian / Beli Galon"
                                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-gray-400 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Date Picker */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Tanggal</label>
                        <GlassDatePicker selectedDate={date} onChange={setDate} />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !amount || !desc}
                        className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''} ${type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                    >
                        {loading ? 'Menyimpan...' : (
                            <>
                                <CheckCircle size={18} />
                                SIMPAN TRANSAKSI
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
