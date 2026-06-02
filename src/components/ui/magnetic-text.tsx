"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MagneticTextProps {
    text: string
    hoverText?: string
    className?: string
}

export function MagneticText({ text = "CREATIVE", hoverText = "EXPLORE", className }: MagneticTextProps) {
    const overlayRef = useRef<HTMLDivElement>(null)


    const mousePos = useRef({ x: 0, y: 0 })
    const currentPos = useRef({ x: 0, y: 0 })
    const currentRadius = useRef(0)
    const targetRadius = useRef(0)
    const animationFrameRef = useRef<number>(0)

    // Smooth animation loop
    useEffect(() => {
        const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

        const animate = () => {
            // Lerp position
            currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.25)
            currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.25)

            // Lerp radius
            currentRadius.current = lerp(currentRadius.current, targetRadius.current, 0.2)

            // Update clip-path
            if (overlayRef.current) {
                // Recalculate overlay rect each frame so scroll, layout shifts,
                // font loading, and transforms do not desync the clip-path.
                const overlayRect = overlayRef.current.getBoundingClientRect()

                // Calculate mouse position relative to overlay's coordinate space
                // This automatically handles transforms, scales, and parent positioning
                let xRelative = currentPos.current.x - overlayRect.left
                let yRelative = currentPos.current.y - overlayRect.top

                // Clamp coordinates to overlay bounds to prevent visual artifacts
                xRelative = Math.max(0, Math.min(xRelative, overlayRect.width))
                yRelative = Math.max(0, Math.min(yRelative, overlayRect.height))

                overlayRef.current.style.clipPath = `circle(${currentRadius.current}px at ${xRelative}px ${yRelative}px)`
            }

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animationFrameRef.current = requestAnimationFrame(animate)
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        }
    }, [])

    // Track mouse position in viewport coordinates
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Store viewport coordinates - decoupled from element positioning
        mousePos.current = {
            x: e.clientX,
            y: e.clientY,
        }
    }, [])

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Invalidate cached rect to ensure fresh calculation (removed unused ref)

        // Store viewport coordinates - decoupled from element positioning
        const x = e.clientX
        const y = e.clientY
        mousePos.current = { x, y }
        currentPos.current = { x, y }
        targetRadius.current = 55 // 110px diameter

    }, [])

    const handleMouseLeave = useCallback(() => {

        targetRadius.current = 0
    }, [])

    // Accessibility focus
    const handleFocus = useCallback(() => {
        // Invalidate cached rect to ensure fresh calculation (removed unused ref)

        targetRadius.current = 55
        if (overlayRef.current) {
            // Center on overlay in viewport coordinates
            const rect = overlayRef.current.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2
            mousePos.current = { x: centerX, y: centerY }
            currentPos.current = { x: centerX, y: centerY }
        }
    }, [])

    const handleBlur = useCallback(() => {

        targetRadius.current = 0
    }, [])

    // Mobile check and resize handling
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        const handleResize = () => {
            checkMobile()
            // Invalidate cached rect on resize since overlay position may change (removed unused ref)
        }

        checkMobile()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
            className={cn(
                "relative inline-flex items-center justify-center select-none",
                !isMobile && "cursor-none",
                "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg",
                className
            )}
        >
            {/* Base text layer */}
            <span className="text-3xl font-bold tracking-tighter text-foreground">{text}</span>

            {/* Overlay layer with clip-path */}
            <div
                ref={overlayRef}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+300px)] h-[calc(100%+300px)] bg-foreground flex items-center justify-center pointer-events-none"
                style={{
                    willChange: "clip-path",
                    clipPath: "circle(0px at 50% 50%)"
                }}
            >
                <span className="text-3xl font-bold tracking-tighter text-background whitespace-nowrap">
                    {hoverText}
                </span>
            </div>
        </div>
    )
}
