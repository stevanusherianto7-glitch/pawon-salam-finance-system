

import React, { useEffect, useState } from 'react';
import { usePayrollStore } from '../../store/payrollStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Save, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Payslip, UserRole, Employee } from '../../types';

interface Props {
    onBack: () => void;
    payslipId?: string;
    isNew?: boolean;
    initialMonth?: number;
    initialYear?: number;
}

export const PayslipFormScreen: React.FC<Props> = ({ onBack, payslipId, isNew, initialMonth, initialYear }) => {
    const { user } = useAuthStore();
    const { savePayslip, sendPayslip, fetchPayslipDetail, currentPayslip } = usePayrollStore();
    const { employees, fetchEmployees } = useEmployeeStore();

    const [formData, setFormData] = useState<Partial<Payslip>>({
        periodMonth: initialMonth || new Date().getMonth() + 1,
        periodYear: initialYear || new Date().getFullYear(),
        payDate: new Date().toISOString().split('T')[0],
        basicSalary: 0,
        allowanceMeal: 0,
        allowanceTransport: 0,
        allowanceOther: 0,
        overtimeHours: 0,
        overtimeAmount: 0,
        bonus: 0,
        commission: 0,
        bpjsKesehatan: 0,
        bpjsKetenagakerjaan: 0,
        taxPPh21: 0,
        otherDeductions: 0,
        totalEarnings: 0,
        totalDeductions: 0,
        netSalary: 0,
        status: 'DRAFT',
        notesForEmployee: '',
        notesInternalHr: ''
    });

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial data
    useEffect(() => {
        fetchEmployees();
        if (payslipId) {
            fetchPayslipDetail(payslipId);
        }
    }, [payslipId]);

    // Populate form when editing
    useEffect(() => {
        if (!isNew && currentPayslip && currentPayslip.id === payslipId) {
            setFormData(currentPayslip);
            const emp = employees.find(e => e.id === currentPayslip.employeeId);
            setSelectedEmployee(emp || null);
        }
    }, [currentPayslip, employees]);

    // Auto Calculate Totals
    useEffect(() => {
        const earnings =
            Number(formData.basicSalary) +
            Number(formData.allowanceMeal) +
            Number(formData.allowanceTransport) +
            Number(formData.allowanceOther) +
            Number(formData.overtimeAmount) +
            Number(formData.bonus) +
            Number(formData.commission);

        const deductions =
            Number(formData.bpjsKesehatan) +
            Number(formData.bpjsKetenagakerjaan) +
            Number(formData.taxPPh21) +
            Number(formData.otherDeductions);

        setFormData(prev => ({
            ...prev,
            totalEarnings: earnings,
            totalDeductions: deductions,
            netSalary: earnings - deductions
        }));
    }, [
        formData.basicSalary, formData.allowanceMeal, formData.allowanceTransport,
        formData.allowanceOther, formData.overtimeAmount, formData.bonus,
        formData.commission, formData.bpjsKesehatan, formData.bpjsKetenagakerjaan,
        formData.taxPPh21, formData.otherDeductions
    ]);

    // Filter valid employees (Exclude Owner)
    const validEmployees = employees.filter(e => e.role !== UserRole.BUSINESS_OWNER);
    const canEdit = user?.role === UserRole.HR_MANAGER && formData.status !== 'SENT';
    const isFinance = user?.role === UserRole.FINANCE_MANAGER;

    const handleSave = async (status: 'DRAFT' | 'READY_TO_SEND') => {
        if (!selectedEmployee || !user) return;
        setIsSubmitting(true);

        const payload: Payslip = {
            ...formData as Payslip,
            id: payslipId || `slip-${Date.now()}`,
            employeeId: selectedEmployee.id,
            status: status,
            createdByHrId: isNew ? user.id : formData.createdByHrId!,
            isVisibleToEmployee: false, // Only true when sent
            createdAt: isNew ? new Date().toISOString() : formData.createdAt!,
            updatedAt: new Date().toISOString()
        };

        const success = await savePayslip(payload);
        setIsSubmitting(false);
        if (success) {
            alert(`Slip Gaji berhasil disimpan sebagai ${status === 'DRAFT' ? 'Draft' : 'Siap Kirim'}`);
            if (isNew) onBack();
        }
    };

    const handleSend = async () => {
        if (!payslipId) return;
        const confirm = window.confirm(`Kirim slip gaji ini ke ${selectedEmployee?.name}? Karyawan akan menerima notifikasi.`);
        if (!confirm) return;

        setIsSubmitting(true);
        const success = await sendPayslip(payslipId);
        setIsSubmitting(false);

        if (success) {
            alert('Slip Gaji terkirim ke karyawan!');
            onBack();
        }
    };

    const InputRow = ({ label, field, color = 'gray' }: { label: string, field: keyof Payslip, color?: string }) => (
        <div className="mb-2.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase mb-0.5 block">{label}</label>
            <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400 font-bold text-[10px]">Rp</span>
                <input
                    type="number"
                    disabled={!canEdit}
                    value={formData[field] as number}
                    onChange={e => setFormData({ ...formData, [field]: parseFloat(e.target.value) || 0 })}
                    className={`w-full pl-8 p-2 border rounded-xl text-xs outline-none focus:border-orange-500 transition-colors ${color === 'green' ? 'bg-green-50 text-green-700' : color === 'red' ? 'bg-red-50 text-red-700' : 'bg-white'}`}
                />
            </div>
        </div>
    );

    return (
        <div className="bg-gray-50 pb-24">
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={18} className="text-gray-600" />
                </button>
                <div className="flex-1">
                    <h2 className="font-bold text-gray-800 text-base leading-tight">{isNew ? 'Buat Slip Gaji' : 'Edit Slip Gaji'}</h2>
                    {selectedEmployee && <p className="text-[10px] text-gray-500">{selectedEmployee.name} • {selectedEmployee.department}</p>}
                </div>
            </div>

            <div className="p-4 max-w-lg mx-auto space-y-4">

                {/* 1. Basic Info */}
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                    {isNew ? (
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Pilih Karyawan</label>
                            <select
                                className="w-full p-2.5 border rounded-xl text-xs bg-gray-50 outline-none"
                                onChange={e => {
                                    const emp = employees.find(em => em.id === e.target.value);
                                    setSelectedEmployee(emp || null);
                                }}
                                value={selectedEmployee?.id || ''}
                            >
                                <option value="">-- Pilih Karyawan --</option>
                                {validEmployees.map(e => <option key={e.id} value={e.id}>{e.name} - {e.department}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2.5 bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                            <img src={selectedEmployee?.avatarUrl} className="w-9 h-9 rounded-full bg-white" />
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{selectedEmployee?.name}</p>
                                <p className="text-[10px] text-gray-500">{selectedEmployee?.role}</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Bulan</label>
                            <select
                                disabled={!canEdit}
                                value={formData.periodMonth}
                                onChange={e => setFormData({ ...formData, periodMonth: Number(e.target.value) })}
                                className="w-full p-2 border rounded-xl text-xs bg-gray-50 outline-none"
                            >
                                {[...Array(12)].map((_, i) => <option key={i} value={i + 1}>{new Date(0, i).toLocaleDateString('id-ID', { month: 'long' })}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Tahun</label>
                            <input
                                type="number"
                                disabled={!canEdit}
                                value={formData.periodYear}
                                onChange={e => setFormData({ ...formData, periodYear: Number(e.target.value) })}
                                className="w-full p-2 border rounded-xl text-xs bg-gray-50 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Earnings */}
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-green-700 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider"><CheckCircle2 size={14} /> Pendapatan</h3>
                    <InputRow label="Gaji Pokok" field="basicSalary" />
                    <div className="grid grid-cols-2 gap-2.5">
                        <InputRow label="Tunj. Makan" field="allowanceMeal" />
                        <InputRow label="Tunj. Transport" field="allowanceTransport" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <InputRow label="Lembur" field="overtimeAmount" />
                        <InputRow label="Bonus/Insentif" field="bonus" />
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-xl flex justify-between items-center border border-green-100">
                        <span className="text-[10px] font-bold text-green-800 uppercase">Total Pendapatan</span>
                        <span className="font-bold text-green-800 text-sm">Rp {formData.totalEarnings?.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* 3. Deductions */}
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-red-700 mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider"><AlertCircle size={14} /> Potongan</h3>
                    <div className="grid grid-cols-2 gap-2.5">
                        <InputRow label="BPJS Kesehatan" field="bpjsKesehatan" color="red" />
                        <InputRow label="BPJS TK" field="bpjsKetenagakerjaan" color="red" />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                        <InputRow label="PPh 21" field="taxPPh21" color="red" />
                        <InputRow label="Lainnya (Kasbon)" field="otherDeductions" color="red" />
                    </div>
                    <div className="bg-red-50 p-2.5 rounded-xl flex justify-between items-center border border-red-100">
                        <span className="text-[10px] font-bold text-red-800 uppercase">Total Potongan</span>
                        <span className="font-bold text-red-800 text-sm">- Rp {formData.totalDeductions?.toLocaleString('id-ID')}</span>
                    </div>
                </div>

                {/* 4. Net & Notes */}
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                    <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 text-center mb-3">
                        <p className="text-[10px] font-bold text-orange-500 uppercase mb-0.5">Gaji Bersih (Take Home Pay)</p>
                        <p className="text-2xl font-bold text-orange-700">Rp {formData.netSalary?.toLocaleString('id-ID')}</p>
                        <p className="text-[9px] text-gray-500 mt-0.5">Dibayarkan tgl: {new Date(formData.payDate!).toLocaleDateString('id-ID')}</p>
                    </div>

                    <div className="space-y-2.5">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Pesan untuk Karyawan</label>
                            <textarea
                                disabled={!canEdit}
                                rows={2}
                                className="w-full p-2.5 border rounded-xl text-xs bg-gray-50 outline-none"
                                placeholder="Contoh: Terima kasih atas kerja keras Anda..."
                                value={formData.notesForEmployee}
                                onChange={e => setFormData({ ...formData, notesForEmployee: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 mb-1 block">Catatan Internal HR</label>
                            <textarea
                                disabled={!canEdit}
                                rows={1}
                                className="w-full p-2.5 border rounded-xl text-xs bg-gray-50 outline-none"
                                placeholder="Hanya dilihat oleh Admin/Finance..."
                                value={formData.notesInternalHr}
                                onChange={e => setFormData({ ...formData, notesInternalHr: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {canEdit && (
                    <div className="flex gap-2.5 pt-1">
                        <button
                            onClick={() => handleSave('DRAFT')}
                            disabled={isSubmitting}
                            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-xs"
                        >
                            Simpan Draft
                        </button>
                        <button
                            onClick={() => handleSave('READY_TO_SEND')}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all text-xs"
                        >
                            Siap Kirim
                        </button>
                    </div>
                )}

                {/* Send Button (Separate Step) */}
                {user?.role === UserRole.HR_MANAGER && formData.status === 'READY_TO_SEND' && (
                    <button
                        onClick={handleSend}
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-xs"
                    >
                        <Send size={16} /> Kirim Slip Gaji Sekarang
                    </button>
                )}

                {isFinance && formData.status !== 'DRAFT' && (
                    <div className="text-center p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-bold text-sm">
                        Mode Review Finance (Read Only)
                    </div>
                )}

            </div>
        </div>
    );
};
