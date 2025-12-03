import React, { useState, useRef, useEffect } from 'react';
import { PayrollData } from '../../types';
import { Logo } from '../../components/Logo';
import PayrollInput from '../../components/PayrollInput';
import { useEmployeeStore } from '../../store/employeeStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CreatePayslipProps {
    onBack?: () => void;
}

const SlipMotifTopRight = () => (
    <div className="absolute top-0 right-0 z-0 pointer-events-none">
        <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 right-0 w-[50%] md:w-auto h-auto print:w-[10cm]">
            {/* Background Blob - Vibrant Orange - Resized smaller */}
            <path d="M300 0L300 150C250 120 180 100 150 0H300Z" fill="#FB923C" fillOpacity="0.5" />

            {/* Round Motifs / Bubbles - Repositioned closer to corner */}
            <circle cx="270" cy="40" r="20" fill="#EA580C" fillOpacity="0.6" />
            <circle cx="230" cy="30" r="12" fill="#F97316" fillOpacity="0.8" />
            <circle cx="190" cy="20" r="8" fill="#FB923C" fillOpacity="0.9" />

            <circle cx="250" cy="70" r="15" fill="#FDBA74" fillOpacity="0.7" />
            <circle cx="220" cy="90" r="6" fill="#EA580C" fillOpacity="0.5" />

            <circle cx="280" cy="90" r="10" fill="#C2410C" fillOpacity="0.6" />
            <circle cx="260" cy="110" r="5" fill="#FDBA74" fillOpacity="0.8" />
        </svg>
    </div>
);

const SlipMotifTopLeft = () => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 z-0 pointer-events-none w-[30%] md:w-auto h-auto print:w-[8cm]">
        <circle cx="30" cy="50" r="18" fill="#F97316" fillOpacity="0.8" /> {/* Orange 500 */}
        <circle cx="65" cy="25" r="10" fill="#FB923C" fillOpacity="0.8" /> {/* Orange 400 */}
        <circle cx="20" cy="90" r="8" fill="#FDBA74" fillOpacity="0.9" />  {/* Orange 300 */}
        <circle cx="60" cy="70" r="5" fill="#EA580C" fillOpacity="0.6" />
        <circle cx="85" cy="45" r="4" fill="#C2410C" fillOpacity="0.5" /> {/* Orange 700 */}
    </svg>
);

const SlipMotifBottomLeft = () => (
    <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 left-0 z-0 pointer-events-none w-[25%] md:w-auto h-auto print:w-[6cm]">
        <path d="M0 100C10 70 40 60 70 100H0Z" fill="#FDBA74" fillOpacity="0.8" /> {/* Orange 300 - Resized smaller */}
    </svg>
);

const SlipMotifBottomRight = () => (
    <svg width="150" height="150" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0 z-0 pointer-events-none w-[25%] md:w-auto h-auto print:w-[6cm]">
        <circle cx="120" cy="110" r="12" fill="#F97316" fillOpacity="0.8" />
        <circle cx="95" cy="130" r="8" fill="#FB923C" fillOpacity="0.8" />
        <circle cx="130" cy="80" r="5" fill="#FDBA74" fillOpacity="0.9" />
        <circle cx="80" cy="140" r="4" fill="#EA580C" fillOpacity="0.6" />
    </svg>
);

const SlipLogo = () => (
    <div className="flex items-center gap-5 text-orange-600">
        <div className="w-24 h-24 text-orange-600 relative flex items-center justify-center">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-full"
            >
                <circle cx="50" cy="50" r="44" />
                <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
                <line x1="28" y1="72" x2="72" y2="28" />
                <line x1="28" y1="72" x2="19" y2="81" />
            </svg>
        </div>
        <div className="text-left">
            <p className="text-5xl font-bold tracking-tight" style={{ fontFamily: '"Times New Roman", Times, serif' }}>Pawon Salam</p>
            <p className="text-base tracking-[0.3em] uppercase text-orange-600 opacity-90 font-medium mt-1">Resto & Catering</p>
        </div>
    </div>
);

const SlipRow: React.FC<{ label: string; value: string | number; valuePrefix?: string, isBold?: boolean, rightAlign?: boolean, disableMono?: boolean }> = ({ label, value, valuePrefix, isBold = false, rightAlign = true, disableMono = false }) => (
    <div className={`flex items-start ${isBold ? 'font-bold' : ''}`}>
        <div className="w-1/2 break-words pr-2">{label}</div>
        <div className="w-auto pr-4">:</div>
        <div className={`flex-1 ${rightAlign ? 'text-right' : 'text-left'} ${(!disableMono && rightAlign) ? 'font-mono tabular-nums' : ''} break-words`}>{valuePrefix}{value}</div>
    </div>
);

const SlipSeparator: React.FC<{ symbol: string }> = ({ symbol }) => (
    <div className="flex items-center">
        <div className="w-1/2"></div>
        <div className="w-auto pr-4 invisible">:</div>
        <div className="flex-1 flex items-center text-right">
            <div className="flex-grow border-b border-gray-800"></div>
            <span className="ml-2 w-4 font-bold text-lg">{symbol}</span>
        </div>
    </div>
);

const SlipSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <p className="font-bold tracking-wide">{title}</p>
        <div className="mt-2 space-y-1 text-sm">
            {children}
        </div>
    </div>
);


export const CreatePayslip: React.FC<CreatePayslipProps> = ({ onBack }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { employees, fetchEmployees } = useEmployeeStore();

    const [showSlip, setShowSlip] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Preload assets to prevent logo/image disappearing in PDF
    useEffect(() => {
        const images = printRef.current?.querySelectorAll('svg, img');
        if (images && images.length > 0) {
            Promise.all(
                Array.from(images).map((img) => {
                    if (img instanceof HTMLImageElement && !img.complete) {
                        return new Promise((resolve) => {
                            img.onload = resolve;
                            img.onerror = resolve;
                        });
                    }
                    return Promise.resolve();
                })
            ).then(() => setAssetsLoaded(true));
        } else {
            setAssetsLoaded(true);
        }
    }, [showSlip]);

    const [formData, setFormData] = useState<PayrollData>({
        month: 'NOVEMBER 2025',
        employeeName: 'Stepanus Herianto',
        nik: '3271030909790009',
        position: 'Manajer Marketing',
        basicSalary: 3000000,
        allowances: 0, // 'Paket' in the screenshot
        positionAllowance: 2750000,
        attendanceDays: 29,
        overtime: 1450000, // 'Lembur' in the screenshot
        tax: 0,
        otherDeductions: 0,
    });

    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const employee = employees.find(emp => emp.id === selectedId);

        if (employee) {
            setFormData(prev => ({
                ...prev,
                employeeName: employee.name,
                nik: employee.id, // Using ID as NIK placeholder
                position: employee.role.replace('_', ' '), // Simple formatting
            }));
        } else {
            // Reset if "Pilih Karyawan" is selected
            setFormData(prev => ({
                ...prev,
                employeeName: '',
                nik: '',
                position: '',
            }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const formatNumber = (amount: number): string => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const calculateGross = (): number => {
        return formData.basicSalary + formData.allowances + formData.positionAllowance + formData.overtime;
    };

    const calculateTotalDeductions = (): number => {
        return formData.tax + formData.otherDeductions;
    };

    const calculateNet = (): number => {
        return calculateGross() - calculateTotalDeductions();
    };

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const handlePrint = () => {
        // Backup current payslip data to prevent loss during print
        const currentState = JSON.stringify(formData);
        localStorage.setItem('payslip-print-backup', currentState);

        // Small delay to ensure localStorage sync
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        if (!element || !assetsLoaded) {
            alert('Please wait, assets are still loading...');
            return;
        }

        setIsGeneratingPDF(true);

        try {
            // High-resolution canvas for crisp text and logo
            const canvas = await html2canvas(element, {
                scale: 2, // 2x resolution for clarity
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Dynamic filename: [Employee Name]_[Period].pdf
            const sanitizedName = formData.employeeName.replace(/[^a-zA-Z0-9]/g, '-');
            const sanitizedPeriod = formData.month.replace(/[^a-zA-Z0-9]/g, '-');
            const filename = `Slip-Gaji_${sanitizedName}_${sanitizedPeriod}.pdf`;

            pdf.save(filename);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleGenerate = () => {
        setShowSlip(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 font-sans p-8 md:p-12 print:p-0 print:m-0 print:bg-white">
            {/* Form Section - Hidden when showing slip */}
            {!showSlip && (
                <div className="max-w-4xl mx-auto mb-8 print:hidden animate-slide-in-down">
                    {onBack && (
                        <button onClick={onBack} className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2">
                            &larr; Kembali
                        </button>
                    )}
                    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <Logo size="lg" variant="color" showText={false} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Slip Gaji</h1>
                                <p className="text-gray-600">Pawon Salam Resto & Catering</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                            <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2 mb-2">Data Karyawan</h3>
                            <PayrollInput label="Periode Gaji (Bulan & Tahun)" id="month" name="month" value={formData.month} onChange={handleInputChange} />

                            {/* Employee Dropdown */}
                            <div className="flex flex-col">
                                <label htmlFor="employeeSelect" className="mb-1 text-sm font-medium text-gray-700">Pilih Karyawan</label>
                                <select
                                    id="employeeSelect"
                                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors bg-white"
                                    onChange={handleEmployeeSelect}
                                    defaultValue=""
                                >
                                    <option value="" disabled>-- Pilih Karyawan --</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            <PayrollInput label="Nama Karyawan (Auto)" id="employeeName" name="employeeName" value={formData.employeeName} onChange={handleInputChange} />
                            <PayrollInput label="NIK (Auto)" id="nik" name="nik" value={formData.nik} onChange={handleInputChange} />
                            <PayrollInput label="Jabatan (Auto)" id="position" name="position" value={formData.position} onChange={handleInputChange} />
                            <PayrollInput label="Jumlah Hari Masuk" id="attendanceDays" name="attendanceDays" type="number" value={formData.attendanceDays} onChange={handleInputChange} inputMode="numeric" />

                            <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2 mb-2 mt-4">Penerimaan</h3>
                            <PayrollInput label="Upah Pokok" id="basicSalary" name="basicSalary" type="number" value={formData.basicSalary} onChange={handleInputChange} isCurrency inputMode="numeric" />
                            <PayrollInput label="Tunjangan Jabatan" id="positionAllowance" name="positionAllowance" type="number" value={formData.positionAllowance} onChange={handleInputChange} isCurrency inputMode="numeric" />
                            <PayrollInput label="Lembur" id="overtime" name="overtime" type="number" value={formData.overtime} onChange={handleInputChange} isCurrency inputMode="numeric" />
                            <PayrollInput label="Paket" id="allowances" name="allowances" type="number" value={formData.allowances} onChange={handleInputChange} isCurrency inputMode="numeric" />

                            <h3 className="md:col-span-2 text-lg font-semibold text-gray-800 border-b pb-2 mb-2 mt-4">Potongan</h3>
                            <PayrollInput label="Pajak" id="tax" name="tax" type="number" value={formData.tax} onChange={handleInputChange} isCurrency inputMode="numeric" />
                            <PayrollInput label="Lain-lain" id="otherDeductions" name="otherDeductions" type="number" value={formData.otherDeductions} onChange={handleInputChange} isCurrency inputMode="numeric" />
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleGenerate}
                                className="w-full bg-gradient-to-br from-orange-500/90 to-orange-600/90 backdrop-blur-lg text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] border border-white/20"
                            >
                                🎯 Generate Slip Gaji
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payslip View - Replaces form when shown */}
            {showSlip && (
                <div className="max-w-4xl mx-auto p-2 md:p-4 animate-slide-in-down">
                    {/* Back to Edit Button */}
                    <button
                        onClick={() => setShowSlip(false)}
                        className="mb-4 bg-white/80 backdrop-blur-lg text-gray-800 font-semibold py-2 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] border border-gray-200/50 flex items-center gap-2 print:hidden"
                    >
                        ← Kembali ke Edit
                    </button>

                    {/* Action Buttons */}
                    <div className="mb-4 flex flex-col sm:flex-row gap-3 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="hidden md:block flex-1 bg-white/80 backdrop-blur-lg text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] border border-gray-200/50"
                        >
                            🖨️ Print / Save (Desktop)
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF || !assetsLoaded}
                            className="flex-1 bg-gradient-to-br from-orange-500/90 to-orange-600/90 backdrop-blur-lg text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-white/20"
                        >
                            {isGeneratingPDF ? '⏳ Generating...' : '📥 Cetak / Simpan PDF'}
                        </button>
                    </div>

                    {/* Payslip Preview - Blank A4 Template */}
                    <div
                        ref={printRef}
                        className="bg-white rounded-xl shadow-2xl overflow-hidden relative font-serif text-gray-800 w-full max-w-4xl mx-auto aspect-[210/297] print:aspect-auto print:static print:w-[210mm] print:h-auto print:bg-white print:shadow-none print:rounded-none print:m-0 print:overflow-visible print:min-h-[297mm] flex flex-col"
                    >
                        {/* DECORATIVE MOTIFS - Professional & Elegant */}
                        <SlipMotifTopLeft />
                        <SlipMotifTopRight />
                        <SlipMotifBottomLeft />
                        <SlipMotifBottomRight />

                        {/* MEKARI STYLE LAYOUT - PAWON SALAM THEME */}
                        <div className="p-12 h-full flex flex-col relative z-10">
                            {/* 1. Header Section */}
                            <div className="flex justify-between items-end border-b-2 border-gray-800 pb-4 mb-6">
                                <div className="flex items-center gap-4">
                                    {/* Logo Placeholder / Actual Logo */}
                                    <div className="w-16 h-16 text-orange-600">
                                        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" className="w-full h-full">
                                            <circle cx="50" cy="50" r="44" />
                                            <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900 font-serif">Pawon Salam</h1>
                                        <p className="text-sm text-gray-500 uppercase tracking-widest">Resto & Catering</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-xl font-bold text-gray-400 uppercase tracking-wider">Slip Gaji</h2>
                                    <p className="text-gray-600 font-medium mt-1">{formData.month}</p>
                                </div>
                            </div>

                            {/* 2. Employee Info Section */}
                            <div className="grid grid-cols-2 gap-12 mb-8 text-sm text-gray-700">
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="w-32 font-semibold text-gray-500">Nama</span>
                                        <span className="font-bold text-gray-900">: {formData.employeeName}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-semibold text-gray-500">Jabatan</span>
                                        <span className="text-gray-900">: {formData.position}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-semibold text-gray-500">NIK</span>
                                        <span className="text-gray-900">: {formData.nik}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex">
                                        <span className="w-32 font-semibold text-gray-500">Departemen</span>
                                        <span className="text-gray-900">: Operasional</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-semibold text-gray-500">Status</span>
                                        <span className="text-gray-900">: Karyawan Tetap</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-semibold text-gray-500">Kehadiran</span>
                                        <span className="text-gray-900">: {formData.attendanceDays} Hari</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Earnings & Deductions Columns */}
                            <div className="grid grid-cols-2 gap-8 mb-8">
                                {/* Earnings Column */}
                                <div>
                                    <div className="bg-orange-600 text-white font-bold px-3 py-2 text-sm uppercase tracking-wider mb-2 rounded-sm">
                                        PENERIMAAN (EARNINGS)
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span className="text-gray-600">Gaji Pokok</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(formData.basicSalary)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span className="text-gray-600">Tunjangan Jabatan</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(formData.positionAllowance)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span className="text-gray-600">Lembur</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(formData.overtime)}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span className="text-gray-600">Tunjangan Lain (Paket)</span>
                                            <span className="font-medium text-gray-900">{formatCurrency(formData.allowances)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-gray-100 px-3 py-2 flex justify-between items-center rounded-sm">
                                        <span className="font-bold text-gray-600 text-sm">TOTAL PENERIMAAN</span>
                                        <span className="font-bold text-gray-900">{formatCurrency(totalEarnings)}</span>
                                    </div>
                                </div>

                                {/* Deductions Column */}
                                <div>
                                    <div className="bg-orange-700 text-white font-bold px-3 py-2 text-sm uppercase tracking-wider mb-2 rounded-sm">
                                        POTONGAN (DEDUCTIONS)
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span className="text-gray-600">Pajak (PPh 21)</span>
                                            <span className="font-medium text-gray-900 text-red-600">({formatCurrency(formData.tax)})</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-100 pb-1">
                                            <span className="text-gray-600">Potongan Lain</span>
                                            <span className="font-medium text-gray-900 text-red-600">({formatCurrency(formData.otherDeductions)})</span>
                                        </div>
                                        {/* Spacer for alignment if needed */}
                                        <div className="h-6"></div>
                                        <div className="h-6"></div>
                                    </div>
                                    <div className="mt-4 bg-gray-100 px-3 py-2 flex justify-between items-center rounded-sm">
                                        <span className="font-bold text-gray-600 text-sm">TOTAL POTONGAN</span>
                                        <span className="font-bold text-red-600">({formatCurrency(totalDeductions)})</span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Net Pay Section */}
                            <div className="flex mb-12">
                                <div className="bg-orange-600 text-white font-bold px-6 py-3 text-sm uppercase tracking-wider w-1/3 flex items-center rounded-l-md">
                                    TAKE HOME PAY
                                </div>
                                <div className="bg-orange-50 border-2 border-orange-600 text-orange-700 font-bold px-6 py-3 text-xl w-2/3 text-right rounded-r-md flex items-center justify-end">
                                    {formatCurrency(netSalary)}
                                </div>
                            </div>

                            {/* 5. Footer Section */}
                            <div className="mt-auto grid grid-cols-2 gap-12">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ditransfer Ke:</p>
                                    <p className="text-sm font-semibold text-gray-800">BCA (Bank Central Asia)</p>
                                    <p className="text-sm text-gray-600">No. Rek: 001 1234567</p>
                                    <p className="text-sm text-gray-600">a.n. {formData.employeeName}</p>
                                </div>
                                <div className="flex justify-between text-center">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-16">Disetujui Oleh:</p>
                                        <p className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-1">Manager HRD</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-16">Diterima Oleh:</p>
                                        <p className="text-sm font-bold text-gray-900 border-b border-gray-300 pb-1">{formData.employeeName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
