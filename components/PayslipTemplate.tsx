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
            style={{
                width: '297mm',
                minHeight: '210mm',
                padding: '40mm 30mm 30mm 30mm',
                fontFamily: '"Times New Roman", Times, serif'
            }}
        >

            {/* LEFT BORDER STRIP - Official Look */}
            <div className="absolute top-0 left-0 bottom-0 bg-[#ff6b35] z-20 print:block" style={{ width: '3mm' }}></div>

            {/* TOP-RIGHT: "The Spice Wave" - Pure SVG */}
            <div className="absolute top-0 right-0 pointer-events-none z-0">
                <svg width="350" height="350" viewBox="0 0 350 350" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="spiceGradient" x1="0" y1="0" x2="350" y2="350" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#ff6b35" />
                            <stop offset="1" stopColor="#e65100" />
                        </linearGradient>
                    </defs>
                    {/* Darker Depth Layer */}
                    <path d="M350 0 V250 C300 220, 200 150, 150 0 Z" fill="#e65100" />
                    {/* Main Wave Layer */}
                    <path d="M350 0 V200 C280 180, 150 100, 100 0 Z" fill="url(#spiceGradient)" fillOpacity="1" />
                    {/* Leaf Cutout Accent */}
                    <path d="M250 50 Q290 50 310 90 Q290 110 250 110 Q230 90 250 50 Z" fill="#ffffff" fillOpacity="0.15" />
                </svg>
            </div>

            {/* BOTTOM-LEFT: "The Foundation" - Pure SVG */}
            <div className="absolute bottom-0 left-0 pointer-events-none z-0" style={{ marginLeft: '3mm' }}>
                <svg width="250" height="250" viewBox="0 0 250 250" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Geometric Accents */}
                    <path d="M0 250 L0 120 L130 250 Z" fill="#ff8a65" fillOpacity="0.8" />
                    <path d="M0 250 L0 180 L70 250 Z" fill="#ff6b35" />
                </svg>
            </div>

            {/* HEADER */}
            <div className="flex justify-between items-center pb-6 mb-10 w-full relative z-10" style={{ borderBottom: '4pt solid #ff6b35' }}>

                <div className="flex flex-row items-center" style={{ gap: '6mm' }}>
                    <div className="flex-shrink-0 aspect-square">
                        <Logo size="xl" variant="color" showText={false} />
                    </div>
                    <div className="flex-1" style={{ maxWidth: '105mm' }}>
                        <h1 className="font-bold text-gray-900 tracking-tight antialiased subpixel-antialiased mb-1" style={{ fontSize: '24pt', fontFamily: '"Times New Roman", Times, serif' }}>
                            Pawon Salam
                        </h1>
                        <p className="font-bold text-gray-500 tracking-widest uppercase mb-2" style={{ fontSize: '9pt' }}>Resto & Catering</p>
                        <div className="text-gray-900 leading-relaxed antialiased subpixel-antialiased" style={{ fontSize: '9pt' }}>
                            <p>Beryl Commercial, Summarecon</p>
                            <p>Jl. Bulevar Selatan No.78, Cisaranten Kidul</p>
                            <p>Kec. Gedebage, Kota Bandung</p>
                            <p>Jawa Barat 40295</p>
                        </div>
                    </div>
                </div>
                <div className="text-right self-start" style={{ marginTop: '2mm' }}>
                    <h2 className="font-black text-[#ff6b35] uppercase tracking-wider mb-1 antialiased subpixel-antialiased" style={{ fontSize: '24pt', fontFamily: '"Times New Roman", Times, serif' }}>SLIP GAJI</h2>
                    <p className="text-gray-600 antialiased" style={{ fontSize: '11pt' }}>Periode: <span className="font-bold text-gray-900">{employee.period}</span></p>
                    <p className="text-gray-400 mt-1" style={{ fontSize: '9pt' }}>No: PS/{new Date().getFullYear()}/12/001</p>
                </div>
            </div>

            {/* EMPLOYEE INFO GRID - CSS Grid for precision */}
            <div className="grid grid-cols-2 gap-y-4 mb-8 w-full" style={{ gap: '12mm', fontSize: '11pt' }}>
                <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_auto] gap-4 pb-1" style={{ borderBottom: '0.5pt solid #e5e7eb' }}>
                        <span className="text-gray-500">Nama</span>
                        <span className="font-bold text-right text-gray-900 tabular-nums">{employee.name}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-4 pb-1" style={{ borderBottom: '0.5pt solid #e5e7eb' }}>
                        <span className="text-gray-500">Jabatan</span>
                        <span className="font-medium text-right text-gray-900">{employee.role}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-4 pb-1" style={{ borderBottom: '0.5pt solid #e5e7eb' }}>
                        <span className="text-gray-500">Departemen</span>
                        <span className="font-medium text-gray-900 antialiased">{employee.department}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="grid grid-cols-[1fr_auto] gap-4 pb-1" style={{ borderBottom: '0.5pt solid #e5e7eb' }}>
                        <span className="text-gray-500">NIK / ID</span>
                        <span className="font-medium text-gray-900 antialiased">{employee.nik}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-4 pb-1" style={{ borderBottom: '0.5pt solid #e5e7eb' }}>
                        <span className="text-gray-500">Status</span>
                        <span className="font-medium text-gray-900 antialiased">{employee.status}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-4 pb-1" style={{ borderBottom: '0.5pt solid #e5e7eb' }}>
                        <span className="text-gray-500">Grade / Gol</span>
                        <span className="font-medium text-gray-900 antialiased">{employee.grade}</span>
                    </div>
                </div>
            </div>

            {/* FINANCIAL SPLIT */}
            <div className="grid grid-cols-2 mb-8 w-full" style={{ gap: '8mm' }}>
                {/* EARNINGS COLUMN */}
                <div>
                    <div className="bg-[#ff6b35] text-white px-3 py-4 font-bold uppercase tracking-widest rounded-t mb-2 shadow-sm antialiased flex-shrink-0 whitespace-nowrap leading-relaxed" style={{ fontSize: '11pt' }}>
                        Penerimaan
                    </div>
                    <div className="space-y-2" style={{ minHeight: '150px' }}>
                        {earnings.map((item) => (
                            <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 group py-1 border-b border-gray-100 border-dashed" style={{ fontSize: '11pt' }}>
                                <span className="truncate text-gray-800">{item.label}</span>
                                <span className="text-right font-mono text-gray-700 tabular-nums" style={{ width: '32mm' }}>{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded mt-4 border border-gray-200">
                        <span className="font-bold text-gray-600" style={{ fontSize: '11pt' }}>Total Penerimaan</span>
                        <span className="font-bold text-gray-900 antialiased tabular-nums" style={{ fontSize: '12pt' }}>{formatRupiah(totalEarnings)}</span>
                    </div>
                </div>

                {/* DEDUCTIONS COLUMN */}
                <div>
                    <div className="bg-[#d64518] text-white px-3 py-4 font-bold uppercase tracking-widest rounded-t mb-2 shadow-sm antialiased flex-shrink-0 whitespace-nowrap leading-relaxed" style={{ fontSize: '11pt' }}>
                        Potongan
                    </div>
                    <div className="space-y-2" style={{ minHeight: '150px' }}>
                        {deductions.map((item) => (
                            <div key={item.id} className="grid grid-cols-[1fr_auto] gap-4 group py-1 border-b border-gray-100 border-dashed" style={{ fontSize: '11pt' }}>
                                <span className="truncate text-gray-800">{item.label}</span>
                                <span className="text-right font-mono text-gray-700 tabular-nums" style={{ width: '32mm' }}>{formatRupiah(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 rounded mt-4 border border-gray-200">
                        <span className="font-bold text-gray-600" style={{ fontSize: '11pt' }}>Total Potongan</span>
                        <span className="font-bold text-gray-900 antialiased tabular-nums" style={{ fontSize: '12pt' }}>{formatRupiah(totalDeductions)}</span>
                    </div>
                </div>
            </div>

            {/* TAKE HOME PAY */}
            <div className="flex items-center mb-8 w-full shadow-sm rounded overflow-hidden">
                <div className="bg-[#ff6b35] text-white font-bold px-6 py-4 tracking-widest uppercase flex items-center antialiased flex-shrink-0 whitespace-nowrap leading-relaxed" style={{ fontSize: '11pt', width: '33%' }}>
                    TAKE HOME PAY
                </div>
                <div className="bg-orange-50 flex-1 py-4 px-6 text-right border border-[#ff6b35]">
                    <span className="font-black text-[#ff6b35] antialiased subpixel-antialiased tabular-nums" style={{ fontSize: '18pt' }}>{formatRupiah(takeHomePay)}</span>
                </div>
            </div>

            {/* FOOTER INFO & SIGNATURE */}
            <div className="flex flex-row justify-between items-end mt-auto w-full" style={{ gap: '4mm' }}>
                <div className="flex-1 basis-0 text-gray-600" style={{ fontSize: '11pt' }}>
                    <p className="font-bold text-gray-800 mb-2 uppercase tracking-wide antialiased" style={{ fontSize: '9pt' }}>Ditransfer Ke:</p>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="font-bold text-gray-900 antialiased">BCA (Bank Central Asia)</p>
                        <p className="font-mono text-gray-800 my-1 antialiased tabular-nums">123-456-7890</p>
                        <p className="uppercase text-gray-700 antialiased" style={{ fontSize: '9pt' }}>a.n. {employee.name}</p>
                    </div>
                </div>

                <div className="flex-1 basis-0 text-center" style={{ fontSize: '9pt' }}>
                    <div className="mb-4 flex flex-col items-center">
                        <p className="font-semibold text-gray-500 mb-2">Disetujui Oleh,</p>
                        <div style={{ height: '32mm', width: '100%' }}></div> {/* Space for signature */}
                        <p className="font-bold text-gray-900 border-t border-gray-300 pt-2 px-4 inline-block antialiased subpixel-antialiased" style={{ minWidth: '40mm', fontSize: '10pt' }}>HRD Manager</p>
                    </div>
                </div>

                <div className="flex-1 basis-0 text-center" style={{ fontSize: '9pt' }}>
                    <div className="mb-4 flex flex-col items-center">
                        <p className="font-semibold text-gray-500 mb-2">Diterima Oleh,</p>
                        <div style={{ height: '32mm', width: '100%' }}></div> {/* Space for signature */}
                        <p className="font-bold text-gray-900 border-t border-gray-300 pt-2 px-4 inline-block antialiased subpixel-antialiased" style={{ minWidth: '40mm', fontSize: '10pt' }}>{employee.name}</p>
                    </div>
                </div>
            </div>

            {/* FOOTER COPYRIGHT */}
            <div className="absolute bottom-4 left-0 w-full text-center">
                <p className="text-gray-400 antialiased" style={{ fontSize: '8pt' }}>Dicetak secara otomatis oleh sistem Pawon Salam Payroll</p>
            </div>
        </div>
    );
});

PayslipTemplate.displayName = 'PayslipTemplate';
