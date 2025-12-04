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

            {/* LEFT BORDER STRIP - Official Look */}
            <div className="absolute top-0 left-0 bottom-0 w-3 bg-[#ff6b35] z-20 print:block"></div>

            {/* TOP-RIGHT: "The Spice Wave" */}
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
