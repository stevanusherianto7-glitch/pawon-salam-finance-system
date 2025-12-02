import React from 'react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
    fallbackScreen?: string;
    onNavigate?: (screen: string) => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    allowedRoles,
    children,
    fallbackScreen = 'dashboard',
    onNavigate
}) => {
    const { user } = useAuthStore();

    // Check if user is logged in
    if (!user) {
        console.warn('🔒 ProtectedRoute: No user found, access denied');
        if (onNavigate) {
            onNavigate('login');
        }
        return null;
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(user.role)) {
        console.warn(`🔒 ProtectedRoute: User role "${user.role}" not in allowed roles:`, allowedRoles);

        // Show toast notification if available
        if (window.showToast) {
            window.showToast('Anda tidak memiliki akses ke halaman ini', 'error');
        } else {
            alert('Anda tidak memiliki akses ke halaman ini');
        }

        // Navigate to fallback screen
        if (onNavigate) {
            setTimeout(() => onNavigate(fallbackScreen), 500);
        }

        // Show blocking UI while redirecting
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="glass-card max-w-md p-8 text-center">
                    <div className="mb-4 text-red-500 text-5xl">🔒</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
                    <p className="text-gray-600 text-sm">
                        Anda tidak memiliki izin untuk mengakses halaman ini.
                    </p>
                    <p className="text-gray-500 text-xs mt-4">
                        Redirecting...
                    </p>
                </div>
            </div>
        );
    }

    // User has access - render children
    return <>{children}</>;
};
