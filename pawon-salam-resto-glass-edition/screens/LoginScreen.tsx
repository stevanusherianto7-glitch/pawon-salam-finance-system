import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { Smartphone, Users, Utensils, Megaphone, Crown, LogIn, Briefcase, Zap, Banknote } from 'lucide-react';
import { Logo } from '../components/Logo';
import { BackgroundPattern } from '../components/layout/BackgroundPattern';

export const LoginScreen = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const { login, isLoading } = useAuthStore();

    const DEMO_ROLES = [
        { label: 'Super Admin', name: 'IT Support Sistem', phone: '08888888888', icon: Zap },
        { label: 'Executive Admin', name: 'Dr. Veronica Dhian Rusnasari. SpPD, M.MRS', phone: '081325736911', icon: Crown },
        { label: 'Human Resources Manager', name: 'Ana Jumnanik', phone: '085640028589', icon: Users },
        { label: 'Restaurant Manager', name: 'Wawan', phone: '085219481806', icon: Utensils },
        { label: 'Finance Manager', name: 'Boston Endi Sitompul', phone: '082312398289', icon: Banknote },
        { label: 'Marketing Manager', name: 'Anto', phone: '082125265827', icon: Megaphone },
        { label: 'Staff (FOH / BOH)', name: 'Contoh Staff', phone: '081313042461', icon: Briefcase }
    ];

    const handleRoleSelect = (role: any) => {
        setError('');
        setPhoneNumber(role.phone);
        setTimeout(() => phoneInputRef.current?.focus(), 100);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (phoneNumber.length < 3) {
            setError('Masukkan nomor HP yang valid.');
            return;
        }

        const res = await login(phoneNumber.trim());
        if (!res.success) {
            const msg = res.message || `Login gagal. Periksa kembali No. HP Anda.`;
            setError(msg);
        }
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans">
            <BackgroundPattern />

            <div className="relative z-10 w-full max-w-sm px-4 py-6">
                <div className="mb-6 animate-slide-in-down">
                    <Logo variant="color" size="lg" />
                </div>

                {/* Main Cream Card - FROSTED DAWN THEME */}
                <div className="w-full bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl p-4 shadow-2xl shadow-orange-500/10 flex flex-col gap-4 relative">

                    {/* Inner Zone A: Login Form */}
                    <div className="bg-white/60 rounded-2xl p-4 shadow-inner border border-white/50">
                        <div className="shrink-0 flex flex-col items-center justify-center mb-4">
                            <h2 className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.3em]">Login Karyawan</h2>
                            <p className="text-[10px] text-gray-400 mt-1">Gunakan nomor HP terdaftar</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                <input
                                    ref={phoneInputRef}
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none font-bold text-gray-800 placeholder-gray-300 text-sm"
                                    placeholder="Nomor HP"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="!mt-6 w-full py-3.5 rounded-xl font-bold text-white active:scale-95 transition-all disabled:opacity-70 flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/20 relative group overflow-hidden tracking-wide"
                            >
                                {/* Glass Shine */}
                                <div className="absolute top-0 -left-20 w-1/2 h-full bg-white/20 blur-xl transform -skew-x-12 group-hover:left-full transition-all duration-700 ease-in-out"></div>

                                {isLoading ? (
                                    <span className="flex items-center gap-2 relative z-10"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></span>
                                ) : (
                                    <span className="flex items-center gap-2 relative z-10 text-xs"><LogIn size={16} /> MASUK</span>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Separator */}
                    <div className="flex items-center gap-3">
                        <div className="h-px bg-gray-300/50 flex-1"></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pilih Akun</p>
                        <div className="h-px bg-gray-300/50 flex-1"></div>
                    </div>

                    {/* Inner Zone B: Account Selection (Premium Glass Cards - Light Mode) */}
                    <div className="p-1 h-44 flex flex-col">
                        <div className="overflow-y-auto h-full pr-1 space-y-2 scrollbar-hide pb-2">
                            {DEMO_ROLES.map((role, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleRoleSelect(role)}
                                    className="group relative w-full flex items-center gap-4 p-3 text-left bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg hover:bg-white/60 active:scale-[0.99]"
                                >
                                    {/* Ambient Lighting */}
                                    <div className="absolute -top-8 -left-8 w-24 h-24 bg-orange-100/50 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-200/50 transition-all duration-500"></div>

                                    {/* Pop-out Icon */}
                                    <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100 transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                                        <role.icon size={20} className="text-orange-500" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-800 tracking-tight">{role.label}</p>
                                        {role.name && <p className="text-[10px] text-gray-500 font-medium truncate">{role.name}</p>}
                                    </div>

                                    {/* Arrow Icon */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                        <LogIn size={16} className="text-orange-400" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="absolute bottom-4 left-6 right-6 p-3 rounded-xl bg-red-50 border border-red-200 flex flex-col gap-2 animate-shake z-20 shadow-lg shadow-red-500/10">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse"></div>
                                        <p className="text-[10px] text-red-700 font-bold leading-tight uppercase tracking-wide">Login Gagal</p>
                                    </div>
                                    <button onClick={() => setError('')} className="text-[10px] text-red-600 hover:text-red-800 font-bold">Tutup</button>
                                </div>
                                <p className="text-xs text-red-600 leading-tight">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                <p className="mt-8 text-[10px] text-gray-400 font-medium text-shadow-sm flex flex-col items-center gap-1">
                    <span>&copy; 2025 Pawon Salam. v1.5.0-beta</span>
                </p>
            </div>
        </div>
    );
};