import React from 'react';
import { useNotificationStore, NotificationType } from '../store/notificationStore';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

// Sultan Mode Style Configuration
const typeStyles: Record<NotificationType, {
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  title: string;
}> = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-400',
    borderColor: 'border-green-500/40',
    title: 'Berhasil'
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-red-400',
    borderColor: 'border-red-500/40',
    title: 'Gagal'
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/40',
    title: 'Peringatan'
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    title: 'Info'
  }
};

export const ToastContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto max-w-md mx-auto md:mx-0 z-[200] space-y-3 pointer-events-none">
      {notifications.map((notification) => {
        const styles = typeStyles[notification.type];
        const Icon = styles.icon;

        return (
          <div
            key={notification.id}
            className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border 
                        bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/30
                        animate-fade-in-down transition-all transform hover:scale-[1.02]
                        ${styles.borderColor}`}
          >
            {/* Icon with glow */}
            <div className={`relative shrink-0 mt-0.5 ${styles.iconColor}`}>
              <Icon size={20} />
              <div className={`absolute -inset-2 rounded-full blur-xl opacity-40 ${styles.iconColor.replace('text-', 'bg-')}`}></div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
               <h4 className="text-sm font-bold text-white">
                 {styles.title}
               </h4>
               <p className="text-xs font-medium mt-0.5 text-white/80 leading-snug">
                 {notification.message}
               </p>
            </div>

            {/* Close Button */}
            <button 
              onClick={() => removeNotification(notification.id)}
              className="shrink-0 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
