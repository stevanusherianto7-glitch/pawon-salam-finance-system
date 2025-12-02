
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { colors } from '../../theme/colors';
import { performanceApi } from '../../services/api';
import { DashboardAnalytics } from '../../types';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

interface Props {
  onBack: () => void;
}

export const HRTrendReportScreen: React.FC<Props> = ({ onBack }) => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const statsRes = await performanceApi.getDashboardStats(month, year);
      if (statsRes.success && statsRes.data) setAnalytics(statsRes.data);
      setLoading(false);
    };
    loadData();
  }, [month, year]);

  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
    if (trend === 'UP') return <span className="text-green-400">↑</span>;
    if (trend === 'DOWN') return <span className="text-red-400">↓</span>;
    return <span className="text-white/40">→</span>;
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      <BackgroundPattern />

      {/* Header */}
      <div className="relative z-10 p-4 pt-8">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1.5 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors backdrop-blur-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-white text-lg leading-tight">Laporan Tren Indikator</h2>
            <p className="text-[10px] text-orange-100/80 font-medium mt-0.5">Analisa performa tim</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4">
        {/* Filter Glass */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex justify-between items-center shadow-lg">
          <span className="text-xs font-bold text-white/70 pl-2">Periode</span>
          <div className="flex gap-2">
            <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm outline-none text-white focus:bg-white/20">
              {[...Array(12)].map((_, i) => <option key={i} value={i + 1} className="text-black">{new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}</option>)}
            </select>
            <select value={year} onChange={e => setYear(parseInt(e.target.value))} className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm outline-none text-white focus:bg-white/20">
              <option value={2023} className="text-black">2023</option>
              <option value={2024} className="text-black">2024</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/50 text-sm">Memuat data...</div>
        ) : !analytics ? (
          <div className="text-center py-20 text-white/50 text-sm">Data tidak tersedia.</div>
        ) : (
          <div className="bg-black/20 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-white/10">
            <h3 className="font-bold text-white mb-4 text-xs flex items-center gap-2 uppercase tracking-wider">
              <TrendingUp size={14} className="text-orange-400" /> Tren Kinerja
            </h3>
            <div className="space-y-3">
              {analytics.itemTrends.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-2.5 last:border-0">
                  <span className="text-xs text-white/80 font-medium capitalize">{item.label.toLowerCase()}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-white">{item.value}</span>
                    <span className="text-base font-mono font-bold">{getTrendIcon(item.trend)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
