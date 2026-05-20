"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/context/AuthContext"
import { db } from "@/lib/firebase"
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch, deleteDoc } from "firebase/firestore"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react"
import Navbar from "@/components/layout/Navbar"

interface Notification {
    id: string
    title: string
    message: string
    image?: string
    createdAt: any
    read: boolean
    type: 'achievement' | 'message' | 'event' | 'system'
}

export default function NotificationsPage() {
    const { user } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'unread'>('all')

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'members', user.uid, 'notifications'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const markAsRead = async (id: string) => {
        if (!user) return;
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

    const deleteNotification = async (id: string) => {
        if (!user) return;
        if (!confirm("Delete this notification?")) return;
        try {
            await deleteDoc(doc(db, 'members', user.uid, 'notifications', id));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    }

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.read);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <div className="pt-24 px-4 md:px-8 max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Bell className="w-8 h-8 text-primary" />
                            Notifications
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Stay updated with your latest activities and announcements.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors text-sm font-medium"
                            disabled={notifications.every(n => n.read)}
                        >
                            <CheckCheck size={16} />
                            Mark all read
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6 border-b border-border">
                    <button
                        onClick={() => setFilter('all')}
                        className={`pb-3 px-4 font-medium transition-colors relative ${filter === 'all' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        All
                        {filter === 'all' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`pb-3 px-4 font-medium transition-colors relative ${filter === 'unread' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Unread
                        {notifications.some(n => !n.read) && (
                            <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                                {notifications.filter(n => !n.read).length}
                            </span>
                        )}
                        {filter === 'unread' && (
                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {/* List */}
                <div className="space-y-4 pb-12">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">Loading notifications...</div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-12 bg-card border border-border rounded-xl">
                            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                            <h3 className="text-lg font-medium">No notifications found</h3>
                            <p className="text-muted-foreground">You're all caught up!</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notif) => (
                                <motion.div
                                    key={notif.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative p-6 rounded-xl border transition-all ${notif.read
                                            ? 'bg-card/50 border-border'
                                            : 'bg-card border-primary/50 shadow-lg shadow-primary/5'
                                        }`}
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xl ${notif.type === 'achievement' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                                notif.type === 'event' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                                                    notif.type === 'message' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                                        'bg-gradient-to-r from-gray-500 to-gray-600'
                                            }`}>
                                            {notif.type === 'achievement' && '🏆'}
                                            {notif.type === 'event' && '📅'}
                                            {notif.type === 'message' && '💬'}
                                            {(!notif.type || notif.type === 'system') && '🔔'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className={`font-semibold text-lg ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notif.read && (
                                                        <button
                                                            onClick={() => markAsRead(notif.id)}
                                                            className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notif.id)}
                                                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>

                                            <p className={`mt-3 leading-relaxed ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                {notif.message}
                                            </p>

                                            {notif.image && (
                                                <div className="mt-4 rounded-lg overflow-hidden border border-border max-w-md relative aspect-video">
                                                    <Image src={notif.image} alt={`${notif.title} notification attachment`} fill className="object-contain" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!notif.read && (
                                        <div className="absolute top-6 right-6 w-3 h-3 bg-primary rounded-full animate-pulse" />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    )
}
