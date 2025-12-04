import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, Trash2, ChevronLeft, Send } from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { usePayslipStore } from '../../store/payslipStore';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/Logo';
import { mapRoleToDetails } from '../../utils/payslipMapper';
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
    const { addPayslip } = usePayslipStore();
    const { sendMessage } = useMessageStore();
    const { user } = useAuthStore();
    const payslipRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);

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
            const details = mapRoleToDetails(selectedEmp);
            setEmployee(prev => ({
                ...prev,
                name: selectedEmp.name,
                role: details.role,
                nik: selectedEmp.id, // Using ID as NIK placeholder if NIK not available
                department: details.department,
                status: details.status,
                grade: details.grade,
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

    // Handler: Update Nilai (ContentEditable)
    const handleTextChange = (
        type: 'employee' | 'earning' | 'deduction',
        id: number | null,
        field: string,
        value: string
    ) => {
        if (type === 'employee') {
            setEmployee(prev => ({ ...prev, [field]: value }));
        } else if (type === 'earning') {
            setEarnings(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        } else if (type === 'deduction') {
            setDeductions(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
        }
    };

    const handleAmountBlur = (
        type: 'earning' | 'deduction',
        id: number,
        value: string
    ) => {
        const numericValue = Number(value.replace(/\D/g, '')) || 0;
        if (type === 'earning') {
            setEarnings(prev => prev.map(item => item.id === id ? { ...item, amount: numericValue } : item));
        } else {
            setDeductions(prev => prev.map(item => item.id === id ? { ...item, amount: numericValue } : item));
        }
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

    // Handler: Send Payslip to Employee
    const handleSendPayslip = async () => {
        if (!payslipRef.current) return;

        //Find selected employee
        const selectedEmp = employees.find(emp => emp.name === employee.name);
        if (!selectedEmp) {
            alert('Employee tidak ditemukan!');
            return;
        }

        // Confirmation Dialog
        const isConfirmed = window.confirm(`Kirim slip gaji bulan ${employee.period} ke ${employee.name}?`);
        if (!isConfirmed) return;

        setIsSending(true);

        try {
            // Wait for any potential re-renders or font loads
            await new Promise(resolve => setTimeout(resolve, 500));

            // Generate PDF
            const canvas = await html2canvas(payslipRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1123,
                windowHeight: 794
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);

            // Get PDF as base64 data URL
            const pdfBlob = pdf.output('dataurlstring');

            // Save to payslip store
            addPayslip({
                id: Date.now().toString(),
                employeeId: selectedEmp.id,
                employeeName: employee.name,
                period: employee.period,
                pdfBlob,
                sentAt: Date.now(),
                earnings,
                deductions,
                takeHomePay
            });

            // Send announcement notification
            if (user) {
                await sendMessage(
                    user as any,
                    `📄 Slip Gaji ${employee.period} Anda sudah tersedia. Silakan cek di menu Slip Gaji untuk mengunduh.`,
                    'individual' as any
                );
            }

            alert(`Slip gaji berhasil dikirim ke ${employee.name}!`);
        } catch (error) {
            console.error('Error sending payslip:', error);
            alert('Gagal mengirim slip gaji. Silakan coba lagi.');
        } finally {
            setIsSending(false);
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

                    <button
                        onClick={handleSendPayslip}
                        disabled={isSending || !employee.name}
                        className={`
                            relative overflow-hidden group
                            glass bg-gradient-to-br from-blue-500/90 to-blue-600/90 
                            text-white px-6 py-2.5 rounded-xl 
                            shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30
                            transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                            flex items-center justify-center gap-2 font-medium min-w-[140px]
                            border-white/20
                            ${isSending ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        {isSending ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Mengirim...
                            </span>
                        ) : (
                            <>
                                <Send size={18} className="group-hover:scale-110 transition-transform" />
                                <span>Kirim Slip</span>
                            </>
                        )}
                        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 group-hover:ring-white/30 transition-all" />
                    </button>
                </div>
            </div>

            {/* KERTAS A4 LANDSCAPE (Fixed Size) */}
            <div
                ref={payslipRef}
                className="mx-auto bg-white shadow-2xl print:shadow-none print:mx-0 relative transform transition-transform duration-500 overflow-hidden"
                style={{ width: '297mm', minHeight: '210mm', padding: '30mm' }}
            >
                {/* DECORATIVE MOTIF (Organic Watermark) */}
                <div className="absolute top-0 right-0 pointer-events-none z-0">
                    <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                        {/* Organic Blob Background */}
                        <path d="M400 0H200C200 0 240 80 300 120C360 160 400 250 400 250V0Z" fill="#ff6b35" fillOpacity="0.15" />
                        <path d="M400 0H300C300 0 320 40 360 60C400 80 400 120 400 120V0Z" fill="#ff6b35" fillOpacity="0.1" />

                        {/* Botanical Line Art */}
                        <g stroke="#ff6b35" strokeWidth="0.5" strokeOpacity="0.4">
                            <path d="M380 20 C360 60, 320 120, 280 160" />
                            <path d="M360 60 Q380 50 390 40" />
                            <path d="M350 80 Q330 90 320 100" />
                            <path d="M340 100 Q360 90 370 80" />
                            <path d="M330 120 Q310 130 300 140" />
                            <path d="M320 140 Q340 130 350 120" />
                            <path d="M390 40 Q385 45 365 55" strokeOpacity="0.2" />
                            <path d="M320 100 Q325 95 345 85" strokeOpacity="0.2" />
                        </g>

                        {/* Decorative Dots */}
                        <circle cx="380" cy="180" r="2" fill="#ff6b35" fillOpacity="0.2" />
                        <circle cx="360" cy="200" r="3" fill="#ff6b35" fillOpacity="0.15" />
                        <circle cx="390" cy="220" r="1.5" fill="#ff6b35" fillOpacity="0.2" />
                    </svg>
                </div>

                {/* Secondary Motif (Top Left - Subtle) */}
                <div className="absolute top-0 left-0 pointer-events-none z-0">
                    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                        <circle cx="0" cy="0" r="120" fill="#ff6b35" fillOpacity="0.05" />
                        <circle cx="20" cy="20" r="80" fill="#ff6b35" fillOpacity="0.05" />
                        <circle cx="10" cy="80" r="4" fill="#ff6b35" fillOpacity="0.1" />
                        <circle cx="60" cy="40" r="2" fill="#ff6b35" fillOpacity="0.1" />
                    </svg>
                </div>

                {/* CENTER WATERMARK - Very Faint Logo */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <svg width="384" height="384" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 opacity-[0.03]">
                        {/* Lingkaran Luar */}
                        <circle cx="50" cy="50" r="44" />
                        {/* Daun Diagonal */}
                        <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
                        {/* Tulang Daun (Garis Tengah) */}
                        <line x1="28" y1="72" x2="72" y2="28" />
                        {/* Tangkai Daun (Menempel ke Lingkaran) */}
                        <line x1="28" y1="72" x2="19" y2="81" />
                    </svg>
                </div>

                {/* BOTTOM-LEFT CULINARY PATTERN */}
                <div className="absolute bottom-0 left-0 pointer-events-none z-0">
                    <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-200">
                        {/* Spoon */}
                        <path d="M20 140 Q20 120 35 110 Q50 100 50 80 L50 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
                        <ellipse cx="50" cy="25" rx="8" ry="12" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />

                        {/* Fork */}
                        <path d="M90 30 L90 110 Q90 125 100 135" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
                        <line x1="82" y1="30" x2="82" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                        <line x1="90" y1="30" x2="90" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                        <line x1="98" y1="30" x2="98" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

                        {/* Decorative Leaf */}
                        <path d="M130 100 Q140 80 150 100 Q140 120 130 100 Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
                        <line x1="140" y1="80" x2="140" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.2" />

                        {/* Small Dots Pattern */}
                        <circle cx="60" cy="150" r="2" fill="currentColor" opacity="0.2" />
                        <circle cx="75" cy="155" r="1.5" fill="currentColor" opacity="0.2" />
                        <circle cx="120" cy="145" r="2" fill="currentColor" opacity="0.2" />
                    </svg>
                </div>


                {/* HEADER */}
                <div className="flex justify-between items-center border-b-4 border-[#ff6b35] pb-6 mb-6 w-full relative z-10">
                    <div className="flex flex-row items-center gap-6">
                        <div className="flex-shrink-0 aspect-square">
                            <Logo size="xl" variant="color" showText={false} />
                        </div>
                        <div className="flex-1 max-w-md">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight antialiased subpixel-antialiased mb-1" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                                Pawon Salam
                            </h1>
                            <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-2">Resto & Catering</p>
                            <div className="text-xs text-gray-900 leading-relaxed antialiased subpixel-antialiased">
                                <p>Beryl Commercial, Summarecon</p>
                                <p>Jl. Bulevar Selatan No.78, Cisaranten Kidul</p>
                                <p>Kec. Gedebage, Kota Bandung</p>
                                <p>Jawa Barat 40295</p>
                            </div>
                        </div>
                    </div >
                    <div className="text-right self-start mt-2">
                        <h2 className="text-3xl font-black text-[#ff6b35] uppercase tracking-wider mb-1 antialiased subpixel-antialiased" style={{ fontFamily: '"Times New Roman", Times, serif' }}>SLIP GAJI</h2>
                        <p className="text-sm text-gray-600 antialiased">Periode: <span className="font-bold text-gray-900">{employee.period}</span></p>
                        <p className="text-xs text-gray-400 mt-1">No: PS/2025/12/001</p>
                    </div>
                </div >

                {/* EMPLOYEE INFO GRID */}
                < div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm w-full" >
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Nama</span>
                            <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleTextChange('employee', null, 'name', e.currentTarget.textContent || '')}
                                className="font-bold text-right text-gray-900 focus:outline-none focus:bg-orange-50 px-1 rounded w-1/2 transition-colors antialiased break-words whitespace-pre-wrap min-h-[24px] py-1"
                            >
                                {employee.name}
                            </div>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Jabatan</span>
                            <div
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => handleTextChange('employee', null, 'role', e.currentTarget.textContent || '')}
                                className="font-medium text-right text-gray-900 focus:outline-none focus:bg-orange-50 px-1 rounded w-1/2 transition-colors antialiased break-words whitespace-pre-wrap min-h-[24px] py-1"
                            >
                                {employee.role}
                            </div>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Departemen</span>
                            <span className="font-medium text-gray-900 antialiased">{employee.department}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">NIK / ID</span>
                            <span className="font-medium text-gray-900 antialiased">{employee.nik}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Status</span>
                            <span className="font-medium text-gray-900 antialiased">{employee.status}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Grade / Gol</span>
                            <span className="font-medium text-gray-900 antialiased">{employee.grade}</span>
                        </div>
                    </div>
                </div >

                {/* FINANCIAL SPLIT */}
                < div className="grid grid-cols-2 gap-8 mb-8 w-full" >

                    {/* EARNINGS COLUMN */}
                    < div >
                        <div className="bg-[#ff6b35] text-white px-3 py-4 text-sm font-bold uppercase tracking-widest rounded-t mb-2 shadow-sm antialiased flex-shrink-0 whitespace-nowrap leading-relaxed">
                            Penerimaan
                        </div>
                        <div className="space-y-2 min-h-[150px]">
                            {earnings.map((item) => (
                                <div key={item.id} className="flex items-start justify-between group text-sm py-1 border-b border-gray-100 border-dashed hover:border-orange-200 transition-colors">
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleTextChange('earning', item.id, 'label', e.currentTarget.textContent || '')}
                                        className="w-full bg-transparent h-auto py-1 leading-relaxed text-gray-800 focus:outline-none focus:bg-orange-50 rounded px-1 transition-all antialiased break-words whitespace-pre-wrap min-h-[24px]"
                                    >
                                        {item.label}
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleAmountBlur('earning', item.id, e.currentTarget.textContent || '')}
                                            className="text-right font-mono text-gray-700 w-32 bg-transparent h-auto py-1 leading-relaxed focus:outline-none focus:bg-orange-50 rounded px-1 transition-all antialiased break-words whitespace-pre-wrap min-h-[24px]"
                                        >
                                            {formatRupiah(item.amount)}
                                        </div>
                                        <button
                                            onClick={() => deleteRow('earning', item.id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 print:hidden transition-opacity mt-1"
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

                        <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded mt-4 border border-gray-200">
                            <span className="font-bold text-gray-600 text-sm">Total Penerimaan</span>
                            <span className="font-bold text-gray-900 antialiased">{formatRupiah(totalEarnings)}</span>
                        </div>
                    </div >

                    {/* DEDUCTIONS COLUMN */}
                    < div >
                        <div className="bg-[#d64518] text-white px-3 py-4 text-sm font-bold uppercase tracking-widest rounded-t mb-2 shadow-sm antialiased flex-shrink-0 whitespace-nowrap leading-relaxed">
                            Potongan
                        </div>
                        <div className="space-y-2 min-h-[150px]">
                            {deductions.map((item) => (
                                <div key={item.id} className="flex items-start justify-between group text-sm py-1 border-b border-gray-100 border-dashed hover:border-orange-200 transition-colors">
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleTextChange('deduction', item.id, 'label', e.currentTarget.textContent || '')}
                                        className="w-full bg-transparent h-auto py-1 leading-relaxed text-gray-800 focus:outline-none focus:bg-orange-50 rounded px-1 transition-all antialiased break-words whitespace-pre-wrap min-h-[24px]"
                                    >
                                        {item.label}
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div
                                            contentEditable
                                            suppressContentEditableWarning
                                            onBlur={(e) => handleAmountBlur('deduction', item.id, e.currentTarget.textContent || '')}
                                            className="text-right font-mono text-gray-700 w-32 bg-transparent h-auto py-1 leading-relaxed focus:outline-none focus:bg-orange-50 rounded px-1 transition-all antialiased break-words whitespace-pre-wrap min-h-[24px]"
                                        >
                                            {formatRupiah(item.amount)}
                                        </div>
                                        <button
                                            onClick={() => deleteRow('deduction', item.id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 print:hidden transition-opacity mt-1"
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

                        <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded mt-4 border border-gray-200">
                            <span className="font-bold text-gray-600 text-sm">Total Potongan</span>
                            <span className="font-bold text-gray-900 antialiased">{formatRupiah(totalDeductions)}</span>
                        </div>
                    </div >
                </div >

                {/* TAKE HOME PAY */}
                < div className="flex items-center mb-8 w-full shadow-sm rounded overflow-hidden" >
                    <div className="bg-[#ff6b35] text-white font-bold px-6 py-4 text-sm tracking-widest uppercase w-1/3 flex items-center antialiased flex-shrink-0 whitespace-nowrap leading-relaxed">
                        TAKE HOME PAY
                    </div>
                    <div className="bg-orange-50 flex-1 py-4 px-6 text-right border border-[#ff6b35]">
                        <span className="text-xl font-black text-[#ff6b35] antialiased subpixel-antialiased">{formatRupiah(takeHomePay)}</span>
                    </div>
                </div >

                {/* FOOTER INFO & SIGNATURE */}
                < div className="flex flex-row justify-between items-end mt-auto w-full gap-4" >
                    <div className="flex-1 basis-0 text-sm text-gray-600">
                        <p className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wide antialiased">Ditransfer Ke:</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="font-bold text-gray-900 antialiased">BCA (Bank Central Asia)</p>
                            <p className="font-mono text-gray-800 my-1 antialiased">123-456-7890</p>
                            <p className="text-xs uppercase text-gray-700 antialiased">a.n. {employee.name}</p>
                        </div>
                    </div>

                    <div className="flex-1 basis-0 text-center text-xs">
                        <div className="mb-4 flex flex-col items-center">
                            <p className="font-semibold text-gray-500 mb-2">Disetujui Oleh,</p>
                            <div className="h-32 w-full"></div> {/* Space for signature */}
                            <p className="font-bold text-gray-900 border-t border-gray-300 pt-2 px-4 inline-block min-w-[150px] antialiased subpixel-antialiased">HRD Manager</p>
                        </div>
                    </div>

                    <div className="flex-1 basis-0 text-center text-xs">
                        <div className="mb-4 flex flex-col items-center">
                            <p className="font-semibold text-gray-500 mb-2">Diterima Oleh,</p>
                            <div className="h-32 w-full"></div> {/* Space for signature */}
                            <p className="font-bold text-gray-900 border-t border-gray-300 pt-2 px-4 inline-block min-w-[150px] antialiased subpixel-antialiased">{employee.name}</p>
                        </div>
                    </div>
                </div >

                {/* FOOTER COPYRIGHT */}
                < div className="absolute bottom-4 left-0 w-full text-center" >
                    <p className="text-[10px] text-gray-400 antialiased">Dicetak secara otomatis oleh sistem Pawon Salam Payroll</p>
                </div >

            </div >
        </div >
    );
};
