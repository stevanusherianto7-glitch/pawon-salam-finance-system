import React, { useState } from 'react';
import { Zap, Droplets, Wifi, Flame, Plus, Trash2, Wallet, AlertTriangle, TrendingUp } from 'lucide-react';
import { useOpexStore } from '../../store/useOpexStore';
import { PanelHeader } from '../../components/PanelHeader';

interface Props {
    onBack: () => void;
}

type Tab = 'utilities' | 'petty' | 'waste';

export const SmartOpExScreen: React.FC<Props> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('utilities');
    const { utilities, logs, setUtility, addLog, removeLog, getTotalExpense } = useOpexStore();

    // Form States
    const [pettyForm, setPettyForm] = useState({ name: '', price: '', category: 'Dapur' });
    const [wasteForm, setWasteForm] = useState({ name: '', qty: '', reason: 'Basi', price: '' });

    const handleAddPetty = () => {
        if (!pettyForm.name || !pettyForm.price) return;
        addLog({
            type: 'petty',
            name: pettyForm.name,
            price: parseFloat(pettyForm.price),
            category: pettyForm.category,
            reason: '-' // Not used for petty
        });
        setPettyForm({ name: '', price: '', category: 'Dapur' });
    };

    const handleAddWaste = () => {
        if (!wasteForm.name || !wasteForm.qty) return;
        addLog({
            type: 'waste',
            name: wasteForm.name,
            price: wasteForm.price ? parseFloat(wasteForm.price) : 0,
            qty: parseFloat(wasteForm.qty),
            reason: wasteForm.reason
        });
        setWasteForm({ name: '', qty: '', reason: 'Basi', price: '' });
    };

    const renderUtilities = () => (
        <div className="space-y-3">
            {[
                { key: 'gas', label: 'Gas LPG', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50' },
                { key: 'listrik', label: 'Listrik (Token)', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-50' },
                { key: 'air', label: 'Air (PDAM)', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
                { key: 'internet', label: 'Internet', icon: Wifi, color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((item) => (
                <div key={item.key} className={`p-4 rounded-2xl border ${utilities[item.key as keyof typeof utilities] > 500000 ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white'} shadow-sm transition-all`}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-xl ${item.bg}`}>
                            <item.icon size={20} className={item.color} />
                        </div>
                        <span className="font-bold text-gray-700">{item.label}</span>
                    </div>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-400 font-bold text-sm">Rp</span>
                        <input
                            type="number"
                            value={utilities[item.key as keyof typeof utilities] || ''}
                            onChange={(e) => setUtility(item.key as keyof typeof utilities, parseFloat(e.target.value))}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl font-black text-gray-800 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPettyCash = () => (
        <div className="space-y-4">
            {/* Quick Add Form */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <Plus size={16} className="text-orange-500" />
                    Catat Pengeluaran
                </h3>
                <input
                    type="text"
                    placeholder="Nama Barang (Contoh: Es Batu)"
                    value={pettyForm.name}
                    onChange={(e) => setPettyForm({ ...pettyForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition-all"
                />
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-3 text-gray-400 text-xs font-bold">Rp</span>
                        <input
                            type="number"
                            placeholder="Nominal"
                            value={pettyForm.price}
                            onChange={(e) => setPettyForm({ ...pettyForm, price: e.target.value })}
                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition-all"
                        />
                    </div>
                    <select
                        value={pettyForm.category}
                        onChange={(e) => setPettyForm({ ...pettyForm, category: e.target.value })}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-orange-500 transition-all appearance-none"
                    >
                        <option value="Dapur">Dapur</option>
                        <option value="Kebersihan">Kebersihan</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>
                <button
                    onClick={handleAddPetty}
                    className="w-full py-3 bg-gradient-to-r from-[#E87722] to-[#F9A055] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all"
                >
                    + Tambah
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hari Ini</h3>
                {logs.filter(l => l.type === 'petty').map(log => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                                <Wallet size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{log.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full w-fit mt-1">{log.category || 'Umum'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-gray-800 text-sm">Rp {log.price.toLocaleString()}</p>
                            <button onClick={() => removeLog(log.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {logs.filter(l => l.type === 'petty').length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs italic">Belum ada pengeluaran hari ini</div>
                )}
            </div>
        </div>
    );

    const renderWaste = () => (
        <div className="space-y-4">
            {/* Quick Add Form */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" />
                    Catat Waste (Terbuang)
                </h3>
                <input
                    type="text"
                    placeholder="Nama Bahan (Contoh: Ayam Potong)"
                    value={wasteForm.name}
                    onChange={(e) => setWasteForm({ ...wasteForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-red-500 transition-all"
                />
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="number"
                            placeholder="Qty"
                            value={wasteForm.qty}
                            onChange={(e) => setWasteForm({ ...wasteForm, qty: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-red-500 transition-all"
                        />
                    </div>
                    <select
                        value={wasteForm.reason}
                        onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })}
                        className="flex-[1.5] px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-red-500 transition-all appearance-none"
                    >
                        <option value="Basi">Basi</option>
                        <option value="Jatuh">Jatuh</option>
                        <option value="Salah Masak">Salah Masak</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-400 text-xs font-bold">Rp</span>
                    <input
                        type="number"
                        placeholder="Estimasi Kerugian (Opsional)"
                        value={wasteForm.price}
                        onChange={(e) => setWasteForm({ ...wasteForm, price: e.target.value })}
                        className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none focus:border-red-500 transition-all"
                    />
                </div>
                <button
                    onClick={handleAddWaste}
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                    + Catat Waste
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Log Waste</h3>
                {logs.filter(l => l.type === 'waste').map(log => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-red-50 text-red-600">
                                <Trash2 size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{log.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">{log.qty} Items</span>
                                    <span className="text-[10px] text-gray-400">{log.reason}</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-gray-800 text-sm">Rp {log.price.toLocaleString()}</p>
                            <button onClick={() => removeLog(log.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
                {logs.filter(l => l.type === 'waste').length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs italic">Belum ada data waste</div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-32">
            <PanelHeader title="Smart OpEx" icon={TrendingUp} onBack={onBack} />

            <div className="px-4 space-y-4 -mt-6 relative z-10">
                {/* Segmented Control */}
                <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex">
                        {(['utilities', 'petty', 'waste'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'utilities' ? 'Utilities' : tab === 'petty' ? 'Petty Cash' : 'Waste'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                    {activeTab === 'utilities' && renderUtilities()}
                    {activeTab === 'petty' && renderPettyCash()}
                    {activeTab === 'waste' && renderWaste()}
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-[100] max-w-md mx-auto">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Expense</span>
                    <span className="text-xl font-black text-gray-800">Rp {getTotalExpense().toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};
