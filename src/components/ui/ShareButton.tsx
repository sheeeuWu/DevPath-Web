"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check } from 'lucide-react';
import styles from './Button.module.css';

interface ShareButtonProps {
    url?: string;
    title?: string;
    text?: string;
    className?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    label?: string;
    showLabel?: boolean;
}

export default function ShareButton({
    url,
    title,
    text,
    className = '',
    variant = 'secondary',
    label = 'Share',
    showLabel = true,
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [isMobileShareSupported, setIsMobileShareSupported] = useState(false);

    useEffect(() => {
        // Detect native mobile/browser share support safely on mount
        if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
            setIsMobileShareSupported(true);
        }
    }, []);

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid triggering any card click events

        const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
        const shareTitle = title || (typeof document !== 'undefined' ? document.title : 'DevPath');
        const shareText = text || 'Check out this learning path on DevPath!';

        if (isMobileShareSupported) {
            try {
                await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: shareUrl,
                });
            } catch (error) {
                // If sharing was aborted or failed, ignore it
                console.warn('Native share cancelled or failed:', error);
            }
        } else {
            // Desktop fallback: copy to clipboard
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
            }
        }
    };

    return (
        <div className="relative inline-block">
            <motion.button
                onClick={handleShare}
                className={`${styles.button} ${styles[variant]} ${className} relative overflow-hidden group`}
                whileHover={{ scale: 1.05, translateY: -2 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                aria-label={copied ? "Link copied to clipboard" : `Share ${title || "roadmap"}`}
                style={{
                    padding: showLabel ? '10px 18px' : '10px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    borderColor: copied ? 'var(--accent-green)' : 'rgba(255, 255, 255, 0.2)',
                    boxShadow: copied ? '0 0 15px rgba(0, 255, 136, 0.3)' : 'none',
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                }}
            >
                <span className="relative z-10 flex items-center justify-center gap-2">
                    <span className="relative flex items-center justify-center h-4 w-4">
                        <AnimatePresence mode="wait">
                            {copied ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0, rotate: -45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 45 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-emerald-400"
                                >
                                    <Check size={16} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="share"
                                    initial={{ scale: 0, rotate: 45 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: -45 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Share2 size={16} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </span>
                    {showLabel && (
                        <span className="font-semibold tracking-wide">
                            {copied ? 'Copied!' : label}
                        </span>
                    )}
                </span>

                {/* Hover shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />

                {/* Dynamic background glow on copy */}
                <div
                    className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, transparent 70%)',
                        opacity: copied ? 1 : 0,
                    }}
                />
            </motion.button>

            {/* Custom toast/tooltip popover for desktop users on copy fallback */}
            <AnimatePresence>
                {copied && !isMobileShareSupported && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: -40, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg pointer-events-none z-50 flex items-center gap-1.5 backdrop-blur-sm border border-emerald-400/30"
                    >
                        <Check size={12} />
                        Copied to Clipboard!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
