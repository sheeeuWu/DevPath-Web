"use client";

import React from 'react';
import { useRemoveToast, useToasts } from '@/stores/ui-store';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export function ToastContainer() {
    const toasts = useToasts();
    const removeToast = useRemoveToast();

    const typeConfig = {
        error: {
            bg: 'bg-red-50 dark:bg-red-950/30',
            border: 'border-red-200 dark:border-red-800',
            text: 'text-red-800 dark:text-red-200',
            icon: AlertCircle,
            color: 'text-red-600 dark:text-red-400'
        },
        success: {
            bg: 'bg-green-50 dark:bg-green-950/30',
            border: 'border-green-200 dark:border-green-800',
            text: 'text-green-800 dark:text-green-200',
            icon: CheckCircle,
            color: 'text-green-600 dark:text-green-400'
        },
        warning: {
            bg: 'bg-amber-50 dark:bg-amber-950/30',
            border: 'border-amber-200 dark:border-amber-800',
            text: 'text-amber-800 dark:text-amber-200',
            icon: AlertTriangle,
            color: 'text-amber-600 dark:text-amber-400'
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            border: 'border-blue-200 dark:border-blue-800',
            text: 'text-blue-800 dark:text-blue-200',
            icon: Info,
            color: 'text-blue-600 dark:text-blue-400'
        }
    };

    return (
        <div aria-live="polite" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
            {toasts.map(toast => {
                const config = typeConfig[toast.type];
                const Icon = config.icon;

                return (
                    <div
                        key={toast.id}
                        className={`${config.bg} ${config.border} ${config.text} border rounded-lg p-4 shadow-lg flex items-start gap-3 pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300`}
                    >
                        <Icon className={`${config.color} flex-shrink-0 mt-0.5`} size={20} />
                        <div className="flex-1 pt-0.5">
                            <p className="text-sm font-medium">{toast.message}</p>
                        </div>
                        <button
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className={`${config.color} flex-shrink-0 hover:opacity-70 transition-opacity`}
                            aria-label="Close notification"
                        >
                            <X size={18} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
