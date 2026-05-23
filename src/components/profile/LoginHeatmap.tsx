"use client";

import { useMemo } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { calculateStreak, getISTDateString } from '@/lib/streakUtils';

interface LoginHeatmapProps {
    loginDates?: string[];
}

export default function LoginHeatmap({ loginDates = [] }: LoginHeatmapProps) {
    const safeLoginDates = Array.isArray(loginDates) ? loginDates : [];

    const days = useMemo(() => {
        const dates = [];
        const nowMs = Date.now();
        for (let i = 364; i >= 0; i--) {
            const d = new Date(nowMs - i * 24 * 60 * 60 * 1000);
            dates.push(getISTDateString(d));
        }
        return dates;
    }, []);

    const { currentStreak, maxStreak } = useMemo(() => calculateStreak(safeLoginDates), [safeLoginDates]);

    return (
        <div className="w-full p-4 bg-card border border-border rounded-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Login Activity</h3>
                <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Current Streak: <strong className="text-foreground">{currentStreak} days</strong></span>
                    <span>Longest Streak: <strong className="text-foreground">{maxStreak} days</strong></span>
                </div>
            </div>
            <TooltipProvider>
                <div className="flex flex-wrap gap-[2px] justify-center md:justify-start">
                    {days.map(date => {
                        const isLoggedIn = safeLoginDates.includes(date);
                        return (
                            <Tooltip key={date}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={`w-2.5 h-2.5 rounded-sm transition-colors ${isLoggedIn
                                            ? 'bg-green-500 hover:bg-green-400'
                                            : 'bg-muted/30 hover:bg-muted/50'
                                            }`}
                                    />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{date}: {isLoggedIn ? 'Logged In' : 'No Activity'}</p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </TooltipProvider>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground justify-end">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-sm bg-muted/30" />
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                <span>More</span>
            </div>
        </div>
    );
}