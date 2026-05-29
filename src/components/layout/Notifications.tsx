"use client";

import { useState, useRef, useEffect } from 'react';
import { Bell, MessageSquare, Trophy, Calendar, Star } from 'lucide-react';
import styles from './Notifications.module.css';

const initialNotifications = [
    {
        id: 1,
        type: 'reply',
        message: "Sarah Chen replied to your comment on 'React Patterns'",
        time: "2 min ago",
        read: false,
        icon: <MessageSquare size={16} />
    },
    {
        id: 2,
        type: 'achievement',
        message: "You unlocked the 'Code Warrior' badge!",
        time: "1 hour ago",
        read: false,
        icon: <Trophy size={16} />
    },
    {
        id: 3,
        type: 'event',
        message: "Reminder: 'System Design Workshop' starts in 30 mins",
        time: "30 min ago",
        read: true,
        icon: <Calendar size={16} />
    },
    {
        id: 4,
        type: 'star',
        message: "Your project 'AI Assistant' reached 100 stars!",
        time: "5 hours ago",
        read: true,
        icon: <Star size={16} />
    }
];

export default function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const handleNotificationClick = (id: number) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button aria-label="Action button" 
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <span className={styles.title}>Notifications</span>
                        {unreadCount > 0 && (
                            <button aria-label="Action button"  className={styles.markRead} onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className={styles.list}>
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`${styles.notification} ${!notification.read ? styles.unread : ''}`}
                                onClick={() => handleNotificationClick(notification.id)}
                            >
                                <div className={styles.icon}>
                                    {notification.icon}
                                </div>
                                <div className={styles.content}>
                                    <p className={styles.message}>{notification.message}</p>
                                    <span className={styles.time}>{notification.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
