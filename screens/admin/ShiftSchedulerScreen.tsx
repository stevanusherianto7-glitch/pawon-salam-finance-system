import React, { useEffect, useState, useRef } from 'react';
import { useShiftStore } from '../../store/shiftStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Calendar as CalendarIcon, CheckCircle, ChevronLeft, ChevronRight, Grid, List, Users, X, Eye, Download, FileText, Edit3 } from 'lucide-react';
import { ShiftAssignment, ShiftType, SHIFT_COLORS, UserRole, Employee } from '../../types';
import { ShiftEditForm } from '../../components/ShiftEditForm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// --- Printable Component for PDF ---
const PrintableSchedule = React.forwardRef<
    HTMLDivElement,
    {
        employees: Employee[],
        shifts: ShiftAssignment[],
        days: number[],
        month: number,
        year: number,
        getDayName: (day: number) => string
    }
>(({ employees, shifts, days, month, year, getDayName }, ref) => {
    const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

    return (
        <div ref={ref} className="bg-white p-8" style={{ width: '1123px', minHeight: '794px' }}>
            <h1 className="text-2xl font-bold mb-2">Jadwal Shift Karyawan</h1>
            <p className="text-lg font-semibold mb-6">Periode: {monthName}</p>
            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left w-48">Karyawan</th>
                        {days.map(d => (
                            <th key={d} className="border p-1 text-center w-8">
                                <div>{getDayName(d)}</div>
                                <div>{d}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {employees.map(emp => (
                        <tr key={emp.id}>
                            <td className="border p-2 font-bold">{emp.name}</td>
                            {days.map(d => {
                                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const shift = shifts.find(s => s.employeeId === emp.id && s.date === dateStr);
                                return (
                                    <td key={d} className="border p-1 text-center font-bold" style={{ backgroundColor: shift ? `${shift.color}20` : '#fff' }}>
                                        {shift ? shift.type[0].toUpperCase() : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

interface Props {
    onBack: () => void;
}

type ViewMode = 'GRID' | 'SUMMARY' | 'CALENDAR';

export const ShiftSchedulerScreen: React.FC<Props> = ({ onBack }) => {
    const { user } = useAuthStore();
    const { shifts, fetchMonthlyShifts, generateDefaults, updateShift, publishShifts, isLoading } = useShiftStore();
    const { employees, fetchEmployees } = useEmployeeStore();

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedShift, setSelectedShift] = useState<ShiftAssignment | null>(null); // For Modal
    const [viewModalShift, setViewModalShift] = useState<ShiftAssignment | null>(null); // For Read Only Modal

    // PDF Download State
    const [isDownloading, setIsDownloading] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    const isRestaurantManager = user?.role === UserRole.RESTAURANT_MANAGER;
    const isBusinessOwner = user?.role === UserRole.BUSINESS_OWNER;

    const isPublished = shifts.length > 0 && shifts.every(s => s.isPublished);

    // --- REVISI UTAMA: PRIVILEGE RESTO MANAGER ---
    // Jika user adalah Resto Manager, dia TIDAK PERNAH Read Only (selalu bisa edit),
    // meskipun status jadwal sudah published.
    // User lain (HR, Owner, Staff) akan Read Only jika bukan manager atau jika status published (untuk staff).
    const isReadOnly = !isRestaurantManager;

    const [viewMode, setViewMode] = useState<ViewMode>(isBusinessOwner ? 'SUMMARY' : 'GRID');

    const leftPanelRef = useRef<HTMLDivElement>(null);
    const rightPanelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchMonthlyShifts(month, year);
    }, [month, year]);

    const schedulableEmployees = employees.filter(e => e.role === UserRole.EMPLOYEE || e.role === UserRole.RESTAURANT_MANAGER);

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const handlePublish = async () => {
        // Hanya izinkan publish jika belum published.
        // Jika sudah published, manager tetap bisa edit item per item, tapi tombol ini non-aktif.
        if (isPublished) return;

        const confirm = window.confirm("Publikasikan jadwal ini ke seluruh karyawan? Notifikasi akan dikirim.");
        if (confirm) {
            await publishShifts(month, year);
        }
    };

    const handleSaveShift = async (type: ShiftType) => {
        if (isReadOnly) return;
        if (selectedShift) {
            await updateShift(selectedShift.id, type);
            setSelectedShift(null);
        }
    };

    const handleDownloadPDF = async () => {
        if (!printableRef.current) return;
        setIsDownloading(true);

        try {
            const canvas = await html2canvas(printableRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

            const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long' });
            pdf.save(`Jadwal_Shift_${monthName}_${year}.pdf`);
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Gagal membuat PDF. Coba lagi.");
        } finally {
            setIsDownloading(false);
        }
    };

    const getDayName = (day: number) => {
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('id-ID', { weekday: 'short' }).replace('.', '');
    };

    const getShiftLabel = (type: ShiftType) => {
        switch (type) {
            case ShiftType.MORNING: return 'P';
            case ShiftType.MIDDLE: return 'M';
            case ShiftType.OFF: return 'O';
            default: return '';
        }
    };

    // --- SYNC SCROLL LOGIC ---
    const handleLeftScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (rightPanelRef.current) rightPanelRef.current.scrollTop = e.currentTarget.scrollTop;
    };

    const handleRightScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (leftPanelRef.current) leftPanelRef.current.scrollTop = e.currentTarget.scrollTop;
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24 flex flex-col overflow-hidden">
            {/* Hidden component for PDF generation */}
            <div className="absolute left-[-9999px] top-0">
                <PrintableSchedule
                    ref={printableRef}
                    employees={schedulableEmployees}
                    shifts={shifts}
                    days={daysArray}
                    month={month}
                    year={year}
                    getDayName={getDayName}
                />
            </div>

            {/* Header */}
            <div className="pt-10 pb-6 px-4 shadow-md relative z-30 flex-shrink-0 rounded-b-[2.5rem] overflow-hidden" style={{ background: colors.gradientMain }}>
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 text-white mb-3">
                        <button onClick={onBack} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"><ArrowLeft size={18} /></button>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold truncate">{isRestaurantManager ? 'Atur Jadwal Shift' : 'Jadwal Shift'}</h2>
                            {/* Indikator Status Header yang Lebih Jelas */}
                            <p className="text-orange-100 text-[10px] truncate flex items-center gap-1">
                                {isRestaurantManager ? (
                                    isPublished ? <span className="flex items-center gap-1"><Edit3 size={9} /> Mode Edit (Terpublikasi)</span> : 'Draft Mode (Editable)'
                                ) : (
                                    isPublished ? 'Jadwal Terpublikasi' : 'Mode Lihat'
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2.5 bg-white/10 p-2 rounded-xl border border-white/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 w-full justify-center">
                            <button onClick={() => setMonth(m => m === 1 ? 12 : m - 1)} className="p-1 text-white hover:bg-white/20 rounded-full"><ChevronLeft size={18} /></button>
                            <span className="text-white font-bold text-xs w-28 text-center">{new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                            <button onClick={() => setMonth(m => m === 12 ? 1 : m + 1)} className="p-1 text-white hover:bg-white/20 rounded-full"><ChevronRight size={18} /></button>
                        </div>

                        <div className="flex gap-2 w-full justify-center px-1">
                            <button onClick={handleDownloadPDF} disabled={isDownloading} className="h-8 flex-1 px-2 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg shadow hover:bg-blue-400 flex items-center justify-center gap-1 disabled:opacity-70">
                                {isDownloading ? 'Processing...' : <><FileText size={12} /> PDF</>}
                            </button>

                            {!isRestaurantManager ? (
                                <div className="h-8 flex-1 px-2 py-1.5 bg-black/20 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 border border-white/10"><Eye size={12} /> Read Only</div>
                            ) : isPublished ? (
                                // Tampilan saat sudah Published bagi Manager (Badge Hijau, tapi grid tetap bisa diedit)
                                <div className="h-8 flex-1 px-2 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 shadow-md border border-green-400">
                                    <CheckCircle size={12} /> Terpublikasi
                                </div>
                            ) : (
                                <button onClick={handlePublish} className="h-8 flex-1 px-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-500 flex items-center justify-center gap-1.5 text-[10px] font-bold">
                                    <CheckCircle size={14} /> Publish
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-3 justify-center flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30 flex items-center justify-center text-[7px] font-bold text-white shadow-sm" style={{ backgroundColor: SHIFT_COLORS.OFF }}>O</div>
                            <span className="text-[9px] text-white font-bold">Libur (OFF)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30 flex items-center justify-center text-[7px] font-bold text-white shadow-sm" style={{ backgroundColor: SHIFT_COLORS.MORNING }}>P</div>
                            <span className="text-[9px] text-white font-bold">Pagi (10-20)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3.5 h-3.5 rounded-full border border-white/30 flex items-center justify-center text-[7px] font-bold text-white shadow-sm" style={{ backgroundColor: SHIFT_COLORS.MIDDLE }}>M</div>
                            <span className="text-[9px] text-white font-bold">Middle (11-21)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* === NEW MODERN TABLE LAYOUT === */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white p-3">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full text-gray-400 text-xs">Memuat jadwal...</div>
                ) : shifts.length === 0 && isRestaurantManager ? (
                    <div className="flex flex-col justify-center items-center h-full gap-3">
                        <div className="text-center">
                            <p className="text-gray-500 font-bold mb-1.5 text-sm">Belum ada jadwal untuk bulan ini</p>
                            <p className="text-gray-400 text-xs">Klik tombol di bawah untuk generate jadwal otomatis</p>
                        </div>
                        <button
                            onClick={() => generateDefaults(month, year)}
                            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-orange-700 transition-all flex items-center gap-1.5 text-xs"
                        >
                            <CalendarIcon size={16} /> Generate Jadwal
                        </button>
                    </div>
                ) : shifts.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-400 text-xs">
                        Belum ada jadwal untuk bulan ini
                    </div>
                ) : (
                    <div className="flex h-full border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        {/* Sticky Left Panel: Employee List */}
                        <div ref={leftPanelRef} onScroll={handleLeftScroll} className="w-40 flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto z-20 shadow-[4px_0_10px_-3px_rgba(0,0,0,0.05)]">
                            <div className="h-12 sticky top-0 bg-gray-50/70 backdrop-blur-sm z-30 flex items-end p-2.5 border-b border-gray-200 font-bold text-gray-500 text-[10px] uppercase tracking-wider">Karyawan</div>
                            <div className="bg-white">
                                {schedulableEmployees.map((emp, index) => (
                                    <div key={emp.id} className={`h-12 flex items-center gap-2.5 pl-3 pr-2 border-b border-gray-100 transition-colors ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                                        <img src={emp.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200 object-cover border border-gray-100 shadow-sm flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-gray-800 truncate">{emp.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{emp.department}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-4"></div>
                        </div>
                        {/* Scrollable Right Panel: Schedule Grid */}
                        <div ref={rightPanelRef} onScroll={handleRightScroll} className="flex-1 overflow-auto bg-white relative">
                            <div className="min-w-max">
                                <div className="h-12 sticky top-0 bg-gray-50/70 backdrop-blur-sm z-30 flex border-b border-gray-200">
                                    {daysArray.map(d => (
                                        <div key={d} className="w-10 text-center shrink-0 flex flex-col justify-end pb-2 border-r border-gray-100 last:border-0">
                                            <div className="text-[9px] font-bold text-gray-400 uppercase mb-0.5">{getDayName(d)}</div>
                                            <div className="text-xs font-bold text-gray-700">{d}</div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    {schedulableEmployees.map((emp, index) => (
                                        <div key={emp.id} className={`h-12 flex border-b border-gray-100 transition-colors ${index % 2 !== 0 ? 'bg-gray-50/50' : ''}`}>
                                            {daysArray.map(d => {
                                                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                                const shift = shifts.find(s => s.employeeId === emp.id && s.date === dateStr);

                                                return (
                                                    <div key={d} className="w-10 shrink-0 h-full flex items-center justify-center border-r border-dashed border-gray-100 last:border-0">
                                                        {shift ? (
                                                            <button
                                                                onClick={() => {
                                                                    // JIKA isReadOnly FALSE (Resto Manager), Buka Edit Form
                                                                    // JIKA isReadOnly TRUE (Staff/Owner), Buka View Modal
                                                                    if (!isReadOnly) setSelectedShift(shift);
                                                                    else setViewModalShift(shift);
                                                                }}
                                                                className="w-6 h-6 rounded-full shadow-sm hover:scale-110 hover:shadow-md transition-all active:scale-90 border border-black/5 flex items-center justify-center text-white text-[9px] font-bold"
                                                                style={{ backgroundColor: shift.color }}
                                                                title={`${shift.type}`}
                                                            >
                                                                {getShiftLabel(shift.type)}
                                                            </button>
                                                        ) : <div className="w-1 h-1 rounded-full bg-gray-200"></div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* === END OF NEW LAYOUT === */}

            {selectedShift && !isReadOnly && (
                <ShiftEditForm employeeName={employees.find(e => e.id === selectedShift.employeeId)?.name || ''} date={selectedShift.date} currentShiftType={selectedShift.type} onSave={handleSaveShift} onCancel={() => setSelectedShift(null)} />
            )}

            {viewModalShift && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xs p-4 animate-fade-in shadow-2xl">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-gray-800 text-sm">Detail Shift</h3>
                            <button onClick={() => setViewModalShift(null)} className="p-1 rounded-full hover:bg-gray-100"><X size={16} className="text-gray-400" /></button>
                        </div>

                        <div className="space-y-2.5">
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Karyawan</p>
                                <p className="font-bold text-gray-800 text-xs">{employees.find(e => e.id === viewModalShift.employeeId)?.name}</p>
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Tanggal</p>
                                <p className="font-bold text-gray-800 text-xs">{new Date(viewModalShift.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                            </div>
                            <div className="flex gap-2.5">
                                <div className="flex-1 bg-blue-50 p-2.5 rounded-xl border border-blue-100 text-center">
                                    <p className="text-[10px] text-blue-500 uppercase font-bold">Tipe</p>
                                    <p className="font-bold text-blue-800 text-xs">{viewModalShift.type}</p>
                                </div>
                                <div className="flex-1 bg-orange-50 p-2.5 rounded-xl border border-orange-100 text-center">
                                    <p className="text-[10px] text-orange-500 uppercase font-bold">Jam</p>
                                    <p className="font-bold text-orange-800 text-xs">{viewModalShift.startTime} - {viewModalShift.endTime}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};