

import React, { useEffect, useState } from 'react';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useAuthStore } from '../../store/authStore';
import { Calendar, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, MapPin, Camera, Clock, Filter, BarChart3, TrendingUp, ArrowLeft } from 'lucide-react';
import { AttendanceStatus } from '../../types';
import { colors } from '../../theme/colors';
import { calculateDistance, OFFICE_LOCATION } from '../../utils/locationUtils';
import { BackgroundPattern } from '../../components/layout/BackgroundPattern';

type FilterType = 'WEEK' | 'MONTH' | 'ALL';

export const AttendanceHistoryScreen = () => {
  const { user } = useAuthStore();
  const { history, fetchHistory, isLoading } = useAttendanceStore();

  const [filterType, setFilterType] = useState<FilterType>('MONTH');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHistory(user.id);
    }
  }, [user]);

  // --- Filter Logic ---
  const filteredHistory = history.filter((log) => {
    // Parse YYYY-MM-DD explicitly to local time to avoid timezone issues
    const [year, month, day] = log.date.split('-').map(Number);
    const logDate = new Date(year, month - 1, day);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filterType === 'WEEK') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      return logDate >= oneWeekAgo && logDate <= today;
    }
    if (filterType === 'MONTH') {
      return (
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === now.getFullYear()
      );
    }
    return true; // 'ALL'
  });

  // --- Stats Calculation ---
  const totalLogs = filteredHistory.length;
  const presentCount = filteredHistory.filter(l => l.status === AttendanceStatus.PRESENT).length;
  const lateCount = filteredHistory.filter(l => l.status === AttendanceStatus.LATE).length;
  const absentCount = filteredHistory.filter(l => l.status === AttendanceStatus.ABSENT).length;

  let totalDurationMs = 0;
  let durationCount = 0;

  filteredHistory.forEach(log => {
    if (log.checkInTime && log.checkOutTime) {
      const start = new Date(log.checkInTime).getTime();
      const end = new Date(log.checkOutTime).getTime();
      const duration = end - start;
      if (duration > 0) {
        totalDurationMs += duration;
        durationCount++;
      }
    }
  });

  const avgDurationMs = durationCount > 0 ? totalDurationMs / durationCount : 0;
  const avgHours = Math.floor(avgDurationMs / (1000 * 60 * 60));
  const avgMinutes = Math.floor((avgDurationMs % (1000 * 60 * 60)) / (1000 * 60));

  // --- Helper Functions ---
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return '#10B981'; // Green
      case AttendanceStatus.LATE: return '#F59E0B';   // Amber/Yellow
      case AttendanceStatus.ABSENT: return '#EF4444';     // Red
      default: return '#64748B';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    const color = getStatusColor(status);
    switch (status) {
      case AttendanceStatus.PRESENT: return <CheckCircle2 size={18} style={{ color }} />;
      case AttendanceStatus.LATE: return <AlertCircle size={18} style={{ color }} />;
      case AttendanceStatus.ABSENT: return <XCircle size={18} style={{ color }} />;
      default: return null;
    }
  };

  const getStatusText = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT: return 'Hadir';
      case AttendanceStatus.LATE: return 'Terlambat';
      case AttendanceStatus.ABSENT: return 'Absen';
      default: return 'N/A';
    }
  };

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return '-';
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}j ${minutes}m`;
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      <BackgroundPattern />

      {/* Header */}
      <div className="relative z-10 p-4 pt-8">
        <div className="flex items-center gap-3 mb-3">
          {/* Back button might be needed if this screen is not in main tab */}
          {/* <button className="p-2 bg-white/10 rounded-full text-white/80 hover:bg-white/20 transition-colors"><ArrowLeft size={20} /></button> */}
          <h2 className="text-lg font-bold text-white">Riwayat Absensi</h2>
        </div>
      </div>

      <div className="relative z-10 px-4 space-y-4 pb-32 h-full overflow-y-auto">

        {/* Filter Tabs - Sultan Mode */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center gap-2">
          {(['WEEK', 'MONTH', 'ALL'] as FilterType[]).map((type) => {
            const isActive = filterType === type;
            const labels: Record<FilterType, string> = { WEEK: 'Minggu Ini', MONTH: 'Bulan Ini', ALL: 'Semua' };
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`relative flex-1 py-2.5 text-[10px] font-bold rounded-xl transition-all duration-300
                    ${isActive ? 'text-orange-900' : 'text-white/60 hover:text-white hover:bg-white/5'}`
                }
              >
                {isActive && <div className="absolute inset-0 bg-white rounded-xl shadow-lg shadow-black/10"></div>}
                <span className="relative z-10">{labels[type]}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
            <p className="text-xs text-white/50">Memuat data...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/10">
              <Filter size={24} className="text-white/20" />
            </div>
            <p className="text-white/80 font-medium">Tidak ada riwayat</p>
            <p className="text-xs text-white/50">Coba ubah filter tanggal.</p>
          </div>
        ) : (
          <>
            {/* Statistics Summary Card - Sultan Mode */}
            <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-2xl p-3.5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={16} className="text-white/50" />
                <h3 className="font-bold text-white/80 text-[10px] uppercase tracking-wider">Statistik Ringkas</h3>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-blue-300 mb-1">
                    <CheckCircle2 size={10} /> Total Hari Kerja
                  </div>
                  <p className="text-base font-bold text-white leading-none">{totalLogs} <span className="text-[9px] font-medium text-white/40">Hari</span></p>
                </div>
                <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <div className="flex items-center gap-1.5 text-[10px] text-orange-300 mb-1">
                    <Clock size={10} /> Rata-rata
                  </div>
                  <p className="text-base font-bold text-white leading-none">{avgHours}j {avgMinutes}m</p>
                </div>
              </div>
            </div>

            {/* History List */}
            {filteredHistory.map((log) => {
              const isExpanded = expandedId === log.id;
              const statusColor = getStatusColor(log.status);
              const dateObj = new Date(log.date);
              const dist = calculateDistance(log.latitude, log.longitude, OFFICE_LOCATION.latitude, OFFICE_LOCATION.longitude);

              return (
                <div
                  key={log.id}
                  className={`bg-black/20 backdrop-blur-xl border rounded-2xl transition-all duration-300 overflow-hidden ${isExpanded ? 'border-orange-400/50' : 'border-white/10'}`}
                >
                  {/* Card Header (Clickable) */}
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-3.5 flex items-center justify-between cursor-pointer active:bg-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-[9px] font-bold text-white/40 uppercase">
                          {dateObj.toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                        <span className="text-base font-bold text-white">
                          {dateObj.getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {dateObj.toLocaleDateString('id-ID', { weekday: 'long' })}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="flex items-center text-[10px] text-white/50">
                            {log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                            <span className="mx-1">-</span>
                            {log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex flex-col items-end">
                        {getStatusIcon(log.status)}
                        <span className="text-[9px] font-bold mt-0.5" style={{ color: statusColor }}>
                          {getStatusText(log.status)}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={14} className="text-white/30" />
                      ) : (
                        <ChevronDown size={14} className="text-white/30" />
                      )}
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-0 animate-fade-in">
                      <div className="pt-3 border-t border-dashed border-white/10 grid grid-cols-2 gap-2">
                        <div className="col-span-2 flex justify-between bg-black/20 p-2.5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-white/40" />
                            <span className="text-[10px] text-white/50">Durasi Kerja:</span>
                          </div>
                          <span className="text-[10px] font-bold text-white">
                            {calculateDuration(log.checkInTime, log.checkOutTime)}
                          </span>
                        </div>

                        <div className="col-span-1 p-2.5 rounded-lg border border-orange-400/20 bg-black/20 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <MapPin size={12} className="text-orange-400" />
                            <span className="text-[10px] font-semibold text-orange-300">Lokasi Check-in</span>
                          </div>
                          <div className="text-[9px] text-white/60 leading-tight space-y-1">
                            <div className="flex justify-between">
                              <span className="text-white/40">Lat:</span>
                              <span className="font-mono">{log.latitude.toFixed(5)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Lon:</span>
                              <span className="font-mono">{log.longitude.toFixed(5)}</span>
                            </div>
                            <div className="pt-1 mt-1 border-t border-orange-400/20 flex justify-between font-bold text-orange-300">
                              <span>Jarak:</span>
                              <span>{Math.round(dist)}m</span>
                            </div>
                          </div>
                        </div>

                        <div className="col-span-1 p-2.5 rounded-lg border border-orange-400/20 bg-black/20 flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Camera size={12} className="text-orange-400" />
                            <span className="text-[10px] font-semibold text-orange-300">Bukti Foto</span>
                          </div>
                          {log.photoInUrl ? (
                            <div className="h-10 w-full rounded bg-black/20 border border-white/10 overflow-hidden relative group">
                              <img
                                src={log.photoInUrl}
                                alt="Selfie"
                                className="w-full h-full object-cover transition-transform hover:scale-110"
                              />
                            </div>
                          ) : (
                            <div className="h-10 w-full rounded bg-black/20 border border-dashed border-white/10 flex items-center justify-center">
                              <span className="text-[9px] text-white/40">Tidak ada</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};
