import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, Package, TrendingUp, TrendingDown, Calculator } from 'lucide-react';
import { inventoryApi, StockItem } from '../../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isReadOnly?: boolean;
}

export const StockOpnameModal: React.FC<Props> = ({ isOpen, onClose, isReadOnly = false }) => {
    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resultData, setResultData] = useState<any>(null);

    const [activeTab, setActiveTab] = useState<'FOH' | 'BOH'>('FOH');

    // Load data when modal opens
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            inventoryApi.getStock().then(res => {
                if (res.success && res.data) {
                    // Reset physical stock input for fresh entry if not read only
                    const freshItems = res.data.map(i => ({
                        ...i,
                        physicalStock: (isReadOnly ? i.systemStock : '') as number | '' // If read only, show system stock as placeholder or actual physical if stored
                    }));
                    setItems(freshItems);
                }
                setLoading(false);
            });
            setSuccess(false);
        }
    }, [isOpen, isReadOnly]);

    const handleStockChange = (id: string, value: string) => {
        const numValue = value === '' ? '' : parseFloat(value);
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, physicalStock: numValue as number | '' } : item
        ));
    };

    const calculateVariance = (system: number, physical: number | '') => {
        if (physical === '') return 0;
        return physical - system;
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await inventoryApi.submitOpname(items);
            if (res.success) {
                setResultData(res.data);
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (error) {
            alert("Gagal menyimpan laporan");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => item.category === activeTab);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">

                {/* Header */}
                <div className="p-6 border-b border-white/40 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-orange-100 rounded-xl text-orange-600 shadow-sm">
                            <Package size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Stock Opname</h2>
                            <p className="text-xs text-gray-500 font-medium">{isReadOnly ? 'Laporan Stok Fisik Outlet' : 'Input stok fisik harian outlet'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/5 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="px-6 pt-4 pb-2 flex gap-2">
                    <button
                        onClick={() => setActiveTab('FOH')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'FOH'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white/50 text-gray-500 hover:bg-white hover:text-orange-500'
                            }`}
                    >
                        Front of House (FOH)
                    </button>
                    <button
                        onClick={() => setActiveTab('BOH')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'BOH'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                            : 'bg-white/50 text-gray-500 hover:bg-white hover:text-orange-500'
                            }`}
                    >
                        Back of House (BOH)
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white/40">
                    {success ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600 shadow-lg shadow-emerald-200">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 mb-2">Laporan Tersimpan!</h3>
                            <p className="text-gray-500">Stok opname berhasil diperbarui ke sistem.</p>

                            {/* Dynamic Result Display */}
                            {resultData && resultData.totalVariance !== 0 && (
                                <div className={`mt-4 p-3 rounded-xl border ${resultData.totalVariance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Financial Impact</p>
                                    <div className={`text-lg font-black ${resultData.totalVariance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {resultData.totalVariance < 0 ? '-' : '+'} Rp {Math.abs(resultData.totalVariance).toLocaleString('id-ID')}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {resultData.transaction ? 'Jurnal otomatis tercatat' : 'Tidak ada selisih nilai'}
                                    </p>
                                </div>
                            )}

                            {resultData && resultData.totalVariance === 0 && (
                                <p className="text-xs text-gray-400 mt-2">Tidak ada selisih stok (Perfect Match!)</p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {loading && items.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">Memuat data stok...</div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-12 gap-4 px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200/50">
                                        <div className="col-span-5">Nama Barang</div>
                                        <div className="col-span-2 text-center">Sistem</div>
                                        <div className="col-span-3 text-center">Fisik</div>
                                        <div className="col-span-2 text-right">Selisih</div>
                                    </div>

                                    {filteredItems.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400 text-xs italic">
                                            Tidak ada item untuk kategori {activeTab}
                                        </div>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const variance = calculateVariance(item.systemStock, item.physicalStock);
                                            const isMatch = variance === 0 && item.physicalStock !== '';
                                            const isMismatch = variance !== 0 && item.physicalStock !== '';

                                            return (
                                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 bg-white/60 rounded-2xl border border-white/60 shadow-sm hover:shadow-md transition-all group">
                                                    {/* Item Info */}
                                                    <div className="col-span-5">
                                                        <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                        <p className="text-[10px] text-gray-500">Last: {item.lastOpname}</p>
                                                    </div>

                                                    {/* System Stock */}
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                                                            {item.systemStock} {item.unit}
                                                        </span>
                                                    </div>

                                                    {/* Physical Input */}
                                                    <div className="col-span-3">
                                                        <div className="relative">
                                                            {isReadOnly ? (
                                                                <div className={`w-full bg-gray-50 border-2 border-transparent rounded-xl px-3 py-2 text-center font-bold text-gray-800`}>
                                                                    {item.physicalStock === '' ? '-' : item.physicalStock}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="number"
                                                                    value={item.physicalStock}
                                                                    onChange={(e) => handleStockChange(item.id, e.target.value)}
                                                                    placeholder="0"
                                                                    className={`w-full bg-white border-2 rounded-xl px-3 py-2 text-center font-bold text-gray-800 outline-none focus:ring-2 transition-all ${isMismatch ? 'border-rose-200 focus:border-rose-400 focus:ring-rose-100' :
                                                                        isMatch ? 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100' :
                                                                            'border-gray-100 focus:border-orange-300 focus:ring-orange-100'
                                                                        }`}
                                                                />
                                                            )}
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium pointer-events-none">
                                                                {item.unit}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Variance */}
                                                    <div className="col-span-2 text-right flex justify-end">
                                                        {item.physicalStock !== '' ? (
                                                            <span className={`text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 ${variance === 0 ? 'text-emerald-600 bg-emerald-100' :
                                                                variance > 0 ? 'text-blue-600 bg-blue-100' : 'text-rose-600 bg-rose-100'
                                                                }`}>
                                                                {variance > 0 ? '+' : ''}{variance}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300">-</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!success && !isReadOnly && (
                    <div className="p-6 border-t border-white/40 bg-white/60 backdrop-blur-md flex justify-between items-center">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <AlertCircle size={14} />
                            <span>Pastikan hitungan fisik akurat</span>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan Laporan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
