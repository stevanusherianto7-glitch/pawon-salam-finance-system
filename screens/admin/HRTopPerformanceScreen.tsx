import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Trophy, Filter, Loader2 } from 'lucide-react';
import { performanceApi } from '../../services/api';
import { DashboardAnalytics } from '../../types';
import { PeriodFilter } from '../../components/PeriodFilter';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

interface Props {
  onBack: () => void;
}

export const HRTopPerformanceScreen: React.FC<Props> = ({ onBack }) => {
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

  const handlePeriodChange = (period: { month: number; year: number }) => {
    setMonth(period.month);
    setYear(period.year);
  };

  const getTrophy = (rank: number) => {
    if (rank === 0) return <Trophy size={24} className="text-yellow-400 fill-yellow-400/20 flex-shrink-0" />;
    if (rank === 1) return <Trophy size={24} className="text-gray-300 fill-gray-300/20 flex-shrink-0" />;
    return <Trophy size={24} className="text-orange-400 fill-orange-400/20 flex-shrink-0" />;
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      <BackgroundPattern />

      {/* Header */}
      <div className="relative z-10 p-4 pt-8">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1.5 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">Laporan Top Performance</h2>
            <p className="text-[10px] text-white/70">Karyawan dengan skor tertinggi</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4 space-y-4">
        {/* Filter */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-white/60 flex items-center gap-1"><Filter size={12} /> Periode</span>
          <PeriodFilter onPeriodChange={handlePeriodChange} />
        </div>

        {loading ? (
          <div className="text-center py-20 text-white/60 flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin" />
            <span>Memuat data...</span>
          </div>
        ) : !analytics || !analytics.topPerformers || analytics.topPerformers.length === 0 ? (
          <div className="text-center py-20 text-white/60 bg-black/20 rounded-2xl">Data tidak tersedia.</div>
        ) : (
          <div className="relative bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/20 overflow-hidden">
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <h3 className="font-bold text-white/80 text-[10px] uppercase tracking-wider mb-3 flex items-center gap-1.5 relative z-10">
              <Trophy size={14} className="text-yellow-400/80" /> Papan Peringkat Karyawan
            </h3>
            <div className="space-y-2.5 relative z-10">
              {analytics.topPerformers.map((emp, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between bg-white/5 p-2.5 rounded-xl border transition-all duration-300
                                        ${idx === 0
                      ? 'border-yellow-400/30 shadow-lg shadow-yellow-500/10'
                      : 'border-white/10'}
                                        hover:bg-white/10 hover:border-white/20`}
                >
                  <div className="flex items-center gap-3">
                    {getTrophy(idx)}
                    <img src={emp.avatarUrl} alt={emp.name} className="w-9 h-9 rounded-full bg-gray-700 object-cover border-2 border-white/10" />
                    <span className="text-xs font-bold text-white">{emp.name}</span>
                  </div>
                  <span className="text-base font-bold text-green-400">{emp.avgScore.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};