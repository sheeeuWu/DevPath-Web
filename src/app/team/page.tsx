'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { Github, Linkedin, Instagram } from 'lucide-react';
import { teamMembers, TeamMember } from '@/data/team';

interface BorderGlowProps {
    children?: ReactNode;
    className?: string;
    edgeSensitivity?: number;
    glowColor?: string;
    borderRadius?: number;
    glowRadius?: number;
    glowIntensity?: number;
    animated?: boolean;
    colors?: string[];
}

const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

const buildMeshGradients = (colors: string[]): string[] => {
    const gradients: string[] = [];
    for (let i = 0; i < 7; i++) {
        const color = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
        gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${color} 0px, transparent 50%)`);
    }
    gradients.push(`linear-gradient(${colors[0]} 0%, ${colors[0]} 100%)`);
    return gradients;
};

const BorderGlow: React.FC<BorderGlowProps> = ({
    children,
    className = '',
    edgeSensitivity = 30,
    glowColor = '124 58 237',
    borderRadius = 0,
    glowRadius = 30,
    glowIntensity = 1,
    animated = false,
    colors = ['#c084fc', '#22d3ee', '#38bdf8']
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [cursorAngle, setCursorAngle] = useState(45);
    const [edgeProximity, setEdgeProximity] = useState(0);
    const [sweepActive, setSweepActive] = useState(false);

    const getCenterOfElement = useCallback((el: HTMLElement): [number, number] => {
        const { width, height } = el.getBoundingClientRect();
        return [width / 2, height / 2];
    }, []);

    const getEdgeProximity = useCallback((el: HTMLElement, x: number, y: number): number => {
        const [cx, cy] = getCenterOfElement(el);
        const dx = x - cx;
        const dy = y - cy;
        let kx = Infinity;
        let ky = Infinity;
        if (dx !== 0) kx = cx / Math.abs(dx);
        if (dy !== 0) ky = cy / Math.abs(dy);
        return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }, [getCenterOfElement]);

    const getCursorAngle = useCallback((el: HTMLElement, x: number, y: number): number => {
        const [cx, cy] = getCenterOfElement(el);
        const dx = x - cx;
        const dy = y - cy;
        if (dx === 0 && dy === 0) return 0;
        const radians = Math.atan2(dy, dx);
        let degrees = radians * (180 / Math.PI) + 90;
        if (degrees < 0) degrees += 360;
        return degrees;
    }, [getCenterOfElement]);

    const pointerMoveRafRef = useRef<number | null>(null);
    const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);

    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        pointerPositionRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        if (pointerMoveRafRef.current !== null) return;

        pointerMoveRafRef.current = requestAnimationFrame(() => {
            pointerMoveRafRef.current = null;
            const nextCard = cardRef.current;
            const position = pointerPositionRef.current;
            if (!nextCard || !position) return;
            setEdgeProximity(getEdgeProximity(nextCard, position.x, position.y));
            setCursorAngle(getCursorAngle(nextCard, position.x, position.y));
        });
    }, [getEdgeProximity, getCursorAngle]);

    useEffect(() => {
        return () => {
            if (pointerMoveRafRef.current !== null) {
                cancelAnimationFrame(pointerMoveRafRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!animated) return;
        const angleStart = 110;
        const angleEnd = 465;
        requestAnimationFrame(() => setSweepActive(true));
        requestAnimationFrame(() => setCursorAngle(angleStart));

        const t0 = performance.now();
        let raf = 0;
        const duration = 1400;

        const tick = () => {
            const t = Math.min((performance.now() - t0) / duration, 1);
            setCursorAngle((angleEnd - angleStart) * t + angleStart);
            setEdgeProximity(Math.max(0, Math.sin(t * Math.PI)));
            if (t < 1) {
                raf = requestAnimationFrame(tick);
            } else {
                setSweepActive(false);
                setEdgeProximity(0);
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [animated]);

    const colorSensitivity = edgeSensitivity + 20;
    const isVisible = isHovered || sweepActive;
    const borderOpacity = isVisible
        ? Math.max(0, (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity))
        : 0;
    const glowOpacity = isVisible
        ? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity))
        : 0;

    const meshGradients = buildMeshGradients(colors);
    const borderBg = meshGradients.map(gradient => `${gradient} border-box`);

    return (
        <div
            ref={cardRef}
            onPointerMove={handlePointerMove}
            onPointerEnter={() => {
                setIsHovered(true);
                setEdgeProximity(0.85);
            }}
            onPointerLeave={() => {
                setIsHovered(false);
                setEdgeProximity(0);
            }}
            className={`relative isolate overflow-visible ${className}`}
            style={{
                borderRadius: `${borderRadius}px`,
                transform: 'translate3d(0, 0, 0.01px)'
            }}
        >
            <div
                className="absolute inset-0 rounded-[inherit] -z-[1] pointer-events-none"
                style={{
                    border: '1px solid transparent',
                    background: [
                        'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) padding-box',
                        'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
                        ...borderBg
                    ].join(', '),
                    opacity: borderOpacity,
                    maskImage: `radial-gradient(circle at calc(50% + ${Math.cos((cursorAngle - 90) * (Math.PI / 180)) * 35}px) calc(50% + ${Math.sin((cursorAngle - 90) * (Math.PI / 180)) * 35}px), black 0%, transparent 45%)`,
                    WebkitMaskImage: `radial-gradient(circle at calc(50% + ${Math.cos((cursorAngle - 90) * (Math.PI / 180)) * 35}px) calc(50% + ${Math.sin((cursorAngle - 90) * (Math.PI / 180)) * 35}px), black 0%, transparent 45%)`,
                    transition: isVisible ? 'opacity 0.1s ease-out' : 'opacity 0.22s ease-in-out'
                }}
            />

            {/* remove the fill layer to avoid visible rectangular bands behind cards */}

            <span
                className="absolute pointer-events-none rounded-[inherit]"
                style={{
                    inset: `${-glowRadius}px`,
                    opacity: glowOpacity,
                    transition: isVisible ? 'opacity 0.1s ease-out' : 'opacity 0.22s ease-in-out',
                    zIndex: -1,
                    mixBlendMode: 'screen'
                }}
            >
                <span
                    className="absolute rounded-[inherit]"
                    style={{
                        inset: `${glowRadius}px`,
                        boxShadow: `0 0 ${Math.max(16, glowRadius)}px ${Math.max(2, glowRadius / 2)}px rgb(${glowColor} / ${Math.min(0.7, 0.35 + glowIntensity * 0.22)})`
                    }}
                />
            </span>

            <div className="relative z-[1]">{children}</div>
        </div>
    );
};

const getInitials = (name: string): string =>
    name
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

const rolePalette: Record<TeamMember['category'], string> = {
    Owner: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30',
    'Core Admin': 'bg-indigo-400/20 text-indigo-200 border-indigo-300/30',
    Head: 'bg-fuchsia-400/20 text-fuchsia-200 border-fuchsia-300/30',
    'City Lead': 'bg-sky-400/20 text-sky-200 border-sky-300/30'
};

const TeamTile = ({ member, index, stepClass = '' }: { member: TeamMember; index: number; stepClass?: string }) => {
    const shouldReduceMotion = useReducedMotion();
    return (
        <BorderGlow
            className={stepClass}
            glowColor="56 189 248"
            glowRadius={26}
            colors={['#22d3ee', '#38bdf8', '#6366f1']}
        >
            <motion.article
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.35, delay: (index % 12) * 0.03 }}
                className="group relative aspect-[5/4] sm:aspect-[6/5] overflow-hidden bg-[#111a34]"
                style={{
                    clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)'
                }}
            >
                {member.image ? (
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 18vw"
                        className="object-cover object-top grayscale-[35%] contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-2xl font-bold text-white/80">
                        {getInitials(member.name)}
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#050915]/95 via-[#050915]/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-semibold leading-tight truncate">{member.name}</p>
                    <p className="text-cyan-100/80 text-[11px] leading-tight truncate">{member.subRole ?? member.role}</p>
                </div>
            </motion.article>
        </BorderGlow>
    );
};

const ValueCard = ({
    title,
    body
}: {
    title: string;
    body: string;
}) => (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-slate-900 font-semibold text-lg">{title}</h3>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">{body}</p>
    </article>
);

const CoreRoleCard = ({ member, index }: { member: TeamMember; index: number }) => {
    const shouldReduceMotion = useReducedMotion();
    return (
    <BorderGlow
        glowColor="168 85 247"
        glowRadius={28}
        colors={['#a855f7', '#22d3ee', '#38bdf8']}
    >
        <motion.article
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            whileInView={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, delay: (index % 6) * 0.04 }}
            className="relative overflow-hidden bg-[#13213f]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' }}
        >
            <div className="relative h-48 sm:h-52 bg-[#0b1430] overflow-hidden">
                {member.image ? (
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 260px"
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center">
                        <span className="text-5xl sm:text-6xl font-semibold text-black/90 tracking-tight">{getInitials(member.name)}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1226]/80 via-[#0b1226]/15 to-transparent" />
            </div>

            <div className="p-3 sm:p-4">
                <p className="text-white text-lg font-semibold leading-tight truncate">{member.name}</p>
                <p className="text-cyan-300 text-sm font-medium mt-1 truncate">{member.role}</p>
                {member.subRole && (
                    <p className="text-cyan-100/70 text-xs mt-1 truncate">{member.subRole}</p>
                )}

                {member.responsibilities && member.responsibilities.length > 0 && (
                    <ul className="mt-2 space-y-1 text-[11px] text-cyan-50/70 leading-snug">
                        {member.responsibilities.slice(0, 2).map((item, idx) => (
                            <li key={idx} className="truncate">• {item}</li>
                        ))}
                    </ul>
                )}
            </div>
        </motion.article>
    </BorderGlow>
    );
};

export default function TeamPage() {
    const owner = teamMembers.find(member => member.category === 'Owner');
    const cityLeads = teamMembers.filter(member => member.category === 'City Lead');

    const coreAdmins = teamMembers.filter(member => member.category === 'Core Admin');
    const heads = teamMembers.filter(member => member.category === 'Head');

    // keep all left tiles on the same top baseline (no staircase offsets)
    const leftStepPattern = ['mt-0', 'mt-0', 'mt-0', 'mt-0'];

    return (
        <>
            <section className="min-h-screen bg-[#090f1f]">
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute -left-24 top-20 h-[34rem] w-[34rem] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.2), transparent 70%)' }}
                    />
                    <div
                        className="absolute -right-20 bottom-0 h-[28rem] w-[28rem] rounded-full"
                        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent 72%)' }}
                    />
                    <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 1200 800" preserveAspectRatio="none">
                        <path d="M-100 550 C 180 400, 420 640, 720 470 C 910 360, 1070 420, 1310 300" fill="none" stroke="rgba(69,224,255,0.35)" strokeWidth="2" />
                        <path d="M-80 590 C 220 430, 450 680, 760 510 C 940 410, 1110 460, 1330 350" fill="none" stroke="rgba(44,194,255,0.22)" strokeWidth="2" />
                        <path d="M-40 630 C 260 470, 500 720, 810 550 C 980 450, 1160 500, 1360 400" fill="none" stroke="rgba(24,173,255,0.16)" strokeWidth="2" />
                    </svg>
                </div>

                <div className="container mx-auto max-w-[1320px] px-4 pt-6 md:pt-8 pb-16 md:pb-20 relative z-10">
                    <div className="grid lg:grid-cols-12 gap-8 xl:gap-10 items-start lg:order-none order-2">
                        <div className="lg:col-span-8 xl:col-span-8 lg:order-none order-2 pt-12 lg:pt-16">
                            <p className="text-cyan-200/80 text-sm uppercase tracking-[0.2em]">DevPath Community</p>
                            <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white leading-[1.08]">
                                Meet our team
                            </h1>
                            <p className="mt-4 text-cyan-50/75 max-w-2xl leading-relaxed">
                                A mission-focused group of builders, mentors, and organizers creating accessible learning pathways for everyone.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3 text-xs">
                                <span className="px-3 py-1.5 rounded-full border border-white/20 text-white/85 bg-white/5">{teamMembers.length} contributors</span>
                                <span className={`px-3 py-1.5 rounded-full border ${rolePalette['Core Admin']}`}>{coreAdmins.length} core admins</span>
                                <span className={`px-3 py-1.5 rounded-full border ${rolePalette['Head']}`}>{heads.length} heads</span>
                                <span className={`px-3 py-1.5 rounded-full border ${rolePalette['City Lead']}`}>{cityLeads.length} city leads</span>
                            </div>

                            <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 content-start">
                                {cityLeads.map((member, index) => (
                                    <TeamTile
                                        key={member.id}
                                        member={member}
                                        index={index}
                                        stepClass={leftStepPattern[index % leftStepPattern.length]}
                                    />
                                ))}
                            </div>
                        </div>

                            <aside className="lg:col-span-4 xl:col-span-4 lg:sticky lg:top-40 self-start mt-2 lg:mt-0 space-y-6 lg:order-none order-1">
                            {owner ? (
                                <>
                                    <BorderGlow
                                        className="w-fit mx-auto"
                                        glowColor="56 189 248"
                                        glowRadius={36}
                                        colors={['#22d3ee', '#38bdf8', '#6366f1']}
                                        edgeSensitivity={22}
                                    >
                                        <div className="relative w-52 h-52 sm:w-56 sm:h-56 rounded-xl overflow-hidden">
                                            {owner.image ? (
                                                <Image src={owner.image} alt={owner.name} fill className="object-cover" sizes="224px" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white text-3xl font-bold">{getInitials(owner.name)}</div>
                                            )}
                                        </div>
                                    </BorderGlow>

                                    <div className="text-center">
                                        <h2 className="text-2xl font-semibold text-white">{owner.name}</h2>
                                        <p className="text-cyan-100/85 text-sm mt-1">{owner.subRole ?? owner.role}</p>
                                        <p className="text-white/70 text-sm mt-4 leading-relaxed">
                                            Guiding the DevPath vision with clarity, collaboration, and an open-source-first mindset.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-center gap-3">
                                        {owner.socials?.github && (
                                            <a href={owner.socials.github} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 hover:text-white hover:border-cyan-300/60 transition-colors" aria-label={`${owner.name} GitHub`}>
                                                <Github size={16} />
                                            </a>
                                        )}
                                        {owner.socials?.linkedin && (
                                            <a href={owner.socials.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 hover:text-white hover:border-cyan-300/60 transition-colors" aria-label={`${owner.name} LinkedIn`}>
                                                <Linkedin size={16} />
                                            </a>
                                        )}
                                        {owner.socials?.instagram && (
                                            <a href={owner.socials.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-9 items-center justify-center border border-white/20 text-white/80 hover:text-white hover:border-cyan-300/60 transition-colors" aria-label={`${owner.name} Instagram`}>
                                                <Instagram size={16} />
                                            </a>
                                        )}
                                    </div>

                                    <div className="border-t border-white/10 pt-6">
                                        <h3 className="text-white text-sm uppercase tracking-[0.16em] text-center">Core Admins</h3>
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {coreAdmins.map((member, index) => (
                                                <CoreRoleCard key={member.id} member={member} index={index} />
                                            ))}
                                        </div>
                                    </div>

                                    {heads.length > 0 && (
                                        <div className="border-t border-white/10 pt-6">
                                            <h3 className="text-white text-sm uppercase tracking-[0.16em] text-center">Community Heads & Leads</h3>
                                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {heads.map((member, index) => (
                                                    <CoreRoleCard key={member.id} member={member} index={index + coreAdmins.length} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-white/80">Owner profile will appear here.</p>
                            )}
                        </aside>
                    </div>
                    </div>
                </div>
            </section>

            <section className="bg-white py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-sky-700/70 text-sm uppercase tracking-[0.2em]">Our Mission</p>
                        <h2 className="mt-4 text-3xl md:text-5xl font-semibold text-slate-900 leading-tight">
                            We make community-driven learning practical, collaborative, and inclusive.
                        </h2>
                    </div>

                    <div className="mt-12 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
                        <ValueCard title="Build in public" body="We share progress, celebrate contributions, and keep our roadmap transparent." />
                        <ValueCard title="Mentor-first culture" body="Students and early professionals get guidance through hands-on collaboration." />
                        <ValueCard title="Community at scale" body="City leads and role-based teams help us create impact across regions." />
                        <ValueCard title="Practical outcomes" body="Projects, events, and pathways are designed to deliver real career growth." />
                    </div>

                    <div className="mt-10 grid md:grid-cols-2 gap-4">
                        <article className="rounded-2xl border border-slate-200 p-6 bg-slate-50">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Explore</p>
                            <h3 className="mt-2 text-2xl font-semibold text-slate-900">Learn more about the team values</h3>
                            <p className="mt-2 text-slate-600 text-sm">Understand how our team collaborates across mentorship, content, and technical initiatives.</p>
                            <Link href="/community" className="inline-block mt-5 text-sm font-semibold text-sky-700 hover:text-sky-800">Read more</Link>
                        </article>

                        <article className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-br from-[#0f1731] to-[#17254a] text-white">
                            <p className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">Opportunities</p>
                            <h3 className="mt-2 text-2xl font-semibold">Join the team</h3>
                            <p className="mt-2 text-cyan-50/80 text-sm">We are continuously expanding with volunteer and leadership roles in multiple cities.</p>
                            <Link href="/signup" className="inline-block mt-5 text-sm font-semibold text-cyan-200 hover:text-cyan-100">View openings</Link>
                        </article>
                    </div>
                </div>
            </section>
        </>
    );
}
