import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { Gift, X } from 'lucide-react';

export const SpecialNotificationBanner: React.FC = () => {
  const { isSpecialNotificationVisible, specialNotification, hideSpecialNotification } = useNotificationStore();

  if (!isSpecialNotificationVisible || !specialNotification) {
    return null;
  }

  // Adjust top padding if impersonation banner is active
  const topPosition = document.querySelector('.fixed.top-0.z-\\[100\\]') ? 'top-16' : 'top-4';

  return (
    <div className={`fixed ${topPosition} left-0 right-0 z-[150] px-4 flex justify-center animate-slide-in-down`}>
      {/* Main Card - "Warm Gold & Cream" Style */}
      {/* Main Card - Premium Glassmorphism Style */}
      <div className="w-full max-w-md 
                   bg-white/70 backdrop-blur-xl 
                   rounded-3xl p-5 
                   border border-white/40 
                   shadow-2xl shadow-orange-500/20
                   flex items-center gap-5 relative overflow-hidden group">

        {/* Ambient Glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

        {/* Icon - Pop-out Glass Style */}
        <div className="relative p-3.5 bg-white rounded-2xl shadow-lg shadow-orange-500/20 flex-shrink-0">
          <Gift size={28} className="text-orange-500" />
        </div>

        {/* Content with Hierarchy */}
        <div className="flex-1 relative z-10">
          <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest mb-0.5">Selamat Ulang Tahun!</p>
          <p className="text-sm font-bold text-gray-800 leading-snug">
            {specialNotification.message}
          </p>
        </div>

        {/* Close Button - Glass Style - Improved Responsiveness */}
        <button
          onClick={hideSpecialNotification}
          className="absolute top-2 right-2 p-3 rounded-full bg-white/40 hover:bg-white border border-white/30 text-gray-500 hover:text-orange-600 transition-all shadow-sm z-50 active:scale-95 cursor-pointer"
          aria-label="Close notification"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
