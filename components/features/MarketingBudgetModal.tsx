import React, { useState } from 'react';
import { X, Megaphone, Target, TrendingUp, Plus, Trash2, DollarSign, Image, AlertCircle, BarChart3 } from 'lucide-react';
import { useMarketingStore } from '../../stores/useMarketingStore';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'budget' | 'campaigns' | 'roi';

export const MarketingBudgetModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('budget');
    const { budget, expenses, revenue, setBudget, addExpense, removeExpense, getRemainingBudget, getTotalSpend, getROAS } = useMarketingStore();

    // Temporary state for new expense
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [newExpense, setNewExpense] = useState({ channel: 'FB Ads', amount: '', campaign: '', evidence: '' });

    if (!isOpen) return null;

    const handleAddExpense = () => {
        if (!newExpense.amount || !newExpense.campaign) return;
        addExpense({
            channel: newExpense.channel,
            amount: parseFloat(newExpense.amount),
            campaign: newExpense.campaign,
            evidence: newExpense.evidence
        });
        setNewExpense({ channel: 'FB Ads', amount: '', campaign: '', evidence: '' });
        setIsAddingExpense(false);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500 animate-pulse';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const usagePercentage = (getTotalSpend() / budget) * 100;

    const renderBudgetControl = () => (
        <div className="flex-1 overflow-y-auto p-4 pb-32">
            {/* Budget Overview Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        <Target size={18} className="text-blue-500" />
                        Budget Bulan Ini
                    </h3>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-400 text-xs font-bold">Rp</span>
                        <input
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(parseFloat(e.target.value))}
                            className="w-32 pl-8 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-right outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1.5">
                        <span>Terpakai: {Math.min(usagePercentage, 100).toFixed(1)}%</span>
                        <span className={usagePercentage > 90 ? 'text-red-500' : 'text-gray-500'}>
                            Sisa: Rp {getRemainingBudget().toLocaleString()}
                        </span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                        <div
                            className={`h-full transition-all duration-500 ${getProgressColor(usagePercentage)}`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                    </div>
                </div>

                {usagePercentage > 90 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600">
                        <AlertCircle size={14} />
                        <span className="text-[10px] font-bold">Warning: Budget hampir habis! Stop spending.</span>
                    </div>
                )}
            </div>

            {/* Quick Add Expense */}
            <button
                onClick={() => setIsAddingExpense(true)}
                className="w-full py-4 bg-gradient-to-r from-[#E87722] to-[#F9A055] text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
                <Plus size={20} />
                Catat Pengeluaran Baru
            </button>
            {/* Recent Expenses List (Filling the Void) */}
            <div className="mt-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">Pengeluaran Terakhir</h4>
                <div className="space-y-3">
                    {expenses.slice(0, 3).map(exp => (
                        <div key={exp.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                                    <DollarSign size={16} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-xs">{exp.campaign}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{exp.channel}</p>
                                </div>
                            </div>
                            <p className="font-black text-gray-800 text-xs">Rp {exp.amount.toLocaleString()}</p>
                        </div>
                    ))}
                    {expenses.length === 0 && (
                        <div className="text-center py-4 text-gray-300 text-xs italic">Belum ada data</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderCampaignList = () => (
        <div className="flex-1 overflow-y-auto p-4 pb-32">
            {expenses.map(exp => (
                <div key={exp.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                            <Megaphone size={18} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{exp.campaign}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{exp.channel}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-gray-800">Rp {exp.amount.toLocaleString()}</p>
                        <button onClick={() => removeExpense(exp.id)} className="text-gray-300 hover:text-red-500 text-xs mt-1">Hapus</button>
                    </div>
                </div>
            ))}
            {expenses.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm italic">Belum ada pengeluaran marketing</div>
            )}
        </div>
    );

    const renderROI = () => (
        <div className="flex-1 overflow-y-auto p-4 pb-32">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Estimasi ROAS (Return on Ad Spend)</p>
                <div className="flex items-center justify-center gap-2">
                    <TrendingUp size={24} className="text-green-500" />
                    <span className="text-4xl font-black text-gray-800">{getROAS().toFixed(1)}x</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Setiap Rp 1 iklan menghasilkan Rp {getROAS().toFixed(0)} omzet</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Total Spend</p>
                    <p className="text-lg font-black text-blue-800">Rp {getTotalSpend().toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <p className="text-[10px] font-bold text-green-600 uppercase mb-1">Total Revenue</p>
                    <p className="text-lg font-black text-green-800">Rp {revenue.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="fixed inset-x-4 top-20 bottom-20 max-w-[480px] mx-auto z-[9999] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#E87722] to-[#F9A055] p-6 flex justify-between items-center border-b border-white/10 z-20">
                    <div>
                        <h2 className="text-lg font-black text-white">Marketing Command</h2>
                        <p className="text-xs text-white/80">Budget & ROI Tracker</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm">
                        <X size={20} className="text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white px-4 pb-4 pt-2 border-b border-gray-100 z-20">
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {(['budget', 'campaigns', 'roi'] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab === 'budget' ? 'Budget' : tab === 'campaigns' ? 'Campaigns' : 'ROI'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50">
                    {activeTab === 'budget' && renderBudgetControl()}
                    {activeTab === 'campaigns' && renderCampaignList()}
                    {activeTab === 'roi' && renderROI()}
                </div>

                {/* Sticky Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#E87722] to-[#F9A055] border-t border-white/10 px-6 py-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[10000]">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white/90 uppercase tracking-wider">Sisa Budget</span>
                        <span className="text-xl font-black text-white">
                            Rp {getRemainingBudget().toLocaleString()}
                        </span>
                    </div>
                </div>

            </div>

            {/* Add Expense Modal (Overlay) */}
            {isAddingExpense && (
                <div className="absolute inset-0 z-[10001] flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddingExpense(false)} />
                    <div className="bg-white w-full sm:max-w-md rounded-2xl p-5 animate-scale-up shadow-2xl relative z-10 mb-4 sm:mb-0">
                        <h3 className="font-bold text-gray-800 mb-4">Catat Pengeluaran</h3>
                        <div className="space-y-3">
                            <select
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-bold text-sm"
                                value={newExpense.channel}
                                onChange={e => setNewExpense({ ...newExpense, channel: e.target.value })}
                            >
                                <option value="FB Ads">Facebook Ads</option>
                                <option value="IG Ads">Instagram Ads</option>
                                <option value="TikTok Ads">TikTok Ads</option>
                                <option value="Influencer">Influencer / KOL</option>
                                <option value="Cetak">Cetak Brosur/Banner</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Nama Campaign (e.g. Promo Merdeka)"
                                value={newExpense.campaign}
                                onChange={e => setNewExpense({ ...newExpense, campaign: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-bold text-sm"
                            />
                            <input
                                type="number"
                                placeholder="Nominal (Rp)"
                                value={newExpense.amount}
                                onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-purple-500 font-bold text-sm"
                            />
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 border-dashed flex items-center justify-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                                <Image size={18} />
                                <span className="text-xs font-bold">Upload Bukti Transfer</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => setIsAddingExpense(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Batal</button>
                                <button onClick={handleAddExpense} className="flex-1 py-3 bg-gradient-to-r from-[#E87722] to-[#F9A055] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20">Simpan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
