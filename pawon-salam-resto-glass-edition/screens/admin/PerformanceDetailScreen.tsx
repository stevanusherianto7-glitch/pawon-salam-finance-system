

import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { usePerformanceStore } from '../../store/performanceStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, Calendar, TrendingUp, Star, CheckSquare, Clock, ChevronDown, ChevronUp, User } from 'lucide-react';
import { computeOverallScore, getScoreColor, getScoreLabel } from '../../utils/scoreUtils';

interface Props {
   employeeId: string;
   onBack: () => void;
}

export const PerformanceDetailScreen: React.FC<Props> = ({ employeeId, onBack }) => {
   const { employees, fetchEmployees } = useEmployeeStore();
   const { reviews, snapshotHistory, fetchReviews, fetchSnapshotHistory, isLoading } = usePerformanceStore();

   const [activeTab, setActiveTab] = useState<'REVIEWS' | 'DAILY'>('REVIEWS');
   const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

   // Date Filter
   const today = new Date();
   const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
   const [selectedYear, setSelectedYear] = useState(today.getFullYear());

   // Get Employee Data
   const employee = employees.find(e => e.id === employeeId);

   useEffect(() => {
      if (!employee) fetchEmployees();
      fetchReviews(employeeId);
      fetchSnapshotHistory(employeeId);
   }, [employeeId]);

   if (!employee) return <div className="p-8 text-center">Memuat data karyawan...</div>;

   // Filtering Logic
   const filteredReviews = reviews.filter(r => r.periodMonth === selectedMonth && r.periodYear === selectedYear);
   const filteredSnapshots = snapshotHistory
      .filter(s => {
         const d = new Date(s.date);
         return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending

   const getMonthName = (m: number) => {
      return new Date(2023, m - 1, 1).toLocaleString('id-ID', { month: 'long' });
   };

   return (
      <div className="bg-gray-50 pb-24">
         {/* Header */}
         <div className="pt-8 pb-10 px-4 rounded-b-[2rem] shadow-md relative z-0" style={{ background: colors.gradientMain }}>
            <div className="flex items-center gap-3 mb-3 text-white">
               <button onClick={onBack} className="p-1.5 bg-white/20 rounded-full hover:bg-white/30">
                  <ArrowLeft size={18} />
               </button>
               <div className="flex-1">
                  <h2 className="text-lg font-bold">Detail Performa</h2>
                  <p className="text-orange-100 text-xs opacity-90">Monitor kinerja & evaluasi</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <img src={employee.avatarUrl} className="w-12 h-12 rounded-full border-2 border-white bg-gray-200" alt={employee.name} />
               <div className="text-white">
                  <h3 className="font-bold text-base leading-none mb-1">{employee.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-orange-100">
                     <span className="bg-white/20 px-1.5 py-0.5 rounded flex items-center gap-1"><User size={9} /> {employee.department}</span>
                     <span className="bg-white/20 px-1.5 py-0.5 rounded font-bold">{employee.area}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Filter & Tabs Container */}
         <div className="px-4 -mt-5 relative z-10">
            <div className="bg-white rounded-2xl shadow-lg p-1.5 mb-3 border border-orange-50">
               {/* Month Selector */}
               <div className="flex justify-between items-center p-1.5 mb-1.5 border-b border-gray-100">
                  <button
                     onClick={() => setSelectedMonth(prev => prev === 1 ? 12 : prev - 1)}
                     className="p-1 rounded-full hover:bg-gray-100"
                  >
                     <ChevronDown className="rotate-90" size={16} />
                  </button>
                  <div className="flex items-center gap-1.5">
                     <Calendar size={14} className="text-orange-500" />
                     <span className="font-bold text-gray-700 text-xs">{getMonthName(selectedMonth)} {selectedYear}</span>
                  </div>
                  <button
                     onClick={() => setSelectedMonth(prev => prev === 12 ? 1 : prev + 1)}
                     className="p-1 rounded-full hover:bg-gray-100"
                  >
                     <ChevronDown className="-rotate-90" size={16} />
                  </button>
               </div>

               {/* Tabs */}
               <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                     onClick={() => setActiveTab('REVIEWS')}
                     className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex justify-center items-center gap-1.5 ${activeTab === 'REVIEWS' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                  >
                     <Star size={12} /> Evaluasi Bulanan
                  </button>
                  <button
                     onClick={() => setActiveTab('DAILY')}
                     className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all flex justify-center items-center gap-1.5 ${activeTab === 'DAILY' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                  >
                     <TrendingUp size={12} /> Monitoring Harian
                  </button>
               </div>
            </div>

            {/* Content Area */}
            <div className="space-y-3">
               {isLoading && <div className="text-center py-8 text-gray-400">Memuat data...</div>}

               {/* --- REVIEWS TAB --- */}
               {!isLoading && activeTab === 'REVIEWS' && (
                  filteredReviews.length === 0 ? (
                     <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Star className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Belum ada evaluasi bulan ini.</p>
                     </div>
                  ) : (
                     filteredReviews.map(review => (
                        <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                           <div
                              className="p-4 flex justify-between items-center cursor-pointer bg-orange-50/50"
                              onClick={() => setExpandedReviewId(expandedReviewId === review.id ? null : review.id)}
                           >
                              <div>
                                 <p className="text-xs font-bold text-gray-500 mb-1">Periode {getMonthName(review.periodMonth)}</p>
                                 <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${review.isFinalized ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                       {review.isFinalized ? 'Final' : 'Draft'}
                                    </span>
                                    <span className="text-xs text-gray-400">Dibuat {new Date(review.createdAt).toLocaleDateString('id-ID')}</span>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="text-2xl font-bold" style={{ color: getScoreColor(review.overallScore) }}>{review.overallScore}</span>
                                 <p className="text-[9px] text-gray-400 uppercase font-bold">Skor Akhir</p>
                              </div>
                           </div>

                           {expandedReviewId === review.id && (
                              <div className="p-4 border-t border-dashed border-orange-100 animate-fade-in bg-white">
                                 <p className="text-xs font-bold text-gray-600 mb-2">Catatan Manager:</p>
                                 <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg mb-3">"{review.overallComment}"</p>

                                 {/* Indicator Breakdown (Simplified) */}
                                 <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(review.scores).slice(0, 4).map(([key, score]) => (
                                       <div key={key} className="flex justify-between items-center text-xs border-b border-gray-50 pb-1">
                                          <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                                          <span className="font-bold" style={{ color: getScoreColor(score as number) }}>{score as number}</span>
                                       </div>
                                    ))}
                                    {Object.keys(review.scores).length > 4 && (
                                       <div className="col-span-2 text-center text-[10px] text-gray-400 mt-1">...dan {Object.keys(review.scores).length - 4} indikator lainnya</div>
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                     ))
                  )
               )}

               {/* --- DAILY TAB --- */}
               {!isLoading && activeTab === 'DAILY' && (
                  filteredSnapshots.length === 0 ? (
                     <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                        <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">Belum ada data harian.</p>
                     </div>
                  ) : (
                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-12 gap-1.5 bg-gray-50 p-2 text-[9px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                           <div className="col-span-3">Tanggal</div>
                           <div className="col-span-3 text-center">Disiplin</div>
                           <div className="col-span-3 text-center">Checklist</div>
                           <div className="col-span-3 text-right">Status</div>
                        </div>
                        {filteredSnapshots.map(snap => {
                           const checklistAvg = snap.checklistScores ? computeOverallScore(snap.checklistScores) : null;
                           const hasChecklist = !!snap.checklistScores;
                           const dateObj = new Date(snap.date);

                           return (
                              <div key={snap.id} className="grid grid-cols-12 gap-1.5 p-2 border-b border-gray-50 items-center hover:bg-gray-50 transition-colors">
                                 <div className="col-span-3">
                                    <p className="text-[10px] font-bold text-gray-800">{dateObj.getDate()}</p>
                                    <p className="text-[8px] text-gray-400">{dateObj.toLocaleDateString('id-ID', { month: 'short' })}</p>
                                 </div>
                                 <div className="col-span-3 text-center">
                                    <span className={`font-bold text-[10px] px-1.5 py-0.5 rounded ${getScoreColor(snap.punctualityScore) === '#ef4444' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                       {snap.punctualityScore}
                                    </span>
                                 </div>
                                 <div className="col-span-3 text-center">
                                    {hasChecklist ? (
                                       <div className="flex flex-col items-center">
                                          <span className="font-bold text-[10px] text-blue-600">{checklistAvg}</span>
                                          <CheckSquare size={8} className="text-blue-400 mt-0.5" />
                                       </div>
                                    ) : (
                                       <span className="text-[8px] text-gray-300">-</span>
                                    )}
                                 </div>
                                 <div className="col-span-3 text-right">
                                    <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${snap.status === 'AUTO_GENERATED' ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                       {snap.status === 'AUTO_GENERATED' ? 'Auto' : 'Review'}
                                    </span>
                                 </div>
                              </div>
                           )
                        })}
                     </div>
                  )
               )}

            </div>
         </div>
      </div>
   );
};
