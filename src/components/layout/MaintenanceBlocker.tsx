"use client";

import { useMaintenance } from "@/hooks/useMaintenance";
import { useAuth } from "@/context/AuthContext";
import MaintenanceOverlay from "@/components/layout/MaintenanceOverlay";

export default function MaintenanceBlocker({ children }: { children: React.ReactNode }) {
    const { isMaintenanceMode, loading: maintenanceLoading } = useMaintenance();
    const { user, isLoading: authLoading } = useAuth();

    // If still checking database or auth, show nothing or a tiny spinner
    if (maintenanceLoading || authLoading) return null; 

    // THE CORE LOGIC: If maintenance is ON and user is NOT an admin, BLOCK THEM.
    if (isMaintenanceMode && !(user as any)?.isAdmin) {
        return <MaintenanceOverlay />;
    }

    // Otherwise, let them see the site normally
    return <>{children}</>;
}