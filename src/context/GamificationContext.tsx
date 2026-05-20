"use client";

import React, { createContext, useContext, useState } from 'react';
import { Trophy, Zap, ArrowUpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export type NotificationType = 'xp' | 'achievement' | 'level-up';

interface GamificationNotification {
    id: number;
    title: string;
    subtitle: string;
    type: NotificationType;
}

interface GamificationContextType {
    xp: number;
    level: number;
    addXp: (amount: number, reason: string, type?: NotificationType, options?: AddXpOptions) => void;
    notifications: GamificationNotification[];
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface AddXpOptions {
    persist?: boolean;
}

const ToastMessage = ({ n, removeNotification }: { n: GamificationNotification, removeNotification: (id: number) => void }) => {
    let Icon = Zap;
    let colorTheme = '#06b6d4'; // Cyan
    let bgTheme = 'rgba(6, 182, 212, 0.1)';
    let borderTheme = 'rgba(6, 182, 212, 0.3)';
    let gradient = 'radial-gradient(circle at 0% 0%, rgba(6,182,212,0.15) 0%, transparent 70%)';

    if (n.type === 'achievement') {
        Icon = Trophy;
        colorTheme = '#f59e0b';
        bgTheme = 'rgba(245, 158, 11, 0.1)';
        borderTheme = 'rgba(245, 158, 11, 0.3)';
        gradient = 'radial-gradient(circle at 0% 0%, rgba(245,158,11,0.15) 0%, transparent 70%)';
    } else if (n.type === 'level-up') {
        Icon = ArrowUpCircle;
        colorTheme = '#10b981';
        bgTheme = 'rgba(16, 185, 129, 0.1)';
        borderTheme = 'rgba(16, 185, 129, 0.3)';
        gradient = 'radial-gradient(circle at 0% 0%, rgba(16,185,129,0.15) 0%, transparent 70%)';
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)', transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
                background: 'rgba(15, 20, 25, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: `1px solid ${borderTheme}`,
                borderRadius: '16px',
                padding: '16px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: `0 10px 40px -10px rgba(0,0,0,0.5), 0 0 20px ${bgTheme}`,
                position: 'relative',
                overflow: 'hidden',
                width: '340px',
                pointerEvents: 'auto',
                cursor: 'pointer'
            }}
            onClick={() => removeNotification(n.id)}
        >
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: gradient, pointerEvents: 'none'
            }} />
            
            <div style={{ 
                background: bgTheme, 
                padding: '12px', 
                borderRadius: '12px', 
                color: colorTheme,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `inset 0 0 20px ${bgTheme}`
            }}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 1, flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '15px', letterSpacing: '0.02em', color: '#fff' }}>
                    {n.title}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4, fontWeight: 400 }}>
                    {n.subtitle}
                </span>
            </div>

            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    background: colorTheme,
                    boxShadow: `0 0 10px ${colorTheme}`,
                    borderRadius: '0 0 0 16px'
                }}
            />
        </motion.div>
    );
};

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const { user, updateUserProfile } = useAuth();
    const [notifications, setNotifications] = useState<GamificationNotification[]>([]);

    const xp = user?.points || 0;
    const level = Math.floor(Math.sqrt(xp / 100));

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const addXp = (
        amount: number,
        reason: string,
        type: NotificationType = 'xp',
        options: AddXpOptions = {}
    ) => {
        const shouldPersist = options.persist !== false;
        const newXp = xp + amount;
        const currentLevel = Math.floor(Math.sqrt(xp / 100));
        const newLevel = Math.floor(Math.sqrt(newXp / 100));
        
        if (user && shouldPersist) {
            // Persist XP to Firestore securely for authenticated users only.
            updateUserProfile({ points: newXp }).catch(err => console.error("Failed to update XP", err));
        }

        const baseId = Date.now();
        const newNotifications = [{ 
            id: baseId, 
            title: type === 'achievement' ? 'Achievement Unlocked' : `+${amount} XP`, 
            subtitle: reason, 
            type 
        }];
        
        if (user && newLevel > currentLevel) {
            newNotifications.push({ 
                id: baseId + 1, 
                title: `Level Up!`, 
                subtitle: `You reached Level ${newLevel}`, 
                type: 'level-up' 
            });
        }
        
        setNotifications(prevNotifs => [...prevNotifs, ...newNotifications]);
        
        newNotifications.forEach(n => {
            setTimeout(() => {
                removeNotification(n.id);
            }, 4000);
        });
    };

    return (
        <GamificationContext.Provider value={{ xp, level, addXp, notifications }}>
            {children}

            <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '16px', pointerEvents: 'none' }}>
                <AnimatePresence>
                    {notifications.map(n => (
                        <ToastMessage key={n.id} n={n} removeNotification={removeNotification} />
                    ))}
                </AnimatePresence>
            </div>
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}
