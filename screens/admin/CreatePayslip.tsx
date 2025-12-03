import React, { useState, useEffect } from 'react';
import { Printer, Plus, Trash2 } from 'lucide-react';
import { useEmployeeStore } from '../../store/employeeStore';

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

    // Handler: Print
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 overflow-x-auto print:bg-white print:p-0 print:overflow-hidden">

            {/* Action Bar (Hidden saat Print) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium">
                            &larr; Kembali
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-700">Slip Gaji Generator</h2>
                </div>

                <div className="flex gap-4">
                    <select
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={handleEmployeeSelect}
                        defaultValue=""
                    >
                        <option value="" disabled>-- Pilih Karyawan --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                    >
                        <Printer size={18} /> Cetak PDF
                    </button>
                </div>
            </div>

            {/* KERTAS A4 (Fixed Size) */}
            <div className="mx-auto bg-white shadow-xl print:shadow-none print:mx-0 relative"
                style={{ width: '210mm', minHeight: '297mm', padding: '15mm' }}>

                {/* HEADER */}
                <div className="flex justify-between items-start border-b-4 border-[#ff6b35] pb-6 mb-6">
                    <div className="flex gap-4">
                        {/* Logo Placeholder */}
                        <div className="w-20 h-20 bg-orange-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-[#ff6b35] text-[#ff6b35]">
                            <div className="text-2xl font-bold">PS</div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 tracking-wide">PAWON SALAM</h1>
                            <p className="text-sm font-semibold text-[#ff6b35]">RESTO & CATERING</p>
                            <p className="text-xs text-gray-500 mt-1 max-w-[200px]">
                                Jl. Raya Example No. 123, Kota Malang, Jawa Timur
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-black text-gray-800 uppercase tracking-wider mb-1">SLIP GAJI</h2>
                        <p className="text-sm text-gray-500">Periode: <span className="font-bold text-gray-800">{employee.period}</span></p>
                        <p className="text-xs text-gray-400 mt-1">No: PS/2025/12/001</p>
                    </div>
                </div>

                {/* EMPLOYEE INFO GRID */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 text-sm">
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Nama Karyawan</span>
                            <input
                                type="text"
                                value={employee.name}
                                onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
                                className="font-bold text-right text-gray-800 focus:outline-none focus:bg-orange-50 px-1 rounded w-1/2"
                            />
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-1">
                            <span className="text-gray-500">Jabatan</span>
                            <input
                                type="text"
                                value={employee.role}
                                onChange={(e) => setEmployee({ ...employee, role: e.target.value })}
                                className="font-medium text-right text-gray-800 focus:outline-none focus:bg-orange-50 px-1 rounded w-1/2"
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
                <div className="grid grid-cols-2 gap-8 mb-8">

                    {/* EARNINGS COLUMN */}
                    <div>
                        <div className="bg-[#ff6b35] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-t mb-2">
                            Penerimaan (Earnings)
                        </div>
                        <div className="space-y-2 min-h-[200px]">
                            {earnings.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group text-sm py-1 border-b border-gray-100 border-dashed hover:border-orange-200">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateRow('earning', item.id, 'label', e.target.value)}
                                        className="w-1/2 focus:outline-none focus:bg-orange-50 rounded px-1"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateRow('earning', item.id, 'amount', e.target.value)}
                                            className="text-right font-mono text-gray-700 w-24 focus:outline-none focus:bg-orange-50 rounded px-1"
                                        />
                                        <button
                                            onClick={() => deleteRow('earning', item.id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 print:hidden"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => addRow('earning')}
                                className="text-xs text-[#ff6b35] font-semibold flex items-center gap-1 mt-3 hover:underline print:hidden"
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
                        <div className="bg-[#d64518] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-t mb-2">
                            Potongan (Deductions)
                        </div>
                        <div className="space-y-2 min-h-[200px]">
                            {deductions.map((item) => (
                                <div key={item.id} className="flex items-center justify-between group text-sm py-1 border-b border-gray-100 border-dashed hover:border-orange-200">
                                    <input
                                        type="text"
                                        value={item.label}
                                        onChange={(e) => updateRow('deduction', item.id, 'label', e.target.value)}
                                        className="w-1/2 focus:outline-none focus:bg-orange-50 rounded px-1"
                                    />
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => updateRow('deduction', item.id, 'amount', e.target.value)}
                                            className="text-right font-mono text-gray-700 w-24 focus:outline-none focus:bg-orange-50 rounded px-1"
                                        />
                                        <button
                                            onClick={() => deleteRow('deduction', item.id)}
                                            className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 print:hidden"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => addRow('deduction')}
                                className="text-xs text-red-500 font-semibold flex items-center gap-1 mt-3 hover:underline print:hidden"
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
                <div className="flex items-center mb-12">
                    <div className="bg-[#ff6b35] text-white font-bold px-6 py-4 text-sm tracking-widest uppercase w-1/3 rounded-l">
                        TAKE HOME PAY
                    </div>
                    <div className="bg-orange-50 flex-1 py-3 px-6 text-right border border-[#ff6b35] border-l-0 rounded-r">
                        <span className="text-3xl font-black text-[#ff6b35]">{formatRupiah(takeHomePay)}</span>
                    </div>
                </div>

                {/* FOOTER INFO & SIGNATURE */}
                <div className="grid grid-cols-2 gap-12 mt-auto">
                    <div className="text-sm text-gray-600">
                        <p className="font-bold text-gray-800 mb-2 uppercase text-xs tracking-wide">Ditransfer Ke:</p>
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="font-bold">BCA (Bank Central Asia)</p>
                            <p className="font-mono text-gray-800 my-1">123-456-7890</p>
                            <p className="text-xs uppercase">a.n. {employee.name}</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end text-center text-xs">
                        <div className="mb-4">
                            <p className="mb-16 font-semibold text-gray-500">Disetujui Oleh,</p>
                            <p className="font-bold text-gray-800 border-t border-gray-300 pt-2 px-4">HRD Manager</p>
                        </div>
                        <div className="mb-4">
                            <p className="mb-16 font-semibold text-gray-500">Diterima Oleh,</p>
                            <p className="font-bold text-gray-800 border-t border-gray-300 pt-2 px-4">{employee.name}</p>
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
