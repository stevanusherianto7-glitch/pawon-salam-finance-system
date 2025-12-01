
import React, { useEffect, useState } from 'react';
import { ArrowLeft, ClipboardList, CheckCircle2, User, MessageSquare, Save, X, ChevronRight, AlertCircle } from 'lucide-react';
import { colors } from '../../theme/colors';
import { jobdeskApi, employeeApi } from '../../services/api';
import { JOBDESK_FOH_ITEMS, JOBDESK_BOH_ITEMS, JobdeskSubmission, Employee, EmployeeArea } from '../../types';

interface Props {
    onBack: () => void;
}

export const JobdeskMonitorScreen: React.FC<Props> = ({ onBack }) => {
    const [submissions, setSubmissions] = useState<JobdeskSubmission[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<JobdeskSubmission | null>(null);
    const [feedbackNote, setFeedbackNote] = useState('');
    const [isSavingFeedback, setIsSavingFeedback] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const today = new Date().toISOString().split('T')[0];

            const [subsRes, empsRes] = await Promise.all([
                jobdeskApi.getAllSubmissionsByDate(today),
                employeeApi.getAll()
            ]);

            if (subsRes.success && subsRes.data) setSubmissions(subsRes.data);
            if (empsRes.success && empsRes.data) setEmployees(empsRes.data);

            setLoading(false);
        };

        loadData();
    }, []);

    const handleSelectSubmission = (sub: JobdeskSubmission) => {
        setSelectedSubmission(sub);
        setFeedbackNote(sub.managerNote || '');
    };

    const handleSaveFeedback = async () => {
        if (!selectedSubmission) return;
        setIsSavingFeedback(true);
        const res = await jobdeskApi.giveFeedback(selectedSubmission.id, feedbackNote);
        if (res.success) {
            // Update local state
            setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, managerNote: feedbackNote } : s));
            setSelectedSubmission(null);
            alert('Catatan terkirim ke staff!');
        }
        setIsSavingFeedback(false);
    };

    // Filter employees who should submit jobdesk (Staff only)
    const relevantEmployees = employees.filter(e =>
        (e.role === 'EMPLOYEE' || e.role === 'RESTAURANT_MANAGER') &&
        (e.area === EmployeeArea.FOH || e.area === EmployeeArea.BOH)
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={18} className="text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-bold text-gray-800 text-base leading-tight">Laporan Jobdesk Harian</h2>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">Monitoring & Feedback</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="text-center py-20 text-gray-400 text-xs">Memuat data...</div>
                ) : (
                    <div className="space-y-2.5">
                        {relevantEmployees.map(emp => {
                            const sub = submissions.find(s => s.employeeId === emp.id);
                            const totalTasks = emp.area === 'FOH' ? JOBDESK_FOH_ITEMS.length : JOBDESK_BOH_ITEMS.length;
                            const completed = sub ? sub.completedTaskIds.length : 0;
                            const progress = Math.round((completed / totalTasks) * 100);

                            return (
                                <div
                                    key={emp.id}
                                    onClick={() => sub && handleSelectSubmission(sub)}
                                    className={`bg-white p-3 rounded-xl border shadow-sm transition-all ${sub ? 'active:scale-98 cursor-pointer border-gray-100' : 'opacity-70 border-gray-100'}`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <img src={emp.avatarUrl} className="w-9 h-9 rounded-full bg-gray-200 object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-800 text-xs">{emp.name}</h4>
                                                {sub ? (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${progress === 100 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {progress}%
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Belum Lapor</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500">{emp.area} Staff</p>

                                            {sub && (
                                                <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                                                    <div className={`h-full rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`} style={{ width: `${progress}%` }}></div>
                                                </div>
                                            )}

                                            {sub?.managerNote && (
                                                <div className="mt-1.5 flex items-center gap-1 text-[9px] text-blue-600 font-medium">
                                                    <MessageSquare size={9} /> Ada catatan manager
                                                </div>
                                            )}
                                        </div>
                                        {sub && <ChevronRight size={14} className="text-gray-300" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FEEDBACK MODAL */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Detail Laporan</h3>
                            <button onClick={() => setSelectedSubmission(null)} className="p-1 rounded-full hover:bg-gray-200"><X size={20} className="text-gray-500" /></button>
                        </div>

                        <div className="p-4 overflow-y-auto">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><ClipboardList size={16} /></div>
                                <div>
                                    <p className="text-[10px] text-gray-500">Total Selesai</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedSubmission.completedTaskIds.length} Tugas</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 mb-5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase">Catatan / Feedback Manager</label>
                                <textarea
                                    className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 transition-all"
                                    rows={3}
                                    placeholder="Berikan apresiasi atau catatan perbaikan..."
                                    value={feedbackNote}
                                    onChange={e => setFeedbackNote(e.target.value)}
                                />
                                <p className="text-[9px] text-gray-400 italic">*Catatan ini akan tampil di dashboard karyawan.</p>
                            </div>

                            <button
                                onClick={handleSaveFeedback}
                                disabled={isSavingFeedback}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-1.5 text-xs"
                            >
                                {isSavingFeedback ? 'Menyimpan...' : <><Save size={16} /> Kirim Catatan</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};