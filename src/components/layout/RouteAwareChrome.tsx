"use client";

import { usePathname } from 'next/navigation';

import MaintenanceBlocker from '@/components/layout/MaintenanceBlocker';
import MaintenanceBanner from '@/components/layout/MaintenanceBanner';
import OfflineBanner from '@/components/layout/OfflineBanner';
import Navbar from '@/components/layout/Navbar';
import FooterWrapper from '@/components/layout/FooterWrapper';
import PageWrapper from '@/components/layout/PageWrapper';
import { FloatingAssistant } from '@/components/assistant/floating-assistant';
import { ToastContainer } from '@/components/ui/ToastContainer';

export default function RouteAwareChrome({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = pathname === '/login' || pathname === '/signup';

    return (
        <>
            <OfflineBanner />
            {!isAuthRoute && <MaintenanceBanner />}
            <Navbar />

            <MaintenanceBlocker>
                <PageWrapper>
                    {children}
                </PageWrapper>
            </MaintenanceBlocker>

            {!isAuthRoute && <FooterWrapper />}
            {!isAuthRoute && <FloatingAssistant />}
            <ToastContainer />
        </>
    );
}