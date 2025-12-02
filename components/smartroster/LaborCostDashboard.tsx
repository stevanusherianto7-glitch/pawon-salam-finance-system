import React from 'react';
import { TrendingUp, Users, DollarSign, AlertTriangle, TrendingDown } from 'lucide-react';
import { LaborCostSnapshot, AlertLevel } from '../../types';

interface Props {
    metrics: LaborCostSnapshot;
}

export const LaborCostDashboard: React.FC<Props> = ({ metrics }) => {
    const getAlertColor = (level: AlertLevel) => {
        switch (level) {
            case 'GREEN':
                return 'bg-green-500';
            case 'YELLOW':
                return 'bg-yellow-500';
            case 'RED':
                return 'bg-red-500';
        }
    };

    const getAlertText = (level: AlertLevel) => {
        switch (level) {
            case 'GREEN':
                return 'Optimal';
            case 'YELLOW':
                return 'Perhatian';
            case 'RED':
                return 'Kritis!';
        }
    };

    const getPercentageColor = (percentage: number) => {
        if (percentage > 30) return 'text-red-600';
        if (percentage > 25) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getProgressBarColor = (percentage: number) => {
        if (percentage > 30) return 'bg-red-500';
        if (percentage > 25) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="glass-card p-4">
            {/* Header with Alert */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2 text-gray-800">
                    <Users size={18} className="text-orange-500" />
                    Labor Cost Analysis
                </h3>
                <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getAlertColor(metrics.alertLevel)}`}>
                    {getAlertText(metrics.alertLevel)}
                </div>
            </div>

            {/* Main Metric: Labor % */}
            <div className="mb-4 p-4 bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl border-2 border-orange-200">
                <p className="text-xs text-gray-600 mb-1 font-medium">Labor Cost Percentage</p>
                <div className="flex items-end gap-2">
                    <p className={`text-4xl font-bold ${getPercentageColor(metrics.laborPercentage)}`}>
                        {metrics.laborPercentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                        Target: &lt;30%
                        {metrics.laborPercentage > 30 ? (
                            <TrendingUp size={12} className="text-red-500" />
                        ) : (
                            <TrendingDown size={12} className="text-green-500" />
                        )}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-500 ${getProgressBarColor(metrics.laborPercentage)}`}
                        style={{ width: `${Math.min(metrics.laborPercentage / 50 * 100, 100)}%` }}
                    />
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Biaya Tenaga Kerja</p>
                    <p className="font-bold text-lg text-orange-600">
                        Rp {(metrics.estimatedLaborCost / 1000).toFixed(0)}K
                    </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Omzet Hari Ini</p>
                    <p className="font-bold text-lg text-green-600">
                        Rp {(metrics.dailyRevenue / 1000).toFixed(0)}K
                    </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Jumlah Staff</p>
                    <p className="font-bold text-lg text-gray-800">{metrics.totalStaffCount} orang</p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Revenue/Karyawan</p>
                    <p className="font-bold text-lg text-blue-600">
                        Rp {(metrics.revenuePerEmployee / 1000).toFixed(0)}K
                    </p>
                </div>
            </div>

            {/* Alert Section */}
            {metrics.laborPercentage > 30 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold text-red-700 text-sm">Biaya Tenaga Kerja Terlalu Tinggi!</p>
                        <p className="text-xs text-red-600 mt-1 leading-relaxed">
                            Pertimbangkan: (1) Kurangi staff shift berikutnya, atau (2) Tingkatkan penjualan
                        </p>
                    </div>
                </div>
            )}

            {metrics.laborPercentage <= 25 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                    <TrendingDown size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="font-bold text-green-700 text-sm">Labor Cost Optimal! 🎉</p>
                        <p className="text-xs text-green-600 mt-1">
                            Biaya tenaga kerja berada di bawah target. Pertahankan efisiensi ini!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
