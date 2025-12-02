import React, { useState } from 'react';
import { ArrowLeft, Megaphone, Target, TrendingUp, BarChart3, Users } from 'lucide-react';
import { colors } from '../../theme/colors';
import { MarketingBudgetModal } from '../../components/features/MarketingBudgetModal';
import { useMarketingStore } from '../../stores/useMarketingStore';

interface PanelProps {
    onBack: () => void;
    onNavigate?: (screen: string) => void;
}

export const MarketingManagerPanel: React.FC<PanelProps> = ({ onBack }) => {
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const { getRemainingBudget, budget } = useMarketingStore();

    const remaining = getRemainingBudget();
    const percentage = (remaining / budget) * 100;

    return (
        <div className="bg-gray-50 pb-24 min-h-screen pt-6">

            <div className="px-4 space-y-3 relative z-10">

                {/* Marketing Command Card */}
                <div
                    onClick={() => setShowBudgetModal(true)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-all group"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-100 transition-colors">
                                <Target size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-sm">Marketing Command</h3>
                                <p className="text-[10px] text-gray-400">Budget & ROI Controller</p>
                            </div>
                        </div>
                        <div className="px-2.5 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-bold">
                            Active
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-gray-500">
                            <span>Sisa Budget</span>
                            <span className={remaining < 0 ? 'text-red-500' : 'text-gray-800'}>
                                Rp {remaining.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${remaining < budget * 0.1 ? 'bg-red-500' : 'bg-purple-500'}`}
                                style={{ width: `${Math.max(0, Math.min(percentage, 100))}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={16} className="text-green-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Engagement</span>
                        </div>
                        <p className="text-xl font-black text-gray-800">4.2%</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-blue-500" />
                            <span className="text-[10px] font-bold text-gray-400 uppercase">Reach</span>
                        </div>
                        <p className="text-xl font-black text-gray-800">45K</p>
                    </div>
                </div>

            </div>

            {/* Modals */}
            <MarketingBudgetModal
                isOpen={showBudgetModal}
                onClose={() => setShowBudgetModal(false)}
            />
        </div>
    );
};
