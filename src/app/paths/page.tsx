"use client";

import React, { useState } from 'react';
import LearningPaths from '@/components/home/LearningPaths';
import SkillTreeVisualizer from '@/components/features/SkillTreeVisualizer';

export default function LearningPathsPage() {
    const [view, setView] = useState<'card' | 'tree'>('card');

    return (
        <main className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Learning Paths</h1>
                
                {/* Toggle Button */}
                <div className="flex gap-2 bg-[#161b22] p-1 rounded-lg border border-[#30363d]">
                    <button aria-label="Action button"  
                        onClick={() => setView('card')}
                        className={`px-4 py-2 rounded-md ${view === 'card' ? 'bg-[#238636] text-white' : 'text-[#8b949e]'}`}
                    >
                        Card View
                    </button>
                    <button aria-label="Action button"  
                        onClick={() => setView('tree')}
                        className={`px-4 py-2 rounded-md ${view === 'tree' ? 'bg-[#238636] text-white' : 'text-[#8b949e]'}`}
                    >
                        Tree View
                    </button>
                </div>
            </div>

            {view === 'card' ? <LearningPaths /> : <SkillTreeVisualizer />}
        </main>
    );
}