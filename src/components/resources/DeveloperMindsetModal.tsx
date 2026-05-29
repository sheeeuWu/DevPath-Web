import { X, BookOpen, Brain, Terminal, Code, Users, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import { useNotification } from '@/context/NotificationContext';

interface DeveloperMindsetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DeveloperMindsetModal({ isOpen, onClose }: DeveloperMindsetModalProps) {
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleShare = async () => {
        const url = new URL(window.location.href);
        url.searchParams.set('open', 'developer-mindset');
        const copied = await copyToClipboard(url.toString());

        if (copied) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            showSuccess('Developer mindset link copied to clipboard.');
        } else {
            showError('Copying the link is not supported in this browser.');
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <AnimatePresence>
            <div 
             className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={onClose}
            >
               <motion.div
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               onClick={e => e.stopPropagation()}
               className="bg-card w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl custom-scrollbar"
               >
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-card/95 backdrop-blur">
                        <div>
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                Developer Mindset & Engineering Thinking
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">Knowledge Sharing Session Notes</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground relative group"
                                aria-label="Share Link"
                            >
                                {copied ? <Check size={24} className="text-green-500" /> : <Share2 size={24} />}
                                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    {copied ? "Link Copied!" : "Share Link"}
                                </span>
                            </button>
                            <button aria-label="Action button" 
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 space-y-12">
                        {/* Section 1 */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><Brain size={24} /></div>
                                <h3 className="text-xl font-bold text-foreground">1. The Problem With Over-Dependence on AI Tools</h3>
                            </div>
                            <div className="pl-14 space-y-4 text-muted-foreground">
                                <p>AI tools such as ChatGPT are powerful, but over-reliance can create several issues for developers:</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Developers may start <strong className="text-foreground">spending tokens instead of thinking</strong>.</li>
                                    <li>There is a risk of <strong className="text-foreground">losing originality</strong>, since many AI-generated solutions look similar.</li>
                                    <li>Developers may become <strong className="text-foreground">too dependent on AI</strong> for coding tasks, creating an <strong className="text-foreground">illusion of coding ability</strong>.</li>
                                </ul>
                                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                                    <p className="font-semibold text-primary">Key Insight:</p>
                                    <p>AI can assist with coding, but it cannot replace engineering thinking.</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Code size={24} /></div>
                                <h3 className="text-xl font-bold text-foreground">2. Coding vs Engineering</h3>
                            </div>
                            <div className="pl-14 grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground">
                                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                                    <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2"><Terminal size={18} /> Coding Focus</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Syntax & Framework usage</li>
                                        <li>Implementing features</li>
                                        <li>Following tutorials</li>
                                    </ul>
                                </div>
                                <div className="bg-primary/5 p-5 rounded-xl border border-primary/20">
                                    <h4 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2"><Brain size={18} /> Engineering Focus</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Understanding the problem</li>
                                        <li>Designing systems</li>
                                        <li>Making technical decisions</li>
                                        <li>Managing trade-offs (Scalability, Maintainability)</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="pl-14 mt-6">
                                <blockquote className="border-l-4 border-primary pl-4 italic text-foreground text-lg">
                                    Instead of asking "What technology should I use?", engineers ask "What problem am I solving?"
                                </blockquote>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><Terminal size={24} /></div>
                                <h3 className="text-xl font-bold text-foreground">3. Problem Solving & Debugging Mindset</h3>
                            </div>
                            <div className="pl-14 space-y-4 text-muted-foreground">
                                <p>Strong developers focus on problem-solving ability rather than just coding. Key components include problem decomposition, root cause analysis, and logical reasoning.</p>
                                <div className="p-4 bg-muted/30 rounded-xl border border-border mt-4">
                                    <h4 className="font-semibold text-foreground mb-2">A good engineer must be able to:</h4>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>Trace errors and investigate issues</li>
                                        <li>Understand system behavior</li>
                                        <li>Identify root causes</li>
                                    </ul>
                                </div>
                                <p className="font-medium text-foreground mt-4">Debugging and problem-solving are far more valuable than memorizing syntax or tutorials.</p>
                            </div>
                        </section>

                        {/* Section 4 & 5 Combined */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><BookOpen size={24} /></div>
                                <h3 className="text-xl font-bold text-foreground">4. Certifications, Projects & The AI Bubble</h3>
                            </div>
                            <div className="pl-14 space-y-4 text-muted-foreground">
                                <p>Many developers focus heavily on certifications, but they often show theoretical knowledge, not real engineering experience.</p>
                                <div className="bg-primary/10 text-primary p-4 rounded-xl border border-primary/20 mb-4 inline-block font-semibold">
                                    Projects matter more than certificates.
                                </div>
                                <p>With the current AI hype, the AI bubble may reduce basic coding barriers. Developers will still need strong fundamentals: Problem decomposition, Debugging ability, Curiosity, Product thinking, System design, and Ownership mindset.</p>
                            </div>
                        </section>

                        {/* Additional Points */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg"><Users size={24} /></div>
                                <h3 className="text-xl font-bold text-foreground">5. Ownership, Failure & System Design</h3>
                            </div>
                            <div className="pl-14 space-y-6 text-muted-foreground">
                                <div>
                                    <h4 className="font-semibold text-foreground text-lg">Curiosity & Ownership</h4>
                                    <p className="mt-2">Curiosity builds better systems. Strong engineers demonstrate ownership—they think about the entire system, care about product success, and improve solutions proactively rather than just completing assigned tasks.</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground text-lg">Failure → Investigation → Insight</h4>
                                    <p className="mt-2">Instead of avoiding failure, engineers use it to gain a better understanding, make better design decisions, and improve system architecture.</p>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-xl border border-border">
                                    <h4 className="font-semibold text-foreground">Managing Technical Trade-offs</h4>
                                    <p className="mt-2">Every decision has trade-offs: Speed vs Scalability, Simplicity vs Flexibility, Development time vs Performance. Strong engineers manage these effectively.</p>
                                </div>
                            </div>
                        </section>

                        {/* Interviews & Marketing */}
                        <section>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-500/10 text-teal-500 rounded-lg"><BookOpen size={24} /></div>
                                <h3 className="text-xl font-bold text-foreground">6. Hiring, Resumes & Interviews</h3>
                            </div>
                            <div className="pl-14 space-y-4 text-muted-foreground">
                                <p><strong className="text-foreground">Skills</strong> help you get shortlisted, but <strong className="text-foreground">Problem Solving</strong> helps you get hired.</p>
                                <p>Companies use ATS (Applicant Tracking Systems) that look for internships, keywords, and stack. During interviews, GitHub plays a major role to demonstrate real experience, consistency, and ownership.</p>
                                <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                                    <h4 className="font-semibold text-foreground mb-3">Effective Portfolio/Interview Structure</h4>
                                    <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-stretch text-center sm:text-left">
                                        <div className="flex-1 bg-background p-3 rounded-lg border border-border">
                                            <span className="text-xs font-bold text-primary uppercase block mb-1">Problem</span>
                                            Manual resume screening was time-consuming.
                                        </div>
                                        <div className="flex items-center text-muted-foreground">→</div>
                                        <div className="flex-1 bg-background p-3 rounded-lg border border-border">
                                            <span className="text-xs font-bold text-primary uppercase block mb-1">Solution</span>
                                            Built an AI-powered resume parser.
                                        </div>
                                        <div className="flex items-center text-muted-foreground">→</div>
                                        <div className="flex-1 bg-background p-3 rounded-lg border border-border">
                                            <span className="text-xs font-bold text-primary uppercase block mb-1">Impact</span>
                                            Reduced screening time by 80%.
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-4"><strong className="text-foreground">Weak Approach:</strong> Listing technologies. <strong className="text-foreground">Strong Approach:</strong> Explain what challenge existed, how you approached it, why specific decisions were made, and the impact created.</p>
                            </div>
                        </section>

                        <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20 text-center">
                            <h3 className="text-xl font-bold text-foreground mb-2">Final Core Message</h3>
                            <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
                                Great engineers do not focus on writing code faster. They focus on understanding problems deeply, designing intelligent systems, making thoughtful technical decisions, and creating real-world impact.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    );
}
