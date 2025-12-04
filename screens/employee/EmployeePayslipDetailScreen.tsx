
import React, { useEffect, useRef, useState } from 'react';
import { usePayrollStore } from '../../store/payrollStore';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { PayslipTemplate } from '../../components/PayslipTemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
    payslipId: string;
    onBack: () => void;
}

export const EmployeePayslipDetailScreen: React.FC<Props> = ({ payslipId, onBack }) => {
    const { user } = useAuthStore();
    const { fetchPayslipDetail, currentPayslip, isLoading } = usePayrollStore();
    const [isDownloading, setIsDownloading] = useState(false);
    const printableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPayslipDetail(payslipId);
    }, [payslipId]);

    const handleDownload = async () => {
        if (!printableRef.current) return;
        setIsDownloading(true);
        try {
            // Wait for fonts to load
            await document.fonts.ready;

            // CRITICAL: Small delay to ensure SVG decorations fully render
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(printableRef.current, {
                scale: 3, // 🔥 UPGRADED: 288 DPI for ultra-sharp text
                useCORS: true,
                allowTaint: false, // Prevent cross-origin issues with logo
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1123, // A4 Landscape width in px (approx)
                windowHeight: 794,
                // Additional options for better quality
                removeContainer: true,
                imageTimeout: 0,
                foreignObjectRendering: false // Better SVG rendering
            });

            const imgData = canvas.toDataURL('image/png', 1.0); // Max quality
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true // Enable PDF compression to keep file size reasonable
            });

            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            pdf.save(`Payslip_${user?.name?.replace(/\s+/g, '_')}_${currentPayslip?.periodMonth}_${currentPayslip?.periodYear}.pdf`);
        } catch (e) {
            console.error(e);
            alert('Gagal membuat PDF. Silakan coba lagi.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading || !currentPayslip) return <div className="p-8 text-center text-gray-500">Memuat detail...</div>;

    // Map flat Payslip data to structured PayslipData for the template
    const mappedData = {
        employee: {
            name: user?.name || 'Unknown',
            role: user?.role || 'Staff',
            department: user?.department || '-',
            nik: user?.id || '-', // Using ID as NIK for now
            status: 'Karyawan Tetap', // Default
            grade: 'Staff', // Default
            period: `${new Date(0, currentPayslip.periodMonth - 1).toLocaleDateString('id-ID', { month: 'long' })} ${currentPayslip.periodYear}`
        },
        earnings: [
            { id: 1, label: 'Gaji Pokok', amount: currentPayslip.basicSalary },
            currentPayslip.allowanceMeal > 0 ? { id: 2, label: 'Tunj. Makan', amount: currentPayslip.allowanceMeal } : null,
            currentPayslip.allowanceTransport > 0 ? { id: 3, label: 'Tunj. Transport', amount: currentPayslip.allowanceTransport } : null,
            currentPayslip.overtimeAmount > 0 ? { id: 4, label: `Lembur (${currentPayslip.overtimeHours} jam)`, amount: currentPayslip.overtimeAmount } : null,
            currentPayslip.bonus > 0 ? { id: 5, label: 'Bonus / Insentif', amount: currentPayslip.bonus } : null,
            currentPayslip.allowanceOther > 0 ? { id: 6, label: 'Tunj. Lainnya', amount: currentPayslip.allowanceOther } : null,
        ].filter(Boolean) as any[],
        deductions: [
            currentPayslip.bpjsKesehatan > 0 ? { id: 1, label: 'BPJS Kesehatan', amount: currentPayslip.bpjsKesehatan } : null,
            currentPayslip.bpjsKetenagakerjaan > 0 ? { id: 2, label: 'BPJS Ketenagakerjaan', amount: currentPayslip.bpjsKetenagakerjaan } : null,
            currentPayslip.taxPPh21 > 0 ? { id: 3, label: 'PPh 21', amount: currentPayslip.taxPPh21 } : null,
            currentPayslip.otherDeductions > 0 ? { id: 4, label: 'Lain-lain (Kasbon)', amount: currentPayslip.otherDeductions } : null,
        ].filter(Boolean) as any[],
        totalEarnings: currentPayslip.totalEarnings,
        totalDeductions: currentPayslip.totalDeductions,
        takeHomePay: currentPayslip.netSalary
    };

    const Row = ({ label, value, isTotal = false, isDeduction = false }: { label: string, value: number, isTotal?: boolean, isDeduction?: boolean }) => (
        <div className={`flex justify-between py-1.5 border-b border-dashed border-gray-100 ${isTotal ? 'font-bold text-gray-900 pt-2 border-gray-200 border-solid' : 'text-xs text-gray-600'}`}>
            <span>{label}</span>
            <span className={isDeduction ? 'text-red-500' : ''}>
                {isDeduction ? '- ' : ''}Rp {value.toLocaleString('id-ID')}
            </span>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <div className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full"><ArrowLeft size={18} /></button>
                <h2 className="font-bold text-base">Detail Slip Gaji</h2>
            </div>

            {/* Hidden component for printing - Uses the shared Template */}
            <div className="absolute left-[-9999px] top-0">
                <PayslipTemplate ref={printableRef} {...mappedData} />
            </div>

            <div className="p-3">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative">
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between items-end border-b pb-3">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Periode</p>
                                <p className="font-bold text-orange-600 text-base">
                                    {new Date(0, currentPayslip.periodMonth - 1).toLocaleDateString('id-ID', { month: 'long' })} {currentPayslip.periodYear}
                                </p>
                            </div>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all shadow-md hover:bg-orange-600 disabled:opacity-60"
                            >
                                {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                            </button>
                        </div>

                        {/* Mobile View Details */}
                        <div>
                            <h3 className="text-[10px] font-bold text-green-600 uppercase mb-1.5 tracking-wider">Pendapatan</h3>
                            <Row label="Gaji Pokok" value={currentPayslip.basicSalary} />
                            {currentPayslip.allowanceMeal > 0 && <Row label="Tunj. Makan" value={currentPayslip.allowanceMeal} />}
                            {currentPayslip.allowanceTransport > 0 && <Row label="Tunj. Transport" value={currentPayslip.allowanceTransport} />}
                            {currentPayslip.overtimeAmount > 0 && <Row label={`Lembur (${currentPayslip.overtimeHours} jam)`} value={currentPayslip.overtimeAmount} />}
                            {currentPayslip.bonus > 0 && <Row label="Bonus / Insentif" value={currentPayslip.bonus} />}
                            <Row label="Total Pendapatan" value={currentPayslip.totalEarnings} isTotal />
                        </div>

                        <div>
                            <h3 className="text-[10px] font-bold text-red-600 uppercase mb-1.5 tracking-wider">Potongan</h3>
                            {currentPayslip.bpjsKesehatan > 0 && <Row label="BPJS Kesehatan" value={currentPayslip.bpjsKesehatan} isDeduction />}
                            {currentPayslip.bpjsKetenagakerjaan > 0 && <Row label="BPJS Ketenagakerjaan" value={currentPayslip.bpjsKetenagakerjaan} isDeduction />}
                            {currentPayslip.otherDeductions > 0 && <Row label="Lain-lain (Kasbon)" value={currentPayslip.otherDeductions} isDeduction />}
                            <Row label="Total Potongan" value={currentPayslip.totalDeductions} isTotal isDeduction />
                        </div>

                        <div className="bg-orange-50 p-3 border border-orange-100 rounded-lg text-center">
                            <p className="text-[10px] font-bold text-orange-500 uppercase">Gaji Bersih Diterima</p>
                            <p className="text-2xl font-bold text-gray-800 mt-0.5">Rp {currentPayslip.netSalary.toLocaleString('id-ID')}</p>
                        </div>

                        {currentPayslip.notesForEmployee && (
                            <div className="text-center px-4">
                                <p className="text-[10px] text-gray-500 italic">"{currentPayslip.notesForEmployee}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



