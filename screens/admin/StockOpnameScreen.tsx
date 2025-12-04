import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { inventoryApi, StockItem } from '../../services/api';
import { PanelHeader } from '../../components/PanelHeader';

interface Props {
    onBack: () => void;
    isReadOnly?: boolean;
}

export const StockOpnameScreen: React.FC<Props> = ({ onBack, isReadOnly = false }) => {
    const [items, setItems] = useState<StockItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [resultData, setResultData] = useState<any>(null);

    const [activeTab, setActiveTab] = useState<'FOH' | 'BOH'>('FOH');

    // Load data
    useEffect(() => {
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
    }, [isReadOnly]);

    const handleStockChange = (id: string, value: string) => {
        const numValue = value === '' ? '' : parseFloat(value);
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, physicalStock: numValue as number | '' } : item
        ));
    };

    const handleNameChange = (id: string, newName: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, name: newName } : item
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
                    onBack();
                }, 2000);
            }
        } catch (error) {
            alert("Gagal menyimpan laporan");
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(item => item.category === activeTab);

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            <PanelHeader title="Stock Opname" icon={Package} onBack={onBack} />

            <div className="px-4 space-y-4 -mt-6 relative z-10">
                {/* Category Tabs */}
                <div className="flex gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <button
                        onClick={() => setActiveTab('FOH')}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-wider ${activeTab === 'FOH'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 border-orange-400'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200 hover:border-orange-200'
                            }`}
                    >
                        Front of House
                    </button>
                    <button
                        onClick={() => setActiveTab('BOH')}
                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all border uppercase tracking-wider ${activeTab === 'BOH'
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 border-orange-400'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200 hover:border-orange-200'
                            }`}
                    >
                        Back of House
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="space-y-3">
                    {success ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-emerald-600 shadow-xl shadow-emerald-200 ring-4 ring-white">
                                <CheckCircle size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 mb-2">Laporan Tersimpan!</h3>
                            <p className="text-gray-500">Stok opname berhasil diperbarui ke sistem.</p>

                            {/* Dynamic Result Display */}
                            {resultData && resultData.totalVariance !== 0 && (
                                <div className={`mt-6 p-4 rounded-2xl border w-full max-w-xs ${resultData.totalVariance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Financial Impact</p>
                                    <div className={`text-xl font-black ${resultData.totalVariance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
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
                                    <div className="grid grid-cols-12 gap-3 px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">
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
                                                <div key={item.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                                    {/* Item Info (Editable) */}
                                                    <div className="col-span-5">
                                                        {isReadOnly ? (
                                                            <p className="font-bold text-gray-800 text-sm leading-tight">{item.name}</p>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={item.name}
                                                                onChange={(e) => handleNameChange(item.id, e.target.value)}
                                                                className="w-full bg-transparent border-b border-transparent focus:border-orange-300 focus:bg-orange-50/50 rounded-t-sm outline-none font-bold text-gray-800 text-sm leading-tight transition-all placeholder-gray-300"
                                                                placeholder="Nama Item"
                                                            />
                                                        )}
                                                        <p className="text-[10px] text-gray-400 mt-0.5">Last: {item.lastOpname}</p>
                                                    </div>

                                                    {/* System Stock */}
                                                    <div className="col-span-2 text-center">
                                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-1.5 py-1 rounded-lg border border-gray-100 block">
                                                            {item.systemStock} {item.unit}
                                                        </span>
                                                    </div>

                                                    {/* Physical Input */}
                                                    <div className="col-span-3">
                                                        <div className="relative">
                                                            {isReadOnly ? (
                                                                <div className={`w-full bg-gray-50 border border-gray-200 rounded-xl px-2 py-2 text-center font-bold text-gray-800 text-sm`}>
                                                                    {item.physicalStock === '' ? '-' : item.physicalStock}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="number"
                                                                    value={item.physicalStock}
                                                                    onChange={(e) => handleStockChange(item.id, e.target.value)}
                                                                    placeholder="0"
                                                                    className={`w-full bg-white border-2 rounded-xl px-1 py-2 text-center font-bold text-gray-800 outline-none focus:ring-4 transition-all text-sm ${isMismatch ? 'border-rose-200 focus:border-rose-400 focus:ring-rose-100' :
                                                                        isMatch ? 'border-emerald-200 focus:border-emerald-400 focus:ring-emerald-100' :
                                                                            'border-gray-100 focus:border-orange-300 focus:ring-orange-100'
                                                                        }`}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Variance */}
                                                    <div className="col-span-2 text-right flex justify-end">
                                                        {item.physicalStock !== '' ? (
                                                            <span className={`text-[10px] font-black px-1.5 py-1 rounded-lg flex items-center gap-0.5 ${variance === 0 ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' :
                                                                variance > 0 ? 'text-blue-600 bg-blue-50 border border-blue-100' : 'text-rose-600 bg-rose-50 border border-rose-100'
                                                                }`}>
                                                                {variance > 0 ? '+' : ''}{variance}
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300 font-bold">-</span>
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
            </div>

            {/* Footer */}
            {!success && !isReadOnly && (
                <div className="fixed bottom-0 left-0 right-0 p-5 border-t border-gray-100 bg-white z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium hidden sm:flex">
                            <AlertCircle size={14} />
                            <span>Pastikan akurat</span>
                        </div>
                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={onBack}
                                className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors border border-transparent hover:border-gray-200"
                                disabled={loading}
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Simpan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
