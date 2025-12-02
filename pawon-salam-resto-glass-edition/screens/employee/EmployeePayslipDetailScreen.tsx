
import React, { useEffect, useRef, useState } from 'react';
import { usePayrollStore } from '../../store/payrollStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Download, Building2, DollarSign, Loader2 } from 'lucide-react';
import { Payslip } from '../../types';
import { Logo } from '../../components/Logo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


// --- Printable Component for PDF ---
const PrintablePayslip = React.forwardRef<
    HTMLDivElement,
    { slip: Payslip, employee: any }
>(({ slip, employee }, ref) => {

    const Row = ({ label, value, isTotal = false, isDeduction = false }: { label: string, value: number, isTotal?: boolean, isDeduction?: boolean }) => (
        <tr className={`${isTotal ? 'font-bold' : ''}`}>
            <td className={`py-1.5 pr-4 ${isTotal ? 'pt-2 border-t border-gray-300' : ''}`}>{label}</td>
            <td className={`py-1.5 text-right whitespace-nowrap ${isDeduction ? 'text-red-600' : ''} ${isTotal ? 'pt-2 border-t border-gray-300' : ''}`}>
                {isDeduction ? '- ' : ''}Rp {value.toLocaleString('id-ID')}
            </td>
        </tr>
    );

    return (
        <div ref={ref} className="bg-white p-10 font-sans" style={{ width: '800px' }}>
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
                <div className="flex items-center gap-4">
                    <Logo variant="dark" size="md" showText={false} />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-heading">PAWON SALAM RESTO</h1>
                        <p className="text-xs text-gray-500">Jl. Gajahmada No.130, Miroto, Semarang Tengah</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-gray-800">SLIP GAJI</h2>
                    <p className="text-xs text-gray-500">Periode: {new Date(0, slip.periodMonth - 1).toLocaleString('id-ID', { month: 'long' })} {slip.periodYear}</p>
                </div>
            </div>

            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-8 my-6 text-sm">
                <div>
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">KARYAWAN</p>
                    <p className="font-bold text-gray-800">{employee?.name}</p>
                    <p className="text-gray-600">{employee?.department}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">TANGGAL PEMBAYARAN</p>
                    <p className="font-bold text-gray-800">{new Date(slip.payDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            {/* Details Table */}
            <div className="grid grid-cols-2 gap-10">
                {/* Earnings */}
                <div>
                    <h3 className="text-sm font-bold text-green-700 mb-2 pb-1 border-b border-gray-200">PENAPATAN</h3>
                    <table className="w-full text-sm">
                        <tbody>
                            <Row label="Gaji Pokok" value={slip.basicSalary} />
                            {slip.allowanceMeal > 0 && <Row label="Tunj. Makan" value={slip.allowanceMeal} />}
                            {slip.allowanceTransport > 0 && <Row label="Tunj. Transport" value={slip.allowanceTransport} />}
                            {slip.overtimeAmount > 0 && <Row label={`Lembur (${slip.overtimeHours} jam)`} value={slip.overtimeAmount} />}
                            {slip.bonus > 0 && <Row label="Bonus / Insentif" value={slip.bonus} />}
                            <Row label="Total Pendapatan" value={slip.totalEarnings} isTotal />
                        </tbody>
                    </table>
                </div>
                {/* Deductions */}
                <div>
                    <h3 className="text-sm font-bold text-red-700 mb-2 pb-1 border-b border-gray-200">POTONGAN</h3>
                    <table className="w-full text-sm">
                        <tbody>
                            {slip.bpjsKesehatan > 0 && <Row label="BPJS Kesehatan" value={slip.bpjsKesehatan} isDeduction />}
                            {slip.bpjsKetenagakerjaan > 0 && <Row label="BPJS Ketenagakerjaan" value={slip.bpjsKetenagakerjaan} isDeduction />}
                            {slip.otherDeductions > 0 && <Row label="Lain-lain (Kasbon)" value={slip.otherDeductions} isDeduction />}
                            <Row label="Total Potongan" value={slip.totalDeductions} isTotal isDeduction />
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Net Salary */}
            <div className="mt-8 bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                <p className="text-base font-bold text-gray-800 uppercase">TOTAL DITERIMA (NET)</p>
                <p className="text-2xl font-bold text-gray-900">Rp {slip.netSalary.toLocaleString('id-ID')}</p>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-8 pt-4 border-t border-dashed">
                <p className="text-xs text-gray-500 italic">Ini adalah slip gaji yang sah dan diterbitkan secara digital oleh sistem HR Pawon Salam Resto.</p>
            </div>
        </div>
    );
});

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
            const canvas = await html2canvas(printableRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Payslip_${user?.name?.replace(' ', '_')}_${currentPayslip?.periodMonth}_${currentPayslip?.periodYear}.pdf`);
        } catch (e) {
            console.error(e);
            alert('Gagal membuat PDF.');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading || !currentPayslip) return <div className="p-8 text-center text-gray-500">Memuat detail...</div>;

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

            {/* Hidden component for printing */}
            <div className="absolute left-[-9999px] top-0">
                <PrintablePayslip ref={printableRef} slip={currentPayslip} employee={user} />
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
                                {isDownloading ? 'Saving...' : 'Simpan PDF'}
                            </button>
                        </div>

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
