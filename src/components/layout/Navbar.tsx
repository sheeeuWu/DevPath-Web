"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Github, LogIn, Menu, X, LogOut, Lock } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useAuth } from '@/context/AuthContext';
import { NotificationDropdown } from '@/components/NotificationDropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import styles from './Navbar.module.css';
import { calculateStreak } from '@/lib/streakUtils';
import { useScroll, useSpring } from 'framer-motion';
import { useMaintenance } from '@/hooks/useMaintenance';


const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/courses', label: 'Courses' },
    { href: '/pathway', label: 'Pathway' },
    { href: '/community', label: 'Community' },
    { href: '/resources', label: 'Resources' },
    { href: '/events', label: 'Events' },
    { href: '/opensource', label: 'Open Source' },
    { href: '/team', label: 'Team' },
];

export default function Navbar() {
    const { user, login, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { isMaintenanceMode } = useMaintenance();
    console.log("Navbar Render: isMaintenanceMode =", isMaintenanceMode);

    const toggleMobileMenu = () => {
        if (!isMaintenanceMode) {
            setMobileMenuOpen(!mobileMenuOpen);
        }
    };
    const closeMobileMenu = () => setMobileMenuOpen(false);

    const { currentStreak } = useMemo(() => calculateStreak(user?.loginDates), [user?.loginDates]);
    const pathname = usePathname();


    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    if (pathname === '/ap') return null;

    return (
        <>
            <div
                className={styles.navbarContainer}
                style={{ top: isMaintenanceMode ? '70px' : '20px' }}
            >
                <nav className={styles.navbar} style={{ pointerEvents: isMaintenanceMode ? 'none' : 'auto' }} aria-label="Main navigation">
                    <Link href="/" className={styles.logo} aria-label="DevPath home">
                        <div className={styles.logoIcon}>
                            <Image src={logo} alt="DevPath Logo" width={32} height={32} className="rounded-full" aria-hidden="true" />
                        </div>
                        <span className={styles.logoText}>DevPath</span>
                    </Link>

                    {/* Center Pill Navigation */}
                    <div className={styles.navPill}>
                        <div className={styles.navLinks}>
                            {navLinks.map((link) => (
                                isMaintenanceMode ? (
                                    <span
                                        key={link.href}
                                        role="link"
                                        aria-disabled="true"
                                        tabIndex={0}
                                        className={`${styles.navLink} text-muted-foreground cursor-not-allowed opacity-50 ${link.label === 'Courses' ? 'text-xs' : ''}`}
                                        style={{ fontSize: link.label === 'Courses' ? '0.75rem' : undefined }}
                                        title="Maintenance Mode Active"
                                        aria-label={`${link.label} (unavailable – maintenance mode)`}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); }}
                                    >
                                        {link.label === 'Community' && <Lock size={12} className="inline mr-1" aria-hidden="true" />}
                                        {link.label}
                                    </span>
                                ) : (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`${styles.navLink} ${link.label === 'Courses' ? 'text-xs' : ''}`}
                                        style={{ fontSize: link.label === 'Courses' ? '0.75rem' : undefined }}
                                        aria-current={pathname === link.href ? 'page' : undefined}
                                    >
                                        {link.label}
                                    </Link>
                                )
                            ))}
                        </div>


                        {/* Scroll Progress Line attached to Pill */}
                        <motion.div
                            className={styles.progressBar}
                            style={{ scaleX }}
                        />
                    </div>

                    <div className={styles.actions}>
                        {user && (
                            <div
                                className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 text-orange-500 rounded-full border border-orange-500/20"
                                title={`Current streak: ${currentStreak} days`}
                                aria-label={`Current streak: ${currentStreak} days`}
                            >
                                <Flame size={16} fill="currentColor" aria-hidden="true" />
                                <span className="text-sm font-bold" aria-hidden="true">{currentStreak}</span>
                            </div>
                        )}
                        <ThemeToggle />
                        <a
                            href="https://github.com/devpathindcommunity-india/DevPath-Web"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.iconButton}
                            aria-label="GitHub"
                        >
                            <Github size={20} />
                        </a>

                        <NotificationDropdown />

                        {user ? (
                            <Link href="/profile" className={styles.profileAvatar} title={user.name || 'Profile'}>
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={user.name || 'User'}
                                        width={36}
                                        height={36}
                                        className="rounded-full"
                                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-sm">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </Link>
                        ) : (
                            <Link
                                href={isMaintenanceMode ? "#" : "/login"}
                                className={`${styles.profileButton} ${isMaintenanceMode ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                            >
                                <LogIn size={16} />
                                <span className="hidden sm:inline">Login</span>
                            </Link>
                        )}

                        {/* Hamburger Menu Button (Mobile Only) */}
                        <button
                            className={styles.hamburger}
                            onClick={toggleMobileMenu}
                            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                            aria-expanded={mobileMenuOpen}
                            aria-controls="mobile-nav-drawer"
                            aria-haspopup="dialog"
                        >
                            {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                        </button>
                    </div>
                </nav >
            </div >

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {
                    mobileMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                className={styles.mobileBackdrop}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeMobileMenu}
                            />

                            {/* Drawer */}
                            <motion.div
                                id="mobile-nav-drawer"
                                className={styles.mobileMenu}
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'tween', duration: 0.3 }}
                                role="dialog"
                                aria-modal="true"
                                aria-label="Navigation menu"
                            >
                                <div className={styles.mobileHeader}>
                                    <span className={styles.mobileTitle} id="mobile-nav-title">Menu</span>
                                    <button
                                        className={styles.mobileClose}
                                        onClick={closeMobileMenu}
                                        aria-label="Close navigation menu"
                                    >
                                        <X size={24} aria-hidden="true" />
                                    </button>
                                </div>

                                <nav className={styles.mobileNav} aria-label="Mobile navigation">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={isMaintenanceMode ? "#" : link.href}
                                            className={`${styles.mobileLink} ${isMaintenanceMode ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                            onClick={isMaintenanceMode ? undefined : closeMobileMenu}
                                            aria-current={!isMaintenanceMode && pathname === link.href ? 'page' : undefined}
                                            aria-disabled={isMaintenanceMode}
                                            tabIndex={isMaintenanceMode ? -1 : 0}
                                        >
                                            {link.label}
                                        </Link>

                                    ))}
                                </nav>

                                <div className={styles.mobileActions}>
                                    <div className={styles.mobileActionRow}>
                                        <ThemeToggle />
                                        <span>Toggle Theme</span>
                                    </div>

                                    {user ? (
                                        <Link
                                            href="/profile"
                                            className={styles.mobileProfileButton}
                                            onClick={closeMobileMenu}
                                        >
                                            <span>{user.name}</span>
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className={styles.mobileProfileButton}
                                            onClick={closeMobileMenu}
                                        >
                                            <LogIn size={20} />
                                            <span>Login</span>
                                        </Link>
                                    )}
                                    {user && (
                                        <button aria-label="Action button" 
                                            className={styles.mobileProfileButton}
                                            onClick={() => {
                                                logout();
                                                closeMobileMenu();
                                                window.location.href = '/';
                                            }}
                                            style={{ color: '#ef4444', borderColor: '#ef4444' }}
                                        >
                                            <LogOut size={20} />
                                            <span>Logout</span>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </>
                    )
                }
            </AnimatePresence >
        </>
    );
}
