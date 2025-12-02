import React, { useState } from 'react';
import { X, Zap, Droplets, Wifi, Flame, Plus, Trash2, Wallet, AlertTriangle } from 'lucide-react';
import { useOpexStore, OpexLog } from '../../stores/useOpexStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'utilities' | 'petty' | 'waste';

export const SmartOpexModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('utilities');
    const { utilities, logs, setUtility, addLog, removeLog, getTotalExpense } = useOpexStore();

    // Temporary state for new log input
    const [isAddingLog, setIsAddingLog] = useState(false);
    const [newLog, setNewLog] = useState({ name: '', price: '', reason: '' });

    if (!isOpen) return null;

    const handleAddLog = () => {
        if (!newLog.name || !newLog.price) return;
        addLog({
            type: activeTab === 'petty' ? 'petty' : 'waste',
            name: newLog.name,
            price: parseFloat(newLog.price),
            reason: newLog.reason
        });
        setNewLog({ name: '', price: '', reason: '' });
        setIsAddingLog(false);
    };

    const renderUtilities = () => (
        <div className="space-y-4 p-4 pb-[200px]">
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

    const renderLogList = (type: 'petty' | 'waste') => {
        const filteredLogs = logs.filter(l => l.type === type);
        return (
            <div className="space-y-3 p-4 pb-[200px]">
                {filteredLogs.map(log => (
                    <div key={log.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${type === 'petty' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {type === 'petty' ? <Wallet size={20} /> : <Trash2 size={20} />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{log.name}</p>
                                <p className="text-xs text-gray-400">{log.reason || '-'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-orange-600">Rp {log.price.toLocaleString()}</p>
                            <button onClick={() => removeLog(log.id)} className="text-gray-300 hover:text-red-500 text-xs mt-1">Hapus</button>
                        </div>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-sm italic">
                        Belum ada data {type === 'petty' ? 'Petty Cash' : 'Waste'}
                    </div>
                )}

                {/* FAB */}
                <button
                    onClick={() => setIsAddingLog(true)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg shadow-orange-500/30 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
                >
                    <Plus size={28} />
                </button>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full sm:max-w-md h-[calc(100vh-110px)] mb-[110px] sm:h-[90vh] sm:mb-0 bg-gray-50 rounded-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">

                {/* Header */}
                <div className="bg-white p-4 flex justify-between items-center border-b border-gray-100 z-20">
                    <div>
                        <h2 className="text-lg font-black text-gray-800">Smart OPEX</h2>
                        <p className="text-xs text-gray-500">Tracker Biaya Harian</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Segmented Control */}
                <div className="bg-white px-4 pb-4 pt-2 border-b border-gray-100 z-20">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['utilities', 'petty', 'waste'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                    ? 'bg-white text-orange-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'utilities' ? 'Utilities' : tab === 'petty' ? 'Petty Cash' : 'Waste'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {activeTab === 'utilities' && renderUtilities()}
                    {activeTab === 'petty' && renderLogList('petty')}
                    {activeTab === 'waste' && renderLogList('waste')}
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-[10000]">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Expense</span>
                        <span className="text-xl font-black text-gray-800">Rp {getTotalExpense().toLocaleString()}</span>
                    </div>
                </div>

            </div>

            {/* Add Log Modal (Overlay) - Moved outside to avoid overflow clipping */}
            {isAddingLog && (
                <div className="absolute inset-0 z-[10001] flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddingLog(false)} />
                    <div className="bg-white w-full sm:max-w-md rounded-2xl p-5 animate-scale-up shadow-2xl relative z-10 mb-4 sm:mb-0">
                        <h3 className="font-bold text-gray-800 mb-4">Tambah {activeTab === 'petty' ? 'Petty Cash' : 'Waste'}</h3>
                        <div className="space-y-3">
                            <input
                                autoFocus
                                type="text"
                                placeholder="Nama Item"
                                value={newLog.name}
                                onChange={e => setNewLog({ ...newLog, name: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-bold text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Harga (Rp)"
                                value={newLog.price}
                                onChange={e => setNewLog({ ...newLog, price: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500 font-bold text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Keterangan (Opsional)"
                                value={newLog.reason}
                                onChange={e => setNewLog({ ...newLog, reason: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-orange-500 text-sm"
                            />
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsAddingLog(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Batal</button>
                                <button onClick={handleAddLog} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
