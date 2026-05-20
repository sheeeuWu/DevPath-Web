"use client";

import { useState, useEffect } from 'react';
import { Github, GitMerge, Globe, BookOpen, Code2, Users, ExternalLink, Star, Check, LayoutDashboard, Clock, GitFork } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { GithubAuthProvider, linkWithPopup } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import GitHubDashboard from '@/components/opensource/GitHubDashboard';
import { siteConfig } from '@/config/siteConfig';

type FeaturedRepoStats = {
    stars: number;
    forks: number;
    openIssues: number;
};

type FeaturedRepoStatsEntry = readonly [string, FeaturedRepoStats];

type GitHubRepoApiResponse = {
    stargazers_count?: number;
    forks_count?: number;
    open_issues_count?: number;
};

type GitHubProfile = {
    login: string;
    avatar_url?: string;
    public_repos?: number;
    followers?: number;
    following?: number;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
    created_at?: string;
};

type GitHubRepo = {
    id: number | string;
    stargazers_count?: number;
    language?: string | null;
};

type GitHubActivityEvent = {
    id: string;
    type: string;
    repo: {
        name: string;
    };
    created_at: string;
};

const getGitHubRepoSlug = (url: string | null) => {
    if (!url) return null;

    try {
        const { hostname, pathname } = new URL(url);
        if (hostname !== 'github.com') return null;

        const [owner, repo] = pathname.replace(/^\/|\/$/g, '').split('/');
        return owner && repo ? `${owner}/${repo}` : null;
    } catch {
        return null;
    }
};

const isFeaturedRepoStatsEntry = (
    entry: FeaturedRepoStatsEntry | null
): entry is FeaturedRepoStatsEntry => entry !== null;

export default function OpenSourcePage() {
    const { user, updateUserProfile } = useAuth();
    const [connecting, setConnecting] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [repoStats, setRepoStats] = useState<Record<string, FeaturedRepoStats>>({});
    const [statsLoading, setStatsLoading] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem('github_access_token');
        if (storedToken) setAccessToken(storedToken);
    }, []);

    useEffect(() => {
        const publicRepos = siteConfig.featuredRepos.filter(repo => repo.isPublic && getGitHubRepoSlug(repo.url));
        if (publicRepos.length === 0) return;

        let cancelled = false;

        const fetchFeaturedRepoStats = async () => {
            setStatsLoading(true);
            const statsEntries = await Promise.all(
                publicRepos.map(async (repo) => {
                    const slug = getGitHubRepoSlug(repo.url);
                    if (!slug) return null;

                    try {
                        const response = await fetch(`https://api.github.com/repos/${slug}`, {
                            headers: { Accept: 'application/vnd.github+json' }
                        });

                        if (!response.ok) return null;

                        const data = await response.json() as GitHubRepoApiResponse;
                        return [
                            repo.name,
                            {
                                stars: data.stargazers_count || 0,
                                forks: data.forks_count || 0,
                                openIssues: data.open_issues_count || 0
                            }
                        ] as FeaturedRepoStatsEntry;
                    } catch {
                        return null;
                    }
                })
            );

            if (!cancelled) {
                setRepoStats(Object.fromEntries(statsEntries.filter(isFeaturedRepoStatsEntry)));
                setStatsLoading(false);
            }
        };

        fetchFeaturedRepoStats();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleConnectGitHub = async () => {
        if (!user) {
            alert("Please login to connect your GitHub account.");
            return;
        }

        setConnecting(true);
        try {
            const provider = new GithubAuthProvider();
            provider.addScope('read:user');
            provider.addScope('repo');

            let token;

            try {
                // Try linking first
                const result = await linkWithPopup(auth.currentUser!, provider);
                const credential = GithubAuthProvider.credentialFromResult(result);
                token = credential?.accessToken;
            } catch (linkError: unknown) {
                const authError = linkError as { code?: string };
                if (authError.code === 'auth/credential-already-in-use') {
                    // Fallback: Connect for Data Only automatically
                    // We don't merge accounts, just use the token for fetching data.

                    // Try to retrieve credential from the error
                    const credential = GithubAuthProvider.credentialFromError(
                        linkError as Parameters<typeof GithubAuthProvider.credentialFromError>[0]
                    );
                    if (credential) {
                        token = credential.accessToken;
                        // We don't have the user object here, but we can fetch profile with the token
                    } else {
                        // If we can't get it from error, we fail gracefully.
                        throw new Error("This GitHub account is linked to another user, and we couldn't retrieve the credentials to fetch its data. Please try a different account.");
                    }
                } else {
                    throw linkError;
                }
            }

            if (token) {
                setAccessToken(token);
                localStorage.setItem('github_access_token', token); // Persist token

                // Fetch Extended Data
                const { fetchUserProfile, fetchUserRepos, fetchUserActivity, fetchRepoContributorStats, calculateUserLinesContributed } = await import('@/lib/github');
                const profile = await fetchUserProfile(token) as GitHubProfile;
                const repos = await fetchUserRepos(token) as GitHubRepo[];
                const activity = await fetchUserActivity(profile.login, token) as GitHubActivityEvent[];

                // Fetch contributor stats (lines and commits)
                const repoStats = await fetchRepoContributorStats(token);
                const userLineStats = calculateUserLinesContributed(repoStats, profile.login);

                // Calculate Total Stars
                const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0);

                // Calculate Top Languages
                const languageCounts: Record<string, number> = {};
                repos.forEach((repo) => {
                    if (repo.language) {
                        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
                    }
                });
                const topLanguages = Object.entries(languageCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([language, count]) => ({ language, count }));

                const githubData = {
                    githubStats: {
                        connected: true,
                        username: profile.login,
                        photoURL: profile.avatar_url,
                        repos: profile.public_repos,
                        followers: profile.followers,
                        following: profile.following,
                        lastFetched: new Date().toISOString(),
                        recentActivity: activity.slice(0, 5).map((event) => ({
                            id: event.id,
                            type: event.type,
                            repo: { name: event.repo.name, url: `https://github.com/${event.repo.name}` },
                            created_at: event.created_at
                        })),
                        totalStars,
                        topLanguages,
                        bio: profile.bio || undefined,
                        company: profile.company || undefined,
                        location: profile.location || undefined,
                        createdAt: profile.created_at,
                        linesAdded: userLineStats.additions,
                        linesRemoved: userLineStats.deletions,
                        linesContributed: userLineStats.additions,
                        contributions: userLineStats.commits
                    },
                    github: profile.login, // Store username
                    // Store detailed data in subcollection or just basic stats here? 
                    // Let's store basic stats in profile and maybe top repos if we want.
                };

                await updateUserProfile(githubData);

                // Save Repos to Subcollection (optional, but good for "more details")
                // We'll do this in the background to not block UI
                const { collection, writeBatch, doc } = await import('firebase/firestore');
                const batch = writeBatch(db);

                const collectionName = user.role === 'admin' ? 'admins' : 'members';
                const docId = user.role === 'admin' ? user.email! : user.uid;

                const reposRef = collection(db, collectionName, docId, 'github_repos');

                // Save top 10 repos for now to save writes
                repos.slice(0, 10).forEach((repo) => {
                    const repoDoc = doc(reposRef, repo.id.toString());
                    batch.set(repoDoc, repo);
                });
                await batch.commit();

                alert("GitHub account connected successfully!");
            }

        } catch (error: unknown) {
            console.error("Error connecting GitHub:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            alert("Failed to connect GitHub: " + message);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Hero Section */}
                <div className="text-center space-y-6 py-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
                        <Globe size={14} /> Open Source Ecosystem
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-600">
                        Connect, Contribute, and Grow
                    </h1>
                    <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
                        Open source is the heartbeat of modern software. Join the global community of developers building the future together.
                    </p>

                    {/* GitHub Connect Button */}
                    <div className="flex flex-col items-center gap-4 mt-8">
                        {user?.githubStats?.connected ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 text-green-500 rounded-full border border-green-500/20 font-medium">
                                    <Check size={20} /> GitHub Connected as {user.githubStats.username}
                                </div>
                                {!accessToken && (
                                    <button
                                        onClick={handleConnectGitHub}
                                        className="text-sm text-muted-foreground hover:text-primary underline"
                                    >
                                        Reconnect to Manage Repos
                                    </button>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={handleConnectGitHub}
                                disabled={connecting}
                                className="flex items-center gap-2 px-6 py-3 bg-[#24292e] text-white rounded-full hover:bg-[#2f363d] transition-colors font-medium disabled:opacity-50"
                            >
                                <Github size={20} />
                                {connecting ? 'Connecting...' : 'Connect GitHub Account'}
                            </button>
                        )}
                    </div>
                </div>

                {/* GitHub Dashboard (Only visible when connected and token available) */}
                {accessToken && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <LayoutDashboard className="text-primary" /> GitHub Dashboard
                            </h2>
                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded border border-primary/20">
                                Live Connection
                            </span>
                        </div>
                        <GitHubDashboard accessToken={accessToken} />
                    </div>
                )}

                {/* Featured Repositories Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Star className="text-yellow-500" /> Featured Repositories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {siteConfig.featuredRepos.map((repo) => {
                            const IconComponent =
                                repo.icon === 'BookOpen' ? BookOpen
                                : repo.icon === 'Code2'   ? Code2
                                : Globe;
                            const liveStats = repoStats[repo.name];

                            return (
                                <div
                                    key={repo.name}
                                    className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                <IconComponent size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">{repo.name}</h3>
                                                <p className="text-xs text-muted-foreground">{repo.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-medium bg-muted px-2 py-1 rounded shrink-0">
                                            <span className="flex items-center gap-1">
                                                <Star size={12} className="text-yellow-500" />
                                                {liveStats ? liveStats.stars.toLocaleString() : repo.stars}
                                            </span>
                                            {liveStats && (
                                                <span className="flex items-center gap-1 text-muted-foreground">
                                                    <GitFork size={12} />
                                                    {liveStats.forks.toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                        {repo.longDescription}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className={`w-2 h-2 rounded-full ${repo.languageColor}`}></span>
                                            {repo.language}
                                            {liveStats && (
                                                <span className="ml-2">
                                                    {liveStats.openIssues.toLocaleString()} open issues
                                                </span>
                                            )}
                                            {!liveStats && statsLoading && repo.isPublic && (
                                                <span className="ml-2">Updating stats...</span>
                                            )}
                                        </div>

                                        {repo.isPublic && repo.url ? (
                                            <Link
                                                href={repo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm font-medium hover:underline flex items-center gap-1"
                                                aria-label={`View code for ${repo.name}`}
                                            >
                                                View Code <ExternalLink size={14} />
                                            </Link>
                                        ) : (
                                            /* Disabled state for repos not yet public */
                                            <div className="relative group/tooltip">
                                                <button
                                                    disabled
                                                    aria-disabled="true"
                                                    aria-label={`${repo.name} coming soon`}
                                                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground/50 cursor-not-allowed select-none"
                                                >
                                                    <Clock size={14} />
                                                    Coming Soon
                                                </button>
                                                {/* Tooltip */}
                                                <div
                                                    role="tooltip"
                                                    className="pointer-events-none absolute bottom-full right-0 mb-2 w-max max-w-[180px] rounded-md bg-popover border border-border px-3 py-1.5 text-xs text-popover-foreground shadow-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200"
                                                >
                                                    This repository is not yet public. Check back soon!
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Platforms Section */}
                <div className="space-y-8">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Code2 className="text-primary" /> Major Platforms
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* GitHub */}
                        <div className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5">
                            <div className="mb-4 p-3 bg-muted rounded-lg w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <Github size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">GitHub</h3>
                            <p className="text-muted-foreground mb-4">
                                The world&apos;s largest platform for developer collaboration. Home to millions of open source projects.
                            </p>
                            <Link href="https://github.com" target="_blank" className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                                Visit Platform <ExternalLink size={14} />
                            </Link>
                        </div>

                        {/* GitLab */}
                        <div className="group bg-card border border-border rounded-xl p-6 hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/5">
                            <div className="mb-4 p-3 bg-muted rounded-lg w-fit group-hover:bg-orange-500/10 group-hover:text-orange-500 transition-colors">
                                <GitMerge size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">GitLab</h3>
                            <p className="text-muted-foreground mb-4">
                                A complete DevOps platform delivered as a single application. Famous for its CI/CD capabilities.
                            </p>
                            <Link href="https://gitlab.com" target="_blank" className="text-orange-500 text-sm font-medium flex items-center gap-1 hover:underline">
                                Visit Platform <ExternalLink size={14} />
                            </Link>
                        </div>

                        {/* Bitbucket */}
                        <div className="group bg-card border border-border rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                            <div className="mb-4 p-3 bg-muted rounded-lg w-fit group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors">
                                <Code2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Bitbucket</h3>
                            <p className="text-muted-foreground mb-4">
                                Git solution for professional teams. Deeply integrated with Jira and Trello.
                            </p>
                            <Link href="https://bitbucket.org" target="_blank" className="text-blue-500 text-sm font-medium flex items-center gap-1 hover:underline">
                                Visit Platform <ExternalLink size={14} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Getting Started Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold">Start Your Journey</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Learn the Basics</h3>
                                    <p className="text-muted-foreground">Understand Git, Pull Requests, and Issues. These are the fundamental tools of open source.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Find a Community</h3>
                                    <p className="text-muted-foreground">Look for projects with active maintainers and a welcoming community.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="mt-1 bg-primary/10 p-2 rounded-full h-fit text-primary">
                                    <Star size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Make Your First Contribution</h3>
                                    <p className="text-muted-foreground">Start small. Fix a typo, update documentation, or tackle a &quot;Good First Issue&quot;.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                        <h3 className="font-bold text-xl mb-4">Resources</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="https://opensource.guide/how-to-contribute/" target="_blank" className="flex items-center justify-between p-3 bg-card rounded-lg hover:border-primary border border-transparent transition-colors group">
                                    <span className="font-medium">How to Contribute to Open Source</span>
                                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                                </Link>
                            </li>
                            <li>
                                <Link href="https://goodfirstissue.dev/" target="_blank" className="flex items-center justify-between p-3 bg-card rounded-lg hover:border-primary border border-transparent transition-colors group">
                                    <span className="font-medium">Good First Issues</span>
                                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                                </Link>
                            </li>
                            <li>
                                <Link href="https://firstcontributions.github.io/" target="_blank" className="flex items-center justify-between p-3 bg-card rounded-lg hover:border-primary border border-transparent transition-colors group">
                                    <span className="font-medium">First Contributions Guide</span>
                                    <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
