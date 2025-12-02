import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2.5 px-4 z-[9999] shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center justify-center gap-2 text-sm font-bold">
                <WifiOff size={18} />
                <span>⚠️ Anda sedang offline. Beberapa fitur tidak tersedia.</span>
            </div>
        </div>
    );
};
