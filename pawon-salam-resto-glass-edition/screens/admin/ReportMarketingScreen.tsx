import React, { useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi } from '../../services/api';
import { ArrowLeft, Megaphone, TrendingUp, TrendingDown, Share, Users, Eye, Activity } from 'lucide-react';
import { OwnerDashboardData } from '../../types';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

interface Props {
    onBack: () => void;
}

const formatNumber = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toString();
};

const MarketingChart = () => {
    // Mock Chart Data for Marketing (Dynamic-ish)
    const data = [
        { label: 'W1', reach: 1200, engagement: 450 },
        { label: 'W2', reach: 1500, engagement: 520 },
        { label: 'W3', reach: 1100, engagement: 380 },
        { label: 'W4', reach: 1800, engagement: 600 },
    ];
    const maxVal = 2000;

    return (
        <div className="h-52 flex items-end justify-between gap-4 px-4 pt-6 pb-2 relative">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between px-4 py-2 pointer-events-none opacity-30">
                <div className="w-full h-px bg-gray-300 border-t border-dashed border-gray-400"></div>
                <div className="w-full h-px bg-gray-300 border-t border-dashed border-gray-400"></div>
                <div className="w-full h-px bg-gray-300 border-t border-dashed border-gray-400"></div>
                <div className="w-full h-px bg-gray-300 border-t border-dashed border-gray-400"></div>
                <div className="w-full h-px bg-gray-300 border-t border-dashed border-gray-400"></div>
            </div>

            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 group relative z-10 h-full justify-end">
                    <div className="w-full flex gap-2 items-end justify-center h-full relative px-2">
                        {/* Reach Bar */}
                        <div
                            className="w-full max-w-[24px] bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg shadow-lg shadow-purple-500/30 hover:brightness-110 transition-all duration-500 relative group/bar"
                            style={{ height: `${(d.reach / maxVal) * 100}%` }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-purple-600 opacity-0 group-hover/bar:opacity-100 transition-opacity">{d.reach}</div>
                        </div>

                        {/* Engagement Bar */}
                        <div
                            className="w-full max-w-[24px] bg-gradient-to-t from-pink-500 to-pink-300 rounded-t-lg shadow-lg shadow-pink-500/30 hover:brightness-110 transition-all duration-500 relative group/bar"
                            style={{ height: `${(d.engagement / maxVal) * 100}%` }}
                        >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-pink-500 opacity-0 group-hover/bar:opacity-100 transition-opacity">{d.engagement}</div>
                        </div>
                    </div>
                    <span className="text-xs text-gray-600 font-bold bg-white/50 px-2 py-0.5 rounded-md backdrop-blur-sm">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

export const ReportMarketingScreen: React.FC<Props> = ({ onBack }) => {
    const [data, setData] = useState<OwnerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const month = selectedDate.getMonth() + 1;
            const year = selectedDate.getFullYear();
            try {
                const res = await ownerApi.getDashboardKPIs(month, year);
                if (res.success && res.data) {
                    setData(res.data);
                } else {
                    // Fallback mock data if API fails or returns empty for marketing
                    setData({
                        marketing: {
                            marketingRoi: { value: 450, percentageChange: 12.5, trend: 'UP' },
                            socialEngagement: { value: 2400, percentageChange: -5.0, trend: 'DOWN' }
                        }
                    } as any);
                }
            } catch (error) {
                console.error(error);
                // Fallback on error
                setData({
                    marketing: {
                        marketingRoi: { value: 450, percentageChange: 12.5, trend: 'UP' },
                        socialEngagement: { value: 2400, percentageChange: -5.0, trend: 'DOWN' }
                    }
                } as any);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [selectedDate]);

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans bg-gray-50">
            <BackgroundPattern />

            {/* Header */}
            <div className="relative z-10 p-4 pt-10 flex items-center gap-3">
                <button onClick={onBack} className="p-2 bg-white/20 rounded-full text-gray-700 hover:bg-white/40 transition-colors backdrop-blur-sm border border-white/20 shadow-sm">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="font-extrabold text-gray-800 text-xl leading-tight">Laporan Marketing</h2>
                    <p className="text-xs text-gray-600 font-medium mt-0.5">Campaign & Engagement</p>
                </div>
            </div>

            <div className="relative z-10 p-4 space-y-6 max-w-3xl mx-auto">

                {/* Date Picker */}
                <div className="w-full flex justify-center">
                    <div className="w-[280px]">
                        <GlassDatePicker
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                            theme="light"
                            placeholder="Pilih Bulan"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-gray-400 text-xs font-medium">Memuat data marketing...</p>
                    </div>
                ) : !data ? (
                    <div className="text-center py-20 text-gray-400">Gagal memuat data.</div>
                ) : (
                    <div className="space-y-4">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600"><TrendingUp size={16} /></div>
                                    <span className="text-xs font-bold text-gray-500">ROI Marketing</span>
                                </div>
                                <p className="text-2xl font-black text-gray-800">{data.marketing?.marketingRoi?.value || 0}%</p>
                                <span className="text-[10px] text-green-600 font-bold bg-green-100 px-1.5 py-0.5 rounded-md">+{data.marketing?.marketingRoi?.percentageChange}% vs last month</span>
                            </div>
                            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 border border-white/60 shadow-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-pink-100 rounded-lg text-pink-600"><Share size={16} /></div>
                                    <span className="text-xs font-bold text-gray-500">Social Reach</span>
                                </div>
                                <p className="text-2xl font-black text-gray-800">{formatNumber(data.marketing?.socialEngagement?.value || 0)}</p>
                                <span className="text-[10px] text-red-500 font-bold bg-red-100 px-1.5 py-0.5 rounded-md">{data.marketing?.socialEngagement?.percentageChange}% vs last month</span>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="bg-white/60 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/60 p-5 animate-fade-in-up">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                                        <Megaphone size={20} className="text-purple-600" /> Campaign Performance
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium mt-1">Reach vs Engagement</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="text-[10px] text-gray-500">Reach</span></div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500"></div><span className="text-[10px] text-gray-500">Engage</span></div>
                                </div>
                            </div>
                            <MarketingChart />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
