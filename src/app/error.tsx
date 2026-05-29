'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service like Sentry
        console.error('Application crashed:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] py-20 flex flex-col items-center justify-center px-4 text-center relative">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-destructive/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center bg-card/30 backdrop-blur-xl border border-white/10 p-10 md:p-20 rounded-[3rem] shadow-2xl">
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-destructive/40 blur-[50px] rounded-full group-hover:bg-destructive/60 transition-all duration-700" />
                    <div className="bg-background/50 p-6 rounded-3xl border border-white/10 shadow-inner relative z-10 backdrop-blur-sm">
                        <AlertTriangle className="w-20 h-20 text-destructive animate-pulse" />
                    </div>
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black font-space mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 drop-shadow-2xl leading-none">
                    System Error
                </h1>
                
                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-destructive to-transparent mb-8 rounded-full" />
                
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white font-space tracking-tight">
                    Something went wrong on our end.
                </h2>
                
                <p className="text-muted-foreground max-w-lg mb-10 text-lg font-sans leading-relaxed">
                    {error.message || "An unexpected error occurred. Our team has been notified and is looking into it. Please try again."}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <Button aria-label="Action button"  
                        variant="primary" 
                        icon={<RotateCcw className="w-5 h-5" />}
                        className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl bg-destructive hover:bg-destructive/90 text-white"
                        onClick={() => reset()}
                    >
                        Try Again
                    </Button>
                    <Link href="/" passHref>
                        <Button aria-label="Action button"  variant="secondary" icon={<Home className="w-5 h-5" />} className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl border-white/20 hover:bg-white/5">
                            Return Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
