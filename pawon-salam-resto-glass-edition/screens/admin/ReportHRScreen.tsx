
import React, { useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi } from '../../services/api';
import { ArrowLeft, Users, Calendar, TrendingUp, TrendingDown, Filter, Star } from 'lucide-react';
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

const KPICard = ({ label, value, trend, icon: Icon, colorClass, inverseTrend = false, subValue }: any) => (
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
             {trend ? <TrendBadge data={trend} inverseColor={inverseTrend} /> : <span className="h-4"></span>}
             <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-20`}>
                 <Icon size={14} className={colorClass.split(' ')[0]} />
             </div>
        </div>
    </div>
);

export const ReportHRScreen: React.FC<Props> = ({ onBack }) => {
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
            <h2 className="font-bold text-white text-xl leading-tight">Kinerja Tim & SDM</h2>
            <p className="text-xs text-orange-100/80 font-medium mt-0.5">Analisa Kinerja Sumber Daya Manusia</p>
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
            <>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <KPICard 
                        label="Staff Turnover" 
                        value={`${data.hr.employeeTurnoverRate.value}%`}
                        trend={data.hr.employeeTurnoverRate}
                        inverseTrend={true}
                        icon={Users}
                        colorClass="text-pink-400"
                    />
                    <KPICard 
                        label="Attendance" 
                        value={`${data.hr.attendanceCompliance}%`}
                        icon={Calendar}
                        colorClass="text-blue-400"
                        subValue="Compliance"
                    />
                </div>
                
                <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/10">
                    <p className="text-sm font-bold text-white/90 mb-4 uppercase tracking-wider">Top Performers</p>
                    <div className="space-y-3">
                        {data.hr.topEmployees.map((emp, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${i===0?'bg-yellow-500':i===1?'bg-gray-500':'bg-orange-600'}`}>
                                        {i+1}
                                    </div>
                                    <img src={emp.avatarUrl} className="w-10 h-10 rounded-full bg-gray-700 object-cover border border-white/10" alt={emp.name}/>
                                    <p className="text-sm font-bold text-white">{emp.name}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-lg text-green-300 border border-green-500/20">
                                    <Star size={12} fill="currentColor"/>
                                    <span className="text-xs font-bold">{emp.avgScore.toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
