"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { collection, query, orderBy, getDocs, limit, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSquare, Target, Plus, Search, Filter, X, Globe } from 'lucide-react';
import { getEmbedUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import CreateDiscussionModal from '@/components/community/CreateDiscussionModal';
import ProjectCard from '@/components/projects/ProjectCard';
import DOMPurify from 'dompurify';

export default function CommunityPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'discussions' | 'showcase'>('discussions');
    const [sortOption, setSortOption] = useState<'newest' | 'popular'>('newest');
    const [loading, setLoading] = useState(true);
    const [discussions, setDiscussions] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'discussions') {
                // Fetch Discussions
                const q = query(collection(db, 'discussions'), orderBy('createdAt', 'desc'), limit(20));
                const snapshot = await getDocs(q);
                setDiscussions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else {
                // Fetch Projects for Showcase
                let q;
                if (sortOption === 'popular') {
                    // Sort by starCount descending
                    q = query(collection(db, 'projects'), orderBy('starCount', 'desc'), limit(20));
                } else {
                    // Sort by createdAt descending (default)
                    q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'), limit(20));
                }

                const snapshot = await getDocs(q);
                setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
        } catch (error: any) {
            console.error("Error fetching data:", error);
            if (error.message.includes("requires an index")) {
                alert("Missing Index! Please check the console for the link to create it.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, sortOption]);

    return (
        <div className="min-h-screen bg-background text-foreground pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Community Hub</h1>
                        <p className="text-muted-foreground">Connect, discuss, and showcase your work.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {activeTab === 'discussions' && (
                            <button aria-label="Action button" 
                                onClick={() => {
                                    if (!user) {
                                        alert("Please login to start a discussion.");
                                        return;
                                    }
                                    setShowCreateModal(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Plus size={18} /> New Discussion
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-border mb-8">
                    <button aria-label="Action button" 
                        onClick={() => setActiveTab('discussions')}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'discussions'
                            ? 'border-primary text-primary font-medium'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <MessageSquare size={18} /> Discussions
                    </button>
                    <button aria-label="Action button" 
                        onClick={() => setActiveTab('showcase')}
                        className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${activeTab === 'showcase'
                            ? 'border-primary text-primary font-medium'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Target size={18} /> Project Showcase
                    </button>
                </div>

                {/* Sort Options (Only for Showcase) */}
                {activeTab === 'showcase' && (
                    <div className="flex justify-end mb-6">
                        <div className="flex bg-muted rounded-lg p-1">
                            <button aria-label="Action button" 
                                onClick={() => setSortOption('newest')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortOption === 'newest' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Newest
                            </button>
                            <button aria-label="Action button" 
                                onClick={() => setSortOption('popular')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortOption === 'popular' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Popular
                            </button>
                        </div>
                    </div>
                )}

                {/* Sort Options (Only for Showcase) */}
                {activeTab === 'showcase' && (
                    <div className="flex justify-end mb-6">
                        <div className="flex bg-muted rounded-lg p-1">
                            <button aria-label="Action button" 
                                onClick={() => setSortOption('newest')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortOption === 'newest' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Newest
                            </button>
                            <button aria-label="Action button" 
                                onClick={() => setSortOption('popular')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${sortOption === 'popular' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Popular
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'discussions' ? (
                            <div className="space-y-4">
                                {discussions.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border/50 border-dashed">
                                        <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No discussions yet. Be the first to start one!</p>
                                    </div>
                                ) : (
                                    discussions.map(discussion => (
                                        <div
                                            key={discussion.id}
                                            onClick={() => router.push(`/community/view?id=${discussion.id}`)}
                                            className="p-6 bg-card border border-border rounded-xl hover:border-primary/50 transition-colors cursor-pointer"
                                        >
                                            <h3 className="text-xl font-semibold mb-2">{discussion.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span>{discussion.authorName || 'Anonymous'}</span>
                                                <span>•</span>
                                                <span>{discussion.createdAt?.seconds ? new Date(discussion.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}</span>
                                                <span>•</span>
                                                <span>{discussion.replyCount || 0} replies</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.length === 0 ? (
                                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-border/50 border-dashed">
                                        <Target size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No projects showcased yet.</p>
                                    </div>
                                ) : (
                                    projects.map(project => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onReadMore={setSelectedProject}
                                        />
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {user && (
                <CreateDiscussionModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    userId={user.uid}
                    userName={user.name || 'Anonymous'}
                    onSuccess={() => {
                        fetchData();
                        alert("Discussion created successfully!");
                    }}
                />
            )}

            {/* Project Details Modal */}
            {selectedProject && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
                    onClick={() => setSelectedProject(null)}
                >
                    <div
                        className="bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl animate-in zoom-in-95"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
                            <h2 className="text-xl font-bold truncate pr-4">{selectedProject.title}</h2>
                            <button aria-label="Action button" 
                                onClick={() => setSelectedProject(null)}
                                className="p-2 hover:bg-muted rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Media */}
                            {selectedProject.videoUrl ? (
                                <div className="aspect-video rounded-xl overflow-hidden bg-black">
                                    <iframe
                                        src={getEmbedUrl(selectedProject.videoUrl)}
                                        className="w-full h-full"
                                        allowFullScreen
                                    />
                                </div>
                            ) : selectedProject.screenshots && selectedProject.screenshots.length > 0 && (
                                <div className="aspect-video rounded-xl overflow-hidden bg-muted relative">
                                    <Image
                                        src={selectedProject.screenshots[0]}
                                        alt={selectedProject.title}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div className="prose dark:prose-invert max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedProject.description) }} />
                            </div>

                            {/* Links & Skills */}
                            <div className="flex flex-wrap gap-4 pt-4 border-t border-border">
                                {selectedProject.websiteUrl && (
                                    <a
                                        href={selectedProject.websiteUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        <Globe size={16} /> Visit Website
                                    </a>
                                )}
                                <div className="flex flex-wrap gap-2 ml-auto">
                                    {selectedProject.skills?.map((skill: string) => (
                                        <span key={skill} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
