import React from 'react';
import { FileText, ChevronLeft, Inbox } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { usePayslipStorage } from '../../hooks/usePayslipStorage';
import { PayslipNotificationCard } from '../../components/PayslipNotificationCard';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

interface MyPayslipsProps {
    onBack?: () => void;
}

export const MyPayslips: React.FC<MyPayslipsProps> = ({ onBack }) => {
    const { user } = useAuthStore();
    // Use the new Hook for V2 Storage
    const { payslips } = usePayslipStorage(user?.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 relative overflow-hidden">
            <BackgroundPattern />

            {/* Header */}
            <div className="relative z-10 p-6 pb-4">
                <div className="flex items-center gap-4 mb-6">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="bg-white hover:bg-slate-50 p-2 rounded-xl text-slate-600 hover:text-slate-900 shadow-md shadow-slate-200/50 border border-slate-100 transition-all duration-300 active:scale-95 hover:-translate-y-0.5"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Slip Gaji Saya</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Riwayat slip gaji yang telah diterima</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 pt-0">
                {payslips.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
                        {/* Empty State Illustration */}
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Inbox size={48} className="text-slate-300" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2 tracking-tight">Belum Ada Slip Gaji</h3>
                        <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
                            Slip gaji akan muncul di sini setelah HR mengirimkannya.
                        </p>
                        <div className="mt-6 inline-block bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-400 font-semibold">
                                💼 Slip gaji biasanya dikirim setiap tanggal 25-28
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Summary Badge */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 flex items-center justify-between border border-blue-100 shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <FileText size={16} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-600">Total Slip Gaji</p>
                                    <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">{payslips.length} slip</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">Terbaru</p>
                                <p className="text-sm font-bold text-blue-600">{payslips[0]?.period}</p>
                            </div>
                        </div>

                        {/* Payslip Cards */}
                        {payslips.map((payslip) => (
                            <PayslipNotificationCard key={payslip.id} data={payslip} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
