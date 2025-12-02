import React, { forwardRef } from 'react';
import { Logo } from '../Logo';

export interface PayslipData {
    employeeName: string;
    employeeId: string;
    role: string;
    period: string;
    salary: number;
    allowance: number;
    deduction: number;
    netSalary: number;
    paymentDate: string;
}

interface PayslipTemplateProps {
    data: PayslipData;
}

export const PayslipTemplate = forwardRef<HTMLDivElement, PayslipTemplateProps>(({ data }, ref) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div
            ref={ref}
            className="bg-white relative overflow-hidden text-gray-900 font-serif"
            style={{
                width: '794px', // A4 Width at 96 DPI
                minHeight: '1123px', // A4 Height at 96 DPI
                padding: '40px',
            }}
        >
            {/* --- WATERMARK & SECURITY PATTERN --- */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Diagonal Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
                        backgroundSize: '10px 10px'
                    }}
                />

                {/* Giant Logo Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
                    <Logo size="2xl" variant="dark" showText={false} className="scale-[3]" />
                </div>

                {/* "DOKUMEN RESMI" Repeated Text */}
                <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-20 opacity-[0.02] -rotate-12 scale-150">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <span key={i} className="text-4xl font-black uppercase">DOKUMEN RESMI</span>
                    ))}
                </div>
            </div>

            {/* --- CONTENT LAYER --- */}
            <div className="relative z-10 border-4 border-double border-gray-800 h-full p-8 flex flex-col justify-between">

                {/* HEADER */}
                <header className="border-b-2 border-gray-800 pb-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Logo size="lg" variant="color" showText={false} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-wide" style={{ fontFamily: '"Times New Roman", serif' }}>
                                    PAWON SALAM
                                </h1>
                                <p className="text-sm text-gray-600 tracking-widest uppercase font-semibold mt-1">Resto & Catering</p>
                                <p className="text-xs text-gray-500 mt-1">Jl. Raya Example No. 123, Kota Sejahtera</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800 uppercase border-2 border-gray-800 px-4 py-1 inline-block">
                                SLIP GAJI
                            </h2>
                            <p className="text-sm text-gray-600 mt-2 font-medium">Periode: {data.period}</p>
                            <p className="text-xs text-gray-500">ID: {data.employeeId}</p>
                        </div>
                    </div>
                </header>

                {/* EMPLOYEE INFO */}
                <section className="mb-8">
                    <table className="w-full text-sm">
                        <tbody>
                            <tr>
                                <td className="w-32 font-bold text-gray-600 py-1">Nama Karyawan</td>
                                <td className="w-4 text-gray-600">:</td>
                                <td className="font-bold text-lg text-gray-900">{data.employeeName}</td>
                            </tr>
                            <tr>
                                <td className="font-bold text-gray-600 py-1">Jabatan</td>
                                <td className="text-gray-600">:</td>
                                <td className="text-gray-800">{data.role}</td>
                            </tr>
                            <tr>
                                <td className="font-bold text-gray-600 py-1">Tanggal Cetak</td>
                                <td className="text-gray-600">:</td>
                                <td className="text-gray-800">{data.paymentDate}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                {/* SALARY DETAILS */}
                <section className="flex-grow">
                    <div className="border border-gray-300 rounded-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-300">
                                <tr>
                                    <th className="py-3 px-4 text-left font-bold text-gray-700 uppercase text-xs tracking-wider">Keterangan</th>
                                    <th className="py-3 px-4 text-right font-bold text-gray-700 uppercase text-xs tracking-wider">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {/* Income */}
                                <tr className="bg-green-50/30">
                                    <td className="py-3 px-4 text-gray-800 font-medium">Gaji Pokok</td>
                                    <td className="py-3 px-4 text-right text-gray-900 font-mono">{formatCurrency(data.salary)}</td>
                                </tr>
                                <tr className="bg-green-50/30">
                                    <td className="py-3 px-4 text-gray-800 font-medium">Tunjangan & Bonus</td>
                                    <td className="py-3 px-4 text-right text-gray-900 font-mono">{formatCurrency(data.allowance)}</td>
                                </tr>

                                {/* Deduction */}
                                <tr className="bg-red-50/30">
                                    <td className="py-3 px-4 text-gray-800 font-medium">Potongan (Kasbon/Absen)</td>
                                    <td className="py-3 px-4 text-right text-red-600 font-mono">({formatCurrency(data.deduction)})</td>
                                </tr>

                                {/* Spacer */}
                                <tr>
                                    <td colSpan={2} className="py-8"></td>
                                </tr>

                                {/* Total */}
                                <tr className="bg-gray-800 text-white">
                                    <td className="py-4 px-4 font-bold uppercase tracking-wider text-sm">Total Gaji Bersih</td>
                                    <td className="py-4 px-4 text-right font-bold text-xl font-mono">{formatCurrency(data.netSalary)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-xs text-gray-500 italic">
                        * Slip gaji ini diterbitkan secara otomatis oleh sistem dan sah tanpa tanda tangan basah.
                    </div>
                </section>

                {/* FOOTER & SIGNATURE */}
                <footer className="mt-12 pt-8 border-t border-gray-300 flex justify-between items-end">
                    <div className="text-xs text-gray-400 font-mono">
                        Generated by Pawon Salam System<br />
                        {new Date().toISOString()}
                    </div>

                    <div className="text-center relative">
                        <p className="text-sm font-bold text-gray-600 mb-16">Manager Keuangan</p>

                        {/* Digital Stamp */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 border-4 border-orange-600 rounded-full flex items-center justify-center opacity-80 -rotate-12 pointer-events-none mix-blend-multiply">
                            <div className="text-[10px] font-bold text-orange-600 text-center leading-tight uppercase">
                                Pawon Salam<br />Resto & Catering<br />OFFICIAL
                            </div>
                        </div>

                        <p className="font-bold text-gray-900 underline decoration-2 underline-offset-4">
                            ( ................................... )
                        </p>
                    </div>
                </footer>

                {/* BORDER DECORATION */}
                <div className="absolute top-2 left-0 right-0 text-center">
                    <span className="text-[10px] tracking-[0.5em] text-gray-300 uppercase">Pawon Salam • Dokumen Resmi • Confidential</span>
                </div>
                <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[10px] tracking-[0.5em] text-gray-300 uppercase">Pawon Salam • Dokumen Resmi • Confidential</span>
                </div>

            </div>
        </div>
    );
});

PayslipTemplate.displayName = 'PayslipTemplate';
