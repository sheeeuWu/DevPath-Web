import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Compass, Home, Map } from 'lucide-react';
import React from 'react';

export default function NotFoundView() {
    return (
        <div className="min-h-[70vh] py-20 flex flex-col items-center justify-center px-4 text-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center bg-card/30 backdrop-blur-xl border border-white/10 p-10 md:p-20 rounded-[3rem] shadow-2xl">
                <div className="relative mb-8 group">
                    <div className="absolute inset-0 bg-primary/40 blur-[50px] rounded-full group-hover:bg-primary/60 transition-all duration-700" />
                    <div className="bg-background/50 p-6 rounded-3xl border border-white/10 shadow-inner relative z-10 backdrop-blur-sm">
                        <Compass className="w-20 h-20 text-primary animate-[spin_8s_linear_infinite]" />
                    </div>
                </div>

                <h1 className="text-8xl md:text-[150px] font-black font-space mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 drop-shadow-2xl leading-none">
                    404
                </h1>

                <div className="h-1 w-24 bg-gradient-to-r from-transparent via-primary to-transparent mb-8 rounded-full" />

                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white font-space tracking-tight">
                    Lost in the Void
                </h2>

                <p className="text-muted-foreground max-w-lg mb-10 text-lg md:text-xl font-sans leading-relaxed">
                    The page you&apos;re looking for has vanished into cyberspace. It might have been moved, deleted, or perhaps it never existed at all.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/" passHref>
                        <Button aria-label="Go back to home" variant="primary" icon={<Home className="w-5 h-5" />} className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl">
                            Back to Safety
                        </Button>
                    </Link>
                    <Link href="/courses" passHref>
                        <Button aria-label="Explore courses" variant="secondary" icon={<Map className="w-5 h-5" />} className="w-full sm:w-auto text-lg px-8 py-6 rounded-2xl border-white/20 hover:bg-white/5">
                            Explore Courses
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
