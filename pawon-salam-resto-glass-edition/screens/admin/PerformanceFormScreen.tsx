

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePerformanceStore } from '../../store/performanceStore';
import { useEmployeeStore } from '../../store/employeeStore';
import { ArrowLeft, Save, User, AlertCircle } from 'lucide-react';
import { BOH_INDICATORS, Employee, EmployeeArea, FOH_INDICATORS, PerformanceReview } from '../../types';
import { computeOverallScore, getScoreColor, getScoreLabel } from '../../utils/scoreUtils';

interface Props {
    employeeId: string;
    onBack: () => void;
}

export const PerformanceFormScreen: React.FC<Props> = ({ employeeId, onBack }) => {
    const { user } = useAuthStore(); // The Reviewer (Manager)
    const { saveReview } = usePerformanceStore();
    const { employees, fetchEmployees } = useEmployeeStore();

    const [targetEmployee, setTargetEmployee] = useState<Employee | null>(null);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [overallComment, setOverallComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize Data
    useEffect(() => {
        if (!employees.length) {
            fetchEmployees();
        } else {
            const emp = employees.find(e => e.id === employeeId);
            setTargetEmployee(emp || null);
        }
    }, [employeeId, employees]);

    // Handle Loading Delay/Fetch updates
    useEffect(() => {
        if (employees.length > 0 && !targetEmployee) {
            const emp = employees.find(e => e.id === employeeId);
            setTargetEmployee(emp || null);
        }
    }, [employees, employeeId, targetEmployee]);


    if (!targetEmployee) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    const indicators = targetEmployee.area === EmployeeArea.BOH ? BOH_INDICATORS : FOH_INDICATORS;
    const calculatedScore = computeOverallScore(scores);

    const handleScoreChange = (key: string, val: number) => {
        setScores(prev => ({ ...prev, [key]: val }));
    };

    const handleNoteChange = (key: string, val: string) => {
        setNotes(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async (isFinal: boolean) => {
        if (!targetEmployee || !user) return;

        if (isFinal) {
            // Validation for Finalization
            const missingScores = indicators.filter(ind => !scores[ind.key]);
            if (missingScores.length > 0) {
                alert(`Mohon lengkapi nilai untuk: ${missingScores.map(i => i.label).join(', ')}`);
                return;
            }
            if (!overallComment.trim()) {
                alert('Mohon isi kesimpulan evaluasi.');
                return;
            }
        }

        setIsSubmitting(true);

        const review: PerformanceReview = {
            id: `pr-${Date.now()}`, // Mock ID
            employeeId: targetEmployee.id,
            reviewerId: user.id,
            periodMonth: new Date().getMonth() + 1,
            periodYear: new Date().getFullYear(),
            area: targetEmployee.area,
            scores,
            notes,
            overallScore: calculatedScore,
            overallComment,
            isFinalized: isFinal,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const success = await saveReview(review);
        setIsSubmitting(false);

        if (success) {
            alert(isFinal ? 'Review berhasil difinalisasi!' : 'Draft berhasil disimpan.');
            onBack();
        } else {
            alert('Gagal menyimpan review.');
        }
    };

    return (
        <div className="bg-gray-50 pb-24">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={18} className="text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <h2 className="font-bold text-gray-800 text-base leading-tight">Form Evaluasi</h2>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                            <User size={10} /> {targetEmployee.name} • <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[9px] font-bold">{targetEmployee.area}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-gray-400 uppercase font-bold">Skor Saat Ini</p>
                        <p className="text-lg font-bold leading-none" style={{ color: getScoreColor(calculatedScore) }}>{calculatedScore}</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto">

                {/* Intro Alert */}
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 flex gap-2.5 items-start">
                    <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-xs font-bold text-blue-700">Petunjuk Pengisian</h4>
                        <p className="text-[10px] text-blue-600 mt-0.5 leading-relaxed">
                            Berikan nilai 1-5 untuk setiap indikator kinerja. Tambahkan catatan khusus jika nilai di bawah 3 atau di atas 4.
                        </p>
                    </div>
                </div>

                {/* Indicators Loop */}
                <div className="space-y-3">
                    {indicators.map((ind) => (
                        <div key={ind.key} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-2.5">
                                <label className="font-bold text-xs text-gray-700 flex-1 mr-4">{ind.label}</label>
                                <div className="text-[10px] font-mono text-gray-400">{scores[ind.key] ? getScoreLabel(scores[ind.key]) : '-'}</div>
                            </div>

                            {/* Score Buttons */}
                            <div className="flex justify-between bg-gray-50 rounded-xl p-1 mb-2.5">
                                {[1, 2, 3, 4, 5].map(num => {
                                    const isSelected = scores[ind.key] === num;
                                    let bgClass = 'hover:bg-gray-200 text-gray-400';
                                    if (isSelected) {
                                        if (num <= 2) bgClass = 'bg-red-500 text-white shadow-md';
                                        else if (num === 3) bgClass = 'bg-orange-400 text-white shadow-md';
                                        else bgClass = 'bg-green-500 text-white shadow-md';
                                    }

                                    return (
                                        <button
                                            key={num}
                                            onClick={() => handleScoreChange(ind.key, num)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all active:scale-95 ${bgClass}`}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Notes Input */}
                            <input
                                type="text"
                                placeholder="Tambahkan catatan (opsional)..."
                                className="w-full text-[10px] py-2 px-2.5 bg-gray-50 rounded-lg border border-transparent focus:bg-white focus:border-orange-300 outline-none transition-all"
                                value={notes[ind.key] || ''}
                                onChange={(e) => handleNoteChange(ind.key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                {/* Overall Summary */}
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500"></div>
                    <h3 className="font-bold text-gray-800 mb-2.5 flex items-center gap-1.5 text-xs">
                        <Save size={16} className="text-orange-500" /> Kesimpulan Akhir
                    </h3>

                    <div className="flex items-center justify-between mb-3 p-2.5 bg-orange-50 rounded-xl border border-orange-100">
                        <span className="text-xs font-medium text-orange-800">Total Nilai Rata-rata</span>
                        <div className="text-right">
                            <span className="text-xl font-bold block" style={{ color: getScoreColor(calculatedScore) }}>{calculatedScore}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">{getScoreLabel(calculatedScore)}</span>
                        </div>
                    </div>

                    <textarea
                        className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-orange-500 min-h-[80px] resize-none"
                        placeholder="Tuliskan rangkuman kinerja karyawan pada periode ini..."
                        value={overallComment}
                        onChange={e => setOverallComment(e.target.value)}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-3">
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 text-xs"
                    >
                        Simpan Draft
                    </button>
                    <button
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-200 active:scale-95 transition-all disabled:opacity-50 flex justify-center items-center gap-1.5 text-xs"
                    >
                        {isSubmitting ? 'Menyimpan...' : 'Finalisasi Review'}
                    </button>
                </div>

            </div>
        </div>
    );
};
