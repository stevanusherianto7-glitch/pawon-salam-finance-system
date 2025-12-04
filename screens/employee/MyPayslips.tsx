import React from 'react';
import { FileText, ChevronLeft } from 'lucide-react';
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
                {payslips.length === 0 ? (
                    <div className="glass p-12 rounded-3xl text-center">
                        <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Belum Ada Slip Gaji</h3>
                        <p className="text-sm text-gray-500">Slip gaji akan muncul di sini setelah HR mengirimkannya.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {payslips.map((payslip) => (
                            <PayslipNotificationCard key={payslip.id} data={payslip} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
