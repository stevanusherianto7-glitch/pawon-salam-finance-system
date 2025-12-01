
import React from 'react';
import { Eye, X, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

export const ImpersonationBanner: React.FC = () => {
  const { isImpersonating, user, stopImpersonation } = useAuthStore();

  if (!isImpersonating || !user) return null;

  const getRoleLabel = (role: UserRole) => {
      return role.replace('_', ' ');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] max-w-md mx-auto">
        <div className="bg-indigo-900 text-white shadow-xl border-b border-indigo-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-1.5 bg-indigo-700 rounded-lg animate-pulse">
                    <Eye size={16} className="text-indigo-200" />
                </div>
                <div>
                    <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider">Viewing As</p>
                    <p className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                        {user.name}
                        <span className="bg-indigo-800 px-1.5 py-0.5 rounded text-[9px] border border-indigo-600 text-indigo-200">
                            {getRoleLabel(user.role)}
                        </span>
                    </p>
                </div>
            </div>
            
            <button 
                onClick={stopImpersonation}
                className="flex items-center gap-1 px-3 py-1.5 bg-white text-indigo-900 rounded-full text-[10px] font-bold hover:bg-indigo-50 active:scale-95 transition-all shadow-sm"
            >
                <X size={12} /> Return to Admin
            </button>
        </div>
    </div>
  );
};
