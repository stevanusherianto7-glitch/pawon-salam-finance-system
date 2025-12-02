import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';
import { haptics } from '../utils/haptics';

export const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if iOS
        const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIosDevice);

        // Handle Android/Desktop Install Prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt after a small delay to not annoy immediately
            setTimeout(() => setShowPrompt(true), 3000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowPrompt(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        haptics.medium();
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleClose = () => {
        haptics.light();
        setShowPrompt(false);
    };

    if (!showPrompt && !isIOS) return null;
    // Note: For this MVP, we only show the Android/Desktop prompt automatically.
    // iOS instructions usually require a specific trigger or just a static help page, 
    // but we'll hide it for now unless we want to force it. 
    // Let's stick to the standard 'beforeinstallprompt' logic for now.
    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-[9999] animate-slide-in-down">
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-2xl shadow-orange-500/20 flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                            <Download size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Install Aplikasi</h3>
                            <p className="text-xs text-gray-500">Akses lebih cepat & offline mode</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <button
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                    <Download size={18} />
                    Install Sekarang
                </button>
            </div>
        </div>
    );
};
