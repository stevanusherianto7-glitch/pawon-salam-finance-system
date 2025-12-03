import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            // Show "Back online" message briefly
            setShowBanner(true);
            setTimeout(() => setShowBanner(false), 3000);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setShowBanner(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showBanner) return null;

    return (
        <div
            className={`fixed top-0 left-0 right-0 z-50 text-white text-center py-3 px-4 font-medium text-sm transition-all duration-300 ${isOffline
                    ? 'bg-red-500 shadow-lg shadow-red-500/20'
                    : 'bg-green-500 shadow-lg shadow-green-500/20'
                }`}
            style={{
                animation: 'slideDown 0.3s ease-out'
            }}
        >
            {isOffline ? (
                <div className="flex items-center justify-center gap-2">
                    <span>📡</span>
                    <span>Tidak ada koneksi internet</span>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2">
                    <span>✅</span>
                    <span>Kembali online</span>
                </div>
            )}
        </div>
    );
};
