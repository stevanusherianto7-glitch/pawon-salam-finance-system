
import React, { useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi } from '../../services/api';
import { ArrowLeft, DollarSign, Activity, Utensils, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { OwnerDashboardData, TrendData } from '../../types';
import { PeriodFilter } from '../../components/PeriodFilter';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

interface Props {
  onBack: () => void;
}

// Helper Components
const TrendBadge = ({ data, inverseColor = false }: { data: TrendData, inverseColor?: boolean }) => {
    let isPositive = data.trend === 'UP';
    if (inverseColor) isPositive = !isPositive;
    if (data.trend === 'STABLE') return <span className="text-[10px] text-white/40 font-medium bg-white/10 px-1.5 py-0.5 rounded">Stable</span>;
    const colorClass = isPositive ? 'text-green-300 bg-green-500/20 border-green-500/30' : 'text-red-300 bg-red-500/20 border-red-500/30';
    const Icon = data.trend === 'UP' ? TrendingUp : TrendingDown;
    return (
        <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorClass}`}>
            <Icon size={10} /> {Math.abs(data.percentageChange)}%
        </span>
    );
};

const KPICard = ({ label, value, trend, icon: Icon, colorClass, subValue }: any) => (
    <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/10 flex flex-col justify-between h-full relative overflow-hidden group hover:bg-black/30 transition-all">
        <div className={`absolute top-0 right-0 p-3 opacity-20 rounded-bl-2xl ${colorClass.replace('text-', 'bg-')}`}>
            <Icon size={32} />
        </div>
        <div>
            <p className="text-xs text-white/50 font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <h3 className="text-2xl font-bold text-white leading-tight">{value}</h3>
                {subValue && <span className="text-xs text-white/60 font-medium">{subValue}</span>}
            </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
             {trend ? <TrendBadge data={trend} /> : <span className="h-4"></span>}
             <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-20`}>
                 <Icon size={14} className={colorClass.split(' ')[0]} />
             </div>
        </div>
    </div>
);

const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

export const ReportOperationalScreen: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState('ALL');

  useEffect(() => {
    const loadKPIs = async () => {
        setLoading(true);
        const res = await ownerApi.getDashboardKPIs(month, year, location === 'ALL' ? undefined : location);
        if (res.success && res.data) setData(res.data);
        setLoading(false);
    };
    loadKPIs();
  }, [month, year, location]);

  const handlePeriodChange = (period: { month: number; year: number }) => {
    setMonth(period.month);
    setYear(period.year);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      <BackgroundPattern />

      <div className="relative z-10 p-4 pt-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors backdrop-blur-sm">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-white text-xl leading-tight">Efisiensi Operasional</h2>
            <p className="text-xs text-orange-100/80 font-medium mt-0.5">Analisa Kinerja Operasional</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4">
        <div className="bg-black/20 backdrop-blur-xl p-3 rounded-2xl shadow-sm border border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold text-white/60 flex items-center gap-1"><Filter size={12}/> Filter</span>
            <div className="flex gap-2 items-center">
               <select 
                 value={location} 
                 onChange={(e) => setLocation(e.target.value)} 
                 className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:bg-white/20 transition"
               >
                   <option value="ALL" className="text-black">Semua Outlet</option>
               </select>
               <PeriodFilter onPeriodChange={handlePeriodChange} />
            </div>
        </div>

        {loading || !data ? (
            <div className="text-center py-20 text-white/50 text-sm">Memuat data...</div>
        ) : (
            <div className="grid grid-cols-2 gap-3">
                <KPICard 
                    label="Table Turnover" 
                    value={data.operational.tableTurnoverRate.value}
                    subValue="kali/hari"
                    trend={data.operational.tableTurnoverRate}
                    icon={Activity}
                    colorClass="text-indigo-400"
                />
                <KPICard 
                    label="Avg Order Value" 
                    value={formatCurrency(data.operational.avgOrderValue.value)}
                    trend={data.operational.avgOrderValue}
                    icon={DollarSign}
                    colorClass="text-teal-400"
                />
            </div>
        )}
      </div>
    </div>
  );
};
