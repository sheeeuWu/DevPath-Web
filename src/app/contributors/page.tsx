"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Github, Code, FileText, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Contributors.module.css';

// Type definitions
interface Contributor {
    name: string;
    handle: string;
    contributions: number;
    types: string[];
    avatar: string | null;
}

interface TopContributor {
    name: string;
    handle: string;
    contributions: number;
    rank: number;
    avatar: string | null;
}

// Fallback lists if API fails or rate-limit is hit
const FALLBACK_TOP: TopContributor[] = [
    { name: "Aditya Patil", handle: "@Aditya948351", contributions: 500, rank: 1, avatar: null },
    { name: "schrodingerspet", handle: "@schrodingerspet", contributions: 300, rank: 2, avatar: null },
    { name: "Niteshagarwal01", handle: "@Niteshagarwal01", contributions: 150, rank: 3, avatar: null },
];

const contributors: Contributor[] = [
    { name: "Aditya Patil", handle: "@Aditya948351", contributions: 500, types: ["code", "design", "community"], avatar: "AP" },
];

export default function ContributorsPage() {
    const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
    const [stats, setStats] = useState({
        totalContributors: 1240,
        totalContributions: 15400,
        activeThisMonth: 128,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContributorsData() {
            try {
                const res = await fetch('https://api.github.com/repos/devpathindcommunity-india/DevPath-Web/contributors');
                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.statusText}`);
                }
                const data = await res.json();
                
                // Sort by contributions descending
                const sorted = [...data].sort((a: any, b: any) => b.contributions - a.contributions);
                
                // Extract top 3
                const mappedTop = sorted.slice(0, 3).map((c: any, index: number) => ({
                    name: c.login,
                    handle: `@${c.login}`,
                    contributions: c.contributions,
                    rank: index + 1,
                    avatar: c.avatar_url,
                }));

                setTopContributors(mappedTop);

                // Calculate stats
                const totalContributorsCount = sorted.length;
                const totalContributionsCount = sorted.reduce((sum: number, c: any) => sum + c.contributions, 0);

                let activeCount = Math.ceil(totalContributorsCount * 0.4); // Fallback: ~40% active

                try {
                    // Fetch recent commits (last 30 days) to calculate active contributors count
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    const commitsRes = await fetch(`https://api.github.com/repos/devpathindcommunity-india/DevPath-Web/commits?since=${thirtyDaysAgo.toISOString()}`);
                    if (commitsRes.ok) {
                        const commits = await commitsRes.json();
                        const uniqueAuthors = new Set(
                            commits.map((commit: any) => commit.author?.login || commit.commit?.author?.name).filter(Boolean)
                        );
                        activeCount = uniqueAuthors.size;
                    }
                } catch (commitsErr) {
                    console.error("Error fetching commits for active stats:", commitsErr);
                }

                setStats({
                    totalContributors: totalContributorsCount,
                    totalContributions: totalContributionsCount,
                    activeThisMonth: activeCount || 1,
                });
            } catch (err: any) {
                console.error("Error fetching contributors data:", err);
                setError(err.message || "Failed to load contributors data");
                setTopContributors(FALLBACK_TOP);
            } finally {
                setLoading(false);
            }
        }

        fetchContributorsData();
    }, []);

    // Standard physical podium arrangement: [2nd, 1st, 3rd]
    const arrangePodium = (list: TopContributor[]) => {
        if (list.length < 3) return list;
        return [list[1], list[0], list[2]];
    };

    // Helper to format large numbers (e.g. 15400 -> 15.4k)
    const formatNumber = (num: number): string => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toString();
    };

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <h1 className={styles.title}>Meet Our Amazing Contributors</h1>
                <p className={styles.subtitle}>
                    DevPath is built by developers, for developers. Thank you to everyone who makes this possible!
                </p>
                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>
                            {loading ? "..." : stats.totalContributors.toLocaleString()}
                        </span>
                        <span className={styles.statLabel}>Total Contributors</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>
                            {loading ? "..." : formatNumber(stats.totalContributions)}
                        </span>
                        <span className={styles.statLabel}>Contributions</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>
                            {loading ? "..." : stats.activeThisMonth.toLocaleString()}
                        </span>
                        <span className={styles.statLabel}>Active This Month</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', gap: '16px' }}>
                    <Loader2 className="animate-spin" size={48} style={{ color: '#00d4ff', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Loading contributors podium...</p>
                </div>
            ) : (
                <div className={styles.podium}>
                    {arrangePodium(topContributors).map((contributor) => (
                        <div key={contributor.handle} className={`${styles.podiumPlace} ${contributor.rank === 1 ? styles.first : ''}`}>
                            <div className={styles.avatarWrapper}>
                                {contributor.rank === 1 && <div className={styles.crown}>👑</div>}
                                {contributor.rank === 2 && <div className={styles.crown} style={{ fontSize: '24px', filter: 'grayscale(1)' }}>🥈</div>}
                                {contributor.rank === 3 && <div className={styles.crown} style={{ fontSize: '24px', filter: 'sepia(1)' }}>🥉</div>}
                                <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                                    {contributor.avatar ? (
                                        <Image
                                            src={contributor.avatar}
                                            alt={contributor.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
                                            {contributor.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.podiumName}>{contributor.name}</div>
                            <div className={styles.podiumContributions}>{contributor.contributions} commits</div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.grid}>
                {contributors.map((contributor, index) => (
                    <div key={index} className={styles.card}>
                        <div className={styles.cardAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: 'white' }}>
                            {contributor.avatar}
                        </div>
                        <h3 className={styles.cardName}>{contributor.name}</h3>
                        <p className={styles.cardHandle}>{contributor.handle}</p>

                        <div className={styles.cardStats}>
                            <span>{contributor.contributions} contributions</span>
                        </div>

                        <div className={styles.types}>
                            {contributor.types.includes('code') && <div className={styles.typeIcon} title="Code"><Code size={16} /></div>}
                            {contributor.types.includes('docs') && <div className={styles.typeIcon} title="Documentation"><FileText size={16} /></div>}
                            {contributor.types.includes('design') && <div className={styles.typeIcon} title="Design"><MessageSquare size={16} /></div>}
                            {contributor.types.includes('community') && <div className={styles.typeIcon} title="Community"><Github size={16} /></div>}
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.cta}>
                <h2 className={styles.ctaTitle}>Want to see your name here?</h2>
                <div className={styles.ctaButtons}>
                    <Button aria-label="Action button"  variant="primary" icon={<Github size={20} />}>
                        View Open Issues
                    </Button>
                    <Button aria-label="Action button"  variant="secondary" icon={<ExternalLink size={20} />}>
                        Read Contributing Guide
                    </Button>
                </div>
            </div>
        </div>
    );
}
