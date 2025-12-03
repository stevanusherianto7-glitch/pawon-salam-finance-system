import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

// --- INTERFACES ---

interface Props {
    onBack?: () => void;
}

interface PayrollData {
    month: string;
    employeeName: string;
    nik: string;
    position: string;
    basicSalary: number;
    allowances: number;
    positionAllowance: number;
    attendanceDays: number;
    overtime: number;
    tax: number;
    otherDeductions: number;
}

// --- VISUAL COMPONENTS (Copied from CreatePayslip) ---

const SlipMotifTopRight = () => (
    <div className="absolute top-0 right-0 z-0 pointer-events-none">
        <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 right-0 w-[60%] md:w-auto h-auto print:w-[15cm]">
            <path d="M400 0L400 220C320 200 200 180 120 0H400Z" fill="#FB923C" fillOpacity="0.5" />
            <circle cx="360" cy="60" r="25" fill="#EA580C" fillOpacity="0.6" />
            <circle cx="310" cy="40" r="15" fill="#F97316" fillOpacity="0.8" />
            <circle cx="260" cy="30" r="10" fill="#FB923C" fillOpacity="0.9" />
            <circle cx="320" cy="100" r="18" fill="#FDBA74" fillOpacity="0.7" />
            <circle cx="280" cy="140" r="8" fill="#EA580C" fillOpacity="0.5" />
            <circle cx="380" cy="130" r="12" fill="#C2410C" fillOpacity="0.6" />
            <circle cx="350" cy="160" r="6" fill="#FDBA74" fillOpacity="0.8" />
        </svg>
    </div>
);

const SlipMotifTopLeft = () => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute top-0 left-0 z-0 pointer-events-none w-[30%] md:w-auto h-auto print:w-[8cm]">
        <circle cx="30" cy="50" r="18" fill="#F97316" fillOpacity="0.8" />
        <circle cx="65" cy="25" r="10" fill="#FB923C" fillOpacity="0.8" />
        <circle cx="20" cy="90" r="8" fill="#FDBA74" fillOpacity="0.9" />
        <circle cx="60" cy="70" r="5" fill="#EA580C" fillOpacity="0.6" />
        <circle cx="85" cy="45" r="4" fill="#C2410C" fillOpacity="0.5" />
    </svg>
);

const SlipMotifBottomLeft = () => (
    <svg width="200" height="150" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 left-0 z-0 pointer-events-none w-[30%] md:w-auto h-auto print:w-[8cm]">
        <path d="M0 150C20 100 80 80 120 150H0Z" fill="#FDBA74" fillOpacity="0.8" />
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

// --- HELPER COMPONENTS ---

const SlipRow: React.FC<{ label: string; value: string | number; valuePrefix?: string, isBold?: boolean, rightAlign?: boolean, disableMono?: boolean }> = ({ label, value, valuePrefix, isBold = false, rightAlign = true, disableMono = false }) => (
    <div className={`flex items-start ${isBold ? 'font-bold' : ''}`}>
        <div className="w-1/2">{label}</div>
        <div className="w-auto pr-4">:</div>
        <div className={`flex-1 ${rightAlign ? 'text-right' : 'text-left'} ${(!disableMono && rightAlign) ? 'font-mono tabular-nums' : ''}`}>{valuePrefix}{value}</div>
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

const PayrollInput: React.FC<{
    label: string;
    id: string;
    name: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: 'text' | 'number';
    placeholder?: string;
    isCurrency?: boolean;
}> = ({ label, id, name, value, onChange, type = 'text', placeholder = '', isCurrency = false }) => (
    <div className="flex flex-col">
        <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-700">
            {label}
        </label>
        <div className="relative">
            {isCurrency && (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
                    Rp
                </span>
            )}
            <input
                id={id}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                inputMode={type === 'number' ? 'numeric' : 'text'}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${isCurrency ? 'pl-9' : ''}`}
            />
        </div>
    </div>
);

// --- MAIN COMPONENT ---

export const PayslipGeneratorScreen: React.FC<Props> = ({ onBack }) => {
    const printRef = useRef<HTMLDivElement>(null);

    // State for the date picker
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const [formData, setFormData] = useState<PayrollData>({
        month: 'NOVEMBER 2025', // Initial default
        employeeName: '',
        nik: '',
        position: '',
        basicSalary: 0,
        allowances: 0,
        positionAllowance: 0,
        attendanceDays: 0,
        overtime: 0,
        tax: 0,
        otherDeductions: 0,
    });

    const [showSlip, setShowSlip] = useState(false);

    // Update formData.month when selectedDate changes
    useEffect(() => {
        const formattedMonth = selectedDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
        setFormData(prev => ({ ...prev, month: formattedMonth }));
    }, [selectedDate]);

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

    const handlePrint = () => {
        window.print();
    };

    const handleGenerate = () => {
        setShowSlip(true);
    };

    return (
        <div className="min-h-screen bg-orange-50 font-sans print:p-0 print:m-0 print:bg-white">
            {!showSlip ? (
                // FORM VIEW - 3 Part Layout
                <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-2xl md:max-w-4xl md:h-auto md:min-h-screen md:my-8 md:rounded-2xl overflow-hidden">

                    {/* 1. STATIC HEADER */}
                    <div className="flex-none p-6 border-b border-gray-100 bg-white z-10 relative">
                        <div className="flex items-center gap-2 mb-4">
                            <button onClick={onBack} className="text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1 text-sm font-medium">
                                <ArrowLeft size={16} /> Kembali
                            </button>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 text-orange-600 flex-shrink-0">
                                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                                    <circle cx="50" cy="50" r="44" />
                                    <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
                                    <line x1="28" y1="72" x2="72" y2="28" />
                                    <line x1="28" y1="72" x2="19" y2="81" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Slip Gaji</h1>
                                <div className="text-gray-600">
                                    <p className="font-bold text-lg text-gray-800">Pawon Salam</p>
                                    <p className="text-sm text-gray-500">Resto & Catering</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. SCROLLABLE CONTENT */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Data Karyawan</h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col">
                                        <label className="mb-1 text-sm font-medium text-gray-700">Periode Gaji (Bulan & Tahun)</label>
                                        <GlassDatePicker
                                            selectedDate={selectedDate}
                                            onChange={setSelectedDate}
                                            mode="month-year"
                                            theme="light"
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <PayrollInput label="Nama Karyawan" id="employeeName" name="employeeName" value={formData.employeeName} onChange={handleInputChange} />
                                        <PayrollInput label="NIK (Auto)" id="nik" name="nik" value={formData.nik} onChange={handleInputChange} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <PayrollInput label="Jabatan (Auto)" id="position" name="position" value={formData.position} onChange={handleInputChange} />
                                        <PayrollInput label="Jumlah Hari Masuk" id="attendanceDays" name="attendanceDays" type="number" value={formData.attendanceDays} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-t pt-4">Penerimaan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <PayrollInput label="Upah Pokok" id="basicSalary" name="basicSalary" type="number" value={formData.basicSalary} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Tunjangan Jabatan" id="positionAllowance" name="positionAllowance" type="number" value={formData.positionAllowance} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Lembur" id="overtime" name="overtime" type="number" value={formData.overtime} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Paket" id="allowances" name="allowances" type="number" value={formData.allowances} onChange={handleInputChange} isCurrency />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-t pt-4">Potongan</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <PayrollInput label="Pajak" id="tax" name="tax" type="number" value={formData.tax} onChange={handleInputChange} isCurrency />
                                    <PayrollInput label="Lain-lain" id="otherDeductions" name="otherDeductions" type="number" value={formData.otherDeductions} onChange={handleInputChange} isCurrency />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. STATIC FOOTER */}
                    <div className="flex-none p-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                        <button
                            onClick={handleGenerate}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all transform active:scale-95 shadow-lg shadow-orange-500/30 focus:outline-none focus:ring-4 focus:ring-orange-300 flex items-center justify-center gap-2"
                        >
                            🎯 Generate Slip Gaji
                        </button>
                    </div>
                </div>
            ) : (
                // PREVIEW VIEW
                <div className="max-w-4xl mx-auto p-4 md:p-8 animate-slide-in-down">
                    <div className="mb-6 flex justify-between items-center print:hidden">
                        <button
                            onClick={() => setShowSlip(false)}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Kembali ke Edit
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={handlePrint}
                                className="bg-gray-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-xl transition-transform transform hover:scale-105 duration-300 shadow-lg flex items-center gap-2"
                            >
                                🖨️ Cetak / Simpan PDF
                            </button>
                        </div>
                    </div>

                    <div
                        ref={printRef}
                        className="bg-white rounded-xl shadow-2xl overflow-hidden relative font-serif text-gray-800 print:static print:w-full print:h-auto print:bg-white print:shadow-none print:rounded-none print:m-0 print:overflow-visible w-[210mm] min-h-[297mm] mx-auto"
                    >
                        <SlipMotifTopLeft />
                        <SlipMotifTopRight />
                        <SlipMotifBottomLeft />
                        <SlipMotifBottomRight />

                        {/* Header Area */}
                        <div className="relative z-20 print:static print:p-8 p-8">
                            <header className="text-center">
                                <div className="flex justify-start print:ml-4">
                                    <SlipLogo />
                                </div>
                                <h1 className="text-xl font-bold tracking-wider mt-12 mb-8">PERINCIAN GAJI KARYAWAN</h1>
                            </header>
                        </div>

                        {/* Content Area */}
                        <div className="px-16 pt-12 pb-32 md:px-32 md:pt-20 md:pb-44 print:static print:px-16 print:pt-4 print:pb-16 relative z-10 flex flex-col justify-between h-full">
                            <section className="text-sm mb-8 space-y-1">
                                <SlipRow label="Gaji Bulan" value={formData.month} disableMono={true} />
                                <SlipRow label="Nama" value={formData.employeeName} disableMono={true} />
                                <SlipRow label="NIK" value={formData.nik} disableMono={true} />
                                <SlipRow label="Jabatan" value={formData.position} disableMono={true} />
                            </section>

                            <SlipSection title="PENERIMAAN - PENERIMAAN">
                                <SlipRow label="Upah Pokok" value={formatNumber(formData.basicSalary)} />
                                <SlipRow label="Paket" value={formData.allowances > 0 ? formatNumber(formData.allowances) : '-'} />
                                <SlipRow label="T. Jabatan" value={formatNumber(formData.positionAllowance)} />
                                <div className="flex items-start text-sm">
                                    <div className="w-1/2 flex justify-between pr-10">
                                        <span>T. Kehadiran</span>
                                        <span>{formData.attendanceDays}</span>
                                    </div>
                                    <div className="w-auto pr-4">:</div>
                                    <div className="flex-1 text-right font-mono tabular-nums">{formData.attendanceDays > 0 ? formatNumber(1450000) : '-'}</div>
                                </div>
                                <SlipRow label="Lembur" value={formatNumber(formData.overtime)} />
                                <SlipSeparator symbol="+" />
                                <SlipRow label="BRUTO" value={formatNumber(calculateGross())} isBold={true} />
                            </SlipSection>

                            <SlipSection title="POTONGAN - POTONGAN">
                                <SlipRow label="Pajak" value={formatNumber(formData.tax)} />
                                <SlipRow label="Lain-lain" value={formatNumber(formData.otherDeductions)} />
                                <SlipSeparator symbol="-" />
                                <SlipRow label="TOTAL POTONGAN" value={formatNumber(calculateTotalDeductions())} isBold={true} />
                            </SlipSection>

                            <section className="mt-8">
                                <SlipRow label="PENERIMAAN GAJI BERSIH" value={formatNumber(calculateNet())} isBold={true} />
                            </section>

                            <div className="mt-auto mb-16 text-center print:mb-0 print:mt-auto">
                                <p className="italic text-gray-600 font-medium text-sm">"Terima kasih atas kinerjanya, Tuhan memberkati"</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
