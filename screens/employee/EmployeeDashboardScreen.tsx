



import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { usePerformanceStore } from '../../store/performanceStore';
import { MapPin, LogOut, Clock, Camera, TrendingUp, Quote, Star, ChevronRight, FileText, ShieldCheck, DollarSign, Bell, RefreshCw, Banknote, ClipboardList, Trophy, Award, Cake, Gift, Users, Crown, LayoutGrid, ListTodo, MessageSquare, X } from 'lucide-react';
import { colors } from '../../theme/colors';
import { calculateDistance, OFFICE_LOCATION, MAX_ALLOWED_DISTANCE } from '../../utils/locationUtils';
import { getScoreColor, getScoreLabel } from '../../utils/scoreUtils';
import { UserRole, EmployeeOfTheMonth, Employee, DashboardAnalytics } from '../../types';
import { Logo } from '../../components/Logo';
import { useMessageStore } from '../../store/messageStore';
import { useNotificationStore } from '../../store/notificationStore';
import { usePayslipStore } from '../../store/payslipStore';
import { performanceApi, employeeApi } from '../../services/api';
import { PremiumGlassCard } from '../../components/PremiumGlassCard';

interface DashboardProps {
  onNavigate?: (screen: string) => void;
}

export const EmployeeDashboardScreen: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, logout, updateUser } = useAuthStore();
  const { todayLog, schedule, fetchTodayStatus, fetchSchedule, performCheckIn, performCheckOut, isLoading: isAttendanceLoading } = useAttendanceStore();
  const { currentSnapshot, fetchDailySnapshot, reviews, fetchReviews, currentJobdesk, fetchJobdesk } = usePerformanceStore();
  const { showNotification, showSpecialNotification } = useNotificationStore();
  const { unreadCount, fetchMessages } = useMessageStore();
  const { getUnreadCount } = usePayslipStore();
  const payslipUnreadCount = user ? getUnreadCount(user.id) : 0;

  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'error'>('idle');
  const [currentDistance, setCurrentDistance] = useState<number | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasNewSchedule, setHasNewSchedule] = useState(false);
  const [eotm, setEotm] = useState<EmployeeOfTheMonth | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [todaysBirthdays, setTodaysBirthdays] = useState<Employee[]>([]);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTodayStatus(user.id);
      fetchSchedule(user.id);
      fetchDailySnapshot(user.id);
      fetchReviews(user.id);
      fetchJobdesk(user.id); // Load jobdesk to check for feedback
      fetchMessages(user.id, user.role); // Fetch messages for unread count

      const loadTeamStats = async () => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const [eotmRes, statsRes] = await Promise.all([
          performanceApi.getEmployeeOfTheMonth(month, year),
          performanceApi.getDashboardStats(month, year)
        ]);

        if (eotmRes.success && eotmRes.data) setEotm(eotmRes.data);
        if (statsRes.success && statsRes.data) setAnalytics(statsRes.data);
      };
      loadTeamStats();

      const checkBirthdays = async () => {
        const res = await employeeApi.getBirthdays();
        if (res.success && res.data && res.data.length > 0) {
          setTodaysBirthdays(res.data);
          const isMyBday = res.data.some(e => e.id === user.id);
          const othersBday = res.data.filter(e => e.id !== user.id);

          if (isMyBday) showNotification(`🎉 Selamat Ulang Tahun, ${user.name}! 🎂`, 'success', 8000);

          if (othersBday.length > 0) {
            const othersIds = othersBday.map(e => e.id);
            const isDismissed = useNotificationStore.getState().checkBirthdayDismissal(othersIds);

            if (!isDismissed) {
              const names = othersBday.map(e => e.name.split(' ')[0]).join(' & ');
              const message = othersBday.length > 1 ? `🎂 Hari ini ${names} berulang tahun!` : `🎂 Hari ini ${names} berulang tahun! Ucapkan selamat!`;
              showSpecialNotification(message, 'birthday', { employeeIds: othersIds });
            }
          }
        }
      };
      checkBirthdays();

      if (user.role === UserRole.EMPLOYEE) detectLocation();
      const d = new Date();
      if (d.getDate() < 10) setHasNewSchedule(true);
    }
  }, [user]);

  useEffect(() => {
    const hasDismissed = localStorage.getItem('feedback_dismissed');
    if (currentJobdesk?.managerNote && !hasDismissed) {
      setIsFeedbackVisible(true);
    } else {
      setIsFeedbackVisible(false);
    }
  }, [currentJobdesk]);

  const handleDismissFeedback = () => {
    setIsFeedbackVisible(false);
    localStorage.setItem('feedback_dismissed', 'true');
    showNotification('Catatan ditutup.', 'info');
  };

  const isPrivilegedUser = user && [
    UserRole.BUSINESS_OWNER, UserRole.HR_MANAGER, UserRole.RESTAURANT_MANAGER,
    UserRole.FINANCE_MANAGER, UserRole.MARKETING_MANAGER, UserRole.SUPER_ADMIN, UserRole.ADMIN
  ].includes(user.role);

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateUser({ avatarUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocationStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude);
        setCurrentDistance(dist);
        setLocationStatus('idle');
      },
      (err) => { console.error("GPS Error", err); setLocationStatus('error'); },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          showNotification("Browser tidak support kamera", "error"); setShowCamera(false); return;
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { setShowCamera(false); }
    };
    if (showCamera) startCamera();
    return () => { if (stream) stream.getTracks().forEach(track => track.stop()); };
  }, [showCamera]);

  const handleCloseCamera = () => setShowCamera(false);
  const handleCaptureAndCheckIn = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.translate(canvasRef.current.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0);
        const photoUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setShowCamera(false);
        processCheckIn(photoUrl);
      }
    }
  };

  const initCheckIn = () => {
    if (isPrivilegedUser) {
      if (!user) return;
      performCheckIn(user.id, 0, 0, 'manager-bypass');
    } else {
      if (currentDistance !== null && currentDistance > MAX_ALLOWED_DISTANCE) {
        showNotification(`Anda berada ${Math.round(currentDistance)}m dari resto. Maksimal ${MAX_ALLOWED_DISTANCE}m.`, 'error');
        return;
      }
      setShowCamera(true);
    }
  };

  const processCheckIn = (photoUrl: string) => {
    if (!user) return;
    setLocationStatus('locating');
    if (!navigator.geolocation) { showNotification('GPS tidak aktif.', 'error'); setLocationStatus('error'); return; }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const long = pos.coords.longitude;
        if (user.role === UserRole.EMPLOYEE) {
          const distance = calculateDistance(lat, long, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude);
          if (distance > MAX_ALLOWED_DISTANCE) {
            setLocationStatus('error'); setCurrentDistance(distance);
            showNotification(`Gagal: Jarak ${Math.round(distance)}m.`, 'error'); return;
          }
        }
        setLocationStatus('idle');
        setCurrentDistance(calculateDistance(lat, long, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude));
        performCheckIn(user.id, lat, long, photoUrl);
        showNotification('Berhasil Check-In!', 'success');
      },
      (err) => { console.error(err); setLocationStatus('error'); showNotification('Gagal lokasi.', 'error'); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  const handleCheckOut = async () => {
    if (todayLog && user) {
      await performCheckOut(todayLog.id);
      fetchDailySnapshot(user.id);
      showNotification('Berhasil Check-Out!', 'success');
    }
  };

  const getTimeString = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--';
  const isLocationValid = currentDistance !== null && currentDistance <= MAX_ALLOWED_DISTANCE;
  const distanceLabel = currentDistance !== null ? `${Math.round(currentDistance)}m` : '...';
  const isMyBirthday = todaysBirthdays.some(e => e.id === user?.id);

  return (
    <div className="bg-gray-50 pb-32 relative overflow-hidden min-h-screen">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center animate-fade-in">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover transform -scale-x-100" />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-10 flex flex-col items-center gap-4 w-full px-8">
            <button onClick={handleCaptureAndCheckIn} className="w-16 h-16 rounded-full bg-white border-4 border-orange-500 flex items-center justify-center shadow-xl active:scale-95"><Camera size={28} className="text-orange-600" /></button>
            <button onClick={handleCloseCamera} className="text-white bg-black/40 px-4 py-2 rounded-full text-xs font-bold border border-white/20">Batalkan</button>
          </div>
        </div>
      )}

      {/* === HEADER COMPACT LUXURY === */}
      <div className="pt-8 pb-12 px-4 rounded-b-[2rem] relative overflow-hidden shadow-2xl shadow-slate-900/10" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/food.png")' }}></div>
        <div className="relative flex items-center gap-3">
          <div className="relative shrink-0 group cursor-pointer" onClick={handleAvatarClick}>
            <img src={user?.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-white/80 object-cover shadow-md" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm"><Camera size={8} className="text-orange-600" /></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-orange-100 font-medium tracking-wide uppercase">Welcome back,</p>
            <h2 className="text-base font-bold text-white truncate leading-tight tracking-tight">{user?.name}</h2>
            {/* Role/Department Display */}
            <p className="text-[9px] text-slate-200/90 font-semibold truncate mt-0.5 bg-white/10 w-fit px-2 py-0.5 rounded-md backdrop-blur-sm">{user?.department}</p>
          </div>
          <button onClick={logout} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-all border border-white/10"><LogOut size={14} /></button>
        </div>
      </div>

      <div className="px-4 -mt-8 relative z-10 space-y-2.5">

        {/* EMPLOYEE OF THE MONTH WIDGET (Persistent & Unobtrusive) */}
        {eotm && (
          <div className="bg-white rounded-2xl p-2.5 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-3 relative overflow-hidden group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            {/* Golden Glow Effect */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-400/20 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-400/30 transition-all"></div>

            <div className="relative">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-br from-amber-300 to-amber-600 shadow-sm">
                <img src={eotm.avatarUrl} alt={eotm.name} className="w-full h-full rounded-full object-cover border-2 border-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border border-white shadow-sm">
                <Crown size={8} fill="currentColor" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[9px] font-extrabold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md border border-amber-200 uppercase tracking-wider">
                  Star of {new Date().toLocaleString('default', { month: 'long' })}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-900 truncate tracking-tight">{eotm.name}</h3>
              <p className="text-[9px] text-slate-600 font-medium truncate">{eotm.achievementBadge}</p>
            </div>

            <div className="p-1.5 bg-amber-50 rounded-xl border border-amber-100 shadow-inner">
              <Trophy size={16} className="text-amber-500" />
            </div>
          </div>
        )}

        {/* MANAGER FEEDBACK WIDGET (NEW) */}
        {isFeedbackVisible && currentJobdesk?.managerNote && (
          <div className="glass p-3 rounded-2xl shadow-lg relative overflow-hidden animate-fade-in-down border border-blue-200/50">
            <button
              onClick={handleDismissFeedback}
              className="absolute top-2 right-2 p-1 bg-black/5 rounded-full hover:bg-black/10 transition-colors z-20"
            >
              <X size={14} className="text-gray-600" />
            </button>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <MessageSquare size={12} className="text-blue-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">Catatan Operasional</span>
              </div>
              <p className="text-xs font-medium leading-relaxed italic text-gray-700">
                "{currentJobdesk.managerNote}"
              </p>
              <div className="mt-1.5 text-[9px] text-gray-500 text-right font-bold">
                - Restaurant Manager
              </div>
            </div>
          </div>
        )}

        {/* SCORE STRIP (Sticky Top Visual) */}
        {currentSnapshot && (
          <div onClick={() => onNavigate && onNavigate('performanceDetail')} className="bg-white rounded-xl p-1.5 shadow-md shadow-slate-200/50 border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
            <div className="flex items-center gap-2 px-2">
              <div className="p-1 bg-orange-100 rounded-full"><TrendingUp size={12} className="text-orange-600" /></div>
              <span className="text-[10px] font-bold text-gray-700">Skor Harian</span>
            </div>
            <div className="flex items-center gap-2 px-2">
              <span className="text-base font-bold font-mono tabular-nums tracking-tight" style={{ color: getScoreColor(currentSnapshot.punctualityScore) }}>{currentSnapshot.punctualityScore}</span>
              <span className="text-[9px] text-slate-400 font-mono">/ 5.0</span>
              <ChevronRight size={12} className="text-gray-300" />
            </div>
          </div>
        )}

        {/* CHECK IN/OUT CARD (Compact) */}
        <div className="bg-white rounded-2xl p-3 shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Jadwal Hari Ini</p>
              <p className="text-xs font-semibold text-slate-900 mt-0.5 tracking-tight">
                {schedule ? `${schedule.shiftName} (${schedule.startTime}-${schedule.endTime})` : 'Jadwal Reguler'}
              </p>
            </div>
            <div className={`px-2 py-1 rounded-lg border text-[9px] font-bold flex items-center gap-1 ${isLocationValid ? 'bg-green-50 text-green-700 border-green-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
              <MapPin size={10} /> {distanceLabel}
            </div>
          </div>

          {!todayLog?.checkInTime ? (
            <button onClick={initCheckIn} disabled={locationStatus === 'locating'} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              <Camera size={16} /> {locationStatus === 'locating' ? 'Mencari Lokasi...' : 'Check In Kehadiran'}
            </button>
          ) : !todayLog.checkOutTime ? (
            <div className="flex gap-2">
              <div className="flex-1 bg-orange-50 rounded-xl p-1.5 border border-orange-100 text-center">
                <p className="text-[9px] text-gray-500">Masuk</p>
                <p className="text-base font-bold font-mono tabular-nums text-orange-700 tracking-tight">{getTimeString(todayLog.checkInTime)}</p>
              </div>
              <button onClick={handleCheckOut} className="flex-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-lg shadow-slate-800/30 hover:shadow-xl active:scale-95 transition-all duration-300">Check Out</button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-2.5 border border-emerald-200 text-center text-emerald-800 text-xs font-bold">
              Shift Selesai • Pulang {getTimeString(todayLog.checkOutTime)}
            </div>
          )}
        </div>

        {/* BENTO GRID MENU - PREMIUM GLASS STYLE */}
        <div className="grid grid-cols-2 gap-2">
          <PremiumGlassCard
            title="Daily Jobdesk"
            subtitle="Tugas Harian Anda"
            icon={ListTodo}
            themeColor="blue"
            onClick={() => onNavigate && onNavigate('dailyJobdesk')}
          />
          <PremiumGlassCard
            title="Cuti & Izin"
            subtitle="Formulir Pengajuan"
            icon={FileText}
            themeColor="purple"
            onClick={() => onNavigate && onNavigate('leaveRequest')}
          />
          <PremiumGlassCard
            title="Slip Gaji"
            subtitle={payslipUnreadCount > 0 ? `${payslipUnreadCount} Slip Baru` : "Riwayat Pendapatan"}
            icon={Banknote}
            themeColor="green"
            onClick={() => onNavigate && onNavigate('employeePayslips')}
            badgeCount={payslipUnreadCount}
          />
          <PremiumGlassCard
            title="Pengumuman"
            subtitle={unreadCount > 0 ? `${unreadCount} Pesan Baru` : "Info & Update Tim"}
            icon={MessageSquare}
            themeColor="orange"
            onClick={() => onNavigate && onNavigate('broadcast')}
            badgeCount={unreadCount}
          />
          {analytics && (
            <PremiumGlassCard
              title="Statistik Tim"
              subtitle={`FOH: ${analytics.fohAverage} • BOH: ${analytics.bohAverage}`}
              icon={Users}
              themeColor="blue"
              onClick={() => { }}
            />
          )}
        </div>

        {/* FOOTER REPORTS SHORTCUT */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-2.5 flex items-center justify-between border border-orange-200/50 shadow-md shadow-orange-200/50">
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-orange-600" />
            <span className="text-[10px] font-bold text-orange-800">Lihat Leaderboard</span>
          </div>
          <button onClick={() => onNavigate && onNavigate('hrTopPerformance')} className="bg-white hover:bg-orange-50 px-3 py-1.5 rounded-lg text-[9px] font-bold text-slate-700 shadow-sm hover:shadow-md active:scale-95 transition-all duration-200 border border-orange-200">
            Buka
          </button>
        </div>

      </div>
    </div>
  );
};