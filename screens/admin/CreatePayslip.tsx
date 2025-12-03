import React, { useState, useEffect, useRef } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { Plus, Trash2, Upload, Calendar, Printer, Download } from 'lucide-react';
import { Logo } from '../../components/Logo';

// --- Types ---
interface FinancialItem {
    id: string;
    label: string;
    amount: number;
    isFixed?: boolean; // For items that shouldn't be deleted easily like Basic Salary
}

interface PayslipData {
    month: string;
    year: string;
    slipNumber: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    employeeGrade: string; // "Golongan"
    employeeDept: string;
    employeeStatus: string;
    earnings: FinancialItem[];
    deductions: FinancialItem[];
    bankName: string;
    bankAccount: string;
    bankHolder: string;
}

// --- Helper Components ---

const EditableField = ({
    value,
    onChange,
    className = "",
    placeholder = "",
    type = "text"
}: {
    value: string | number;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    type?: "text" | "number" | "date";
}) => (
    <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`bg-transparent border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:outline-none transition-colors px-1 py-0.5 w-full ${className} print:border-none print:p-0`}
    />
);

const MoneyInput = ({
    amount,
    onChange,
    className = ""
}: {
    amount: number;
    onChange: (val: number) => void;
    className?: string;
}) => {
    const format = (val: number) => new Intl.NumberFormat('id-ID').format(val);

    // Local state to handle typing
    const [displayValue, setDisplayValue] = useState(format(amount));

    useEffect(() => {
        setDisplayValue(format(amount));
    }, [amount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\./g, '');
        if (!isNaN(Number(val))) {
            onChange(Number(val));
            setDisplayValue(format(Number(val)));
        }
    };

    return (
        <div className={`flex items-center ${className}`}>
            <span className="text-gray-500 mr-1">Rp</span>
            <input
                type="text"
                value={displayValue}
                onChange={handleChange}
                className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-orange-500 focus:outline-none text-right w-full font-mono transition-colors print:border-none print:p-0"
            />
        </div>
    );
};

const SectionHeader = ({ title, colorClass = "bg-orange-600" }: { title: string, colorClass?: string }) => (
    <div className={`${colorClass} text-white px-4 py-2 font-bold text-sm uppercase tracking-wider print:bg-orange-600 print:text-white print:print-color-adjust-exact`}>
        {title}
    </div>
);

// --- Main Component ---

export const CreatePayslip: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    const { employees, fetchEmployees } = useEmployeeStore();

    // --- State ---
    const [data, setData] = useState<PayslipData>({
        month: 'Desember',
        year: '2025',
        slipNumber: 'PS/2025/12/001',
        employeeId: '',
        employeeName: '',
        employeeRole: '',
        employeeGrade: '-',
        employeeDept: 'Operasional',
        employeeStatus: 'Karyawan Tetap',
        earnings: [
            { id: '1', label: 'Gaji Pokok', amount: 0, isFixed: true },
            { id: '2', label: 'Tunjangan Jabatan', amount: 0 },
            { id: '3', label: 'Uang Makan', amount: 0 },
        ],
        deductions: [
            { id: '1', label: 'PPh 21', amount: 0 },
            { id: '2', label: 'BPJS Kesehatan', amount: 0 },
        ],
        bankName: 'BCA',
        bankAccount: '',
        bankHolder: '',
    });

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // --- Calculations ---
    const totalEarnings = data.earnings.reduce((acc, item) => acc + item.amount, 0);
    const totalDeductions = data.deductions.reduce((acc, item) => acc + item.amount, 0);
    const takeHomePay = totalEarnings - totalDeductions;

    // --- Handlers ---
    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const emp = employees.find(emp => emp.id === e.target.value);
        if (emp) {
            setData(prev => ({
                ...prev,
                employeeId: emp.id,
                employeeName: emp.name,
                employeeRole: emp.role.replace(/_/g, ' '),
                // Reset financials or load defaults if you had them
                earnings: [
                    { id: '1', label: 'Gaji Pokok', amount: 3000000, isFixed: true }, // Example default
                    { id: '2', label: 'Tunjangan Jabatan', amount: 500000 },
                    { id: '3', label: 'Uang Makan', amount: 0 },
                ],
                bankHolder: emp.name
            }));
        }
    };

    const updateItem = (type: 'earnings' | 'deductions', id: string, field: 'label' | 'amount', value: string | number) => {
        setData(prev => ({
            ...prev,
            [type]: prev[type].map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const addItem = (type: 'earnings' | 'deductions') => {
        const newItem: FinancialItem = {
            id: Math.random().toString(36).substr(2, 9),
            label: 'Item Baru',
            amount: 0
        };
        setData(prev => ({
            ...prev,
            [type]: [...prev[type], newItem]
        }));
    };

    const deleteItem = (type: 'earnings' | 'deductions', id: string) => {
        setData(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== id)
        }));
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8 print:p-0 print:bg-white font-sans text-gray-800">

            {/* Toolbar - Hidden on Print */}
            <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden">
                <div className="flex items-center gap-4">
                    {onBack && (
                        <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 font-medium">
                            &larr; Kembali
                        </button>
                    )}
                    <select
                        className="bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={handleEmployeeSelect}
                        value={data.employeeId}
                    >
                        <option value="">-- Pilih Karyawan --</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handlePrint}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors shadow-sm"
                    >
                        <Printer size={18} /> Print
                    </button>
                </div>
            </div>

            {/* A4 Paper Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none min-h-[297mm] relative print:w-full print:max-w-none">

                {/* Content Padding */}
                <div className="p-12 md:p-16 print:p-8 h-full flex flex-col">

                    {/* 1. Header */}
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
                        <div className="flex gap-6 items-center">
                            {/* Logo Placeholder */}
                            <div className="w-20 h-20 bg-orange-50 rounded-lg border-2 border-dashed border-orange-200 flex items-center justify-center text-orange-400 print:border-none print:bg-transparent">
                                <Logo variant="color" size="lg" showText={false} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PAWON SALAM</h1>
                                <p className="text-sm text-gray-500 uppercase tracking-widest font-medium mt-1">Resto & Catering</p>
                                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Jl. Raya Example No. 123, Kota Malang, Jawa Timur</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest mb-2">Slip Gaji</h2>
                            <div className="flex items-center justify-end gap-2 text-gray-600 font-medium">
                                <EditableField
                                    value={data.month}
                                    onChange={(val) => setData(prev => ({ ...prev, month: val }))}
                                    className="text-right w-24 font-bold text-orange-600"
                                />
                                <EditableField
                                    value={data.year}
                                    onChange={(val) => setData(prev => ({ ...prev, year: val }))}
                                    className="text-right w-16 font-bold text-orange-600"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">No: {data.slipNumber}</p>
                        </div>
                    </div>

                    {/* 2. Employee Info Grid */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-2 mb-10 text-sm">
                        <div className="space-y-2">
                            <div className="flex">
                                <span className="w-32 text-gray-500 font-medium">Nama</span>
                                <span className="mr-2">:</span>
                                <EditableField value={data.employeeName} onChange={(val) => setData(prev => ({ ...prev, employeeName: val }))} className="font-bold text-gray-900" />
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-500 font-medium">Jabatan</span>
                                <span className="mr-2">:</span>
                                <EditableField value={data.employeeRole} onChange={(val) => setData(prev => ({ ...prev, employeeRole: val }))} />
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-500 font-medium">Departemen</span>
                                <span className="mr-2">:</span>
                                <EditableField value={data.employeeDept} onChange={(val) => setData(prev => ({ ...prev, employeeDept: val }))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex">
                                <span className="w-32 text-gray-500 font-medium">Status</span>
                                <span className="mr-2">:</span>
                                <EditableField value={data.employeeStatus} onChange={(val) => setData(prev => ({ ...prev, employeeStatus: val }))} />
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-500 font-medium">Golongan</span>
                                <span className="mr-2">:</span>
                                <EditableField value={data.employeeGrade} onChange={(val) => setData(prev => ({ ...prev, employeeGrade: val }))} />
                            </div>
                            <div className="flex">
                                <span className="w-32 text-gray-500 font-medium">Periode</span>
                                <span className="mr-2">:</span>
                                <span className="font-medium text-gray-900">{data.month} {data.year}</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Financials Split */}
                    <div className="grid grid-cols-2 gap-8 mb-8 flex-grow items-start">

                        {/* Earnings Column */}
                        <div className="flex flex-col h-full">
                            <SectionHeader title="Penerimaan" colorClass="bg-orange-600" />
                            <div className="mt-4 space-y-0 flex-grow">
                                {data.earnings.map((item) => (
                                    <div key={item.id} className="group flex items-center justify-between py-2 border-b border-gray-100 hover:bg-orange-50/30 transition-colors px-2 -mx-2 rounded">
                                        <div className="flex items-center gap-2 flex-grow">
                                            {!item.isFixed && (
                                                <button
                                                    onClick={() => deleteItem('earnings', item.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity print:hidden"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <EditableField
                                                value={item.label}
                                                onChange={(val) => updateItem('earnings', item.id, 'label', val)}
                                                className="font-medium text-gray-700"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <MoneyInput
                                                amount={item.amount}
                                                onChange={(val) => updateItem('earnings', item.id, 'amount', val)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItem('earnings')}
                                    className="mt-4 text-xs flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium print:hidden opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <Plus size={14} /> Tambah Item
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center bg-gray-50 p-3 rounded print:bg-transparent print:p-0 print:border-gray-300">
                                <span className="font-bold text-gray-700">Total Penerimaan</span>
                                <span className="font-bold text-gray-900 text-lg">Rp {new Intl.NumberFormat('id-ID').format(totalEarnings)}</span>
                            </div>
                        </div>

                        {/* Deductions Column */}
                        <div className="flex flex-col h-full">
                            <SectionHeader title="Potongan" colorClass="bg-red-600" />
                            <div className="mt-4 space-y-0 flex-grow">
                                {data.deductions.map((item) => (
                                    <div key={item.id} className="group flex items-center justify-between py-2 border-b border-gray-100 hover:bg-red-50/30 transition-colors px-2 -mx-2 rounded">
                                        <div className="flex items-center gap-2 flex-grow">
                                            <button
                                                onClick={() => deleteItem('deductions', item.id)}
                                                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity print:hidden"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <EditableField
                                                value={item.label}
                                                onChange={(val) => updateItem('deductions', item.id, 'label', val)}
                                                className="font-medium text-gray-700"
                                            />
                                        </div>
                                        <div className="w-32">
                                            <MoneyInput
                                                amount={item.amount}
                                                onChange={(val) => updateItem('deductions', item.id, 'amount', val)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItem('deductions')}
                                    className="mt-4 text-xs flex items-center gap-1 text-red-600 hover:text-red-700 font-medium print:hidden opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <Plus size={14} /> Tambah Item
                                </button>
                            </div>
                            <div className="mt-4 pt-4 border-t-2 border-gray-200 flex justify-between items-center bg-gray-50 p-3 rounded print:bg-transparent print:p-0 print:border-gray-300">
                                <span className="font-bold text-gray-700">Total Potongan</span>
                                <span className="font-bold text-red-600 text-lg">Rp {new Intl.NumberFormat('id-ID').format(totalDeductions)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. Footer & Net Pay */}
                    <div className="mt-auto">
                        <div className="flex items-center shadow-lg rounded-lg overflow-hidden print:shadow-none print:border print:border-orange-600">
                            <div className="bg-orange-600 text-white px-8 py-4 font-bold text-lg uppercase tracking-wider w-1/3 print:bg-orange-600 print:print-color-adjust-exact">
                                Take Home Pay
                            </div>
                            <div className="bg-white flex-1 px-8 py-4 text-right font-bold text-3xl text-orange-600 print:text-black">
                                Rp {new Intl.NumberFormat('id-ID').format(takeHomePay)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-12 mt-12">
                            {/* Bank Details */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">Ditransfer Ke:</p>
                                <div className="space-y-1 text-sm text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-16">Bank</span>
                                        <EditableField value={data.bankName} onChange={(val) => setData(prev => ({ ...prev, bankName: val }))} />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-16">No. Rek</span>
                                        <EditableField value={data.bankAccount} onChange={(val) => setData(prev => ({ ...prev, bankAccount: val }))} placeholder="0000-0000-0000" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-16">A.N.</span>
                                        <EditableField value={data.bankHolder} onChange={(val) => setData(prev => ({ ...prev, bankHolder: val }))} />
                                    </div>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="flex justify-between items-end text-center">
                                <div className="flex flex-col items-center gap-16">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Disetujui Oleh</p>
                                    <div className="border-t border-gray-400 w-32 pt-2">
                                        <p className="font-bold text-sm text-gray-900">HRD Manager</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-16">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Diterima Oleh</p>
                                    <div className="border-t border-gray-400 w-32 pt-2">
                                        <p className="font-bold text-sm text-gray-900">{data.employeeName || 'Karyawan'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
