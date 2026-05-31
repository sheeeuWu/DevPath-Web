import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface MaintenanceState {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    loading: boolean;
}

export function useMaintenance() {
    const [state, setState] = useState<MaintenanceState>({
        isMaintenanceMode: false,
        maintenanceMessage: '',
        loading: true,
    });

    useEffect(() => {
        if (!db) {
            setState({
                isMaintenanceMode: false,
                maintenanceMessage: '',
                loading: false,
            });
            return;
        }

        // Subscribe to real-time updates from Firestore
        const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                // Robust check for the boolean, checking for common typos (trailing colon)
                // The user created 'maintenanceMode:' instead of 'maintenanceMode'
                const modeValue = data.maintenanceMode !== undefined ? data.maintenanceMode : data['maintenanceMode:'];

                const rawMessage = data.maintenanceMessage || 'We are currently under scheduled maintenance. Please check back later.';
                const cleanedMessage = rawMessage.replace(/^"|"$/g, '');

                // Handle string "true" or boolean true
                const envOverride = process.env.NEXT_PUBLIC_FORCE_MAINTENANCE === 'true';
                const isActive = envOverride || modeValue === true || modeValue === "true";

                setState({
                    isMaintenanceMode: isActive,
                    maintenanceMessage: cleanedMessage,
                    loading: false,
                });
            } else {
                // If document doesn't exist, assume no maintenance (or handle strictly)
                console.log("Maintenance Hook: Document does not exist");
                setState({
                    isMaintenanceMode: false,
                    maintenanceMessage: '',
                    loading: false,
                });
            }
        }, (error) => {
            console.error("Maintenance Hook: Error fetching maintenance status:", error);
            // On error, default to false to avoid locking everyone out due to permission issues if not intended
            setState(prev => ({ ...prev, loading: false }));
        });

        return () => unsubscribe();
    }, []);

    return state;
}
