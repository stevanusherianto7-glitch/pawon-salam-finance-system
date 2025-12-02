import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

interface GlassMonthPickerProps {
    value: string; // Format: "Januari 2025"
    onChange: (value: string) => void;
    className?: string;
}

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const GlassMonthPicker: React.FC<GlassMonthPickerProps> = ({ value, onChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const containerRef = useRef<HTMLDivElement>(null);

    // Parse initial value if exists
    useEffect(() => {
        if (value) {
            const parts = value.split(' ');
            if (parts.length === 2) {
                const year = parseInt(parts[1]);
                if (!isNaN(year)) setSelectedYear(year);
            }
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMonthSelect = (month: string) => {
        onChange(`${month} ${selectedYear}`);
        setIsOpen(false);
    };

    const handleYearChange = (increment: number) => {
        setSelectedYear(prev => prev + increment);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl 
                   bg-white/10 backdrop-blur-md border border-white/20 
                   text-white font-medium transition-all hover:bg-white/20 focus:ring-2 focus:ring-orange-400/50"
            >
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-orange-300" />
                    <span>{value || 'Pilih Periode'}</span>
                </div>
                <ChevronDown size={16} className={`text-white/70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] z-50 
                        bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl 
                        shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Year Selector Header */}
                    <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
                        <button
                            onClick={() => handleYearChange(-1)}
                            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        >
                            <ChevronDown size={20} className="rotate-90" />
                        </button>
                        <span className="font-bold text-lg text-white">{selectedYear}</span>
                        <button
                            onClick={() => handleYearChange(1)}
                            className="p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                        >
                            <ChevronDown size={20} className="-rotate-90" />
                        </button>
                    </div>

                    {/* Months Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3">
                        {MONTHS.map((month) => {
                            const isSelected = value === `${month} ${selectedYear}`;
                            return (
                                <button
                                    key={month}
                                    onClick={() => handleMonthSelect(month)}
                                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-all
                    ${isSelected
                                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {month.substring(0, 3)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
