
import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, Utensils, Megaphone, FileText, Calendar, Clock, ChevronRight, ClipboardList, Banknote, CheckSquare, AlertCircle, Package, Shield } from 'lucide-react';
import { colors } from '../../theme/colors';
import { performanceApi, jobdeskApi, employeeApi, payrollApi } from '../../services/api';
import { Payslip, Employee } from '../../types';
import { PanelHeader } from '../../components/PanelHeader';

interface PanelProps {
    onBack: () => void;
    onNavigate?: (screen: string) => void;
}



// Reusable Action Card for Bento Grid
const ActionCard = ({ onClick, icon: Icon, title, subtitle, colorClass }: any) => (
    <button onClick={onClick} className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-start gap-2 active:scale-95 transition-all hover:shadow-md h-full">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass} bg-opacity-10`}>
            <Icon size={18} className={colorClass.replace('bg-', 'text-')} />
        </div>
        <div className="text-left">
            <h4 className="font-bold text-xs text-gray-800 leading-tight">{title}</h4>
            <p className="text-[9px] text-gray-400 mt-0.5">{subtitle}</p>
        </div>
    </button>
);

export const HRPanel: React.FC<PanelProps> = ({ onBack, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'SP' | 'SALARY'>('SP');
    const [type, setType] = useState('SP1');
    const [desc, setDesc] = useState('');
    const [selectedEmpId, setSelectedEmpId] = useState('');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [salaryForm, setSalaryForm] = useState<Partial<Payslip>>({
        employeeId: '', periodMonth: new Date().getMonth() + 1, periodYear: new Date().getFullYear(),
        basicSalary: 0, allowanceOther: 0, otherDeductions: 0, totalEarnings: 0
    });

    useEffect(() => {
        const loadEmployees = async () => {
            const res = await employeeApi.getAll();
            if (res.success && res.data) setEmployees(res.data);
        };
        loadEmployees();
    }, []);

    useEffect(() => {
        const basic = Number(salaryForm.basicSalary) || 0;
        const allow = Number(salaryForm.allowanceOther) || 0;
        const deduct = Number(salaryForm.otherDeductions) || 0;
        setSalaryForm(prev => ({ ...prev, totalEarnings: basic + allow - deduct }));
    }, [salaryForm.basicSalary, salaryForm.allowanceOther, salaryForm.otherDeductions]);

    const handleSaveSP = async () => {
        if (!selectedEmpId) return alert("Pilih karyawan dulu");
        const res = await performanceApi.saveHRRecord({ type, desc, empId: selectedEmpId });
        if (res.success) {
            alert(res.message);
            setDesc('');
            setSelectedEmpId('');
        }
    };

    const handleSaveSalary = async () => {
        if (!salaryForm.employeeId) return alert("Pilih karyawan dulu");
        const emp = employees.find(e => e.id === salaryForm.employeeId);

        // Construct full Payslip object
        const newPayslip: Payslip = {
            id: `slip-${Date.now()}`,
            employeeId: salaryForm.employeeId,
            periodMonth: salaryForm.periodMonth || 1,
            periodYear: salaryForm.periodYear || 2025,
            payDate: new Date().toISOString(),
            basicSalary: salaryForm.basicSalary || 0,
            allowanceMeal: 0, allowanceTransport: 0,
            allowanceOther: salaryForm.allowanceOther || 0,
            overtimeHours: 0, overtimeAmount: 0, bonus: 0, commission: 0,
            bpjsKesehatan: 0, bpjsKetenagakerjaan: 0, taxPPh21: 0,
            otherDeductions: salaryForm.otherDeductions || 0,
            totalEarnings: (salaryForm.basicSalary || 0) + (salaryForm.allowanceOther || 0),
            totalDeductions: salaryForm.otherDeductions || 0,
            netSalary: (salaryForm.basicSalary || 0) + (salaryForm.allowanceOther || 0) - (salaryForm.otherDeductions || 0),
            status: 'SENT',
            isVisibleToEmployee: true,
            createdByHrId: 'hr-admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const res = await payrollApi.savePayslip(newPayslip);
        if (res.success) {
            alert(res.message);
            setSalaryForm({ ...salaryForm, basicSalary: 0, allowanceOther: 0, otherDeductions: 0, employeeId: '' });
        }
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="HR Manager" icon={Users} onBack={onBack} />
            <div className="px-4 space-y-3 -mt-6 relative z-10">
                {/* Shift Shortcut */}
                <div className="bg-white p-2.5 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-between cursor-pointer active:scale-98" onClick={() => onNavigate && onNavigate('shiftScheduler')}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><Calendar size={18} /></div>
                        <div><h3 className="font-bold text-xs text-gray-800">Jadwal Shift</h3><p className="text-[9px] text-gray-500">Monitoring Staff</p></div>
                    </div>
                    <ChevronRight size={14} className="text-gray-300" />
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-100">
                    <button onClick={() => setActiveTab('SP')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'SP' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400'}`}>Input SP/Coaching</button>
                    <button onClick={() => setActiveTab('SALARY')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'SALARY' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400'}`}>Input Gaji</button>
                </div>

                {activeTab === 'SP' ? (
                    <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 space-y-2.5">
                        <select
                            className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-orange-200"
                            value={selectedEmpId}
                            onChange={e => setSelectedEmpId(e.target.value)}
                        >
                            <option value="">Pilih Karyawan...</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name} - {e.role}</option>
                            ))}
                        </select>
                        <select className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none" value={type} onChange={e => setType(e.target.value)}>
                            <option value="SP1">Surat Peringatan 1</option>
                            <option value="SP2">Surat Peringatan 2</option>
                            <option value="COACHING">Coaching</option>
                        </select>
                        <textarea rows={3} placeholder="Keterangan..." className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none resize-none" value={desc} onChange={e => setDesc(e.target.value)} />
                        <button onClick={handleSaveSP} className="w-full py-2.5 bg-red-500 text-white font-bold rounded-xl shadow-lg active:scale-95 text-xs">Simpan</button>
                    </div>
                ) : (
                    <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 space-y-2.5">
                        <select
                            className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-orange-200"
                            value={salaryForm.employeeId}
                            onChange={e => setSalaryForm({ ...salaryForm, employeeId: e.target.value })}
                        >
                            <option value="">Pilih Karyawan...</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.name} - {e.role}</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <input type="number" placeholder="Gaji Pokok" className="p-2.5 bg-gray-50 border-none rounded-xl text-xs" onChange={e => setSalaryForm({ ...salaryForm, basicSalary: parseFloat(e.target.value) })} />
                            <input type="number" placeholder="Tunjangan" className="p-2.5 bg-gray-50 border-none rounded-xl text-xs" onChange={e => setSalaryForm({ ...salaryForm, allowanceOther: parseFloat(e.target.value) })} />
                            <input type="number" placeholder="Potongan" className="p-2.5 bg-gray-50 border-none rounded-xl text-xs" onChange={e => setSalaryForm({ ...salaryForm, otherDeductions: parseFloat(e.target.value) })} />
                        </div>
                        <div className="bg-green-50 p-2.5 rounded-xl flex justify-between items-center"><span className="text-[10px] font-bold text-green-700">Total</span><span className="font-bold text-green-700 text-sm">Rp {salaryForm.totalEarnings?.toLocaleString('id-ID')}</span></div>
                        <button onClick={handleSaveSalary} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg active:scale-95 text-xs">Kirim Slip Gaji</button>
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
        const salesValue = parseFloat(sales);
        if (!salesValue) return alert("Masukkan nominal omzet");

        const res = await performanceApi.saveOperationalReport({ sales: salesValue, notes });
        if (res.success) {
            alert(res.message);
            setSales('');
            setNotes('');
            onBack();
        }
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="Restaurant Manager" icon={Utensils} onBack={onBack} />
            <div className="px-4 space-y-3 -mt-6 relative z-10">

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-blue-500 uppercase mb-1">Jobdesk FOH</span>
                        <span className="text-xl font-bold text-gray-800">{jobdeskStats.fohCount}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-orange-500 uppercase mb-1">Jobdesk BOH</span>
                        <span className="text-xl font-bold text-gray-800">{jobdeskStats.bohCount}</span>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <ActionCard
                        onClick={() => onNavigate && onNavigate('dailyChecklistList')}
                        icon={ClipboardList} title="Checklist" subtitle="Daily Performance" colorClass="bg-orange-500 text-white"
                    />
                    <ActionCard
                        onClick={() => onNavigate && onNavigate('shiftScheduler')}
                        icon={Clock} title="Shift" subtitle="Scheduling" colorClass="bg-blue-500 text-white"
                    />
                </div>

                {/* NEW FEATURES GRID */}
                <div className="grid grid-cols-3 gap-2">
                    <ActionCard
                        onClick={() => onNavigate && onNavigate('hppCalculator')}
                        icon={Shield} title="HPP Calc" subtitle="Profit Protection" colorClass="bg-green-500 text-white"
                    />
                    <ActionCard
                        onClick={() => onNavigate && onNavigate('smartOpex')}
                        icon={TrendingUp} title="Smart OpEx" subtitle="Cost Tracker" colorClass="bg-purple-500 text-white"
                    />
                    <ActionCard
                        onClick={() => onNavigate && onNavigate('stockOpname')}
                        icon={Package} title="Stock Opname" subtitle="Inventory" colorClass="bg-amber-500 text-white"
                    />
                </div>

                {/* Report Form */}
                <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-xs text-gray-800 mb-2.5">Laporan Omzet Harian</h3>
                    <div className="space-y-2.5">
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 text-[10px] font-bold">Rp</span>
                            <input type="number" placeholder="0" className="w-full pl-8 p-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none focus:ring-1 focus:ring-orange-200" value={sales} onChange={e => setSales(e.target.value)} />
                        </div>
                        <textarea rows={2} placeholder="Catatan operasional..." className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-xs outline-none resize-none" value={notes} onChange={e => setNotes(e.target.value)} />
                        <button onClick={handleSave} className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-lg active:scale-95 text-xs">Kirim Laporan</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FinancePanel: React.FC<PanelProps> = ({ onBack }) => {
    const [bonus, setBonus] = useState('');
    const [empName, setEmpName] = useState('');

    const handleSave = async () => {
        const amount = parseFloat(bonus);
        if (!amount || !empName) return alert("Lengkapi data");

        const res = await performanceApi.saveIncentive({ empName, amount });
        if (res.success) {
            alert(res.message);
            setBonus('');
            setEmpName('');
            onBack();
        }
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="Finance" icon={Banknote} onBack={onBack} />
            <div className="px-4 space-y-3 -mt-6 relative z-10">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-xs">Input Insentif / Lembur</h3>
                    <div className="space-y-2.5">
                        <input type="text" placeholder="Nama Karyawan" className="w-full p-2.5 bg-gray-50 rounded-xl text-xs border-none outline-none" value={empName} onChange={e => setEmpName(e.target.value)} />
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 text-[10px]">Rp</span>
                            <input type="number" placeholder="Nominal" className="w-full p-2.5 pl-8 bg-gray-50 rounded-xl text-xs border-none outline-none" value={bonus} onChange={e => setBonus(e.target.value)} />
                        </div>
                        <button onClick={handleSave} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg active:scale-95 text-xs">Simpan Data</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MarketingPanel: React.FC<PanelProps> = ({ onBack }) => {
    const [campaign, setCampaign] = useState('');

    const handleSave = async () => {
        if (!campaign) return alert("Isi nama campaign");
        const res = await performanceApi.saveCampaign({ name: campaign });
        if (res.success) {
            alert(res.message);
            setCampaign('');
            onBack();
        }
    };

    return (
        <div className="bg-gray-50 pb-24 min-h-screen">
            <PanelHeader title="Marketing" icon={Megaphone} onBack={onBack} />
            <div className="px-4 space-y-3 -mt-6 relative z-10">
                <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div><p className="text-[10px] text-purple-600 font-bold uppercase">Engagement</p><h3 className="text-xl font-bold text-purple-800">4.2%</h3></div>
                    <div><p className="text-[10px] text-purple-600 font-bold uppercase">Reach</p><h3 className="text-xl font-bold text-purple-800">45K</h3></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-3 text-xs">New Campaign</h3>
                    <input type="text" placeholder="Nama Campaign" className="w-full p-2.5 bg-gray-50 rounded-xl text-xs border-none outline-none mb-2.5" value={campaign} onChange={e => setCampaign(e.target.value)} />
                    <button onClick={handleSave} className="w-full py-2.5 bg-purple-600 text-white font-bold rounded-xl shadow-lg active:scale-95 text-xs">Simpan</button>
                </div>
            </div>
        </div>
    );
};
