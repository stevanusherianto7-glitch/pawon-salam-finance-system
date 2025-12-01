
import React, { useEffect, useState, useRef } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi } from '../../services/api';
import { ArrowLeft, DollarSign, Activity, Utensils, TrendingUp, TrendingDown, Filter, Package, ChevronDown, Download } from 'lucide-react';
import { OwnerDashboardData, TrendData } from '../../types';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  onBack: () => void;
}

// Helper Components
const TrendBadge = ({ data, inverseColor = false }: { data: TrendData, inverseColor?: boolean }) => {
  let isPositive = data.trend === 'UP';
  if (inverseColor) isPositive = !isPositive;
  if (data.trend === 'STABLE') return <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">Stable</span>;
  const colorClass = isPositive ? 'text-emerald-600 bg-emerald-100 border-emerald-200' : 'text-rose-600 bg-rose-100 border-rose-200';
  const Icon = data.trend === 'UP' ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorClass}`}>
      <Icon size={10} /> {Math.abs(data.percentageChange)}%
    </span>
  );
};

const KPICard = ({ label, value, trend, icon: Icon, colorClass, subValue, gradientFrom, gradientTo }: any) => (
  <div className={`relative overflow-hidden rounded-3xl p-5 border border-white/40 shadow-xl backdrop-blur-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} group hover:scale-[1.02] transition-all duration-300`}>
    <div className="absolute top-0 right-0 p-4 opacity-10">
      <Icon size={64} className="text-gray-900" />
    </div>

    <div className="relative z-10 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-xl bg-white/40 backdrop-blur-md shadow-sm ${colorClass}`}>
            <Icon size={18} />
          </div>
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</p>
        </div>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-3xl font-black text-gray-800 tracking-tight">{value}</h3>
          {subValue && <span className="text-xs text-gray-500 font-medium">{subValue}</span>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        {trend ? <TrendBadge data={trend} /> : <span className="h-4"></span>}
      </div>
    </div>
  </div>
);

const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

export const ReportOperationalScreen: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [location, setLocation] = useState('ALL');

  useEffect(() => {
    const loadKPIs = async () => {
      setLoading(true);
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const res = await ownerApi.getDashboardKPIs(month, year, location === 'ALL' ? undefined : location);
      if (res.success && res.data) setData(res.data);
      setLoading(false);
    };
    loadKPIs();
  }, [selectedDate, location]);

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#F9FAFB',
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Laporan_Operasional_${selectedDate.toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Export failed", error);
      alert("Gagal mengexport PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-gray-50" ref={contentRef}>
      <BackgroundPattern />

      <div className="relative z-10 p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white/60 rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg transition-all backdrop-blur-xl border border-white/40 group">
            <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex-1">
            <h2 className="font-black text-2xl text-gray-800 tracking-tight">Efisiensi Operasional</h2>
            <p className="text-sm text-gray-500 font-medium">Analisa Kinerja & Stok</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="p-3 bg-white/60 text-gray-700 rounded-2xl shadow-sm border border-white/40 hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
              title="Export PDF"
            >
              <Download size={18} />
            </button>

            {/* Stock Opname Button */}
            <button className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 transition-all active:scale-95">
              <Package size={18} />
              <span className="text-xs font-bold">Stock Opname</span>
            </button>
          </div>
        </div>

        {/* Filters - High Z-Index */}
        <div className="relative z-50 bg-white/60 backdrop-blur-xl p-2 rounded-2xl shadow-sm border border-white/40 flex items-center justify-between">
          <div className="relative group">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="appearance-none bg-white/50 border border-white/40 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-gray-700 outline-none focus:bg-white focus:shadow-md transition-all cursor-pointer hover:bg-white/80 min-w-[160px]"
            >
              <option value="ALL">Semua Outlet</option>
              <option value="JAKARTA">Jakarta</option>
              <option value="BANDUNG">Bandung</option>
              <option value="SURABAYA">Surabaya</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
          </div>

          <div className="w-[200px] relative z-50">
            <GlassDatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />
          </div>
        </div>

        {loading || !data ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm font-medium">Memuat data operasional...</p>
          </div>
        ) : (
          <div className="relative z-0 grid grid-cols-2 gap-4">
            <KPICard
              label="Table Turnover"
              value={data.operational.tableTurnoverRate.value}
              subValue="kali/hari"
              trend={data.operational.tableTurnoverRate}
              icon={Activity}
              colorClass="text-indigo-600"
              gradientFrom="from-indigo-50"
              gradientTo="to-white"
            />
            <KPICard
              label="Avg Order Value"
              value={formatCurrency(data.operational.avgOrderValue.value)}
              trend={data.operational.avgOrderValue}
              icon={DollarSign}
              colorClass="text-emerald-600"
              gradientFrom="from-emerald-50"
              gradientTo="to-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
