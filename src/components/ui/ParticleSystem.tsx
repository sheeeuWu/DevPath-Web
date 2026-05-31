"use client";

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    opacity: number;
    symbol: string;
}

export default function ParticleSystem() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const symbols = ['{ }', '< >', '[ ]', '/', '*', ';', '/>'];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            const particleCount = Math.floor(window.innerWidth / 20); // Responsive count
            particles = [];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 14 + 8,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5 - 0.2, // Slight upward drift
                    opacity: Math.random() * 0.3 + 0.1,
                    symbol: symbols[Math.floor(Math.random() * symbols.length)]
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                ctx.font = `${p.size}px monospace`;
                ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
                ctx.fillText(p.symbol, p.x, p.y);

                // Update position
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around screen
                if (p.y < -20) p.y = canvas.height + 20;
                if (p.x < -20) p.x = canvas.width + 20;
                if (p.x > canvas.width + 20) p.x = -20;
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        const handleResize = () => {
            resizeCanvas();
            createParticles();
        };

        window.addEventListener('resize', handleResize);

        resizeCanvas();
        createParticles();
        drawParticles();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
}
