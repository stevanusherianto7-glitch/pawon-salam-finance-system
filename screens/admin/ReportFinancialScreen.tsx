
import React, { useEffect, useState, useRef } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi, mockExportApi } from '../../services/api';
import { ArrowLeft, DollarSign, Activity, Utensils, Users, TrendingUp, TrendingDown, Filter, Calendar, MapPin, Clock, Download } from 'lucide-react';
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
  const colorClass = isPositive ? 'text-green-600 bg-green-100 border-green-200' : 'text-red-600 bg-red-100 border-red-200';
  const Icon = data.trend === 'UP' ? TrendingUp : TrendingDown;
  return (
    <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorClass}`}>
      <Icon size={10} /> {Math.abs(data.percentageChange)}%
    </span>
  );
};

const KPICard = ({ label, value, trend, icon: Icon, colorClass, inverseTrend = false }: any) => {
  // Extract base color for the icon background (e.g., text-blue-600 -> bg-blue-100)
  const baseColor = colorClass.split('-')[1];
  const iconBgClass = `bg-${baseColor}-100`;
  const iconColorClass = `text-${baseColor}-500`;

  return (
    <div className="bg-white/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-lg border border-white/50 flex flex-col justify-between h-full relative overflow-hidden group hover:bg-white/90 transition-all">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
          <h3 className="text-xl font-extrabold text-gray-800 leading-tight">{value}</h3>
        </div>
        {/* Icon with Pastel Background */}
        <div className={`p-2.5 rounded-xl ${iconBgClass} ${iconColorClass} shadow-sm`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5">
        {trend ? <TrendBadge data={trend} inverseColor={inverseTrend} /> : <span className="h-4"></span>}
        <div className={`p-1 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon size={12} className={colorClass.split(' ')[0]} />
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (val: number) => {
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}M`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
  return `Rp ${val.toLocaleString('id-ID')}`;
};

export const ReportFinancialScreen: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState('ALL');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Real-time clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const month = selectedDate.getMonth() + 1;
        const year = selectedDate.getFullYear();

        const [kpiRes, trxRes] = await Promise.all([
          ownerApi.getDashboardKPIs(month, year, location === 'ALL' ? undefined : location),
          (ownerApi as any).getFinancialTransactions(month, year, location === 'ALL' ? undefined : location)
        ]);

        if (kpiRes.success && kpiRes.data) setData(kpiRes.data);
        if (trxRes && trxRes.success) setTransactions(trxRes.data);
      } catch (error) {
        console.error("Failed to load financial data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
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
      pdf.save(`Laporan_Keuangan_${selectedDate.toISOString().split('T')[0]}.pdf`);
      // After successful local PDF generation, simulate API call for confirmation/logging
      const res = await mockExportApi.exportPDF("Laporan Keuangan");
      if (res.success) alert(res.message);
    } catch (error) {
      console.error("Export failed", error);
      // If html2canvas/jsPDF fails, or mockExportApi fails, show generic error
      alert("Gagal mengexport PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans bg-gray-50" ref={contentRef}>
      <BackgroundPattern />

      {/* Header - Transparent to match original layout */}
      <div className="relative z-10 p-4 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/20 rounded-full text-gray-700 hover:bg-white/40 transition-colors backdrop-blur-sm border border-white/20 shadow-sm">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="font-extrabold text-gray-800 text-lg leading-tight">Laporan Keuangan</h2>
            <p className="text-[10px] text-gray-600 font-medium mt-0.5">Kinerja Finansial Bisnis</p>
          </div>
        </div>
        {/* Real-time Clock & Export */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xl font-black text-gray-800 tracking-tighter leading-none">
              {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}
            </p>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
              {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', '')}
            </p>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="p-2.5 bg-white/60 text-gray-700 rounded-2xl shadow-sm border border-white/40 hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Export PDF"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="relative z-10 p-4 space-y-4 max-w-3xl mx-auto">
        {/* Filter Bar - High Z-Index */}
        <div className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Outlet Dropdown */}
          <div className="relative w-[240px] h-[44px] group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <MapPin size={16} />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-full bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl pl-10 pr-4 text-xs font-bold text-gray-800 outline-none focus:bg-white focus:border-orange-300 transition appearance-none cursor-pointer shadow-sm text-center"
            >
              <option value="ALL">Semua Outlet</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Semarang">Semarang</option>
              <option value="Yogyakarta">Yogyakarta</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="w-[240px] h-[44px] relative z-50">
            <GlassDatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
              theme="light"
              placeholder="Pilih Tanggal"
            />
          </div>
        </div>
        {loading || !data ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-400 text-xs font-medium">Memuat data keuangan...</p>
          </div>
        ) : (
          <div className="relative z-0">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 animate-fade-in-up mb-4">
              <KPICard
                label="Total Revenue"
                value={formatCurrency(data.financial.totalRevenue.value)}
                trend={data.financial.totalRevenue}
                icon={Activity}
                colorClass="text-blue-600"
              />
              <KPICard
                label="Net Profit"
                value={formatCurrency(data.financial.netProfit.value)}
                trend={data.financial.netProfit}
                icon={DollarSign}
                colorClass="text-green-600"
              />
              <KPICard
                label="Food Cost %"
                value={`${data.financial.foodCostPercentage.value}%`}
                trend={data.financial.foodCostPercentage}
                inverseTrend={true}
                icon={Utensils}
                colorClass="text-orange-600"
              />
              <KPICard
                label="Labor Cost %"
                value={`${data.financial.laborCostPercentage.value}%`}
                trend={data.financial.laborCostPercentage}
                inverseTrend={true}
                icon={Users}
                colorClass="text-purple-600"
              />
            </div>

            {/* Transaction List (Database) - PREMIUM GLASS STYLE */}
            <div className="bg-white/60 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden animate-fade-in-up delay-100 relative group">
              {/* Decorative gradient blob */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-400/20 transition-all duration-700"></div>

              <div className="p-4 border-b border-white/40 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                    <Activity size={12} />
                  </div>
                  <h3 className="font-extrabold text-gray-800 text-xs tracking-wide">Jurnal Transaksi Bisnis</h3>
                </div>
                <span className="text-[9px] bg-white/80 backdrop-blur-md text-gray-600 px-2.5 py-0.5 rounded-full font-bold border border-white/50 shadow-sm">
                  {transactions.length} Data
                </span>
              </div>

              <div className="p-2.5 max-h-[320px] overflow-y-auto space-y-2 custom-scrollbar">
                {transactions.length > 0 ? transactions.map((trx, idx) => (
                  <div key={idx} className="group/item relative bg-white/40 hover:bg-white/90 backdrop-blur-sm p-2.5 rounded-2xl border border-white/50 hover:border-orange-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-between cursor-default">
                    <div className="flex items-center gap-3">
                      {/* Icon Container */}
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover/item:scale-110 ${trx.type === 'IN'
                        ? 'bg-gradient-to-br from-emerald-100 to-green-200 text-emerald-600'
                        : 'bg-gradient-to-br from-rose-100 to-red-200 text-rose-600'
                        }`}>
                        {trx.type === 'IN' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      </div>

                      {/* Text Info */}
                      <div>
                        <p className="text-[10px] font-bold text-gray-800 group-hover/item:text-orange-900 transition-colors line-clamp-1">{trx.desc}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] font-medium text-gray-500 flex items-center gap-1">
                            <Calendar size={9} /> {trx.date}
                          </span>
                          <span className="text-[8px] bg-white/50 px-1.5 py-0.5 rounded-md border border-white/30 text-gray-500 font-semibold uppercase tracking-wider">
                            {trx.outlet}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right pl-2">
                      <span className={`block text-xs font-black tracking-tight ${trx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                        {trx.type === 'IN' ? '+' : '-'} {formatCurrency(trx.amount)}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${trx.type === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {trx.type === 'IN' ? 'Income' : 'Expense'}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                      <DollarSign size={20} />
                    </div>
                    <p className="text-gray-400 text-[10px] font-medium">Belum ada transaksi tercatat</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
