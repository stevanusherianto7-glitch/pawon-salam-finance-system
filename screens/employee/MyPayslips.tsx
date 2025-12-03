import React, { useEffect } from 'react';
import { FileText, Download, Calendar, DollarSign, ChevronLeft } from 'lucide-react';
import { usePayslipStore } from '../../store/payslipStore';
import { useAuthStore } from '../../store/authStore';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

interface MyPayslipsProps {
    onBack?: () => void;
}

export const MyPayslips: React.FC<MyPayslipsProps> = ({ onBack }) => {
    const { user } = useAuthStore();
    const { getPayslipsByEmployee, markAsRead } = usePayslipStore();

    const myPayslips = user ? getPayslipsByEmployee(user.id) : [];

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleDownload = (payslip: any) => {
        // Mark as read
        markAsRead(payslip.id);

        // Download PDF
        const link = document.createElement('a');
        link.href = payslip.pdfBlob;
        link.download = `Slip_Gaji_${payslip.period.replace(/\\s+/g, '_')}.pdf`;
        link.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50/30 relative overflow-hidden">
            <BackgroundPattern />

            {/* Header */}
            <div className="relative z-10 p-6 pb-4">
                <div className="flex items-center gap-4 mb-6">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="glass p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-white/50 transition-all duration-300 active:scale-95"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Slip Gaji Saya</h1>
                        <p className="text-sm text-gray-500 mt-1">Riwayat slip gaji yang telah diterima</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 pt-0">
                {myPayslips.length === 0 ? (
                    <div className="glass p-12 rounded-3xl text-center">
                        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Belum Ada Slip Gaji</h3>
                        <p className="text-sm text-gray-500">Slip gaji akan muncul di sini setelah HR mengirimkannya.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {myPayslips.map((payslip) => (
                            <div
                                key={payslip.id}
                                className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 relative"
                            >
                                {/* Unread Badge */}
                                {!payslip.isRead && (
                                    <div className="absolute top-4 right-4">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                        </span>
                                    </div>
                                )}

                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="glass-dark p-3 rounded-xl">
                                                <FileText size={24} className="text-orange-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">{payslip.period}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Calendar size={14} />
                                                    <span>Dikirim: {formatDate(payslip.sentAt)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="glass-dark p-4 rounded-xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-gray-600">Total Penerimaan</span>
                                                <span className="font-bold text-gray-800">
                                                    {formatRupiah(payslip.earnings.reduce((sum, e) => sum + e.amount, 0))}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                                                <span className="text-sm text-gray-600">Total Potongan</span>
                                                <span className="font-bold text-red-600">
                                                    {formatRupiah(payslip.deductions.reduce((sum, d) => sum + d.amount, 0))}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-700 flex items-center gap-2">
                                                    <DollarSign size={18} className="text-orange-500" />
                                                    Take Home Pay
                                                </span>
                                                <span className="text-xl font-black text-orange-600">
                                                    {formatRupiah(payslip.takeHomePay)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => handleDownload(payslip)}
                                            className="glass bg-gradient-to-br from-orange-500/90 to-orange-600/90 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 font-medium"
                                        >
                                            <Download size={18} />
                                            <span>Download PDF</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
