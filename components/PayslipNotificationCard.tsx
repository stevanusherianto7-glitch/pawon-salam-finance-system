import React, { useRef, useState } from 'react';
import { Download, Loader2, ChevronRight } from 'lucide-react';
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
            // Wait for fonts/images
            await document.fonts.ready;
            await new Promise(resolve => setTimeout(resolve, 500)); // Safety buffer

            const canvas = await html2canvas(printableRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1123, // A4 Landscape px
                windowHeight: 794
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            pdf.save(`Slip_Gaji_${data.employeeName}_${data.period}.pdf`);

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

    return (
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 overflow-hidden mb-4 relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 py-4 flex justify-between items-center">
                <div>
                    <p className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-0.5">Slip Gaji</p>
                    <h3 className="text-white font-bold text-lg">{data.period}</h3>
                </div>
                <div className="bg-white/10 p-2 rounded-full">
                    <ChevronRight className="text-white/80" size={20} />
                </div>
            </div>

            {/* Body */}
            <div className="p-5 grid grid-cols-2 gap-6">
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase mb-2">Pendapatan</p>
                    <div className="space-y-1">
                        {data.earnings.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600 truncate mr-2">{item.label}</span>
                                <span className="font-medium text-gray-900">{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                        {data.earnings.length > 3 && (
                            <p className="text-xs text-gray-400 italic mt-1">+ {data.earnings.length - 3} lainnya</p>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-400 font-medium uppercase mb-2">Potongan</p>
                    <div className="space-y-1">
                        {data.deductions.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600 truncate mr-2">{item.label}</span>
                                <span className="font-medium text-red-500">-{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-orange-50 px-5 py-4 flex justify-between items-center border-t border-orange-100">
                <div>
                    <p className="text-xs text-orange-600 font-bold uppercase">Take Home Pay</p>
                    <p className="text-xl font-black text-gray-900">{formatRupiah(data.takeHomePay)}</p>
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="bg-[#ff6b35] hover:bg-[#e65100] text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isDownloading ? 'Generating...' : 'Download PDF'}
                </button>
            </div>

            {/* Hidden Generator */}
            <div className="absolute left-[-9999px] top-0">
                <PayslipTemplate ref={printableRef} {...templateData} />
            </div>
        </div>
    );
};
