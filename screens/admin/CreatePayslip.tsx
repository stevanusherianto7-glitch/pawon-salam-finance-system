import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, Trash2, ChevronLeft } from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { Logo } from '../../components/Logo';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface FinancialItem {
    id: number;
    label: string;
    amount: number;
}

interface EmployeeData {
    name: string;
    role: string;
    nik: string;
    department: string;
    period: string;
    status: string;
    grade: string;
    section: string;
}

export const CreatePayslip: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { employees, fetchEmployees } = useEmployeeStore();
    const payslipRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // State Data Karyawan
    const [employee, setEmployee] = useState<EmployeeData>({
        name: 'Stepanus Herianto',
        role: 'Manajer Marketing',
        nik: '3271838909798889',
        department: 'Marketing & Sales',
        period: 'Desember 2025',
        status: 'Karyawan Tetap',
        grade: 'Grade A',
        section: 'Head Office'
    });

    // State Keuangan (Earnings)
    const [earnings, setEarnings] = useState<FinancialItem[]>([
        { id: 1, label: 'Gaji Pokok', amount: 3000000 },
        { id: 2, label: 'Tunjangan Jabatan', amount: 2750000 },
        { id: 3, label: 'Uang Makan', amount: 0 },
        { id: 4, label: 'Lembur', amount: 1450000 },
    ]);

    // State Keuangan (Deductions)
    const [deductions, setDeductions] = useState<FinancialItem[]>([
        { id: 1, label: 'PPh 21', amount: 150000 },
        { id: 2, label: 'BPJS Kesehatan', amount: 100000 },
    ]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const selectedEmp = employees.find(emp => emp.id === selectedId);
        if (selectedEmp) {
            setEmployee(prev => ({
                ...prev,
                name: selectedEmp.name,
                role: selectedEmp.role.replace(/_/g, ' '),
                nik: selectedEmp.id, // Using ID as NIK placeholder if NIK not available
                department: 'Operasional', // Default or fetch if available
                status: 'Karyawan Tetap',
                grade: '-',
                section: 'Outlet'
            }));
        }
    };

    // Helper: Format Rupiah
    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // Helper: Hitung Total
    const totalEarnings = earnings.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalDeductions = deductions.reduce((sum, item) => sum + Number(item.amount), 0);
    const takeHomePay = totalEarnings - totalDeductions;

    // Handler: Tambah Baris
    const addRow = (type: 'earning' | 'deduction') => {
        const newItem: FinancialItem = { id: Date.now(), label: 'Item Baru', amount: 0 };
        if (type === 'earning') setEarnings([...earnings, newItem]);
        else setDeductions([...deductions, newItem]);
    };

    // Handler: Hapus Baris
    const deleteRow = (type: 'earning' | 'deduction', id: number) => {
        if (type === 'earning') setEarnings(earnings.filter(item => item.id !== id));
        else setDeductions(deductions.filter(item => item.id !== id));
    };

    // Handler: Update Nilai
    const updateRow = (type: 'earning' | 'deduction', id: number, field: keyof FinancialItem, value: string | number) => {
        const updateList = (list: FinancialItem[]) => list.map(item =>
            item.id === id ? { ...item, [field]: field === 'amount' ? Number(value) : value } : item
        );

        if (type === 'earning') setEarnings(updateList(earnings));
        else setDeductions(updateList(deductions));
    };

    // Handler: Download PDF
    const handleDownloadPDF = async () => {
        if (!payslipRef.current) return;

        setIsGenerating(true);

        try {
            // Wait for any potential re-renders or font loads
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(payslipRef.current, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Enable CORS for images
                logging: false,
                backgroundColor: '#ffffff', // Ensure white background
                windowWidth: 1123, // A4 Landscape width in pixels (approx at 96dpi)
                windowHeight: 794 // A4 Landscape height in pixels
            });

            const imgData = canvas.toDataURL('image/png');

            // A4 Landscape dimensions in mm
            const pdfWidth = 297;
            const pdfHeight = 210;

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Generate filename based on employee name and period
            const filename = `Slip_Gaji_${employee.name.replace(/\s+/g, '_')}_${employee.period.replace(/\s+/g, '_')}.pdf`;

            pdf.save(filename);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Gagal membuat PDF. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-10 overflow-x-auto print:bg-white print:p-0 print:overflow-hidden">
            <style>
                {`
                @page {
                    size: A4 landscape;
                    margin: 0;
                }
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
                `}
            </style>

            {/* Action Bar (Hidden saat Print/Capture) */}
            <div className="max-w-[297mm] mx-auto mb-8 flex flex-col md:flex-row justify-between items-center print:hidden px-4 gap-4" data-html2canvas-ignore>
                <div className="flex items-center gap-6 w-full md:w-auto">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="glass px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-300 flex items-center gap-2 font-medium shadow-sm hover:shadow-md active:scale-95"
                        >
                            <ChevronLeft size={20} /> Kembali
                        </button>
                    )}
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Slip Gaji Generator</h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <select
                        className="bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all cursor-pointer hover:bg-white"
                        onChange={handleEmployeeSelect}
                        defaultValue=""
                    >
                        <option value="" disabled>-- Pilih Karyawan --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className={`
                            relative overflow-hidden group
                            glass bg-gradient-to-br from-orange-500/90 to-orange-600/90 
                            text-white px-6 py-2.5 rounded-xl 
                            shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30
                            transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                            flex items-center justify-center gap-2 font-medium min-w-[140px]
                            border-white/20
                            ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </span>
                        ) : (
                            <>
                                <Download size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Save PDF</span>
                            </>
                        )}
                        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 group-hover:ring-white/30 transition-all" />
                    </button>
                </div>
            </div>

            {/* KERTAS A4 LANDSCAPE (Fixed Size) */}
            <div
                ref={payslipRef}
                className="mx-auto bg-white shadow-2xl print:shadow-none print:mx-0 relative transform transition-transform duration-500"
                style={{ width: '297mm', minHeight: '210mm', padding: '30mm' }}
            >

                {/* HEADER */}
                <div className="flex justify-between items-start border-b-4 border-[#ff6b35] pb-6 mb-6 w-full">
                    <div className="flex flex-col items-start">
                        <Logo size="lg" variant="color" showText={true} />
                        <div className="text-xs text-gray-500 mt-4 leading-tight text-left">
                            <p>Beryl Commercial, Summarecon</p>
                            <p>Jl. Bulevar Selatan No.78, Cisaranten Kidul</p>
                            <p>Kec. Gedebage, Kota Bandung</p>
                            <p>Jawa Barat 40295</p>
                        </div>
                    </div>
                    <div className="text-right mt-2">
                        <h2 className="text-3xl font-black text-[#ff6b35] uppercase tracking-wider mb-1" style={{ fontFamily: '"Times New Roman", Times, serif' }}>SLIP GAJI</h2>
                        <p className="text-sm text-gray-500">Periode: <span className="font-bold text-gray-800">{employee.period}</span></p>
                        <p className="text-xs text-gray-400 mt-1">No: PS/2025/12/001</p>
                    </div>
                </div>

                {/* EMPLOYEE INFO GRID */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm w-full">
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Nama Karyawan</span>
                            <input
                                type="text"
                                value={employee.name}
                                onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                                className="font-bold text-right text-gray-800 focus:outline-none focus:bg-orange-50 px-1 rounded w-1/2 transition-colors"
                            />
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Jabatan</span>
                            <input
                                type="text"
                                value={employee.role}
                                onChange={(e) => setEmployee({ ...employee, role: e.target.value })}
                                className="font-medium text-right text-gray-800 focus:outline-none focus:bg-orange-50 px-1 rounded w-1/2 transition-colors"
                            />
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Departemen</span>
                            <span className="font-medium text-gray-800">{employee.department}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">NIK / ID</span>
                            <span className="font-medium text-gray-800">{employee.nik}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Status</span>
                            <span className="font-medium text-gray-800">{employee.status}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Grade / Gol</span>
                            <span className="font-medium text-gray-800">{employee.grade}</span>
                        </div>
                    </div>
                </div>

                {/* FINANCIAL SPLIT */}
                <div className="grid grid-cols-2 gap-8 mb-8 w-full">

                    {/* EARNINGS COLUMN */}
                    <div>
                        <div className="bg-[#ff6b35] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-t mb-2 shadow-sm">
                            Penerimaan
                        </div>
                        <div className="space-y-2 min-h-[150px]">
                            {earnings.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group text-sm py-1 border-b border-gray-100 border-dashed hover:border-orange-200 transition-colors">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateRow('earning', item.id, 'label', e.target.value)}
                                        className="w-1/2 focus:outline-none focus:bg-orange-50 rounded px-1 py-1 transition-colors"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateRow('earning', item.id, 'amount', e.target.value)}
                                            className="text-right font-mono text-gray-700 w-24 focus:outline-none focus:bg-orange-50 rounded px-1 py-1 transition-colors"
                                        />
                                        <button
                                            onClick={() => deleteRow('earning', item.id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 print:hidden transition-opacity"
                                            data-html2canvas-ignore
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => addRow('earning')}
                                className="text-xs text-[#ff6b35] font-semibold flex items-center gap-1 mt-3 hover:underline print:hidden transition-all"
                                data-html2canvas-ignore
                            >
                                <Plus size={14} /> Tambah Item
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded mt-4 border-t-2 border-gray-200">
                            <span className="font-bold text-gray-600 text-sm">Total Penerimaan</span>
                            <span className="font-bold text-gray-800">{formatRupiah(totalEarnings)}</span>
                        </div>
                    </div>

                    {/* DEDUCTIONS COLUMN */}
                    <div>
                        <div className="bg-[#d64518] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-t mb-2 shadow-sm">
                            Potongan
                        </div>
                        <div className="space-y-2 min-h-[150px]">
                            {deductions.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group text-sm py-1 border-b border-gray-100 border-dashed hover:border-orange-200 transition-colors">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateRow('deduction', item.id, 'label', e.target.value)}
                                        className="w-1/2 focus:outline-none focus:bg-orange-50 rounded px-1 py-1 transition-colors"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateRow('deduction', item.id, 'amount', e.target.value)}
                                            className="text-right font-mono text-gray-700 w-24 focus:outline-none focus:bg-orange-50 rounded px-1 py-1 transition-colors"
                                        />
                                        <button
                                            onClick={() => deleteRow('deduction', item.id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 print:hidden transition-opacity"
                                            data-html2canvas-ignore
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => addRow('deduction')}
                                className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-3 hover:underline print:hidden transition-all"
                                data-html2canvas-ignore
                            >
                                <Plus size={14} /> Tambah Item
                            </button>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded mt-4 border-t-2 border-gray-200">
                            <span className="font-bold text-gray-600 text-sm">Total Potongan</span>
                            <span className="font-bold text-gray-800">{formatRupiah(totalDeductions)}</span>
                        </div>
                    </div>
                </div>

                {/* TAKE HOME PAY */}
                <div className="flex items-center mb-8 w-full shadow-sm rounded overflow-hidden">
                    <div className="bg-[#ff6b35] text-white font-bold px-6 py-2 text-sm tracking-widest uppercase w-1/3 flex items-center">
                        TAKE HOME PAY
                    </div>
                    <div className="bg-orange-50 flex-1 py-2 px-6 text-right border border-[#ff6b35] border-l-0">
                        <span className="text-xl font-black text-[#ff6b35]">{formatRupiah(takeHomePay)}</span>
                    </div>
                </div>

                {/* FOOTER INFO & SIGNATURE */}
                <div className="grid grid-cols-3 gap-8 mt-auto w-full items-end">
                    <div className="text-sm text-gray-600 col-span-1">
                        <p className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wide">Ditransfer Ke:</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="font-bold">BCA (Bank Central Asia)</p>
                            <p className="font-mono text-gray-800 my-1">123-456-7890</p>
                            <p className="text-xs uppercase">a.n. {employee.name}</p>
                        </div>
                    </div>

                    <div className="text-center text-xs col-span-1">
                        <div className="mb-4">
                            <p className="mb-16 font-semibold text-gray-500">Disetujui Oleh,</p>
                            <p className="font-bold text-gray-800 border-t border-gray-300 pt-2 px-4 inline-block min-w-[150px]">HRD Manager</p>
                        </div>
                    </div>

                    <div className="text-center text-xs col-span-1">
                        <div className="mb-4">
                            <p className="mb-16 font-semibold text-gray-500">Diterima Oleh,</p>
                            <p className="font-bold text-gray-800 border-t border-gray-300 pt-2 px-4 inline-block min-w-[150px]">{employee.name}</p>
                        </div>
                    </div>
                </div>

                {/* FOOTER COPYRIGHT */}
                <div className="absolute bottom-4 left-0 w-full text-center">
                    <p className="text-[10px] text-gray-400">Dicetak secara otomatis oleh sistem Pawon Salam Payroll</p>
                </div>

            </div>
        </div>
    );
};
