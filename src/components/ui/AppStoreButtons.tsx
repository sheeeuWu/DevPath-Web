import React from 'react';
import Link from 'next/link';

// Simple inline SVGs for Apple and Play Store icons to avoid external dependencies
const AppleIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 384 512" fill="currentColor" height="1em" width="1em">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
);

const PlayStoreIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 512 512" fill="currentColor" height="1em" width="1em">
        <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
);

interface AppStoreButtonsProps {
    className?: string;
    variant?: 'hero' | 'footer';
}

export default function AppStoreButtons({ className = "", variant = 'hero' }: AppStoreButtonsProps) {
    const isFooter = variant === 'footer';

    return (
        <div className={`${className}`}>
            {/* Apple App Store Button */}
            {/* TODO: Update with real App Store URL when live */}
            <div className="flex flex-col lg:flex-row gap-3 w-fit">
                <Link
                    href="#"
                    className="group w-full lg:flex-1 flex items-center gap-3 bg-black border border-white/20 hover:border-white/50 text-white rounded-xl px-4 py-2.5 transition-all hover:scale-105 shadow-lg"
                    aria-label="Download on the App Store"
                >
                    <AppleIcon className="text-3xl group-hover:text-cyan-400 transition-colors" />
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold leading-none mb-1">
                            Download on the
                        </span>
                        <span className="text-sm font-bold leading-none">
                            App Store
                        </span>
                    </div>
                </Link>

                {/* Google Play Store Button */}
                {/* TODO: Update with real Play Store URL when live */}
                <Link
                    href="#"
                    className="group w-full lg:flex-1 flex items-center gap-3 bg-black border border-white/20 hover:border-white/50 text-white rounded-xl px-4 py-2.5 transition-all hover:scale-105 shadow-lg"
                    aria-label="Get it on Google Play"
                >
                    <PlayStoreIcon className="text-3xl group-hover:text-green-400 transition-colors" />
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold leading-none mb-1">
                            Get it on
                        </span>
                        <span className="text-sm font-bold leading-none">
                            Google Play
                        </span>
                    </div>
                </Link>
            </div>
        </div>
    );
}
