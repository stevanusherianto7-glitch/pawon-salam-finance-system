import React, { useState } from 'react';
import { Calculator, CheckSquare, Calendar, FilePlus, AlertTriangle, Package, TrendingUp, Users, ChevronRight, Wallet } from 'lucide-react';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';
import { HPPCalculatorModal } from '../../components/features/HPPCalculatorModal';
import { StockOpnameModal } from '../../components/features/StockOpnameModal';
import { SmartOpexModal } from '../../components/features/SmartOpexModal';

interface Props {
    onNavigate: (screen: string) => void;
}

export const RestaurantManagerPanel: React.FC<Props> = ({ onNavigate }) => {
    const [showHPP, setShowHPP] = useState(false);
    const [showStockOpname, setShowStockOpname] = useState(false);
    const [showSmartOpex, setShowSmartOpex] = useState(false);

    return (
        <div className="px-4 -mt-6 relative z-10 space-y-3">


            {/* Quick Actions Grid - PREMIUM GLASS STYLE */}
            <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-2.5 text-xs uppercase tracking-wider">Menu Utama</h3>
                <div className="grid grid-cols-2 gap-2">
                    <PremiumGlassCard title="Checklist" subtitle="Performa Harian" icon={CheckSquare} onClick={() => onNavigate('dailyChecklistList')} themeColor="orange" />
                    <PremiumGlassCard title="Shift" subtitle="Jadwal Staff" icon={Calendar} onClick={() => onNavigate('shiftScheduler')} themeColor="blue" />
                    <PremiumGlassCard title="Cuti" subtitle="Input Izin" icon={FilePlus} onClick={() => onNavigate('adminLeaveRequest')} themeColor="teal" />
                    <PremiumGlassCard title="Monitoring" subtitle="Laporan Staff" icon={AlertTriangle} onClick={() => onNavigate('jobdeskMonitor')} themeColor="red" />
                    <PremiumGlassCard title="Stock Opname" subtitle="Input Stok Fisik" icon={Package} onClick={() => setShowStockOpname(true)} themeColor="green" />
                    <PremiumGlassCard title="Kalkulator HPP" subtitle="Simulasi Menu" icon={Calculator} onClick={() => setShowHPP(true)} themeColor="orange" />
                    <PremiumGlassCard title="Laporan Biaya" subtitle="Smart OPEX" icon={Wallet} onClick={() => setShowSmartOpex(true)} themeColor="purple" />
                </div>
            </div>

            {/* Stats & Reports */}
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onNavigate('hrTrendReport')} className="p-2.5 bg-yellow-50 text-yellow-800 rounded-xl text-[10px] font-bold border border-yellow-100 flex items-center justify-center gap-2 hover:bg-yellow-100 shadow-sm">
                    <TrendingUp size={14} /> Laporan Tren
                </button>
                <button onClick={() => onNavigate('hrTopPerformance')} className="p-2.5 bg-purple-50 text-purple-800 rounded-xl text-[10px] font-bold border border-purple-100 flex items-center justify-center gap-2 hover:bg-purple-100 shadow-sm">
                    <Users size={14} /> Top Performance
                </button>
            </div>

            {/* Modals */}
            <HPPCalculatorModal isOpen={showHPP} onClose={() => setShowHPP(false)} />

            <StockOpnameModal
                isOpen={showStockOpname}
                onClose={() => setShowStockOpname(false)}
                isReadOnly={false}
            />

            <SmartOpexModal isOpen={showSmartOpex} onClose={() => setShowSmartOpex(false)} />
        </div>
    );
};
