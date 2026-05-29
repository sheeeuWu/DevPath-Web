"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Key, Lock, ArrowLeft, Home } from 'lucide-react';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import AdminDashboard from '@/components/admin/AdminDashboard';

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

export default function SuperAdminLogin() {
    const { user } = useAuth();
    const router = useRouter();
    const [key, setKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Redirect if not Super Admin email (after login)
    useEffect(() => {
        const validateSession = async () => {
            if (user && user.email !== SUPER_ADMIN_EMAIL) {
                router.push('/');
            } else if (user && user.email === SUPER_ADMIN_EMAIL) {
                // Validate session key against Firestore
                const sessionKey = sessionStorage.getItem('admin_session_key');
                if (sessionKey) {
                    try {
                        const keyDoc = await getDoc(doc(db, 'superadmin_keys', 'config'));
                        if (keyDoc.exists() && keyDoc.data().value === sessionKey) {
                            setIsAuthenticated(true);
                        } else {
                            // Invalid or expired session key
                            sessionStorage.removeItem('admin_session_key');
                            setIsAuthenticated(false);
                        }
                    } catch (error) {
                        console.error('Session validation failed:', error);
                        sessionStorage.removeItem('admin_session_key');
                        setIsAuthenticated(false);
                    }
                }
            }
        };
        validateSession();
    }, [user, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Verify Key First
            const keyDoc = await getDoc(doc(db, 'superadmin_keys', 'config'));
            if (!keyDoc.exists() || keyDoc.data().value !== key.trim()) {
                setError("Invalid Security Key");
                setLoading(false);
                return;
            }

            sessionStorage.setItem('admin_session_key', key.trim());

            // 2. Verify Authentication Context
            // User must already be authenticated from the main site to perform actions
            if (!auth.currentUser || auth.currentUser.email !== SUPER_ADMIN_EMAIL) {
                setError("You must be logged in with the Super Admin account first.");
                setLoading(false);
                return;
            }

            setIsAuthenticated(true);

        } catch (err) {
            console.error(err);
            setError("Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                <Shield size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">Restricted Access</h1>
                <p className="text-zinc-400 mb-6 text-center max-w-sm">You must be logged in with a Super Admin account to access this page.</p>
                <button aria-label="Action button"  onClick={() => router.push('/')} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                    Go to Login
                </button>
            </div>
        );
    }

    if (user.email !== SUPER_ADMIN_EMAIL) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
                {/* Ambient glow */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-md w-full bg-zinc-900/90 border border-red-900/40 rounded-2xl p-10 shadow-2xl backdrop-blur-sm text-center">
                    {/* Icon badge */}
                    <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={36} className="text-red-500" strokeWidth={1.5} />
                    </div>

                    {/* Header */}
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                        Access Denied
                    </h1>
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full mb-5">
                        <Shield size={11} />
                        Restricted Area
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                        You do not have the required privileges to access this portal.
                        This area is reserved for authorized Super Admin accounts only.
                        All unauthorized access attempts are logged.
                    </p>

                    {/* Divider */}
                    <div className="border-t border-zinc-800 mb-8" />

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
                        >
                            <ArrowLeft size={15} />
                            Go Back
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Home size={15} />
                            Return Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <AdminDashboard initialAuth={true} />;
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Super Admin Access</h1>
                    <p className="text-zinc-400 mt-2">Restricted Area. Authorized Personnel Only.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Security Key</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                            <input
                                type="password"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                placeholder="Enter your secure key"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button aria-label="Action button" 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Access Console'} <Lock size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
