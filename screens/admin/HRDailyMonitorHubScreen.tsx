import React from 'react';
import { ArrowLeft, CheckSquare, ClipboardList } from 'lucide-react';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';

interface Props {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export const HRDailyMonitorHubScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      <BackgroundPattern />

      {/* Header */}
      <div className="relative z-10 p-4 pt-10">
        <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack} className="p-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
                <h2 className="text-xl font-bold text-white">Monitoring Harian</h2>
                <p className="text-xs text-white/70">Pilih laporan yang ingin Anda lihat</p>
            </div>
        </div>
      </div>
      
      <div className="relative z-10 px-4 space-y-4">
        <div className="grid grid-cols-1 gap-4">
            <PremiumGlassCard
                title="Laporan Checklist Harian"
                subtitle="Lihat skor performa harian staff"
                icon={CheckSquare}
                onClick={() => onNavigate('dailyChecklistList')}
                themeColor="orange"
            />
            <PremiumGlassCard
                title="Laporan Jobdesk Staff"
                subtitle="Monitor penyelesaian tugas"
                icon={ClipboardList}
                onClick={() => onNavigate('jobdeskMonitor')}
                themeColor="blue"
            />
        </div>
      </div>
    </div>
  );
};
