import React, { useEffect, useState } from 'react';
import { useEmployeeStore } from '../../store/employeeStore';
import { colors } from '../../theme/colors';
import { Search, Award, ChevronLeft, User, Briefcase } from 'lucide-react';
import { Employee } from '../../types';

interface Props {
    onBack: () => void;
    onSelectEmployee: (employee: Employee) => void;
}

export const CertificateManager: React.FC<Props> = ({ onBack, onSelectEmployee }) => {
    const { employees, fetchEmployees, isLoading } = useEmployeeStore();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header */}
            <div className="relative">
                <div
                    className="pt-8 pb-12 px-4 rounded-b-[2rem] relative overflow-hidden shadow-md z-10"
                    style={{ background: colors.gradientMain }}
                >
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
                    <div className="relative z-10 flex items-center gap-3">
                        <button onClick={onBack} className="p-2 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">Penghargaan</h2>
                            <p className="text-white/80 text-xs">Buat sertifikat untuk karyawan</p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="px-4 -mt-6 relative z-20">
                    <div className="bg-white rounded-xl flex items-center px-3 py-2.5 border border-gray-200 shadow-lg">
                        <Search size={18} className="text-gray-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Cari nama karyawan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 outline-none text-xs text-gray-700 min-w-0"
                        />
                    </div>
                </div>
            </div>

            {/* Employee List */}
            <div className="mt-6 px-4 space-y-3">
                {isLoading && employees.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Memuat data...</div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">Tidak ada karyawan ditemukan.</div>
                ) : (
                    filteredEmployees.map((emp) => (
                        <div key={emp.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-center gap-3">
                                <div className="relative flex-shrink-0">
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full bg-gray-200 object-cover border border-gray-100" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">{emp.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                        <Briefcase size={10} />
                                        <span>{emp.department}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => onSelectEmployee(emp)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold border border-orange-100 hover:bg-orange-100 active:scale-95 transition-all"
                            >
                                <Award size={14} />
                                Buat Sertifikat
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
