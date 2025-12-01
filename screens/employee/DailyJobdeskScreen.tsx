import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePerformanceStore } from '../../store/performanceStore';
import { colors } from '../../theme/colors';
import { ArrowLeft, CheckSquare, Save, CheckCircle2, ClipboardList } from 'lucide-react';
import { EmployeeArea, JOBDESK_FOH_ITEMS, JOBDESK_BOH_ITEMS, JobdeskSubmission } from '../../types';

interface Props {
  onBack: () => void;
}

export const DailyJobdeskScreen: React.FC<Props> = ({ onBack }) => {
  const { user } = useAuthStore();
  const { currentJobdesk, fetchJobdesk, saveJobdesk, isLoading } = usePerformanceStore();
  
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Determine Tasks based on Category
  const getTasks = () => {
      if (user?.area === EmployeeArea.FOH) return JOBDESK_FOH_ITEMS;
      if (user?.area === EmployeeArea.BOH) return JOBDESK_BOH_ITEMS;
      return [];
  };

  const tasks = getTasks();
  const hasTasks = tasks.length > 0;

  // Load initial data
  useEffect(() => {
      if (user) {
          fetchJobdesk(user.id);
      }
  }, [user]);

  // Sync local state with store
  useEffect(() => {
      if (currentJobdesk) {
          setCompletedTasks(new Set(currentJobdesk.completedTaskIds));
      } else {
          setCompletedTasks(new Set());
      }
  }, [currentJobdesk]);

  const toggleTask = (taskText: string) => {
      const newSet = new Set(completedTasks);
      if (newSet.has(taskText)) {
          newSet.delete(taskText);
      } else {
          newSet.add(taskText);
      }
      setCompletedTasks(newSet);
  };

  const handleSave = async () => {
      if (!user) return;
      
      setIsSaving(true);
      const submission: JobdeskSubmission = {
          id: currentJobdesk?.id || `jd-${Date.now()}`,
          employeeId: user.id,
          date: new Date().toISOString().split('T')[0],
          area: user.area,
          completedTaskIds: Array.from(completedTasks),
          lastUpdated: new Date().toISOString()
      };

      const success = await saveJobdesk(submission);
      setIsSaving(false);
      
      if (success) {
          alert('Jobdesk berhasil disimpan!');
      } else {
          alert('Gagal menyimpan data.');
      }
  };

  // Calculate Progress
  const progress = tasks.length > 0 ? Math.round((completedTasks.size / tasks.length) * 100) : 0;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
       {/* Header */}
       <div className="pt-8 pb-6 px-6 shadow-md relative z-10 flex-shrink-0" style={{ background: colors.gradientMain }}>
           <div className="flex items-center gap-3 text-white mb-4">
               <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                   <ArrowLeft size={20} />
               </button>
               <div className="flex-1">
                   <h2 className="text-xl font-bold">Daily Jobdesk Staff</h2>
                   <p className="text-white/80 text-xs">
                       Rincian Pekerjaan {user?.area === EmployeeArea.FOH ? 'FOH (Front of House)' : user?.area === EmployeeArea.BOH ? 'BOH (Back of House)' : 'Umum'}
                   </p>
               </div>
           </div>

           {/* Progress Bar */}
           {hasTasks && (
               <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                   <div className="flex justify-between text-xs text-white mb-1 font-bold">
                       <span>Progress Harian</span>
                       <span>{progress}% Selesai</span>
                   </div>
                   <div className="w-full bg-white/30 rounded-full h-2">
                       <div 
                         className="bg-green-400 h-2 rounded-full transition-all duration-500" 
                         style={{ width: `${progress}%` }}
                       ></div>
                   </div>
               </div>
           )}
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto p-4">
           <div className="max-w-2xl mx-auto"> {/* Centered Container with max-width and margins */}
               {!hasTasks ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
                       <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                           <ClipboardList size={32} />
                       </div>
                       <p className="font-bold text-gray-600">Tidak ada jobdesk tersedia.</p>
                       <p className="text-xs mt-1">Role ini tidak memiliki daftar tugas harian spesifik.</p>
                   </div>
               ) : (
                   <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                       <div className="p-4 bg-gray-50 border-b border-gray-100">
                           <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                               <CheckSquare size={16} className="text-orange-600"/> Daftar Tugas
                           </h3>
                       </div>
                       
                       <div className="divide-y divide-gray-100">
                           {tasks.map((task, idx) => {
                               const isChecked = completedTasks.has(task);
                               return (
                                   <label 
                                     key={idx} 
                                     className={`flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${isChecked ? 'bg-green-50/30' : ''}`}
                                   >
                                       <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
                                           {isChecked && <CheckCircle2 size={14} className="text-white" />}
                                       </div>
                                       <input 
                                         type="checkbox" 
                                         className="hidden" 
                                         checked={isChecked} 
                                         onChange={() => toggleTask(task)}
                                       />
                                       <span className={`text-sm leading-relaxed text-justify ${isChecked ? 'text-gray-500 line-through decoration-gray-300' : 'text-gray-700'}`}>
                                           {task}
                                       </span>
                                   </label>
                               );
                           })}
                       </div>
                   </div>
               )}
           </div>
       </div>

       {/* Footer Action */}
       {hasTasks && (
           <div className="p-4 bg-white border-t border-gray-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
               <button 
                 onClick={handleSave}
                 disabled={isSaving || isLoading}
                 className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2"
                 style={{ background: colors.gradientMain }}
               >
                   {isSaving ? 'Menyimpan...' : <><Save size={18} /> Simpan Checklist</>}
               </button>
           </div>
       )}
    </div>
  );
};