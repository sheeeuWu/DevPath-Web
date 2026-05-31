import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AdminKeyModalProps {
    isOpen: boolean;
    onVerified: () => void;
    onCancel: () => void;
}

export default function AdminKeyModal({ isOpen, onVerified, onCancel }: AdminKeyModalProps) {
    const { verifyAdmin } = useAuth();
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Sending key to the secure backend route instead of checking in browser
            const response = await fetch('/api/auth/verify-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                verifyAdmin();
                onVerified();
            } else {
                setError(data.message || 'Invalid Admin Key. Please try again.');
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center mb-6 text-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                                    <Lock size={24} />
                                </div>
                                <h2 className="text-2xl font-bold">Admin Verification</h2>
                                <p className="text-muted-foreground mt-2">
                                    Please enter the Admin Key to continue.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Admin Key</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="password"
                                            value={key}
                                            onChange={(e) => setKey(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Enter key..."
                                            autoFocus
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 mt-6">
                                    <button aria-label="Action button" 
                                        type="button"
                                        onClick={onCancel}
                                        className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button aria-label="Action button" 
                                        type="submit"
                                        disabled={isLoading || !key}
                                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            'Verify'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}