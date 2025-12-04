import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, Trash2, ChevronLeft, Send } from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';
import { usePayslipStore } from '../../store/payslipStore';
import { useMessageStore } from '../../store/messageStore';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/Logo';
import { useNotificationStore } from '../../store/notificationStore';
import { mapRoleToDetails } from '../../utils/payslipMapper';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { sendPayslip } from '../../hooks/usePayslipStorage';

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
    const { addPayslip, getPayslipsByEmployee } = usePayslipStore();
    const { sendMessage } = useMessageStore();
    const { user } = useAuthStore();
    const { showNotification } = useNotificationStore();
    const payslipRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isSent, setIsSent] = useState(false);

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

    const [sendingStatus, setSendingStatus] = useState<'idle' | 'generating' | 'uploading' | 'success'>('idle');

    // Check if already sent
    useEffect(() => {
        if (employee.name && employee.period) {
            const selectedEmp = employees.find(emp => emp.name === employee.name);
            if (selectedEmp) {
                const existingPayslips = getPayslipsByEmployee(selectedEmp.id);
                const isAlreadySent = existingPayslips.some(p => p.period === employee.period);
                if (isAlreadySent) {
                    setSendingStatus('success');
                } else {
                    setSendingStatus('idle');
                }
            }
        }
    }, [employee.name, employee.period, employees, getPayslipsByEmployee]);



    // Handler: Send Payslip (V2 - Robust Path)
    const handleSendPayslip = async () => {
        // Validation
        if (!employee.name || !employee.role || earnings.length === 0) {
            alert('Lengkapi data slip gaji sebelum mengirim!');
            return;
        }

        // Find selected employee
        const selectedEmp = employees.find(emp => emp.name === employee.name);
        if (!selectedEmp) {
            alert('Employee tidak ditemukan!');
            return;
        }

        // Confirmation Dialog
        const isConfirmed = window.confirm(`Kirim slip gaji bulan ${employee.period} ke ${employee.name}?`);
        if (!isConfirmed) return;

        setSendingStatus('uploading');

        // JALUR BARU (V2): Prioritize Data Save
        try {
            // 1. Simpan Data ke LocalStorage (Critical Path)
            // Kita simpan DATA JSON-nya, bukan file PDF (Hemat Memori)
            const success = sendPayslip({
                employeeId: selectedEmp.id,
                employeeName: employee.name,
                period: employee.period,
                earnings,
                deductions,
                takeHomePay,
                pdfBlob: 'GENERATE_ON_CLIENT'
            });

            if (success) {
                // 2. UI Feedback - IMMEDIATE SUCCESS
                // Jika data tersimpan, kita anggap SUKSES 100% bagi user.
                setSendingStatus('success');
                showNotification(`Data Slip Gaji berhasil dikirim ke ${employee.name}`, 'success');
                alert('Sukses! Data slip gaji berhasil dikirim.');

                // 3. Background Process: Send Notification (Non-Blocking)
                // Jika ini gagal, jangan batalkan status sukses utama.
                if (user) {
                    setTimeout(async () => {
                        try {
                            await sendMessage(
                                user as any,
                                `📄 Slip Gaji ${employee.period} Anda sudah tersedia.`,
                                'individual' as any
                            );
                            console.log('Notification message sent successfully');
                        } catch (msgError) {
                            // Silent fail for message - Data is already safe
                            console.warn('Background notification failed (non-critical):', msgError);
                        }
                    }, 100);
                }
            }
        } catch (error: any) {
            // Critical Error (Storage Full / System Error)
            console.error('Critical error in sendPayslip V2:', error);
            setSendingStatus('idle');
            const errorMessage = error?.message || 'Unknown error';

            // Show specific error to help diagnosis
            if (errorMessage.includes('QuotaExceeded')) {
                alert('Gagal: Memori HP Penuh. Hapus beberapa slip gaji lama di menu "Riwayat".');
            } else {
                alert(`Gagal menyimpan data: ${errorMessage}`);
            }
        }
    };

    // State for Zoom/Scale
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    // Auto-scale on mount/resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.clientWidth;
                const paperWidth = 1123; // 297mm in pixels (approx)
                const padding = 32; // 2rem padding

                // Calculate scale to fit width
                const fitScale = (containerWidth - padding) / paperWidth;

                // Only scale down, never up automatically (max 1)
                // On mobile, this will be around 0.3-0.4
                // On laptop, maybe 0.8-0.9 depending on sidebar
                const newScale = Math.min(1, Math.max(0.3, fitScale));
                setScale(newScale);
            }
        };

        // Initial calculation
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleZoomIn = () => setScale(prev => Math.min(1.5, prev + 0.1));
    const handleZoomOut = () => setScale(prev => Math.max(0.3, prev - 0.1));

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50/50 flex flex-col print:bg-white print:h-auto print:overflow-visible" ref={containerRef}>
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
                /* Custom Scrollbar for Laptop Usability */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 12px;
                    height: 12px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0,0,0,0.2);
                    border-radius: 6px;
                    border: 3px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,0,0,0.3);
                    border: 3px solid transparent;
                    background-clip: content-box;
                }
                `}
            </style>

            {/* Action Bar (Hidden saat Print/Capture) */}
            <div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center print:hidden px-4 py-4 gap-4 z-50 relative shrink-0 bg-white/50 backdrop-blur-sm border-b border-gray-200/50" data-html2canvas-ignore>
                <div className="flex items-center gap-4 w-full lg:w-auto">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="glass px-3 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-300 flex items-center gap-2 font-medium shadow-sm hover:shadow-md active:scale-95 text-sm md:text-base"
                        >
                            <ChevronLeft size={18} /> <span className="hidden sm:inline">Kembali</span>
                        </button>
                    )}
                    <div className="flex flex-col">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                            Slip Gaji Generator <span className="text-xs font-normal text-orange-500 bg-orange-100 px-2 py-0.5 rounded-full align-middle">v1.2</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 lg:hidden">
                            <button onClick={handleZoomOut} className="p-1 bg-white rounded border hover:bg-gray-50">Zoom -</button>
                            <span>{Math.round(scale * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-1 bg-white rounded border hover:bg-gray-50">Zoom +</button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 w-full lg:w-auto lg:flex-row lg:items-center">
                    {/* Zoom Controls (Desktop) */}
                    <div className="hidden lg:flex items-center gap-2 bg-white/50 backdrop-blur px-2 py-1 rounded-lg border border-gray-200 mr-2">
                        <button onClick={handleZoomOut} className="p-1 hover:bg-white rounded text-gray-600" title="Zoom Out">-</button>
                        <span className="text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
                        <button onClick={handleZoomIn} className="p-1 hover:bg-white rounded text-gray-600" title="Zoom In">+</button>
                    </div>

                    <select
                        className="w-full lg:w-64 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all cursor-pointer hover:bg-white"
                        onChange={handleEmployeeSelect}
                        defaultValue=""
                    >
                        <option value="" disabled>-- Pilih Karyawan --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>

                    <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:flex lg:gap-3">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGenerating}
                            className={`
                                relative overflow-hidden group
                                glass bg-gradient-to-br from-orange-500/90 to-orange-600/90 
                                text-white px-4 py-2.5 rounded-xl 
                                shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30
                                transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                                flex items-center justify-center gap-2 font-medium w-full lg:w-auto
                                border-white/20 text-sm md:text-base
                                ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}
                            `}
                        >
                            {isGenerating ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="hidden sm:inline">Generating...</span>
                                </span>
                            ) : (
                                <>
                                    <Download size={18} className="group-hover:scale-110 transition-transform" />
                                    <span>PDF</span>
                                </>
                            )}
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 group-hover:ring-white/30 transition-all" />
                        </button>

                        <button
                            onClick={handleSendPayslip}
                            disabled={sendingStatus !== 'idle' || !employee.name}
                            className={`
                                relative overflow-hidden group
                                glass 
                                ${sendingStatus === 'success'
                                    ? 'bg-green-500/90 hover:bg-green-600/90 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 hover:shadow-blue-500/30'}
                                text-white px-4 py-2.5 rounded-xl 
                                shadow-lg 
                                transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0
                                flex items-center justify-center gap-2 font-medium w-full lg:w-auto
                                border-white/20 text-sm md:text-base
                                ${(sendingStatus === 'generating' || sendingStatus === 'uploading') ? 'opacity-90 cursor-wait' : ''}
                                ${(!employee.name && sendingStatus === 'idle') ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {sendingStatus === 'generating' && (
                                <span className="flex items-center gap-2 text-xs">
                                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Gen...
                                </span>
                            )}

                            {sendingStatus === 'uploading' && (
                                <span className="flex items-center gap-2 text-xs">
                                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Send...
                                </span>
                            )}

                            {sendingStatus === 'success' && (
                                <span className="flex items-center gap-2">
                                    <Send size={18} className="text-white" />
                                    <span>Sent</span>
                                </span>
                            )}

                            {sendingStatus === 'idle' && (
                                <>
                                    <Send size={18} className="group-hover:scale-110 transition-transform" />
                                    <span>Kirim</span>
                                </>
                            )}

                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 group-hover:ring-white/30 transition-all" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SCROLLABLE & SCALABLE CONTENT AREA */}
            <div className="flex-1 overflow-auto flex justify-center p-4 md:p-8 custom-scrollbar w-full">
                <div
                    className="origin-top transition-transform duration-300 ease-out"
                    style={{
                        transform: `scale(${scale})`,
                        width: '297mm', // Fixed width for the paper itself
                        height: '210mm'
                    }}
                >
                    {/* KERTAS A4 LANDSCAPE (Fixed Size) */}
                    <div
                        ref={payslipRef}
                        className="bg-white shadow-2xl print:shadow-none relative overflow-hidden"
                        style={{ width: '297mm', minHeight: '210mm', padding: '40mm 30mm 30mm 30mm' }}
                    >

                        {/* LEFT BORDER STRIP - Official Look */}
                        <div className="absolute top-0 left-0 bottom-0 w-3 bg-[#ff6b35] z-20 print:block"></div>

                        {/* TOP-RIGHT: "The Spice Wave" */}
                        <div className="absolute top-0 right-0 pointer-events-none z-0">
                            <svg width="350" height="350" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id="spiceGradientAdmin" x1="0" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#ff6b35" />
                                        <stop offset="1" stopColor="#e65100" />
                                    </linearGradient>
                                </defs>
                                {/* Darker Depth Layer */}
                                <path d="M350 0 V250 C300 220, 200 150, 150 0 Z" fill="#e65100" />
                                {/* Main Wave Layer */}
                                <path d="M350 0 V200 C280 180, 150 100, 100 0 Z" fill="url(#spiceGradientAdmin)" fillOpacity="1" />
                                {/* Leaf Cutout Accent */}
                                <path d="M250 50 Q290 50 310 90 Q290 110 250 110 Q230 90 250 50 Z" fill="#ffffff" fillOpacity="0.15" />
                            </svg>
                        </div>

                        {/* BOTTOM-LEFT: "The Foundation" */}
                        <div className="absolute bottom-0 left-0 pointer-events-none z-0 ml-3">
                            <svg width="250" height="250" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Geometric Accents */}
                                <path d="M0 250 L0 120 L130 250 Z" fill="#ff8a65" fillOpacity="0.8" />
                                <path d="M0 250 L0 180 L70 250 Z" fill="#ff6b35" />
                            </svg>
                        </div>


                        {/* HEADER */}
                        <div className="flex justify-between items-center border-b-4 border-[#ff6b35] pb-6 mb-10 w-full relative z-10">

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
                </div>
            </div>
        </div>
    );
};
