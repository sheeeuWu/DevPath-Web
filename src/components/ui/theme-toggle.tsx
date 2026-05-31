"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import Button from "@/components/ui/Button"
import { useAuth } from "@/context/AuthContext"

type ThemePreference = "light" | "dark"

export function ThemeToggle() {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const { user, updateUserProfile } = useAuth()
    const pendingThemeRef = React.useRef<ThemePreference | null>(null)

    // Fix (Issue #261): Track hydration to prevent flash of incorrect theme.
    // Before Next.js hydration completes, `theme` is undefined so the Sun/Moon
    // icons render in the wrong state, causing a visible flash on page load.
    const [mounted, setMounted] = React.useState(false)

    // useEffect only runs on the client, so `mounted` becomes true only after
    // hydration — at which point the correct saved theme is known.
    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (!mounted) return

        const savedTheme = user?.preferences?.theme

        if (pendingThemeRef.current) {
            if (savedTheme === pendingThemeRef.current) {
                pendingThemeRef.current = null
            }
            return
        }

        if (!savedTheme || savedTheme === resolvedTheme) return

        setTheme(savedTheme)
    }, [mounted, resolvedTheme, setTheme, user?.preferences?.theme])

    const handleToggle = async () => {
        const currentTheme = (resolvedTheme || theme) === "light" ? "light" : "dark"
        const nextTheme: ThemePreference = currentTheme === "light" ? "dark" : "light"

        setTheme(nextTheme)

        if (!user) return

        pendingThemeRef.current = nextTheme

        try {
            await updateUserProfile({
                preferences: {
                    ...user.preferences,
                    theme: nextTheme
                }
            })
        } catch (error) {
            pendingThemeRef.current = null
            console.error("Error saving theme preference:", error)
        }
    }

    // Render a same-sized disabled placeholder before hydration to avoid layout
    // shift and prevent theme-dependent icons from flickering.
    if (!mounted) {
        return (
            <Button
                variant="ghost"
                disabled
                aria-hidden="true"
                className="relative h-9 w-9 rounded-full border border-white/10 bg-white/5 p-0 flex items-center justify-center"
            >
                <span className="sr-only">Toggle theme</span>
            </Button>
        )
    }

    // After hydration, theme is resolved — render the real toggle safely.
    return (
        <Button aria-label="Toggle theme"
            variant="ghost"
            onClick={handleToggle}
            className="relative h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors p-0 flex items-center justify-center"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-400" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-cyan-400" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
