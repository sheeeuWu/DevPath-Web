"use client";

import { usePathname } from "next/navigation";

export default function PageWrapper({
    children,
}: {
    children: React.ReactNode; 
}) {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const isTeam = pathname === "/team";
    const isAuthRoute = pathname === "/login" || pathname === "/signup";

    return (
        <main
            style={{
                position: "relative",
                // zIndex: 1, // Removed to prevent stacking context issue with modals
                paddingTop: isHome || isTeam ? 0 : isAuthRoute ? "72px" : "150px",
            }}
        >
            {children}
        </main>
    );
}
