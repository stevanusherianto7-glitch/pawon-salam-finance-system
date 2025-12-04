import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

export interface GlassMonthPickerProps {
    value: string; // Format: "Januari 2025"
    onChange: (value: string) => void;
    className?: string;
    variant?: 'glass' | 'light';
}

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const GlassMonthPicker: React.FC<GlassMonthPickerProps> = ({ value, onChange, className = '', variant = 'glass' }) => {
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

    const isLight = variant === 'light';

    const triggerClasses = isLight
        ? "w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-gray-200 bg-white text-gray-800 font-medium transition-colors hover:border-orange-500 focus:outline-none focus:border-orange-500"
        : "w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium transition-all hover:bg-white/20 focus:ring-2 focus:ring-orange-400/50";

    const dropdownClasses = isLight
        ? "absolute top-full left-0 mt-2 w-full min-w-[280px] z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        : "absolute top-full left-0 mt-2 w-full min-w-[280px] z-50 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200";

    const headerClasses = isLight
        ? "flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50"
        : "flex items-center justify-between p-3 border-b border-white/10 bg-white/5";

    const headerTextClasses = isLight ? "font-bold text-lg text-gray-800" : "font-bold text-lg text-white";
    const headerBtnClasses = isLight
        ? "p-1 hover:bg-gray-200 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
        : "p-1 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors";

    const monthBtnBaseClasses = "py-2 px-1 rounded-lg text-sm font-medium transition-all";
    const monthBtnSelectedClasses = "bg-orange-500 text-white shadow-lg shadow-orange-500/30";
    const monthBtnUnselectedClasses = isLight
        ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        : "text-white/70 hover:bg-white/10 hover:text-white";

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={triggerClasses}
            >
                <div className="flex items-center gap-2">
                    <Calendar size={18} className={isLight ? "text-gray-500" : "text-orange-300"} />
                    <span>{value || 'Pilih Periode'}</span>
                </div>
                <ChevronDown size={16} className={`${isLight ? "text-gray-500" : "text-white/70"} transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={dropdownClasses}>

                    {/* Year Selector Header */}
                    <div className={headerClasses}>
                        <button
                            onClick={() => handleYearChange(-1)}
                            className={headerBtnClasses}
                        >
                            <ChevronDown size={20} className="rotate-90" />
                        </button>
                        <span className={headerTextClasses}>{selectedYear}</span>
                        <button
                            onClick={() => handleYearChange(1)}
                            className={headerBtnClasses}
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
                                    className={`${monthBtnBaseClasses} ${isSelected ? monthBtnSelectedClasses : monthBtnUnselectedClasses}`}
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
