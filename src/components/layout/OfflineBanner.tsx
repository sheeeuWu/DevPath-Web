"use client";

import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        setIsOffline(!navigator.onLine);

        const handleOffline = () => setIsOffline(true);
        const handleOnline = () => setIsOffline(false);

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[2000] h-[50px] bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-md border-b border-white/10 flex items-center justify-center px-4 shadow-lg text-white">
            <div className="flex items-center gap-3 text-sm md:text-base font-medium text-center">
                <WifiOff size={18} className="text-white" />
                <span>You are offline. Some features may be unavailable.</span>
            </div>
        </div>
    );
}
