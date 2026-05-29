"use client";

import { motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useMaintenance } from '@/hooks/useMaintenance';

export default function MaintenanceBanner() {
    const { isMaintenanceMode, maintenanceMessage } = useMaintenance();
    console.log("Banner Render: Mode =", isMaintenanceMode, "Msg =", maintenanceMessage);

    if (!isMaintenanceMode) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-[2000] h-[50px] bg-gradient-to-r from-orange-600/90 to-red-600/90 backdrop-blur-md border-b border-white/10 flex items-center justify-center px-4 shadow-lg text-white"
        >
            <div className="flex items-center gap-3 text-sm md:text-base font-medium text-center">
                <AlertTriangle size={18} className="text-white fill-white/20" />
                <span>
                    <span className="font-bold">Scheduled Maintenance:</span> {maintenanceMessage}
                </span>
            </div>
            {/* Dismiss button - optional, keeping it strictly sticky for now as per "closed fully" urgency */}
            {/* <button aria-label="Action button"  
                onClick={() => setIsVisible(false)}
                className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X size={16} />
            </button> */}
        </div>
    );
}
