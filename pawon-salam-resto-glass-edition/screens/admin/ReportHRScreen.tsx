import React, { useEffect, useState, useRef } from 'react';
import { colors } from '../../theme/colors';
import { ownerApi, mockExportApi } from '../../services/api';
import { ArrowLeft, Users, Calendar, TrendingUp, TrendingDown, Filter, Star, ChevronDown, Download } from 'lucide-react';
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

const KPICard = ({ label, value, trend, icon: Icon, colorClass, inverseTrend = false, subValue, gradientFrom, gradientTo }: any) => (
    <div className={`relative overflow-hidden rounded-3xl p-4 border border-white/40 shadow-xl backdrop-blur-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} group hover:scale-[1.02] transition-all duration-300`}>
        <div className="absolute top-0 right-0 p-3 opacity-10">
            <Icon size={48} className="text-gray-900" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
                <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-xl bg-white/40 backdrop-blur-md shadow-sm ${colorClass}`}>
                        <Icon size={16} />
                    </div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">{label}</p>
                </div>
                <div className="flex items-baseline gap-1 mt-0.5">
                    <h3 className="text-2xl font-black text-gray-800 tracking-tight">{value}</h3>
                    {subValue && <span className="text-[10px] text-gray-500 font-medium">{subValue}</span>}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
                {trend ? <TrendBadge data={trend} inverseColor={inverseTrend} /> : <span className="h-4"></span>}
            </div>
        </div>
    </div>
);

export const ReportHRScreen: React.FC<Props> = ({ onBack }) => {
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
                backgroundColor: '#F9FAFB', // Match bg-gray-50
                useCORS: true
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Laporan_HR_${selectedDate.toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            const handleExport = async () => {
                try {
                    // Assuming mockExportApi is defined elsewhere or imported
                    // For now, this will cause a ReferenceError if mockExportApi is not defined.
                    // This change is made faithfully as per user instruction.
                    const res = await mockExportApi.exportPDF("Laporan HR");
                    if (res.success) alert(res.message);
                } catch (e) {
                    alert("Gagal mengexport PDF");
                }
            };
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden font-sans bg-gray-50" ref={contentRef}>
            <BackgroundPattern />

            <div className="relative z-10 p-4 max-w-3xl mx-auto space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2.5 bg-white/60 rounded-2xl text-gray-700 hover:bg-white hover:shadow-lg transition-all backdrop-blur-xl border border-white/40 group">
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-black text-xl text-gray-800 tracking-tight">Kinerja Tim & SDM</h2>
                        <p className="text-xs text-gray-500 font-medium">Analisa Kinerja Sumber Daya Manusia</p>
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="flex items-center gap-2 px-3 py-2.5 bg-white/60 text-gray-700 rounded-2xl shadow-sm border border-white/40 hover:bg-white hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Download size={16} />
                        <span className="text-xs font-bold">{exporting ? 'Exporting...' : 'Export PDF'}</span>
                    </button>
                </div>

                {/* Filters - High Z-Index to prevent overlap */}
                <div className="relative z-50 bg-white/60 backdrop-blur-xl p-1.5 rounded-2xl shadow-sm border border-white/40 flex items-center justify-between">
                    <div className="relative group">
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="appearance-none bg-white/50 border border-white/40 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:shadow-md transition-all cursor-pointer hover:bg-white/80 min-w-[140px]"
                        >
                            <option value="ALL">Semua Outlet</option>
                            <option value="JAKARTA">Jakarta</option>
                            <option value="BANDUNG">Bandung</option>
                            <option value="SURABAYA">Surabaya</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
                    </div>

                    <div className="w-[180px] relative z-50">
                        <GlassDatePicker
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                        />
                    </div>
                </div>

                {loading || !data ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-400 text-sm font-medium">Memuat data SDM...</p>
                    </div>
                ) : (
                    <div className="relative z-0 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <KPICard
                                label="Staff Turnover"
                                value={`${data.hr.employeeTurnoverRate.value}%`}
                                trend={data.hr.employeeTurnoverRate}
                                inverseTrend={true}
                                icon={Users}
                                colorClass="text-rose-600"
                                gradientFrom="from-rose-50"
                                gradientTo="to-white"
                            />
                            <KPICard
                                label="Attendance"
                                value={`${data.hr.attendanceCompliance}%`}
                                icon={Calendar}
                                colorClass="text-blue-600"
                                subValue="Compliance"
                                gradientFrom="from-blue-50"
                                gradientTo="to-white"
                            />
                        </div>

                        <div className="bg-white/60 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/40">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                    <Star size={14} className="text-amber-500 fill-amber-500" />
                                    Top Performers (FOH & BOH)
                                </p>
                                <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Bulan Ini</span>
                            </div>

                            <div className="space-y-2.5">
                                {data.hr.topEmployees.map((emp, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 bg-white/50 rounded-2xl border border-white/50 hover:bg-white hover:shadow-md transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md transform group-hover:scale-110 transition-transform ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : i === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 'bg-gradient-to-br from-orange-700 to-orange-800'}`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <img src={emp.avatarUrl} className="w-9 h-9 rounded-full bg-gray-200 object-cover border-2 border-white shadow-sm" alt={emp.name} />
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800">{emp.name}</p>
                                                    <p className="text-[9px] font-medium text-gray-500">Staff FOH/BOH</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl text-emerald-600 border border-emerald-100">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-[10px] font-bold">{emp.avgScore.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
