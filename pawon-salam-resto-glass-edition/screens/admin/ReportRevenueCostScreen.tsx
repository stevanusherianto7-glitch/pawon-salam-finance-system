import React, { useEffect, useState } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi } from '../../services/api';
import { ArrowLeft, Activity, Filter } from 'lucide-react';
import { OwnerDashboardData } from '../../types';
import { PeriodFilter } from '../../components/PeriodFilter';

interface Props {
  onBack: () => void;
}

const RevenueChart = ({ data }: { data: { label: string, revenue: number, cost: number }[] }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.revenue, d.cost)));
    
    return (
        <div className="flex items-end justify-between h-64 gap-2 mt-4 px-2">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1 flex-1 group cursor-pointer">
                    <div className="w-full flex gap-1 items-end justify-center h-full relative">
                        <div className="w-4 bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all" style={{ height: `${(d.revenue / maxVal) * 100}%` }}></div>
                        <div className="w-4 bg-red-400 rounded-t-md hover:bg-red-500 transition-all" style={{ height: `${(d.cost / maxVal) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

export const ReportRevenueCostScreen: React.FC<Props> = ({ onBack }) => {
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
    <div className="bg-gray-50 min-h-screen">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg leading-tight">Tren Pendapatan vs Biaya</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Visualisasi Grafik Mingguan</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1"><Filter size={12}/> Filter</span>
            <div className="flex gap-2 items-center">
               <select 
                 value={location} 
                 onChange={(e) => setLocation(e.target.value)} 
                 className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition"
               >
                   <option value="ALL">Semua Outlet</option>
               </select>
               <PeriodFilter onPeriodChange={handlePeriodChange} />
            </div>
        </div>

        {loading || !data ? (
            <div className="text-center py-20 text-gray-400">Memuat data...</div>
        ) : (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-center mb-2">
                   <p className="text-sm font-bold text-gray-700">Grafik Mingguan</p>
                   <div className="flex gap-3">
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div><span className="text-xs text-gray-500">Revenue</span></div>
                       <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><span className="text-xs text-gray-500">Cost</span></div>
                   </div>
               </div>
               <RevenueChart data={data.financial.chartData} />
            </div>
        )}
      </div>
    </div>
  );
};