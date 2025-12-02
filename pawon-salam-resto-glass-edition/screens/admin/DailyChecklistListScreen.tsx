import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { colors } from '../../theme/colors';
import { Calendar, Filter, CheckCircle2, Clock, User, ChevronRight, ArrowLeft, CircleDashed, AlertCircle } from 'lucide-react';
import { EmployeeArea } from '../../types';
import { getScoreColor } from '../../utils/scoreUtils';
import { performanceApi } from '../../services/api';
import { GlassDatePicker } from '../../components/ui/GlassDatePicker';

interface Props {
    onBack: () => void;
    onNavigate: (screen: string, params?: any) => void;
}

export const DailyChecklistListScreen: React.FC<Props> = ({ onBack, onNavigate }) => {
    const { employees, fetchEmployees } = useEmployeeStore();

    // Filters
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedArea, setSelectedArea] = useState<'ALL' | EmployeeArea>('ALL');

    // Data State
    const [statuses, setStatuses] = useState<Record<string, { status: 'EMPTY' | 'DRAFT' | 'FINALIZED', score?: number }>>({});
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(e => {
        if (selectedArea !== 'ALL' && e.area !== selectedArea) return false;
        // Filter relevant roles for checklist
        const validRoles = ['Waiter', 'Assisten Chef', 'Cook Helper'];
        return validRoles.includes(e.department);
    });

    // Fetch statuses when date or filtered employees change
    useEffect(() => {
        const loadStatuses = async () => {
            if (filteredEmployees.length === 0) return;

            setIsLoadingStatus(true);
            const newStatuses: Record<string, any> = {};

            // In a real app, use a bulk API: GET /daily-snapshots?date=...
            // Here we iterate for the prototype
            await Promise.all(filteredEmployees.map(async (emp) => {
                const res = await performanceApi.getDailySnapshot(emp.id, selectedDate);
                if (res.success && res.data && res.data.dailyChecklist) {
                    const checklist = res.data.dailyChecklist;
                    newStatuses[emp.id] = {
                        status: checklist.isFinalized ? 'FINALIZED' : 'DRAFT',
                        score: checklist.summary.avgScoreAll
                    };
                } else {
                    newStatuses[emp.id] = { status: 'EMPTY' };
                }
            }));

            setStatuses(newStatuses);
            setIsLoadingStatus(false);
        };

        loadStatuses();
    }, [selectedDate, selectedArea, employees.length]); // Re-run when basic dependencies change

    const handleSelectEmployee = (empId: string) => {
        onNavigate('dailyChecklistForm', { employeeId: empId, date: selectedDate });
    };

    const getStatusBadge = (empId: string) => {
        const data = statuses[empId];
        if (!data || data.status === 'EMPTY') {
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
                    <CircleDashed size={10} /> Belum Diisi
                </span>
            );
        }
        if (data.status === 'DRAFT') {
            return (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                    <Clock size={10} /> Draft
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">
                <CheckCircle2 size={10} /> Selesai
            </span>
        );
    };

    return (
        <div className="bg-gray-50 pb-24">
            {/* Header */}
            <div className="pt-8 pb-12 px-4 rounded-b-[2.5rem] shadow-md relative z-0 overflow-hidden" style={{ background: colors.gradientMain }}>
                {/* Watermark */}
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3 text-white">
                        <button onClick={onBack} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                            <ArrowLeft size={18} />
                        </button>
                        <h2 className="text-lg font-bold">Daily Checklist Performance</h2>
                    </div>

                    <div className="w-full">
                        <GlassDatePicker
                            selectedDate={selectedDate ? new Date(selectedDate) : null}
                            onChange={(date) => {
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                setSelectedDate(`${year}-${month}-${day}`);
                            }}
                            placeholder="Pilih Tanggal"
                            className="w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 -mt-8 relative z-10 space-y-3">

                {/* Filter Tabs */}
                <div className="bg-white p-1 rounded-xl shadow-sm flex border border-orange-50">
                    {(['ALL', EmployeeArea.FOH, EmployeeArea.BOH] as const).map(area => (
                        <button
                            key={area}
                            onClick={() => setSelectedArea(area)}
                            className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${selectedArea === area ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            {area === 'ALL' ? 'Semua' : area}
                        </button>
                    ))}
                </div>

                {/* Employee List */}
                <div className="space-y-2.5">
                    {filteredEmployees.length === 0 ? (
                        <div className="text-center py-8 flex flex-col items-center justify-center text-gray-400">
                            <AlertCircle size={24} className="mb-2 opacity-20" />
                            <p className="text-xs">Tidak ada karyawan yang sesuai filter.</p>
                        </div>
                    ) : (
                        filteredEmployees.map(emp => {
                            const statusData = statuses[emp.id];
                            const score = statusData?.score;

                            return (
                                <div
                                    key={emp.id}
                                    onClick={() => handleSelectEmployee(emp.id)}
                                    className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-98 transition-transform ${isLoadingStatus ? 'opacity-70 pointer-events-none' : ''}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="relative">
                                            <img src={emp.avatarUrl} className="w-10 h-10 rounded-full bg-gray-200 object-cover border border-gray-100" alt={emp.name} />
                                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${emp.area === 'FOH' ? 'bg-blue-500' : 'bg-red-500'}`}>
                                                <span className="text-[7px] text-white font-bold">{emp.area[0]}</span>
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-gray-800 text-xs truncate">{emp.name}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium truncate">{emp.department}</p>
                                            <div className="mt-0.5">
                                                {getStatusBadge(emp.id)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pl-2">
                                        {score ? (
                                            <div className="text-right">
                                                <span className="text-base font-bold block leading-none" style={{ color: getScoreColor(score) }}>
                                                    {score}
                                                </span>
                                                <span className="text-[8px] text-gray-400 uppercase">Skor</span>
                                            </div>
                                        ) : (
                                            <div className="w-6 h-1 bg-gray-100 rounded-full"></div>
                                        )}
                                        <ChevronRight size={16} className="text-gray-300" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>
        </div>
    );
};
