"use client";

import { useState, useEffect } from 'react';
import { FlaskConical, AlertTriangle, RotateCcw, Save, Cpu, Globe, Mic, Languages, Glasses, Keyboard, Lock, Brain, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Flags.module.css';

interface Flag {
    id: string;
    name: string;
    description: string;
    status: 'Beta' | 'Experimental' | 'Core';
    category: 'UI' | 'Features' | 'Core';
    enabled: boolean;
}

const defaultFlags: Flag[] = [
    // Existing kept flags
    {
        id: "ai-assistant",
        name: "AI Learning Assistant",
        description: "Enable the context-aware chat widget to help you with coding problems.",
        status: "Beta",
        category: "Features",
        enabled: false
    },
    {
        id: "live-collab",
        name: "Live Collaboration",
        description: "Real-time pair programming sessions with other users.",
        status: "Beta",
        category: "Features",
        enabled: false
    },
    {
        id: "neural-search",
        name: "Neural Search",
        description: "Use vector embeddings for semantic search results.",
        status: "Experimental",
        category: "Core",
        enabled: false
    },
    // New Flags
    {
        id: "quantum-encryption",
        name: "Quantum Encryption",
        description: "End-to-end quantum-resistant cryptography for all data transmission.",
        status: "Core",
        category: "Core",
        enabled: false
    },
    {
        id: "vr-workspace",
        name: "VR Workspace",
        description: "Immersive 3D coding environment optimized for VR headsets.",
        status: "Experimental",
        category: "UI",
        enabled: false
    },
    {
        id: "predictive-typing",
        name: "Predictive Typing",
        description: "Advanced AI that predicts your next function definition before you type.",
        status: "Experimental",
        category: "Features",
        enabled: false
    },
    {
        id: "global-mesh",
        name: "Global Mesh Network",
        description: "Decentralized P2P content delivery for zero-latency asset loading.",
        status: "Core",
        category: "Core",
        enabled: false
    },
    {
        id: "voice-coding",
        name: "Voice Coding Assistant",
        description: "Write complex code structures using natural language voice commands.",
        status: "Experimental",
        category: "Features",
        enabled: false
    },
    {
        id: "real-time-translation",
        name: "Real-time Translation",
        description: "Auto-translate code comments and documentation to your native language.",
        status: "Experimental",
        category: "Features",
        enabled: false
    }
];

export default function FlagsPage() {
    const [flags, setFlags] = useState<Flag[]>(defaultFlags);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from Session Storage on mount
    useEffect(() => {
        const savedFlags = sessionStorage.getItem('devpath_feature_flags');
        if (savedFlags) {
            try {
                const parsed = JSON.parse(savedFlags);
                // Merge saved state with default flags to handle new/removed flags
                const merged = defaultFlags.map(def => {
                    const saved = parsed.find((p: Flag) => p.id === def.id);
                    return saved ? { ...def, enabled: saved.enabled } : def;
                });
                setFlags(merged);
            } catch (e) {
                console.error("Failed to parse flags", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to Session Storage whenever flags change
    useEffect(() => {
        if (isLoaded) {
            sessionStorage.setItem('devpath_feature_flags', JSON.stringify(flags));
        }
    }, [flags, isLoaded]);

    const toggleFlag = (id: string) => {
        setFlags(prev => prev.map(flag =>
            flag.id === id ? { ...flag, enabled: !flag.enabled } : flag
        ));
    };

    const resetFlags = () => {
        setFlags(defaultFlags.map(f => ({ ...f, enabled: false })));
    };

    if (!isLoaded) return null; // Prevent hydration mismatch

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <h1 className={styles.title}>DevPath Labs</h1>
                    <p className={styles.subtitle}>
                        Experimental features from the future. Enable at your own risk.
                        State persists until you close this session.
                    </p>
                </div>

                <div className={styles.warningBanner}>
                    <AlertTriangle size={24} />
                    <span>
                        <strong>Warning:</strong> These features are experimental and unstable.
                        Enabling them may cause unexpected behavior or visual glitches.
                    </span>
                </div>

                {/* Feature Sections */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Cpu size={24} /> Core Systems
                    </h2>
                    <div className={styles.grid}>
                        {flags.filter(f => f.category === 'Core').map(flag => (
                            <FlagCard key={flag.id} flag={flag} onToggle={() => toggleFlag(flag.id)} />
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Sparkles size={24} /> Experimental Features
                    </h2>
                    <div className={styles.grid}>
                        {flags.filter(f => f.category === 'Features').map(flag => (
                            <FlagCard key={flag.id} flag={flag} onToggle={() => toggleFlag(flag.id)} />
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Glasses size={24} /> UI Enhancements
                    </h2>
                    <div className={styles.grid}>
                        {flags.filter(f => f.category === 'UI').map(flag => (
                            <FlagCard key={flag.id} flag={flag} onToggle={() => toggleFlag(flag.id)} />
                        ))}
                    </div>
                </div>

                {/* Coming Soon Section */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <Brain size={24} /> Coming Soon (AI/ML)
                    </h2>
                    <div className={styles.comingSoonGrid}>
                        <div className={styles.comingSoonCard}>
                            <div className={styles.comingSoonIcon}>
                                <Brain size={24} />
                            </div>
                            <div className={styles.comingSoonContent}>
                                <h3>DeepMind Integration</h3>
                                <p>Advanced problem solving agents.</p>
                            </div>
                        </div>
                        <div className={styles.comingSoonCard}>
                            <div className={styles.comingSoonIcon}>
                                <Cpu size={24} />
                            </div>
                            <div className={styles.comingSoonContent}>
                                <h3>Auto-Bug Fixer</h3>
                                <p>Self-healing code capabilities.</p>
                            </div>
                        </div>
                        <div className={styles.comingSoonCard}>
                            <div className={styles.comingSoonIcon}>
                                <Globe size={24} />
                            </div>
                            <div className={styles.comingSoonContent}>
                                <h3>Global Brain</h3>
                                <p>Collective intelligence network.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button aria-label="Action button"  variant="ghost" icon={<RotateCcw size={18} />} onClick={resetFlags}>
                        Reset All
                    </Button>
                </div>
            </div>
        </div>
    );
}

function FlagCard({ flag, onToggle }: { flag: Flag, onToggle: () => void }) {
    return (
        <div className={styles.card}>
            <div className={styles.flagInfo}>
                <div className={styles.flagName}>
                    {flag.name}
                    <span className={`${styles.badge} ${styles[flag.status.toLowerCase()]}`}>
                        {flag.status}
                    </span>
                </div>
                <p className={styles.flagDesc}>{flag.description}</p>
            </div>
            <label className={styles.switch}>
                <input
                    type="checkbox"
                    checked={flag.enabled}
                    onChange={onToggle}
                />
                <span className={styles.slider}></span>
            </label>
        </div>
    );
}
