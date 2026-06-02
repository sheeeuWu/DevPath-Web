"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, limit, Timestamp } from "firebase/firestore"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Notification {
    id: string
    title: string
    message: string
    image?: string
    createdAt?: Timestamp
    read: boolean
   type: 'achievement' | 'message' | 'event' | 'system' | 'event_reminder' | 'announcement' | 'wiki_update'
link?: string
}

const notificationTypeClasses: Record<Notification['type'], string> = {
    achievement: "bg-gradient-to-r from-yellow-500 to-orange-500",
    event: "bg-gradient-to-r from-cyan-500 to-blue-500",
    message: "bg-gradient-to-r from-purple-500 to-pink-500",
    system: "bg-gradient-to-r from-gray-500 to-gray-600",
    event_reminder: "bg-gradient-to-r from-green-500 to-teal-500",
announcement: "bg-gradient-to-r from-blue-500 to-indigo-500",
wiki_update: "bg-gradient-to-r from-violet-500 to-purple-500",
}

export function NotificationDropdown() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const triggerRef = useRef<HTMLButtonElement>(null)

    const closePanel = useCallback(() => {
        setIsOpen(false)
        // Return focus to trigger when panel closes
        triggerRef.current?.focus()
    }, [])

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closePanel()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [isOpen, closePanel])

    useEffect(() => {
        if (!user) {
            let cancelled = false
            window.queueMicrotask(() => {
                if (cancelled) return
                // Clear sensitive state on sign-out / user switch to avoid showing stale notifications.
                setNotifications([])
                setIsOpen(false)
            })
            return () => {
                cancelled = true
            }
        }

        const q = query(
            collection(db, 'members', user.uid, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
            },
            (error) => {
                console.error("Notification subscription error:", error);
                // Gracefully handle permission errors (e.g. rules not yet deployed)
            }
        );

        return () => unsubscribe();
    }, [user]);

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = async (id: string) => {
        if (!user) return;
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await updateDoc(doc(db, 'members', user.uid, 'notifications', id), {
                read: true
            });
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    }

    const markAllAsRead = async () => {
        if (!user) return;
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            const batch = writeBatch(db);
            const unread = notifications.filter(n => !n.read);
            if (unread.length === 0) return;

            unread.forEach(n => {
                const ref = doc(db, 'members', user.uid, 'notifications', n.id);
                batch.update(ref, { read: true });
            });
            await batch.commit();
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    }

    return (
        <div className="sm:relative">
            {/* Bell Button */}
            <button
            <button 
                ref={triggerRef}
                id="notification-trigger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={isOpen}
                aria-haspopup="true"
                aria-controls="notification-panel"
                className="relative p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-bold flex items-center justify-center animate-pulse text-white"
                        aria-hidden="true"
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={closePanel}
                            aria-hidden="true"
                        />

                        {/* Notification Panel */}
                        <motion.div
                            id="notification-panel"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-4 sm:mt-2 w-auto sm:w-96 origin-top sm:origin-top-right bg-white/95 dark:bg-[#0f1419]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-50 max-h-[600px] overflow-hidden"
                            role="region"
                            aria-label="Notifications"
                            aria-live="polite"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white" id="notification-heading">Notifications</h3>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        aria-label={`Mark all ${unreadCount} notifications as read`}
                                        className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* Notifications List */}
                            <div className="overflow-y-auto max-h-[500px]">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif) => (
                                        <motion.div
                                            key={notif.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={cn(
                                                "p-4 border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500",
                                                !notif.read && "bg-black/5 dark:bg-white/5"
                                            )}
                                            onClick={() => markAsRead(notif.id)}
                                            role="button"
                                            tabIndex={0}
                                            aria-label={`${notif.title}: ${notif.message}${!notif.read ? ' (unread)' : ''}`}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault()
                                                    markAsRead(notif.id)
                                                }
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Type Icon */}
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                                                        notificationTypeClasses[notif.type || 'system']
                                                    )}
                                                >
                                                    {notif.type === 'achievement' && '🏆'}
                                                    {notif.type === 'event' && '📅'}
                                                    {notif.type === 'message' && '💬'}
                                                    {(!notif.type || notif.type === 'system') && '🔔'}
                                                    {notif.type === 'event_reminder' && '⏰'}
{notif.type === 'announcement' && '📢'}
{notif.type === 'wiki_update' && '📝'}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{notif.title}</p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                                    </p>
                                                </div>

                                                {/* Unread Indicator */}
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-2" aria-hidden="true" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-black/5 dark:border-white/10 text-center">
                                <Link
                                    href="/notifications"
                                    onClick={closePanel}
                                    aria-label="View all notifications"
                                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                                >
                                    View All Notifications
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
