"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ExternalLink, Bookmark, Sparkles, Map, Code } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';
import Link from 'next/link';

interface BookmarkDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BookmarkDrawer({ isOpen, onClose }: BookmarkDrawerProps) {
    const { bookmarks, removeBookmark } = useBookmarks();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        className="fixed top-0 right-0 bottom-0 z-[1600] w-full max-w-md bg-white/95 dark:bg-[#0f1419]/95 backdrop-blur-xl border-l border-black/5 dark:border-white/10 shadow-2xl flex flex-col"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <Bookmark size={20} fill="currentColor" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                                        Saved Resources
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Offline Quick-Access via LocalStorage
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                aria-label="Close Saved Resources Drawer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Bookmarks List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {bookmarks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground animate-pulse">
                                        <Bookmark size={28} />
                                    </div>
                                    <h3 className="font-bold text-foreground mb-1">No saved items yet</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs">
                                        Click the star or bookmark icon on any roadmap or project to save it here for offline access!
                                    </p>
                                </div>
                            ) : (
                                bookmarks.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative p-4 rounded-xl border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-primary/30 transition-all group overflow-hidden"
                                    >
                                        {/* Colored Accent Line */}
                                        <div 
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                                            style={{ backgroundColor: item.color || 'var(--primary)' }}
                                        />

                                        <div className="flex items-start justify-between gap-2 pl-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                        item.type === 'roadmap' 
                                                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                                                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => removeBookmark(item.id)}
                                                    className="p-1.5 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 rounded-lg transition-colors"
                                                    title="Remove Bookmark"
                                                    aria-label={`Remove ${item.title} from bookmarks`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Interactive Action Footer */}
                                        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-2">
                                            {item.type === 'roadmap' ? (
                                                <Link
                                                    href={`/resources?open=roadmap&title=${encodeURIComponent(item.title)}`}
                                                    onClick={onClose}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/95 shadow-sm transition-all"
                                                >
                                                    <Map size={12} />
                                                    View Roadmap
                                                    <ExternalLink size={10} />
                                                </Link>
                                            ) : (
                                                <Link
                                                    href="/profile"
                                                    onClick={onClose}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/95 shadow-sm transition-all"
                                                >
                                                    <Code size={12} />
                                                    View Project
                                                    <ExternalLink size={10} />
                                                </Link>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-6 border-t border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium">
                                <Sparkles size={14} className="text-yellow-500 animate-pulse" />
                                {bookmarks.length} {bookmarks.length === 1 ? 'item' : 'items'} saved offline
                            </span>
                            <span className="opacity-70">Zero-Auth System</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
