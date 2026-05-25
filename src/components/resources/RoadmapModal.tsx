import {
    X,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Check,
    Download,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { jsPDF } from 'jspdf';
import { useGamification } from '@/context/GamificationContext';
import QuizComponent from './QuizComponent';

// --- FIREBASE IMPORTS ---
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
// TODO: Replace with your actual Firebase config import path
import { db } from '@/lib/firebase'; 
// TODO: Replace with your actual Auth hook/context
import { useAuth } from '@/context/AuthContext'; 

interface RoadmapModalProps {
    isOpen: boolean;
    onClose: () => void;
    roadmap: {
        id?: string; // Added ID for Firestore doc reference
        title: string;
        phases: {
            title: string;
            duration: string;
            icon: ReactNode;
            items: {
                subtitle: string;
                points: string[];
            }[];
        }[];
    } | null;
}

const quizQuestions = [
    {
        question: 'What is React primarily used for?',
        options: [
            'Database Management',
            'Building User Interfaces',
            'Machine Learning',
            'Backend APIs',
        ],
        answer: 'Building User Interfaces',
    },
    {
        question: 'Which hook is used for state management?',
        options: ['useFetch', 'useState', 'useData', 'useStore'],
        answer: 'useState',
    },
    {
        question: 'What does JSX stand for?',
        options: [
            'Java Syntax Extension',
            'JavaScript XML',
            'JSON XML',
            'JavaScript Extension',
        ],
        answer: 'JavaScript XML',
    },
];

export function RoadmapModal({
    isOpen,
    onClose,
    roadmap,
}: RoadmapModalProps) {
    // Custom Auth - Make sure this matches how DevPath handles users
    const { user } = useAuth() || { user: { uid: 'test-user-id' } }; 

    const [mounted, setMounted] = useState(false);
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [completedPhases, setCompletedPhases] = useState<number[]>([]);
    const [showQuiz, setShowQuiz] = useState(false);

    const { addXp } = useGamification();

    useEffect(() => {
        const mountTimeout = window.setTimeout(() => {
            setMounted(true);
        }, 0);

        return () => {
            window.clearTimeout(mountTimeout);
            setMounted(false);
        };
    }, []);

    const handleDownloadPDF = useCallback(async () => {
        if (!roadmap) return;

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 16;
        const contentWidth = pageWidth - margin * 2;
        const bottomMargin = 18;
        const footerHeight = 12;
        const footerY = pageHeight - 10;

        const slugify = (value: string) =>
            value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');

        const loadImageAsDataUrl = async (source: string) => {
            const response = await fetch(source);
            if (!response.ok) {
                throw new Error(`Failed to load image: ${source}`);
            }

            const blob = await response.blob();

            return await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result;
                    if (typeof result === 'string') {
                        resolve(result);
                    } else {
                        reject(new Error('Unable to read logo image'));
                    }
                };
                reader.onerror = () => reject(new Error('Unable to read logo image'));
                reader.readAsDataURL(blob);
            });
        };

        let currentPage = 1;
        let cursorY = margin + 46;

        const addFooter = (pageNumber: number) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor('#94a3b8');
            doc.text(`Page ${pageNumber}`, pageWidth - margin, footerY, { align: 'right' });
        };

        const paintPageBackground = () => {
            doc.setFillColor('#0f0f1a');
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
        };

        const ensureSpace = (requiredHeight: number) => {
            if (cursorY + requiredHeight > pageHeight - bottomMargin - footerHeight) {
                addFooter(currentPage);
                doc.addPage();
                currentPage += 1;
                paintPageBackground();
                cursorY = margin;
                return true;
            }

            return false;
        };

        try {
            let logoDataUrl: string | null = null;

            try {
                logoDataUrl = await loadImageAsDataUrl('/DevPath%20logo.png');
            } catch (error) {
                console.error('Logo load failed:', error);
            }

            paintPageBackground();

            if (logoDataUrl) {
                doc.addImage(logoDataUrl, 'PNG', margin, margin, 22, 22);
            }

            doc.setFillColor('#111827');
            doc.roundedRect(margin + 28, margin, pageWidth - margin * 2 - 28, 22, 3, 3, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.setTextColor('#00f5ff');
            doc.text(roadmap.title, margin + 34, margin + 10, { maxWidth: pageWidth - margin * 2 - 40 });

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor('#e2e8f0');
            doc.text('Interactive Pathway Tutorial', margin + 34, margin + 17);

            for (const phase of roadmap.phases) {
                const phaseLabel = `${phase.title}  •  ${phase.duration}`;
                const estimatedPhaseHeight = 20 + phase.items.reduce((total, item) => {
                    const subtitleLines = doc.splitTextToSize(item.subtitle, contentWidth - 10);
                    const pointLines = item.points.reduce((pointTotal, point) => {
                        const wrapped = doc.splitTextToSize(point, contentWidth - 14);
                        return pointTotal + wrapped.length + 1;
                    }, 0);

                    return total + subtitleLines.length * 5 + pointLines * 4.5 + 10;
                }, 0);

                ensureSpace(estimatedPhaseHeight + 8);

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(15);
                doc.setTextColor('#7c3aed');
                doc.text(phaseLabel, margin, cursorY, { maxWidth: contentWidth });
                cursorY += 8;

                doc.setDrawColor('#7c3aed');
                doc.setLineWidth(0.4);
                doc.line(margin, cursorY - 1, pageWidth - margin, cursorY - 1);

                for (const item of phase.items) {
                    const subtitleLines = doc.splitTextToSize(item.subtitle, contentWidth - 8);
                    const subtitleHeight = subtitleLines.length * 5;
                    ensureSpace(subtitleHeight + 8);

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(11.5);
                    doc.setTextColor('#00f5ff');
                    doc.text(subtitleLines, margin + 2, cursorY + 5);
                    cursorY += subtitleHeight + 2;

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    doc.setTextColor('#e2e8f0');

                    for (const point of item.points) {
                        const wrappedPoint = doc.splitTextToSize(point, contentWidth - 12);
                        const pointHeight = wrappedPoint.length * 4.8;
                        ensureSpace(pointHeight + 4);

                        doc.text('•', margin + 4, cursorY + 4);
                        doc.text(wrappedPoint, margin + 10, cursorY + 4);
                        cursorY += pointHeight + 1.5;
                    }

                    cursorY += 4;
                }

                cursorY += 4;
            }

            addFooter(currentPage);

            const pageCount = doc.getNumberOfPages();
            for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
                doc.setPage(pageNumber);
                addFooter(pageNumber);
            }

            doc.save(`${slugify(roadmap.title)}-roadmap.pdf`);
        } catch (error) {
            console.error('Failed to generate roadmap PDF:', error);
        }
    }, [roadmap]);

    // 1. FETCH PROGRESS ON MODAL OPEN
    useEffect(() => {
        let isMounted = true;

        const fetchProgress = async () => {
            if (isOpen && roadmap && user) {
                try {
                    // Fallback to slugified title if id doesn't exist
                    const roadmapId = roadmap.id || roadmap.title.toLowerCase().replace(/\s+/g, '-');
                    const docRef = doc(db, 'members', user.uid, 'progress', roadmapId);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists() && isMounted) {
                        const data = docSnap.data();
                        setCurrentPhaseIndex(data.lastActiveStep || 0);
                        setCompletedPhases(data.completedPhases || []);
                    } else if (isMounted) {
                        setCurrentPhaseIndex(0);
                        setCompletedPhases([]);
                    }
                } catch (error) {
                    console.error("Error fetching progress from Firestore: ", error);
                    if (isMounted) {
                        setCurrentPhaseIndex(0);
                        setCompletedPhases([]);
                    }
                }
            }
        };

        if (isOpen) {
            fetchProgress();
            const resetQuizTimeout = window.setTimeout(() => {
                if (isMounted) {
                    setShowQuiz(false);
                }
            }, 0);

            return () => {
                window.clearTimeout(resetQuizTimeout);
            };
        }

        return () => { isMounted = false; };
    }, [isOpen, roadmap, user]);

    // 2. DEBOUNCED SAVE PROGRESS ON STEP CHANGE
    useEffect(() => {
        if (!isOpen || !roadmap || !user) return;

        const saveProgress = async () => {
            try {
                const roadmapId = roadmap.id || roadmap.title.toLowerCase().replace(/\s+/g, '-');
                const docRef = doc(db, 'members', user.uid, 'progress', roadmapId);
                
                await setDoc(docRef, {
                    lastActiveStep: currentPhaseIndex,
                    completedPhases: completedPhases,
                    updatedAt: serverTimestamp()
                }, { merge: true });
                
                console.log(`Progress saved: Step ${currentPhaseIndex}`);
            } catch (error) {
                console.error("Error writing progress to Firestore: ", error);
            }
        };

        // Debounce logic: Wait 2.5 seconds before hitting the database
        const timeoutId = setTimeout(() => {
            saveProgress();
        }, 2500); 

        return () => clearTimeout(timeoutId);
    }, [currentPhaseIndex, completedPhases, isOpen, roadmap, user]);

    if (!isOpen || !roadmap || !mounted) return null;

    const activePhase = roadmap.phases[currentPhaseIndex];

    const markPhaseComplete = (index: number) => {
        if (!completedPhases.includes(index)) {
            setCompletedPhases(prev => [...prev, index]);
        }
    };

    const handleNext = () => {
        if (currentPhaseIndex < roadmap.phases.length - 1) {
            markPhaseComplete(currentPhaseIndex);
            setCurrentPhaseIndex((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentPhaseIndex > 0) {
            setCurrentPhaseIndex((prev) => prev - 1);
        }
    };

    const handleComplete = async () => {
        try {
            // Mark final phase as complete
            markPhaseComplete(currentPhaseIndex);

            // Final explicit save for completion
            if (user) {
                const roadmapId = roadmap.id || roadmap.title.toLowerCase().replace(/\s+/g, '-');
                const docRef = doc(db, 'members', user.uid, 'progress', roadmapId);
                await setDoc(docRef, {
                    lastActiveStep: currentPhaseIndex,
                    completedPhases: [...completedPhases, currentPhaseIndex],
                    isCompleted: true,
                    updatedAt: serverTimestamp()
                }, { merge: true });
            }

            addXp(500, `Completed the ${roadmap.title} Pathway!`);
        } catch (err) {
            console.error('Failed to add XP or save final progress: ', err);
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

                            <p className="text-sm text-muted-foreground mt-1">
                                Interactive Pathway Tutorial
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownloadPDF}
                                aria-label="Download PDF"
                                title="Download PDF"
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <Download size={24} />
                            </button>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {!showQuiz ? (
                        <>
                            {/* Progress Steps */}
                            <div className="px-6 pt-6">
                                <div className="flex items-center justify-between bg-muted/20 p-4 rounded-xl border border-border/50 overflow-x-auto scrollbar-hide">
                                    <div className="flex items-center gap-2 w-full justify-between min-w-[300px]">
                                        {roadmap.phases.map((phase, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 flex-grow last:flex-grow-0"
                                            >
                                                <button
                                                    onClick={() => {
                                                        markPhaseComplete(currentPhaseIndex);
                                                        setCurrentPhaseIndex(idx);
                                                    }}
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                        idx === currentPhaseIndex
                                                            ? 'bg-primary text-white scale-110'
                                                            : completedPhases.includes(idx) || idx < currentPhaseIndex
                                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                                            : 'bg-muted text-muted-foreground border border-border'
                                                    }`}
                                                >
                                                    {completedPhases.includes(idx) || idx < currentPhaseIndex ? (
                                                        <Check size={14} />
                                                    ) : (
                                                        idx + 1
                                                    )}
                                                </button>

                                                {idx <
                                                    roadmap.phases.length -
                                                        1 && (
                                                    <div
                                                        className={`h-[2px] flex-grow rounded ${
                                                            completedPhases.includes(idx) || idx < currentPhaseIndex
                                                                ? 'bg-primary'
                                                                : 'bg-muted'
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
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

                                            <div className="text-sm text-muted-foreground font-mono bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50">
                                                Step{' '}
                                                {currentPhaseIndex + 1} of{' '}
                                                {roadmap.phases.length}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {activePhase.items.map((item, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-muted/30 rounded-xl p-5 border border-border/50"
                                                >
                                                    <h4 className="font-semibold text-foreground mb-3 flex items-start gap-2">
                                                        <CheckCircle
                                                            size={16}
                                                            className="text-green-500 mt-1 shrink-0"
                                                        />
                                                        {item.subtitle}
                                                    </h4>

                                                    <ul className="space-y-2">
                                                        {item.points.map(
                                                            (point, j) => (
                                                                <li
                                                                    key={j}
                                                                    className="text-sm text-muted-foreground pl-6 relative before:content-['•'] before:absolute before:left-2"
                                                                >
                                                                    {point}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation */}
                                <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                                    {currentPhaseIndex > 0 ? (
                                        <button
                                            onClick={handleBack}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-muted/80 rounded-xl"
                                        >
                                            <ChevronLeft size={16} />
                                            Previous
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    {currentPhaseIndex <
                                    roadmap.phases.length - 1 ? (
                                        <button
                                            onClick={handleNext}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl"
                                        >
                                            Next
                                            <ChevronRight size={16} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() =>
                                                    setShowQuiz(true)
                                                }
                                                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                                            >
                                                Take Quiz
                                            </button>

                                            <button
                                                onClick={handleComplete}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                                            >
                                                Complete Pathway
                                                <Check size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-6">
                            <QuizComponent 
                                quizId={`roadmap-${roadmap.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-quiz`}
                                questions={quizQuestions}
                                onComplete={() => {
                                    setShowQuiz(false);
                                    handleComplete();
                                }}
                            />
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}