"use client";

import { useState, useEffect } from 'react';
import { Github, Star, GitFork, CircleDot, CircleOff, GitPullRequest, GitPullRequestArrow, BookOpen, Plus, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const CircleOff = AlertCircle;
const GitPullRequestArrow = GitPullRequest;

interface Repo {
    id: number;
    name: string;
    full_name: string;
    description: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    language: string;
    open_issues_count: number;
    owner: {
        login: string;
        avatar_url: string;
    };
}

interface Issue {
    id: number;
    number: number;
    title: string;
    html_url: string;
    state: string;
    closed_at?: string | null;
    pull_request?: Record<string, unknown>;
    created_at: string;
    user: {
        login: string;
    };
}

interface GitHubDashboardProps {
    accessToken: string;
}

export default function GitHubDashboard({ accessToken }: GitHubDashboardProps) {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loadingIssues, setLoadingIssues] = useState(false);
    const [newIssueTitle, setNewIssueTitle] = useState('');
    const [creatingIssue, setCreatingIssue] = useState(false);

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=12', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/vnd.github.v3+json'
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch repositories');
                const data = await res.json();
                setRepos(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (accessToken) {
            fetchRepos();
        }
    }, [accessToken]);

    const fetchIssues = async (repo: Repo) => {
        setLoadingIssues(true);
        try {
            const res = await fetch(`https://api.github.com/repos/${repo.full_name}/issues?state=all&per_page=5`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
            if (!res.ok) throw new Error('Failed to fetch issues');
            const data = await res.json();
            setIssues(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingIssues(false);
        }
    };

    const handleRepoClick = (repo: Repo) => {
        setSelectedRepo(repo);
        fetchIssues(repo);
    };

    const handleCreateIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRepo || !newIssueTitle.trim()) return;

        setCreatingIssue(true);
        try {
            const res = await fetch(`https://api.github.com/repos/${selectedRepo.full_name}/issues`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: newIssueTitle,
                    body: 'Created via DevPath Community Dashboard'
                })
            });

            if (!res.ok) throw new Error('Failed to create issue');

            const newIssue = await res.json();
            setIssues([newIssue, ...issues]);
            setNewIssueTitle('');
            alert('Issue created successfully!');
        } catch (err: any) {
            alert('Error creating issue: ' + err.message);
        } finally {
            setCreatingIssue(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center gap-2">
                <AlertCircle size={20} />
                <span>Error loading GitHub data: {error}</span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Repository List */}
            <div className="lg:col-span-1 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="text-primary" size={20} /> Your Repositories
                </h3>
                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {repos.map(repo => (
                        <div
                            key={repo.id}
                            onClick={() => handleRepoClick(repo)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedRepo?.id === repo.id
                                    ? 'bg-primary/10 border-primary'
                                    : 'bg-card border-border hover:border-primary/50'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold truncate pr-2">{repo.name}</h4>
                                {repo.language && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                        {repo.language}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Star size={12} /> {repo.stargazers_count}</span>
                                <span className="flex items-center gap-1"><GitFork size={12} /> {repo.forks_count}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Repository Details & Management */}
            <div className="lg:col-span-2">
                {selectedRepo ? (
                    <div className="bg-card border border-border rounded-xl p-6 space-y-6 h-full">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    {selectedRepo.full_name}
                                </h2>
                                <p className="text-muted-foreground mt-1">{selectedRepo.description}</p>
                            </div>
                            <Link
                                href={selectedRepo.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <ExternalLink size={20} />
                            </Link>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <div className="text-2xl font-bold">{selectedRepo.stargazers_count}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Stars</div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <div className="text-2xl font-bold">{selectedRepo.forks_count}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Forks</div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-lg text-center">
                                <div className="text-2xl font-bold">{selectedRepo.open_issues_count}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Open Issues</div>
                            </div>
                        </div>

                        {/* Issues Management */}
                        <div className="space-y-4">
                            <h3 className="font-bold flex items-center gap-2">
                                <CircleDot size={18} /> Recent Issues
                            </h3>

                            {/* Create Issue Form */}
                            <form onSubmit={handleCreateIssue} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Create a new issue..."
                                    value={newIssueTitle}
                                    onChange={(e) => setNewIssueTitle(e.target.value)}
                                    className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                />
                                <button aria-label="Action button" 
                                    type="submit"
                                    disabled={creatingIssue || !newIssueTitle.trim()}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {creatingIssue ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Add
                                </button>
                            </form>

                            {/* Issues List */}
                            <div className="space-y-2">
                                {loadingIssues ? (
                                    <div className="text-center py-4 text-muted-foreground text-sm">Loading issues...</div>
                                ) : issues.length > 0 ? (
                                    issues.map(issue => {
                                        const isClosed = issue.state === 'closed' || Boolean(issue.closed_at);
                                        const isPullRequest = Boolean(issue.pull_request);

                                        return (
                                        <div key={issue.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/40 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                {isPullRequest ? (
                                                    isClosed ? (
                                                        <GitPullRequestArrow size={16} className="text-muted-foreground shrink-0" />
                                                    ) : (
                                                        <GitPullRequest size={16} className="text-purple-500 shrink-0" />
                                                    )
                                                ) : (
                                                    isClosed ? (
                                                        <CircleOff size={16} className="text-muted-foreground shrink-0" />
                                                    ) : (
                                                        <CircleDot size={16} className="text-green-500 shrink-0" />
                                                    )
                                                )}
                                                <span className={`text-sm font-medium truncate ${isClosed ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    <span className="text-muted-foreground mr-2">#{issue.number}</span>
                                                    {issue.title}
                                                </span>
                                            </div>
                                            <Link href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary whitespace-nowrap ml-2">
                                                View
                                            </Link>
                                        </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground text-sm">No recent issues found.</div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
                        <BookOpen size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">Select a Repository</h3>
                        <p className="max-w-xs">Click on a repository from the list to view details and manage issues.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
