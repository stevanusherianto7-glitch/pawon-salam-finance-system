
import React, { useEffect, useState } from 'react';
import { useShiftStore } from '../../store/shiftStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Calendar, Grid, List, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { ShiftType, SHIFT_COLORS, UserRole } from '../../types';

interface Props {
  onBack: () => void;
}

type ViewMode = 'SUMMARY' | 'GRID';

export const OwnerShiftOverviewScreen: React.FC<Props> = ({ onBack }) => {
  const { shifts, fetchMonthlyShifts, isLoading } = useShiftStore();
  const { employees, fetchEmployees } = useEmployeeStore();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>('SUMMARY');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchMonthlyShifts(month, year);
  }, [month, year]);

  // Filter relevant employees
  const schedulableEmployees = employees.filter(e => e.role === UserRole.EMPLOYEE || e.role === UserRole.RESTAURANT_MANAGER);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayName = (day: number) => {
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('id-ID', { weekday: 'narrow' });
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 flex flex-col">
       {/* Header */}
       <div className="pt-8 pb-6 px-6 shadow-md relative z-10 overflow-hidden" style={{ background: colors.gradientMain }}>
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-white mb-4">
                  <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                      <ArrowLeft size={20} />
                  </button>
                  <div className="flex-1">
                      <h2 className="text-xl font-bold">Staffing Overview</h2>
                      <p className="text-orange-100 text-xs">Monitoring ketersediaan karyawan bulanan</p>
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex bg-black/20 rounded-lg p-1">
                      <button 
                          onClick={() => setViewMode('SUMMARY')}
                          className={`p-1.5 rounded-md transition-all ${viewMode === 'SUMMARY' ? 'bg-white text-orange-600 shadow' : 'text-white/60 hover:text-white'}`}
                          title="Ringkasan"
                      >
                          <List size={16}/>
                      </button>
                      <button 
                          onClick={() => setViewMode('GRID')}
                          className={`p-1.5 rounded-md transition-all ${viewMode === 'GRID' ? 'bg-white text-orange-600 shadow' : 'text-white/60 hover:text-white'}`}
                          title="Detail Grid"
                      >
                          <Grid size={16}/>
                      </button>
                  </div>
              </div>

              {/* Month Selector */}
              <div className="flex justify-between items-center bg-white/10 p-2 rounded-xl border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mx-auto">
                      <button onClick={() => setMonth(m => m === 1 ? 12 : m - 1)} className="p-1 text-white hover:bg-white/20 rounded"><ChevronLeft size={20}/></button>
                      <span className="text-white font-bold text-sm w-32 text-center">
                          {new Date(year, month - 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={() => setMonth(m => m === 12 ? 1 : m + 1)} className="p-1 text-white hover:bg-white/20 rounded"><ChevronRight size={20}/></button>
                  </div>
              </div>
            </div>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-auto bg-white">
           {isLoading ? (
               <div className="flex justify-center items-center h-64 text-gray-400">Memuat data...</div>
           ) : viewMode === 'SUMMARY' ? (
               // --- SUMMARY VIEW ---
               <div className="p-4 space-y-3">
                   <div className="grid grid-cols-4 text-xs font-bold text-gray-500 uppercase mb-2 px-4">
                       <div>Tanggal</div>
                       <div className="text-center text-blue-600">Pagi</div>
                       <div className="text-center text-green-600">Middle</div>
                       <div className="text-center text-red-500">Libur</div>
                   </div>
                   {daysArray.map(d => {
                       const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                       const isWeekend = new Date(year, month-1, d).getDay() === 0;
                       
                       const dailyShifts = shifts.filter(s => s.date === dateStr);
                       const countMorning = dailyShifts.filter(s => s.type === ShiftType.MORNING).length;
                       const countMiddle = dailyShifts.filter(s => s.type === ShiftType.MIDDLE).length;
                       const countOff = dailyShifts.filter(s => s.type === ShiftType.OFF).length;

                       return (
                           <div key={d} className={`bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between ${isWeekend ? 'border-red-100 bg-red-50/30' : 'border-gray-100'}`}>
                               <div className="flex items-center gap-3 w-1/4">
                                   <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border ${isWeekend ? 'bg-red-50 border-red-100 text-red-600' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                                      <span className="text-[10px] font-bold uppercase">{new Date(year, month-1, d).toLocaleDateString('id-ID',{weekday:'short'})}</span>
                                      <span className="text-sm font-bold">{d}</span>
                                   </div>
                               </div>
                               
                               <div className="flex-1 grid grid-cols-3 gap-2">
                                   <div className="text-center py-1 bg-blue-50 rounded-lg text-blue-700 font-bold text-sm border border-blue-100">{countMorning}</div>
                                   <div className="text-center py-1 bg-green-50 rounded-lg text-green-700 font-bold text-sm border border-green-100">{countMiddle}</div>
                                   <div className="text-center py-1 bg-red-50 rounded-lg text-red-700 font-bold text-sm border border-red-100">{countOff}</div>
                               </div>
                           </div>
                       )
                   })}
               </div>
           ) : (
               // --- READ ONLY GRID VIEW ---
               <div className="min-w-max p-4">
                   {/* Header Row */}
                   <div className="flex mb-2">
                       <div className="w-40 shrink-0 sticky left-0 bg-white z-10 font-bold text-gray-700 text-xs flex items-end pb-2 border-b">Karyawan</div>
                       {daysArray.map(d => {
                           const isWeekend = new Date(year, month-1, d).getDay() === 0;
                           return (
                              <div key={d} className={`w-10 text-center shrink-0 border-b pb-2 ${isWeekend ? 'text-red-500' : 'text-gray-600'}`}>
                                  <div className="text-[10px] font-medium">{getDayName(d)}</div>
                                  <div className="text-sm font-bold">{d}</div>
                              </div>
                           )
                       })}
                   </div>

                   {/* Rows */}
                   {schedulableEmployees.map(emp => (
                       <div key={emp.id} className="flex items-center border-b border-gray-50 hover:bg-gray-50 transition-colors h-14">
                           <div className="w-40 shrink-0 sticky left-0 bg-white z-10 flex items-center gap-2 pr-2 border-r border-gray-100 h-full">
                               <img src={emp.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200 object-cover"/>
                               <div className="min-w-0">
                                   <p className="text-xs font-bold text-gray-800 truncate">{emp.name.split(' ')[0]}</p>
                                   <p className="text-[10px] text-gray-400 truncate">{emp.department}</p>
                               </div>
                           </div>
                           {daysArray.map(d => {
                               const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                               const shift = shifts.find(s => s.employeeId === emp.id && s.date === dateStr);
                               
                               return (
                                   <div key={d} className="w-10 shrink-0 p-1 h-full flex items-center justify-center border-r border-dashed border-gray-100">
                                       {shift ? (
                                           <div 
                                              className="w-full h-8 rounded-md shadow-sm"
                                              style={{ backgroundColor: shift.color }}
                                              title={`${shift.type}`}
                                           />
                                       ) : (
                                           <div className="w-full h-8 rounded-md bg-gray-50 text-gray-200 text-[10px] flex items-center justify-center">-</div>
                                       )}
                                   </div>
                               );
                           })}
                       </div>
                   ))}
               </div>
           )}
       </div>
    </div>
  );
};