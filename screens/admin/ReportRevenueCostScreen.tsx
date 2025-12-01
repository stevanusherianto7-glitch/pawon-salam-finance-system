import React, { useEffect, useState, useRef } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi } from '../../services/api';
import { ArrowLeft, Filter, MapPin, Calendar, TrendingUp, TrendingDown, DollarSign, Activity, Download } from 'lucide-react';
import { OwnerDashboardData } from '../../types';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  onBack: () => void;
}

const formatCurrency = (val: number) => {
  if (val === undefined || val === null) return 'Rp 0';
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}M`;
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
  return `Rp ${(val / 1000).toFixed(0)}k`;
};

const RevenueChart = ({ data }: { data: { label: string, revenue: number, cost: number }[] }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-xs">Tidak ada data grafik</div>;
  }

  const maxVal = Math.max(...data.map(d => Math.max(d.revenue || 0, d.cost || 0))) || 1;

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
          {/* Tooltip */}
          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-[10px] p-2 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20">
            <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Rev: {formatCurrency(d.revenue)}</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> Cost: {formatCurrency(d.cost)}</div>
          </div>

          <div className="w-full flex gap-2 items-end justify-center h-full relative px-2">
            {/* Revenue Bar */}
            <div
              className="w-full max-w-[24px] bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg shadow-lg shadow-blue-500/30 hover:brightness-110 transition-all duration-500 relative group/bar"
              style={{ height: `${((d.revenue || 0) / maxVal) * 100}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-blue-600 opacity-0 group-hover/bar:opacity-100 transition-opacity">{formatCurrency(d.revenue)}</div>
            </div>

            {/* Cost Bar */}
            <div
              className="w-full max-w-[24px] bg-gradient-to-t from-red-500 to-red-300 rounded-t-lg shadow-lg shadow-red-500/30 hover:brightness-110 transition-all duration-500 relative group/bar"
              style={{ height: `${((d.cost || 0) / maxVal) * 100}%` }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-red-500 opacity-0 group-hover/bar:opacity-100 transition-opacity">{formatCurrency(d.cost)}</div>
            </div>
          </div>
          <span className="text-xs text-gray-600 font-bold bg-white/50 px-2 py-0.5 rounded-md backdrop-blur-sm">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

export const ReportRevenueCostScreen: React.FC<Props> = ({ onBack }) => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [location, setLocation] = useState('ALL');

  useEffect(() => {
    const loadKPIs = async () => {
      setLoading(true);
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();

      try {
        const res = await ownerApi.getDashboardKPIs(month, year, location === 'ALL' ? undefined : location);
        if (res.success && res.data) {
          setData(res.data);
        } else {
          console.error("API returned success=false or no data");
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
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
      pdf.save(`Laporan_RevenueCost_${selectedDate.toISOString().split('T')[0]}.pdf`);
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

      {/* Header */}
      <div className="relative z-10 p-4 pt-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 bg-white/20 rounded-full text-gray-700 hover:bg-white/40 transition-colors backdrop-blur-sm border border-white/20 shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="font-extrabold text-gray-800 text-xl leading-tight">Tren Pendapatan vs Biaya</h2>
            <p className="text-xs text-gray-600 font-medium mt-0.5">Visualisasi Grafik Mingguan</p>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="p-3 bg-white/60 text-gray-700 rounded-2xl shadow-sm border border-white/40 hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          title="Export PDF"
        >
          <Download size={18} />
        </button>
      </div>

      <div className="relative z-10 p-4 space-y-6 max-w-3xl mx-auto">

        {/* Filter Bar - Premium Glass Style - High Z-Index */}
        <div className="relative z-50 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Outlet Dropdown */}
          <div className="relative w-[280px] h-[52px] group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <MapPin size={18} />
            </div>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-full bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl pl-11 pr-4 text-sm font-bold text-gray-800 outline-none focus:bg-white focus:border-orange-300 transition appearance-none cursor-pointer shadow-sm text-center"
            >
              <option value="ALL">Semua Outlet</option>
              <option value="Jakarta">Jakarta</option>
              <option value="Bandung">Bandung</option>
              <option value="Semarang">Semarang</option>
              <option value="Yogyakarta">Yogyakarta</option>
            </select>
          </div>

          {/* Date Picker */}
          <div className="w-[280px] h-[52px] relative z-50">
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
            <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-400 text-xs font-medium">Memuat data grafik...</p>
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-gray-400">
            <p>Gagal memuat data.</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-orange-500 text-xs font-bold">Refresh</button>
          </div>
        ) : (
          <div className="relative z-0 bg-white/60 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/60 p-5 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-gray-800 flex items-center gap-2">
                  <Activity size={20} className="text-blue-600" /> Grafik Mingguan
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-1">Perbandingan Revenue vs Cost</p>
              </div>

              <div className="flex gap-4 bg-white/50 p-2 rounded-xl border border-white/40 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm"></div>
                  <span className="text-xs font-bold text-gray-600">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-sm"></div>
                  <span className="text-xs font-bold text-gray-600">Cost</span>
                </div>
              </div>
            </div>

            <RevenueChart data={data.financial?.chartData || []} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-500 font-bold uppercase">Total Revenue</p>
                  <p className="text-lg font-black text-blue-700">{formatCurrency(data.financial?.totalRevenue?.value || 0)}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-xl text-blue-600"><TrendingUp size={20} /></div>
              </div>
              <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-500 font-bold uppercase">Total Cost</p>
                  <p className="text-lg font-black text-red-700">{formatCurrency((data.financial?.totalRevenue?.value || 0) - (data.financial?.netProfit?.value || 0))}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-xl text-red-600"><TrendingDown size={20} /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};