"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import Link from 'next/link';
import AdminKeyModal from '@/components/auth/AdminKeyModal';
import { useMaintenance } from '@/hooks/useMaintenance';
import { AlertTriangle } from 'lucide-react';
import {doc , getDoc} from 'firebase/firestore'
import { db } from '@/lib/firebase';


export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showAdminKeyModal, setShowAdminKeyModal] = useState(false);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
    const { login, user, isLoading, logout, isAdminVerified } = useAuth();
    const router = useRouter();
    const { isMaintenanceMode, maintenanceMessage } = useMaintenance();


    // Handle redirection for logged-in users
    useEffect(() => {
        if (!isLoading && user) {
            if (user.role === 'admin') {
                // If user is admin, ALWAYS require verification if not yet verified
                if (!isAdminVerified && !showAdminKeyModal && !isCheckingAdmin) {
                    setShowAdminKeyModal(true);
                } else if (isAdminVerified) {
                    router.push('/profile');
                }
            } else {
                // If regular user, redirect to profile
                router.push('/profile');
            }
        }
    }, [user, isLoading, router, user?.role, isAdminVerified]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsCheckingAdmin(true); // Prevent auto-redirect while we check

        try {
            await login(email, password);
            // Login successful. Now check if admin.



const adminDoc = await getDoc(doc(db, 'admins', email));
            if (adminDoc.exists()) {
                setShowAdminKeyModal(true);
            } else {
                router.push('/profile');
            }

        } catch (err: any) {
            console.error(err);
            setError('Login failed. Please check your credentials.');
            setIsCheckingAdmin(false); // Reset on error
        }
    };

    const handleAdminVerified = () => {
        setShowAdminKeyModal(false);
        router.push('/profile');
    };

    const handleAdminCancel = async () => {
        setShowAdminKeyModal(false);
        await logout(); // Logout if they cancel verification
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <AdminKeyModal
                isOpen={showAdminKeyModal}
                onVerified={handleAdminVerified}
                onCancel={handleAdminCancel}
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to continue to DevPath</p>
                    </div>

                    {isMaintenanceMode && (
                        <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3 text-orange-500">
                            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                            <div className="text-sm">
                                <p className="font-bold mb-1">Login Disabled</p>
                                <p>{maintenanceMessage}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="name@example.com"
                                required
                                disabled={isMaintenanceMode}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                placeholder="••••••••"
                                required
                                disabled={isMaintenanceMode}
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">{error}</div>
                        )}

                        <button aria-label="Action button" 
                            type="submit"
                            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isMaintenanceMode}
                        >
                            <LogIn size={18} />

                            Login
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-primary hover:underline">
                            Sign up
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
