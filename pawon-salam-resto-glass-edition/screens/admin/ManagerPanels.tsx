
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, Utensils, Megaphone, FileText, Calendar, Clock, ChevronRight, ClipboardList, Banknote, CheckSquare, AlertCircle } from 'lucide-react';
import { colors } from '../../theme/colors';
import { performanceApi, jobdeskApi } from '../../services/api';
import { SalarySlip } from '../../types';

interface PanelProps {
    onBack: () => void;
    onNavigate?: (screen: string) => void;
}

const PanelHeader = ({ title, icon: Icon, onBack }: { title: string, icon: any, onBack: () => void }) => (
    <div className="pt-12 pb-10 px-6 rounded-b-[2.5rem] shadow-sm relative z-0 mb-6 overflow-hidden" style={{ background: colors.gradientMain }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
        <div className="flex items-center gap-3 text-white relative z-10">
            <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"><ArrowLeft size={20} /></button>
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><Icon size={18} /></div>
                <h2 className="text-lg font-bold">{title}</h2>
            </div>
        </div>
    </div>
);

// Reusable Action Card for Bento Grid
const ActionCard = ({ onClick, icon: Icon, title, subtitle, colorClass }: any) => (
    <button onClick={onClick} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start gap-2 active:scale-95 transition-all hover:shadow-md h-full">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10`}>
            <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div className="text-left">
            <h4 className="font-bold text-sm text-gray-800 leading-tight">{title}</h4>
            <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
    </button>
);

export const HRPanel: React.FC<PanelProps> = ({ onBack, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'SP' | 'SALARY'>('SP');
    const [type, setType] = useState('SP1');
    const [desc, setDesc] = useState('');
    const [empName, setEmpName] = useState('');
    const [salaryForm, setSalaryForm] = useState<Partial<SalarySlip>>({
        employeeName: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        basicSalary: 0, allowances: 0, deductions: 0, totalSalary: 0
    });

    useEffect(() => {
        const basic = Number(salaryForm.basicSalary) || 0;
        const allow = Number(salaryForm.allowances) || 0;
        const deduct = Number(salaryForm.deductions) || 0;
        setSalaryForm(prev => ({ ...prev, totalSalary: basic + allow - deduct }));
    }, [salaryForm.basicSalary, salaryForm.allowances, salaryForm.deductions]);

    const handleSaveSP = async () => {
        await performanceApi.saveHRRecord({ type, desc, empName });
        alert('Catatan HR Tersimpan'); setEmpName(''); setDesc('');
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="HR Manager" icon={Users} onBack={onBack} />
            <div className="px-4 space-y-4 -mt-8 relative z-10">
                {/* Shift Shortcut */}
                <div className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between cursor-pointer active:scale-98" onClick={() => onNavigate && onNavigate('shiftScheduler')}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                        <div><h3 className="font-bold text-sm text-gray-800">Jadwal Shift</h3><p className="text-[10px] text-gray-500">Monitoring Staff</p></div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300" />
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => setActiveTab('SP')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'SP' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400'}`}>Input SP/Coaching</button>
                    <button onClick={() => setActiveTab('SALARY')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'SALARY' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400'}`}>Input Gaji</button>
                </div>

                {activeTab === 'SP' ? (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        <input type="text" placeholder="Nama Karyawan" className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-orange-200" value={empName} onChange={e => setEmpName(e.target.value)} />
                        <select className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm outline-none" value={type} onChange={e => setType(e.target.value)}>
                            <option value="SP1">Surat Peringatan 1</option>
                            <option value="SP2">Surat Peringatan 2</option>
                            <option value="COACHING">Coaching</option>
                        </select>
                        <textarea rows={3} placeholder="Keterangan..." className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm outline-none resize-none" value={desc} onChange={e => setDesc(e.target.value)} />
                        <button onClick={handleSaveSP} className="w-full py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg active:scale-95">Simpan</button>
                    </div>
                ) : (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                        <input type="text" placeholder="Nama Karyawan" className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm" value={salaryForm.employeeName} onChange={e => setSalaryForm({ ...salaryForm, employeeName: e.target.value })} />
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" placeholder="Gaji Pokok" className="p-3 bg-gray-50 border-none rounded-xl text-sm" onChange={e => setSalaryForm({ ...salaryForm, basicSalary: parseFloat(e.target.value) })} />
                            <input type="number" placeholder="Tunjangan" className="p-3 bg-gray-50 border-none rounded-xl text-sm" onChange={e => setSalaryForm({ ...salaryForm, allowances: parseFloat(e.target.value) })} />
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl flex justify-between items-center"><span className="text-xs font-bold text-green-700">Total</span><span className="font-bold text-green-700">Rp {salaryForm.totalSalary?.toLocaleString('id-ID')}</span></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const RestoPanel: React.FC<PanelProps> = ({ onBack, onNavigate }) => {
    const [sales, setSales] = useState('');
    const [notes, setNotes] = useState('');
    const [jobdeskStats, setJobdeskStats] = useState({ fohCount: 0, bohCount: 0 });

    useEffect(() => {
        const loadStats = async () => {
            const today = new Date().toISOString().split('T')[0];
            const res = await jobdeskApi.getAllSubmissionsByDate(today);
            if (res.success && res.data) {
                setJobdeskStats({
                    fohCount: res.data.filter(s => s.area === 'FOH').length,
                    bohCount: res.data.filter(s => s.area === 'BOH').length
                });
            }
        };
        loadStats();
    }, []);

    const handleSave = async () => {
        await performanceApi.saveOperationalReport({ sales, notes });
        alert('Laporan Tersimpan'); onBack();
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="Restaurant Manager" icon={Utensils} onBack={onBack} />
            <div className="px-4 space-y-4 -mt-8 relative z-10">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-blue-500 uppercase mb-1">Jobdesk FOH</span>
                        <span className="text-2xl font-bold text-gray-800">{jobdeskStats.fohCount}</span>
                    </div>
                    <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-orange-500 uppercase mb-1">Jobdesk BOH</span>
                        <span className="text-2xl font-bold text-gray-800">{jobdeskStats.bohCount}</span>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <ActionCard
                        onClick={() => onNavigate && onNavigate('dailyChecklistList')}
                        icon={ClipboardList} title="Checklist" subtitle="Daily Performance" colorClass="bg-orange-500 text-white"
                    />
                    <ActionCard
                        onClick={() => onNavigate && onNavigate('shiftScheduler')}
                        icon={Clock} title="Shift" subtitle="Scheduling" colorClass="bg-blue-500 text-white"
                    />
                </div>

                {/* Report Form */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-sm text-gray-800 mb-3">Laporan Omzet Harian</h3>
                    <div className="space-y-3">
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 text-xs font-bold">Rp</span>
                            <input type="number" placeholder="0" className="w-full pl-8 p-2.5 bg-gray-50 border-none rounded-xl text-sm outline-none focus:ring-1 focus:ring-orange-200" value={sales} onChange={e => setSales(e.target.value)} />
                        </div>
                        <textarea rows={2} placeholder="Catatan operasional..." className="w-full p-3 bg-gray-50 border-none rounded-xl text-sm outline-none resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
                        <button onClick={handleSave} className="w-full py-3 bg-orange-500 text-white font-bold rounded-xl shadow-lg active:scale-95 text-xs">Kirim Laporan</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FinancePanel: React.FC<PanelProps> = ({ onBack }) => {
    const [bonus, setBonus] = useState('');
    const [empName, setEmpName] = useState('');

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="Finance" icon={Banknote} onBack={onBack} />
            <div className="px-4 space-y-4 -mt-8 relative z-10">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-sm">Input Insentif / Lembur</h3>
                    <div className="space-y-3">
                        <input type="text" placeholder="Nama Karyawan" className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none outline-none" value={empName} onChange={e => setEmpName(e.target.value)} />
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-400 text-xs">Rp</span>
                            <input type="number" placeholder="Nominal" className="w-full p-3 pl-8 bg-gray-50 rounded-xl text-sm border-none outline-none" value={bonus} onChange={e => setBonus(e.target.value)} />
                        </div>
                        <button onClick={() => { alert('Saved'); onBack(); }} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl shadow-lg active:scale-95 text-sm">Simpan Data</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MarketingPanel: React.FC<PanelProps> = ({ onBack }) => {
    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="Marketing" icon={Megaphone} onBack={onBack} />
            <div className="px-4 space-y-4 -mt-8 relative z-10">
                <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div><p className="text-xs text-purple-600 font-bold uppercase">Engagement</p><h3 className="text-2xl font-bold text-purple-800">4.2%</h3></div>
                    <div><p className="text-xs text-purple-600 font-bold uppercase">Reach</p><h3 className="text-2xl font-bold text-purple-800">45K</h3></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 text-sm">New Campaign</h3>
                    <input type="text" placeholder="Nama Campaign" className="w-full p-3 bg-gray-50 rounded-xl text-sm border-none outline-none mb-3" />
                    <button onClick={() => { alert('Saved'); onBack(); }} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95 text-sm">Simpan</button>
                </div>
            </div>
        </div>
    );
};
