"use client"
import { motion } from "framer-motion"
import { ReactNode, useState } from "react"
import { useBookmarks, BookmarkItem } from "@/hooks/useBookmarks"
import { Bookmark } from "lucide-react"

interface PremiumCardProps {
    children: ReactNode
    className?: string
    hoverScale?: boolean
    bookmarkItem?: BookmarkItem
}

export function PremiumCard({ children, className = "", hoverScale = true, bookmarkItem }: PremiumCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)
    const { isBookmarked, toggleBookmark } = useBookmarks();

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    const bookmarked = bookmarkItem ? isBookmarked(bookmarkItem.id) : false;

    return (
        <motion.div
            className={`relative group ${className}`}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            whileHover={hoverScale ? { scale: 1.02, y: -8 } : {}}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {/* Glow effect that follows cursor */}
            {isHovering && (
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 212, 255, 0.15), transparent 40%)`,
                    }}
                />
            )}

            {/* Bookmark button */}
            {bookmarkItem && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleBookmark(bookmarkItem);
                    }}
                    className={`absolute top-4 right-4 z-30 p-2.5 rounded-xl border backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 ${
                        bookmarked
                            ? 'bg-yellow-500/20 dark:bg-yellow-500/30 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30'
                            : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10'
                    }`}
                    title={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
                    aria-label={bookmarked ? "Remove Bookmark" : "Save Bookmark"}
                >
                    <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
                </button>
            )}

            {/* Card content */}
            <div className="relative bg-white/70 dark:bg-[#0f1419]/70 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl p-8 transition-all duration-300 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_40px_rgba(0,212,255,0.2)] overflow-hidden h-full">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content */}
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </div>
        </motion.div>
    )
}

