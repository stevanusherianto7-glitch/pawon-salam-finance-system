import React from 'react';
import { Logo } from './Logo';

interface FinancialItem {
    id: number | string;
    label: string;
    amount: number;
}

interface PayslipData {
    employee: {
        name: string;
        role: string;
        department: string;
        nik: string;
        status: string;
        grade: string;
        period: string;
    };
    earnings: FinancialItem[];
    deductions: FinancialItem[];
    totalEarnings: number;
    totalDeductions: number;
    takeHomePay: number;
}

export const PayslipTemplate = React.forwardRef<HTMLDivElement, PayslipData>(({
    employee,
    earnings,
    deductions,
    totalEarnings,
    totalDeductions,
    takeHomePay
}, ref) => {

    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div
            ref={ref}
            className="bg-white shadow-none relative overflow-hidden text-gray-900"
            style={{ width: '297mm', minHeight: '210mm', padding: '40mm 30mm 30mm 30mm' }}
        >

            {/* DECORATIVE MOTIF (Organic Watermark) */}
            <div className="absolute top-0 right-0 pointer-events-none z-0">
                <svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
                    <path d="M400 0H200C200 0 240 80 300 120C360 160 400 250 400 250V0Z" fill="#ff6b35" fillOpacity="0.15" />
                    <path d="M400 0H300C300 0 320 40 360 60C400 80 400 120 400 120V0Z" fill="#ff6b35" fillOpacity="0.1" />
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
                    <circle cx="50" cy="50" r="44" />
                    <path d="M28 72 Q 28 28 72 28 Q 72 72 28 72 Z" />
                    <line x1="28" y1="72" x2="72" y2="28" />
                    <line x1="28" y1="72" x2="19" y2="81" />
                </svg>
            </div>

            {/* BOTTOM-LEFT CULINARY PATTERN */}
            <div className="absolute bottom-0 left-0 pointer-events-none z-0">
                <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-200">
                    <path d="M20 140 Q20 120 35 110 Q50 100 50 80 L50 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
                    <ellipse cx="50" cy="25" rx="8" ry="12" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
                    <path d="M90 30 L90 110 Q90 125 100 135" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4" />
                    <line x1="82" y1="30" x2="82" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <line x1="90" y1="30" x2="90" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <line x1="98" y1="30" x2="98" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    <path d="M130 100 Q140 80 150 100 Q140 120 130 100 Z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" />
                    <line x1="140" y1="80" x2="140" y2="120" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                    <circle cx="60" cy="150" r="2" fill="currentColor" opacity="0.2" />
                    <circle cx="75" cy="155" r="1.5" fill="currentColor" opacity="0.2" />
                    <circle cx="120" cy="145" r="2" fill="currentColor" opacity="0.2" />
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
                </div>
                <div className="text-right self-start mt-2">
                    <h2 className="text-3xl font-black text-[#ff6b35] uppercase tracking-wider mb-1 antialiased subpixel-antialiased" style={{ fontFamily: '"Times New Roman", Times, serif' }}>SLIP GAJI</h2>
                    <p className="text-sm text-gray-600 antialiased">Periode: <span className="font-bold text-gray-900">{employee.period}</span></p>
                    <p className="text-xs text-gray-400 mt-1">No: PS/{new Date().getFullYear()}/12/001</p>
                </div>
            </div>

            {/* EMPLOYEE INFO GRID */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm w-full">
                <div className="space-y-2">
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500">Nama</span>
                        <span className="font-bold text-right text-gray-900 w-1/2">{employee.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500">Jabatan</span>
                        <span className="font-medium text-right text-gray-900 w-1/2">{employee.role}</span>
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
            </div>

            {/* FINANCIAL SPLIT */}
            <div className="grid grid-cols-2 gap-8 mb-8 w-full">
                {/* EARNINGS COLUMN */}
                <div>
                    <div className="bg-[#ff6b35] text-white px-3 py-4 text-sm font-bold uppercase tracking-widest rounded-t mb-2 shadow-sm antialiased flex-shrink-0 whitespace-nowrap leading-relaxed">
                        Penerimaan
                    </div>
                    <div className="space-y-2 min-h-[150px]">
                        {earnings.map((item) => (
                            <div key={item.id} className="flex items-start justify-between group text-sm py-1 border-b border-gray-100 border-dashed">
                                <span className="w-full text-gray-800">{item.label}</span>
                                <span className="text-right font-mono text-gray-700 w-32">{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded mt-4 border border-gray-200">
                        <span className="font-bold text-gray-600 text-sm">Total Penerimaan</span>
                        <span className="font-bold text-gray-900 antialiased">{formatRupiah(totalEarnings)}</span>
                    </div>
                </div>

                {/* DEDUCTIONS COLUMN */}
                <div>
                    <div className="bg-[#d64518] text-white px-3 py-4 text-sm font-bold uppercase tracking-widest rounded-t mb-2 shadow-sm antialiased flex-shrink-0 whitespace-nowrap leading-relaxed">
                        Potongan
                    </div>
                    <div className="space-y-2 min-h-[150px]">
                        {deductions.map((item) => (
                            <div key={item.id} className="flex items-start justify-between group text-sm py-1 border-b border-gray-100 border-dashed">
                                <span className="w-full text-gray-800">{item.label}</span>
                                <span className="text-right font-mono text-gray-700 w-32">{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded mt-4 border border-gray-200">
                        <span className="font-bold text-gray-600 text-sm">Total Potongan</span>
                        <span className="font-bold text-gray-900 antialiased">{formatRupiah(totalDeductions)}</span>
                    </div>
                </div>
            </div>

            {/* TAKE HOME PAY */}
            <div className="flex items-center mb-8 w-full shadow-sm rounded overflow-hidden">
                <div className="bg-[#ff6b35] text-white font-bold px-6 py-4 text-sm tracking-widest uppercase w-1/3 flex items-center antialiased flex-shrink-0 whitespace-nowrap leading-relaxed">
                    TAKE HOME PAY
                </div>
                <div className="bg-orange-50 flex-1 py-4 px-6 text-right border border-[#ff6b35]">
                    <span className="text-xl font-black text-[#ff6b35] antialiased subpixel-antialiased">{formatRupiah(takeHomePay)}</span>
                </div>
            </div>

            {/* FOOTER INFO & SIGNATURE */}
            <div className="flex flex-row justify-between items-end mt-auto w-full gap-4">
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
            </div>

            {/* FOOTER COPYRIGHT */}
            <div className="absolute bottom-4 left-0 w-full text-center">
                <p className="text-[10px] text-gray-400 antialiased">Dicetak secara otomatis oleh sistem Pawon Salam Payroll</p>
            </div>
        </div>
    );
});

PayslipTemplate.displayName = 'PayslipTemplate';
