import React, { useRef, useState } from 'react';
import { Download, Loader2, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { PayslipData } from '../hooks/usePayslipStorage';
import { PayslipTemplate } from './PayslipTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
    data: PayslipData;
}

export const PayslipNotificationCard: React.FC<Props> = ({ data }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleDownload = async () => {
        if (!printableRef.current) return;
        setIsDownloading(true);

        try {
            // Wait for fonts/images + SVG decorations
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(printableRef.current, {
                scale: 3, // 🔥 288 DPI for ultra-sharp
                useCORS: true,
                allowTaint: false,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1123,
                windowHeight: 794,
                removeContainer: true,
                imageTimeout: 0,
                foreignObjectRendering: false
            });

            const imgData = canvas.toDataURL('image/png', 1.0); // Max quality
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            pdf.save(`Slip_Gaji_${data.employeeName.replace(/\s+/g, '_')}_${data.period.replace(/\s+/g, '_')}.pdf`);

        } catch (error) {
            console.error('PDF Generation Failed:', error);
            alert('Gagal mendownload PDF. Silakan coba lagi.');
        } finally {
            setIsDownloading(false);
        }
    };

    // Map data for Template
    const templateData = {
        employee: {
            name: data.employeeName,
            role: 'Staff', // Default, or fetch if available
            department: 'Resto',
            nik: data.employeeId,
            status: 'Karyawan',
            grade: '-',
            period: data.period
        },
        earnings: data.earnings,
        deductions: data.deductions,
        totalEarnings: data.earnings.reduce((a, b) => a + b.amount, 0),
        totalDeductions: data.deductions.reduce((a, b) => a + b.amount, 0),
        takeHomePay: data.takeHomePay
    };

    const totalEarnings = data.earnings.reduce((a, b) => a + b.amount, 0);
    const totalDeductions = data.deductions.reduce((a, b) => a + b.amount, 0);

    return (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-4 relative transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300" style={{ borderLeft: '4px solid #ff6b35' }}>

            {/* Header: Modern Fintech Style */}
            <div className="px-5 py-4 flex justify-between items-center border-b border-gray-50">
                <div className="flex items-center gap-3">
                    {/* Icon with Orange Accent */}
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="text-orange-600" size={24} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Slip Gaji</p>
                        <h3 className="text-gray-900 font-bold text-base mt-0.5">{data.period}</h3>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 font-medium">Status</p>
                    <span className="inline-block mt-1 px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
                        ✓ Diterima
                    </span>
                </div>
            </div>

            {/* Body: Financial Summary */}
            <div className="p-5 grid grid-cols-2 gap-6">
                {/* Earnings Column */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="text-blue-500" size={14} strokeWidth={2.5} />
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Pendapatan</p>
                    </div>
                    <div className="space-y-2">
                        {data.earnings.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                                <span className="text-gray-600 truncate font-medium">{item.label}</span>
                                <span className="font-bold text-gray-800 tabular-nums">{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                        {data.earnings.length > 3 && (
                            <p className="text-xs text-gray-400 italic mt-2">+ {data.earnings.length - 3} item lainnya</p>
                        )}
                        {/* Total Earnings */}
                        <div className="grid grid-cols-[1fr_auto] gap-3 pt-2 mt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-bold uppercase">Total</span>
                            <span className="text-sm font-black text-blue-600 tabular-nums">{formatRupiah(totalEarnings)}</span>
                        </div>
                    </div>
                </div>

                {/* Deductions Column */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                            <TrendingDown className="text-red-500" size={14} strokeWidth={2.5} />
                        </div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Potongan</p>
                    </div>
                    <div className="space-y-2">
                        {data.deductions.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
                                <span className="text-gray-600 truncate font-medium">{item.label}</span>
                                <span className="font-bold text-red-500 tabular-nums">-{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                        {data.deductions.length === 0 && (
                            <p className="text-xs text-gray-400 italic">Tidak ada potongan</p>
                        )}
                        {/* Total Deductions */}
                        <div className="grid grid-cols-[1fr_auto] gap-3 pt-2 mt-2 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-bold uppercase">Total</span>
                            <span className="text-sm font-black text-red-600 tabular-nums">{formatRupiah(totalDeductions)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer: Take Home Pay + Download Button */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-5 flex justify-between items-center border-t border-orange-100">
                <div>
                    <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Take Home Pay</p>
                    <p className="text-3xl font-black text-gray-900 tabular-nums">{formatRupiah(data.takeHomePay)}</p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-white hover:bg-gray-50 text-orange-600 border-2 border-orange-500 px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-2.5 shadow-sm active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                >
                    {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} strokeWidth={2.5} />}
                    {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
            </div>

            {/* Hidden Generator (Off-Screen) */}
            <div className="absolute left-[-9999px] top-0 pointer-events-none">
                <PayslipTemplate ref={printableRef} {...templateData} />
            </div>
        </div>
    );
};
