import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { usePerformanceStore } from '../../store/performanceStore';
import { colors } from '../../theme/colors';
import { 
    ArrowLeft, Save, User, CheckSquare, AlertCircle, 
    FileText, ClipboardList 
} from 'lucide-react';
import { 
    CHECKLIST_ITEMS_GENERAL, CHECKLIST_ITEMS_KITCHEN, CHECKLIST_ITEMS_WAITER, 
    ChecklistItemResult, ChecklistItemDef, EmployeeArea, DailyChecklistData, DailyPerformanceSnapshot
} from '../../types';
import { computeOverallScore, getScoreColor, getScoreLabel } from '../../utils/scoreUtils';

interface Props {
  employeeId: string;
  date: string;
  onBack: () => void;
}

export const DailyChecklistFormScreen: React.FC<Props> = ({ employeeId, date, onBack }) => {
  const { employees } = useEmployeeStore();
  const { fetchDailySnapshot, currentSnapshot, updateDailySnapshot, isLoading } = usePerformanceStore();
  
  const employee = employees.find(e => e.id === employeeId);
  
  // Form State
  const [results, setResults] = useState<Record<string, ChecklistItemResult>>({});
  const [overallComment, setOverallComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed Recap State
  const [recap, setRecap] = useState({
      sumGeneral: 0,
      countGeneral: 0,
      avgGeneral: 0,
      
      sumSpecific: 0,
      countSpecific: 0,
      avgSpecific: 0,

      sumTotal: 0,
      avgTotal: 0
  });

  useEffect(() => {
    if (employeeId && date) {
        // In a real implementation, fetchDailySnapshot(employeeId, date) would load existing data
        // For prototype, we fetch 'today' or rely on store state if matched
        fetchDailySnapshot(employeeId); 
    }
  }, [employeeId, date]);

  // Determine Questions based on Area
  const specificItems = employee?.area === EmployeeArea.BOH ? CHECKLIST_ITEMS_KITCHEN : CHECKLIST_ITEMS_WAITER;
  const allItems = [...CHECKLIST_ITEMS_GENERAL, ...specificItems];

  // Load existing data if available
  useEffect(() => {
    if (currentSnapshot?.dailyChecklist) {
        setResults(currentSnapshot.dailyChecklist.items || {});
        setOverallComment(currentSnapshot.dailyChecklist.summary?.overallComment || '');
    } else {
        // Initialize empty form
        const initial: Record<string, ChecklistItemResult> = {};
        allItems.forEach(item => {
            initial[item.key] = { checked: false, score: 0, notes: '' };
        });
        setResults(initial);
    }
  }, [currentSnapshot, employee]);

  // Auto Calculate Recap
  useEffect(() => {
      let sumGen = 0, countGen = 0;
      let sumSpec = 0, countSpec = 0;

      // General Section Calc
      CHECKLIST_ITEMS_GENERAL.forEach(item => {
          const res = results[item.key];
          if (res && res.score > 0) {
              sumGen += res.score;
              countGen++;
          }
      });

      // Specific Section Calc
      specificItems.forEach(item => {
          const res = results[item.key];
          if (res && res.score > 0) {
              sumSpec += res.score;
              countSpec++;
          }
      });

      const avgGeneral = countGen > 0 ? parseFloat((sumGen / countGen).toFixed(1)) : 0;
      const avgSpecific = countSpec > 0 ? parseFloat((sumSpec / countSpec).toFixed(1)) : 0;
      
      // Total Calculations
      const sumTotal = sumGen + sumSpec;
      const totalCount = countGen + countSpec;
      const avgTotal = totalCount > 0 ? parseFloat((sumTotal / totalCount).toFixed(1)) : 0;

      setRecap({
          sumGeneral: sumGen,
          countGeneral: countGen,
          avgGeneral,
          sumSpecific: sumSpec,
          countSpecific: countSpec,
          avgSpecific,
          sumTotal,
          avgTotal
      });

  }, [results]);

  if (!employee) return <div className="p-8 text-center text-gray-500">Memuat data karyawan...</div>;

  const handleResultChange = (key: string, field: keyof ChecklistItemResult, value: any) => {
      setResults(prev => ({
          ...prev,
          [key]: { ...prev[key], [field]: value }
      }));
  };

  const handleSubmit = async (finalize: boolean) => {
      setIsSubmitting(true);
      
      const checklistData: DailyChecklistData = {
          items: results,
          summary: {
              totalScoreUmum: recap.sumGeneral,
              avgScoreUmum: recap.avgGeneral,
              totalScoreKhusus: recap.sumSpecific,
              avgScoreKhusus: recap.avgSpecific,
              totalScoreAll: recap.sumTotal,
              avgScoreAll: recap.avgTotal,
              overallComment
          },
          isFinalized: finalize
      };

      const updates: Partial<DailyPerformanceSnapshot> = {
          dailyChecklist: checklistData,
          // Sync legacy fields for dashboard widgets
          punctualityScore: recap.avgTotal, 
          status: finalize ? 'FINALIZED' : 'REVIEWED',
          summaryComment: overallComment
      };

      await updateDailySnapshot(employeeId, date, updates);
      setIsSubmitting(false);
      alert(finalize ? 'Checklist berhasil difinalisasi!' : 'Draft berhasil disimpan.');
      onBack();
  };

  const renderSection = (title: string, items: ChecklistItemDef[]) => (
      <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
             <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
             <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">{title}</h3>
          </div>
          <div className="space-y-3">
              {items.map(item => {
                  const res = results[item.key] || { checked: false, score: 0, notes: '' };
                  return (
                      <div key={item.key} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                          <div className="flex items-start gap-3 mb-3">
                              {/* Checkbox */}
                              <button 
                                onClick={() => handleResultChange(item.key, 'checked', !res.checked)}
                                className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${res.checked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
                              >
                                  {res.checked && <CheckSquare size={16} className="text-white" />}
                              </button>
                              
                              {/* Labels */}
                              <div className="flex-1">
                                  <p className="font-bold text-sm text-gray-800">{item.label}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 leading-tight">{item.description}</p>
                              </div>

                              {/* Current Score Display */}
                              <div className="text-right font-bold text-lg min-w-[24px]" style={{ color: getScoreColor(res.score) }}>
                                  {res.score > 0 ? res.score : '-'}
                              </div>
                          </div>

                          {/* Score Selector (Segmented) */}
                          <div className="flex gap-1 mb-3 bg-gray-50 p-1 rounded-lg">
                              {[1, 2, 3, 4, 5].map(num => (
                                  <button
                                    key={num}
                                    onClick={() => {
                                        handleResultChange(item.key, 'score', num);
                                        if (!res.checked) handleResultChange(item.key, 'checked', true);
                                    }}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${res.score === num ? 'bg-white text-orange-600 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                                    style={res.score === num ? { color: colors.primary } : {}}
                                  >
                                      {num}
                                  </button>
                              ))}
                          </div>

                          {/* Notes */}
                          <input 
                            type="text"
                            placeholder="Catatan (opsional)"
                            value={res.notes}
                            onChange={(e) => handleResultChange(item.key, 'notes', e.target.value)}
                            className="w-full text-xs py-2.5 px-3 bg-gray-50 rounded-lg border border-transparent focus:bg-white focus:border-orange-300 outline-none transition-colors"
                          />
                      </div>
                  )
              })}
          </div>
      </div>
  );

  return (
    <div className="bg-gray-50 pb-24">
       {/* Header */}
       <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-4">
          <div className="flex items-center gap-3">
             <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                 <ArrowLeft size={20} className="text-gray-600"/>
             </button>
             <div className="flex-1">
                 <h2 className="font-bold text-gray-800 text-lg leading-tight">Checklist Harian</h2>
                 <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                    <User size={12}/> {employee.name} • {date}
                 </p>
             </div>
             <div className="text-right bg-orange-50 px-2 py-1 rounded-lg">
                 <p className="text-[9px] text-orange-400 uppercase font-bold">Total Rata-Rata</p>
                 <p className="text-xl font-bold leading-none text-orange-600">{recap.avgTotal}</p>
             </div>
          </div>
       </div>

       <div className="p-4 max-w-lg mx-auto space-y-6">
           
           {/* Section A */}
           {renderSection('A. Penilaian Umum', CHECKLIST_ITEMS_GENERAL)}

           {/* Section B */}
           {renderSection(`B. Penilaian Khusus - ${employee.area === 'BOH' ? 'Kitchen Staff' : 'Waiter'}`, specificItems)}

           {/* Recap Section C */}
           <div className="bg-white rounded-2xl border border-orange-200 shadow-lg overflow-hidden">
               <div className="bg-gradient-to-r from-orange-50 to-white px-5 py-3 border-b border-orange-100 flex items-center gap-2">
                   <ClipboardList size={18} className="text-orange-600" />
                   <h3 className="font-bold text-orange-900 text-sm">C. Rekap Nilai Akhir</h3>
               </div>
               
               <div className="p-5 space-y-5">
                   {/* Score Grid */}
                   <div className="grid grid-cols-3 gap-3 text-center">
                       <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                           <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Rata-rata Umum</p>
                           <p className="text-lg font-bold text-gray-800">{recap.avgGeneral}</p>
                           <p className="text-[9px] text-gray-400">Total: {recap.sumGeneral}</p>
                       </div>
                       <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                           <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Rata-rata Khusus</p>
                           <p className="text-lg font-bold text-gray-800">{recap.avgSpecific}</p>
                           <p className="text-[9px] text-gray-400">Total: {recap.sumSpecific}</p>
                       </div>
                       <div className="p-2 rounded-xl bg-orange-50 border border-orange-100">
                           <p className="text-[10px] text-orange-600 uppercase font-bold mb-1">Total Akhir</p>
                           <p className="text-2xl font-bold text-orange-600">{recap.avgTotal}</p>
                           <p className="text-[9px] text-orange-400 font-bold">{getScoreLabel(recap.avgTotal)}</p>
                       </div>
                   </div>
                   
                   {/* Comment Field */}
                   <div>
                       <label className="text-xs font-bold text-gray-700 mb-2 block flex items-center gap-1">
                           <FileText size={14} /> Keterangan / Komentar Manager
                       </label>
                       <textarea 
                         rows={3}
                         value={overallComment}
                         onChange={(e) => setOverallComment(e.target.value)}
                         className="w-full p-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                         placeholder="Tulis kesimpulan performa hari ini..."
                       />
                   </div>
               </div>
           </div>

           {/* Action Buttons */}
           <div className="flex gap-3 pt-4 pb-8">
              <button 
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95"
              >
                  Simpan Draft
              </button>
              <button 
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                  <Save size={18} /> Finalisasi
              </button>
           </div>

       </div>
    </div>
  );
};
