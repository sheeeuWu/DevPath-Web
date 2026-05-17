import { X, CheckCircle, BookOpen, Code, Database, Brain, Rocket, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useGamification } from '@/context/GamificationContext';

interface RoadmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    roadmap: {
        title: string;
        phases: {
            title: string;
            duration: string;
            icon: any;
            items: {
                subtitle: string;
                points: string[];
            }[];
        }[];
    } | null;
}

export function RoadmapModal({ isOpen, onClose, roadmap }: RoadmapModalProps) {
    const [mounted, setMounted] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const { addXp } = useGamification();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Reset current step when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentPhaseIndex(0);
        }
    }, [isOpen]);

    if (!isOpen || !roadmap || !mounted) return null;

    const activePhase = roadmap.phases[currentPhaseIndex];

    const handleNext = () => {
        if (currentPhaseIndex < roadmap.phases.length - 1) {
            setCurrentPhaseIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentPhaseIndex > 0) {
            setCurrentPhaseIndex(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        try {
            addXp(500, `Completed the ${roadmap.title} Pathway!`);
        } catch (err) {
            console.error("Failed to add XP: ", err);
        }
        onClose();
    };

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl custom-scrollbar flex flex-col"
                >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-card/95 backdrop-blur">
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                {roadmap.title}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">Interactive Pathway Tutorial</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Progress Indicator Steps Bar */}
                    <div className="px-6 pt-6">
                        <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50 overflow-x-auto scrollbar-hide">
                            <div className="flex items-center gap-2 w-full justify-between min-w-[300px]">
                                {roadmap.phases.map((phase, idx) => (
                                    <div key={idx} className="flex items-center gap-2 flex-grow last:flex-grow-0">
                                        <button
                                            onClick={() => setCurrentPhaseIndex(idx)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                idx === currentPhaseIndex
                                                    ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/25'
                                                    : idx < currentPhaseIndex
                                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                                    : 'bg-muted text-muted-foreground border border-border'
                                            }`}
                                            title={phase.title}
                                        >
                                            {idx < currentPhaseIndex ? <Check size={14} /> : idx + 1}
                                        </button>
                                        {idx < roadmap.phases.length - 1 && (
                                            <div className={`h-[2px] flex-grow rounded ${
                                                idx < currentPhaseIndex ? 'bg-primary' : 'bg-muted'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-grow">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentPhaseIndex}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6 min-h-[300px]"
                            >
                                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                                            {activePhase.icon}
                                            {activePhase.title}
                                        </h3>
                                        <span className="text-xs font-mono text-primary bg-primary/10 px-3 py-1 rounded-full mt-2 inline-block">
                                            {activePhase.duration}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground font-mono bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50 select-none">
                                        Step {currentPhaseIndex + 1} of {roadmap.phases.length}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activePhase.items.map((item, i) => (
                                        <div key={i} className="bg-muted/30 rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-colors flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-foreground mb-3 flex items-start gap-2">
                                                    <CheckCircle size={16} className="text-green-500 mt-1 shrink-0" />
                                                    {item.subtitle}
                                                </h4>
                                                <ul className="space-y-2">
                                                    {item.points.map((point, j) => (
                                                        <li key={j} className="text-sm text-muted-foreground pl-6 relative before:content-['•'] before:absolute before:left-2 before:text-muted-foreground/50 leading-relaxed">
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                            {currentPhaseIndex > 0 ? (
                                <button
                                    onClick={handleBack}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground text-sm font-semibold rounded-xl transition-all border border-border cursor-pointer select-none"
                                >
                                    <ChevronLeft size={16} /> Previous Step
                                </button>
                            ) : (
                                <div />
                            )}

                            {currentPhaseIndex < roadmap.phases.length - 1 ? (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg shadow-primary/20 cursor-pointer select-none"
                                >
                                    Next Step <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg shadow-emerald-500/20 cursor-pointer select-none"
                                >
                                    Complete Pathway <Check size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
