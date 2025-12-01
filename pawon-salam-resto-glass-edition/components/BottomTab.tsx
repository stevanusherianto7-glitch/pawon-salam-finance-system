import React, { useEffect } from 'react';
import { Home, Clock, User, Users, FileText, CalendarCheck, MessageSquare } from 'lucide-react';
import { UserRole } from '../types';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';

interface BottomTabProps {
  role: UserRole;
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export const BottomTab: React.FC<BottomTabProps> = ({ role, currentScreen, onNavigate }) => {
  const isActive = (screenName: string) => currentScreen === screenName;
  const { user } = useAuthStore();
  const { unreadCount, fetchMessages } = useMessageStore();

  useEffect(() => {
    if (user) {
        fetchMessages(user.id, user.role);
    }
  }, [user, fetchMessages]);
  
  const renderIcon = (screenName: string, Icon: React.ElementType, label: string, badgeCount?: number) => {
    const active = isActive(screenName);
    return (
      <button 
        onClick={() => onNavigate(screenName)} 
        className={`group relative flex flex-col items-center justify-center p-2 transition-all duration-300 w-16 h-full`}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
      >
        {/* Badge */}
        {badgeCount && badgeCount > 0 && (
            <div className={`absolute top-1 right-1 z-20 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 ${active ? 'border-white' : 'border-emerald-800/80'}`}>
                {badgeCount > 9 ? '9+' : badgeCount}
            </div>
        )}
        
        {/* Icon */}
        <Icon 
            size={24} 
            strokeWidth={active ? 2.5 : 2}
            className={`relative z-10 transition-all duration-300 transform ${active ? 'text-white -translate-y-1' : 'text-white/50 group-hover:text-white'}`} 
        />
        
        {/* Label Text */}
        <span className={`text-[10px] font-bold mt-1 relative z-10 transition-all duration-300 ${active ? 'text-white opacity-100' : 'text-white/70 opacity-0 absolute'}`}>
            {label}
        </span>
      </button>
    );
  };

  const isManagement = [
      UserRole.ADMIN, 
      UserRole.RESTAURANT_MANAGER, 
      UserRole.HR_MANAGER, 
      UserRole.BUSINESS_OWNER,
      UserRole.FINANCE_MANAGER,
      UserRole.MARKETING_MANAGER,
      UserRole.SUPER_ADMIN
  ].includes(role);

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center">
        <div className="bg-emerald-800/50 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-black/40 px-4 h-20 rounded-[2rem] flex justify-around items-center w-full max-w-sm">
          {!isManagement ? (
            <>
              {renderIcon('dashboard', Home, 'Home')}
              {renderIcon('broadcast', MessageSquare, 'Pesan', unreadCount)}
              {renderIcon('history', Clock, 'Riwayat')}
              {renderIcon('profile', User, 'Profil')}
            </>
          ) : (
            <>
              {renderIcon('adminDashboard', Home, 'Home')}
              {renderIcon('broadcast', MessageSquare, 'Pesan', unreadCount)}
              {renderIcon('adminEmployees', Users, 'Staff')}
              {renderIcon('adminAttendance', CalendarCheck, 'Absensi')}
            </>
          )}
        </div>
    </div>
  );
};