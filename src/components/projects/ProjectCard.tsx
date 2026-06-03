"use client";

import { useState, type ReactNode } from 'react';
import { Target, ExternalLink, Edit3, Star, Bookmark } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useBookmarks } from '@/hooks/useBookmarks';

interface FuseMatch {
    key?: string;
    value?: string;
    indices: readonly [number, number][];
}

interface Project {
    id: string;
    title: string;
    description: string;
    authorName: string;
    userId: string;
    websiteUrl?: string;
    videoUrl?: string;
    screenshots?: string[];
    skills?: string[];
    createdAt?: unknown;
    stars?: string[];
    starCount?: number;
    matches?: FuseMatch[];
}

interface ProjectCardProps {
    project: Project;
    isOwner?: boolean;
    onEdit?: (project: Project) => void;
    onReadMore?: (project: Project) => void;
}

function HighlightedText({
    text,
    indices,
}: {
    text: string;
    indices?: readonly [number, number][];
}) {
    if (!indices?.length) {
        return <>{text}</>;
    }

    const parts: ReactNode[] = [];
    let lastIndex = 0;

    indices.forEach(([start, end], index) => {
        if (start > lastIndex) {
            parts.push(text.slice(lastIndex, start));
        }

        parts.push(
            <mark key={`${start}-${end}-${index}`} className="rounded bg-cyan-500/25 px-0.5 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.35)]">
                {text.slice(start, end + 1)}
            </mark>
        );

        lastIndex = end + 1;
    });

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return <>{parts}</>;
}

export default function ProjectCard({ project, isOwner, onEdit, onReadMore }: ProjectCardProps) {
    const { user } = useAuth();
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isStarring, setIsStarring] = useState(false);
    const { isBookmarked, toggleBookmark } = useBookmarks();
    const isLocalBookmarked = isBookmarked(project.id);

    const stripHtml = (html: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, '');
    };

    const titleMatch = project.matches?.find((match) => match.key === 'title');
    const descriptionMatch = project.matches?.find((match) => match.key === 'description');
    const descriptionText = stripHtml(project.description);
    const descriptionIndices = project.description === descriptionText ? descriptionMatch?.indices : undefined;

    const [stars, setStars] = useState<string[]>(project.stars || []);
    const [starCount, setStarCount] = useState<number>(project.starCount || (project.stars?.length || 0));

    const hasStarred = user ? stars.includes(user.uid) : false;

    const handleToggleStar = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            alert("Please login to star projects.");
            return;
        }
        if (isStarring) return;

        setIsStarring(true);
        const newHasStarred = !hasStarred;

        if (newHasStarred) {
            setStars([...stars, user.uid]);
            setStarCount(prev => prev + 1);
        } else {
            setStars(stars.filter(id => id !== user.uid));
            setStarCount(prev => Math.max(0, prev - 1));
        }

        try {
            const projectRef = doc(db, 'projects', project.id);
            if (newHasStarred) {
                await updateDoc(projectRef, {
                    stars: arrayUnion(user.uid),
                    starCount: increment(1)
                });
            } else {
                await updateDoc(projectRef, {
                    stars: arrayRemove(user.uid),
                    starCount: increment(-1)
                });
            }
        } catch (error) {
            console.error("Error starring project:", error);
            if (newHasStarred) {
                setStars(stars.filter(id => id !== user.uid));
                setStarCount(prev => Math.max(0, prev - 1));
            } else {
                setStars([...stars, user.uid]);
                setStarCount(prev => prev + 1);
            }
            alert("Failed to update star.");
        } finally {
            setIsStarring(false);
        }
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return '';

        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1]?.split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1];
            } else if (url.includes('youtube.com/embed/')) {
                return url;
            }
            if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        if (url.includes('drive.google.com')) {
            return url.replace('/view', '/preview').replace('/usp=sharing', '');
        }

        return url;
    };

    const embedUrl = getEmbedUrl(project.videoUrl || '');

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/20 hover:scale-[1.02] transition-all duration-300 flex flex-col h-full group/card">
            <div className="aspect-video bg-muted relative group">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggleBookmark({
                            id: project.id,
                            title: project.title,
                            description: project.description,
                            type: 'project',
                            color: '#3b82f6',
                            path: '/profile'
                        });
                    }}
                    className={`absolute top-2 left-2 p-2 rounded-full backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 z-10 ${
                        isLocalBookmarked
                            ? 'bg-yellow-500/20 dark:bg-yellow-500/30 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/30 border'
                            : 'bg-background/80 text-muted-foreground hover:text-foreground hover:bg-background border border-border'
                    }`}
                    title={isLocalBookmarked ? "Remove Bookmark" : "Save Bookmark (Offline)"}
                    aria-label={isLocalBookmarked ? "Remove Bookmark" : "Save Bookmark (Offline)"}
                >
                    <Bookmark size={14} fill={isLocalBookmarked ? "currentColor" : "none"} />
                </button>

                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={project.title}
                    />
                ) : project.screenshots?.[0] ? (
                    <Image
                        src={project.screenshots[0]}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted/50">
                        <Target size={48} className="opacity-20" />
                    </div>
                )}

                {isOwner && (
                    <button
                        aria-label="Action button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(project);
                        }}
                        className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm text-foreground rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors z-10"
                        title="Edit Project"
                    >
                        <Edit3 size={16} />
                    </button>
                )}
            </div>

            <div className="p-5 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-lg line-clamp-1 flex-1" title={project.title}>
                        <HighlightedText text={project.title} indices={titleMatch?.indices} />
                    </h3>
                    <div className="flex items-center gap-2">
                        {project.websiteUrl && (
                            <a
                                aria-label="Link"
                                href={project.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ExternalLink size={18} />
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                    <p className="text-xs text-primary font-medium">by {project.authorName || 'Anonymous'}</p>

                    <button
                        aria-label="Action button"
                        onClick={handleToggleStar}
                        disabled={isStarring}
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${hasStarred
                            ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                            : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                            }`}
                    >
                        <Star size={14} fill={hasStarred ? "currentColor" : "none"} />
                        {starCount}
                    </button>
                </div>

                {project.skills && project.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {project.skills.slice(0, 3).map(skill => {
                            const skillMatch = project.matches?.find(
                                (match) => match.key === 'skills' && match.value === skill
                            );

                            return (
                                <span key={skill} className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-[10px] rounded-full border border-border/50">
                                    <HighlightedText text={skill} indices={skillMatch?.indices} />
                                </span>
                            );
                        })}
                        {project.skills.length > 3 && (
                            <span className="px-2 py-0.5 bg-secondary/50 text-secondary-foreground text-[10px] rounded-full border border-border/50">
                                +{project.skills.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="text-sm text-muted-foreground mb-4">
                    <p className="line-clamp-3">
                        <HighlightedText text={descriptionText} indices={descriptionIndices} />
                    </p>
                </div>

                <button
                    aria-label="Action button"
                    onClick={() => onReadMore ? onReadMore(project) : setShowFullDescription(!showFullDescription)}
                    className="text-xs text-primary hover:underline mt-auto self-start"
                >
                    Read More
                </button>
            </div>
        </div>
    );
}
