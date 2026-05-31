
"use client";

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Trophy, Award, Zap, Lightbulb, Monitor, Play, Info } from 'lucide-react';
import rankingsData from '@/data/rankings.json';

interface Ranking {
    rank: number;
    project: string;
    total: number;
    details: {
        originality: number;
        technical: number;
        design: number;
        innovation: number;
        presentation: number;
    };
}

export default function RankingsTable() {
    return (
        <div className="w-full max-w-4xl mx-auto mt-24 space-y-8">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-sm font-medium">
                    <Trophy size={16} />
                    <span>Hall of Fame</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white">Top 20 Rankings</h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    Celebrating the most innovative and impactful projects from HackFiesta.
                </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                    <div className="col-span-6 md:col-span-7">Project Name</div>
                    <div className="col-span-4 md:col-span-4 text-right">Action</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-white/5">
                    {rankingsData.map((item: Ranking) => (
                        <RankingRow key={item.rank} item={item} />
                    ))}
                </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden p-6 space-y-4">
                <div className="flex items-center gap-2 text-yellow-500 font-medium pb-2 border-b border-white/10">
                    <Info size={18} />
                    <span>Ranking Adjustments & Bonus Points</span>
                </div>
                <ul className="space-y-2 text-slate-400 text-sm list-disc pl-5">
                    <li><span className="text-green-400 font-medium">+2 points</span> - Solo Participation</li>
                    <li><span className="text-red-400 font-medium">-1 point</span> - For having an Advanced commit on 20th January</li>
                    <li><span className="text-white font-medium">Team Ecosage</span> and <span className="text-white font-medium">AidLedger</span> got <span className="text-green-400 font-medium">+2 points</span> for their Exceptional Video and PPT based explantion from our Content Head of Community.</li>
                    <li><span className="text-green-400 font-medium">+1 point</span> to <span className="text-white font-medium">Tiya</span> for having a Cross Platform app and for full Production grade App</li>
                </ul>
            </div>
        </div>
    );
}

function RankingRow({ item }: { item: Ranking }) {
    const [isOpen, setIsOpen] = useState(false);

    // Colors for ranks
    let rankColor = "text-slate-400";
    let bgHighlight = "";
    if (item.rank === 1) { rankColor = "text-yellow-400"; bgHighlight = "bg-yellow-500/5"; }
    else if (item.rank === 2) { rankColor = "text-slate-300"; bgHighlight = "bg-slate-300/5"; }
    else if (item.rank === 3) { rankColor = "text-amber-600"; bgHighlight = "bg-amber-600/5"; }

    return (
        <div className={`group transition-colors ${bgHighlight} hover:bg-white/5`}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="grid grid-cols-12 gap-4 p-4 items-center cursor-pointer"
            >
                <div className={`col-span-2 md:col-span-1 text-center font-bold text-lg ${rankColor}`}>
                    #{item.rank}
                </div>
                <div className="col-span-6 md:col-span-7 font-medium text-white">
                    {item.project}
                </div>
                <div className="col-span-4 md:col-span-4 text-right flex items-center justify-end gap-3 text-sm">
                    <span className="font-mono text-slate-300 hidden sm:block">{item.total} pts</span>
                    <button aria-label="Action button" 
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isOpen ? 'bg-primary text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                    >
                        {isOpen ? 'Close' : 'View Feedback'}
                        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/20"
                    >
                        <div className="p-4 md:p-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <ScoreCard label="Originality" score={item.details.originality} icon={<Lightbulb size={16} />} />
                            <ScoreCard label="Technical" score={item.details.technical} icon={<Monitor size={16} />} />
                            <ScoreCard label="Design" score={item.details.design} icon={<Award size={16} />} />
                            <ScoreCard label="Innovation" score={item.details.innovation} icon={<Zap size={16} />} />
                            <ScoreCard label="Presentation" score={item.details.presentation} icon={<Play size={16} />} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ScoreCard({ label, score, icon }: { label: string, score: number, icon: ReactNode }) {
    return (
        <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex flex-col items-center justify-center text-center gap-2">
            <div className="text-slate-400 mb-1">{icon}</div>
            <div className="text-xs text-slate-500 uppercase font-semibold">{label}</div>
            <div className="text-xl font-bold text-white">{score}</div>
        </div>
    );
}
