import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { colors } from '../../theme/colors';

interface GlassDatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date) => void;
    placeholder?: string;
    className?: string;
    theme?: 'light' | 'dark';
    mode?: 'date' | 'month-year' | 'year';
}

export const GlassDatePicker: React.FC<GlassDatePickerProps> = ({
    selectedDate,
    onChange,
    placeholder = 'Pilih Tanggal',
    className = '',
    theme = 'dark',
    mode = 'date',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selectedDate || new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(newDate);
        setIsOpen(false);
    };

    const renderCalendarDays = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);

        const days = [];

        // Empty cells for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-11 w-11" />);
        }

        // Days of current month
        for (let day = 1; day <= totalDays; day++) {
            const currentDate = new Date(year, month, day);
            const isSelected = selectedDate &&
                currentDate.getDate() === selectedDate.getDate() &&
                currentDate.getMonth() === selectedDate.getMonth() &&
                currentDate.getFullYear() === selectedDate.getFullYear();

            const isToday = new Date().toDateString() === currentDate.toDateString();

            days.push(
                <button
                    key={day}
                    onClick={() => handleDateClick(day)}
                    className={`
            h-11 w-11 rounded-full flex items-center justify-center text-sm transition-all duration-200 min-h-[44px] min-w-[44px]
            ${isSelected
                            ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-bold scale-110'
                            : theme === 'light'
                                ? 'text-gray-700 hover:bg-gray-100'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }
            ${isToday && !isSelected ? 'border border-orange-400/50 text-orange-500' : ''}
          `}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const formatDate = (date: Date) => {
        if (mode === 'year') {
            return date.toLocaleDateString('id-ID', { year: 'numeric' });
        } else if (mode === 'month-year') {
            return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
        }
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const isLight = theme === 'light';

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl w-full transition-all duration-300
          ${isLight
                        ? 'bg-white border border-gray-200 hover:border-orange-300 shadow-sm'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'}
          ${isOpen ? 'ring-2 ring-orange-500/20 border-orange-500/50' : ''}
        `}
            >
                <CalendarIcon size={18} className="text-orange-500" />
                <span className={`text-sm font-medium ${isLight ? 'text-gray-700' : (selectedDate ? 'text-white' : 'text-white/40')}`}>
                    {selectedDate ? formatDate(selectedDate) : placeholder}
                </span>
            </button>

            {/* Dropdown Calendar */}
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 z-[60] w-72 max-w-[90vw] animate-in fade-in zoom-in-95 duration-200">
                    <div className={`
                        backdrop-blur-xl border rounded-2xl shadow-2xl p-4 overflow-hidden
                        ${isLight
                            ? 'bg-white/95 border-gray-200'
                            : 'bg-[#1a1a1a]/90 border-white/10'
                        }
                    `}>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={handlePrevMonth}
                                className={`
                                    p-1 rounded-lg transition-colors
                                    ${isLight
                                        ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                        : 'hover:bg-white/10 text-white/60 hover:text-white'
                                    }
                                `}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <span className={`font-bold text-sm ${isLight ? 'text-gray-800' : 'text-white'}`}>
                                {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                            </span>

                            <button
                                onClick={handleNextMonth}
                                className={`
                                    p-1 rounded-lg transition-colors
                                    ${isLight
                                        ? 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                                        : 'hover:bg-white/10 text-white/60 hover:text-white'
                                    }
                                `}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Weekday Headers (only for date mode) */}
                        {mode === 'date' && (
                            <div className="grid grid-cols-7 mb-2 text-center">
                                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                                    <div key={day} className={`
                                    text-[10px] font-bold uppercase tracking-wider
                                    ${isLight ? 'text-gray-400' : 'text-white/40'}
                                `}>
                                        {day}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Content Grid - depends on mode */}
                        {mode === 'date' && (
                            <div className="grid grid-cols-7 gap-1 place-items-center">
                                {renderCalendarDays()}
                            </div>
                        )}

                        {mode === 'month-year' && (
                            <div className="grid grid-cols-3 gap-2">
                                {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((monthName, idx) => {
                                    const isSelected = selectedDate &&
                                        selectedDate.getMonth() === idx &&
                                        selectedDate.getFullYear() === viewDate.getFullYear();
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                const newDate = new Date(viewDate.getFullYear(), idx, 1);
                                                onChange(newDate);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                py-3 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px]
                                                ${isSelected
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-bold'
                                                    : isLight
                                                        ? 'text-gray-700 hover:bg-gray-100'
                                                        : 'text-white/80 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            {monthName}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {mode === 'year' && (
                            <div className="grid grid-cols-3 gap-2">
                                {Array.from({ length: 12 }, (_, i) => {
                                    const year = viewDate.getFullYear() - 5 + i;
                                    const isSelected = selectedDate && selectedDate.getFullYear() === year;
                                    return (
                                        <button
                                            key={year}
                                            onClick={() => {
                                                const newDate = new Date(year, 0, 1);
                                                onChange(newDate);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                py-3 px-4 rounded-xl text-sm font-medium transition-all min-h-[44px]
                                                ${isSelected
                                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-bold'
                                                    : isLight
                                                        ? 'text-gray-700 hover:bg-gray-100'
                                                        : 'text-white/80 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            {year}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Clear Button (Optional) */}
                        {selectedDate && (
                            <div className="mt-3 pt-3 border-t border-white/10 flex justify-center">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // We need a way to clear, but the prop expects Date. 
                                        // For now, let's just close or maybe we need to update the interface to allow null
                                        // If onChange allows null, we can do onChange(null as any) but better to keep it safe.
                                        // Let's just have a "Today" button instead.
                                        const today = new Date();
                                        onChange(today);
                                        setViewDate(today);
                                        setIsOpen(false);
                                    }}
                                    className="text-xs text-orange-400 hover:text-orange-300 font-medium transition-colors"
                                >
                                    Pilih Hari Ini
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
