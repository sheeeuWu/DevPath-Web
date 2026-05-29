"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, GitFork, Eye, ExternalLink, Github } from "lucide-react"
import { PremiumCard } from "./ui/PremiumCard"

interface Project {
    author: string
    title: string
    technologies: string[]
    stats: {
        stars: number
        forks: number
        views: string
    }
    color: string
    image?: string
    description?: string
    liveUrl?: string
    githubUrl?: string
}

export function ProjectCard({ project }: { project: Project }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isStarred, setIsStarred] = useState(false)

    return (
        <>
            <PremiumCard>
                <div
                    className="cursor-pointer h-full flex flex-col"
                    onClick={() => setIsModalOpen(true)}
                >
                    {/* Project Thumbnail/Gradient */}
                    <div
                        className="aspect-video rounded-xl mb-4 overflow-hidden relative"
                        style={{
                            background: `linear-gradient(45deg, ${project.color}, #1a1f35)`,
                        }}
                    >
                        <div className="absolute inset-0 bg-black/20 dark:bg-black/40" />
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">{project.author}</p>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {project.title}
                    </h3>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-auto">
                        {project.technologies.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 text-xs rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                        <button aria-label="Action button" 
                            onClick={(e) => {
                                e.stopPropagation()
                                setIsStarred(!isStarred)
                            }}
                            className={`flex items-center gap-2 transition-colors ${isStarred ? 'text-yellow-500' : 'hover:text-yellow-500'}`}
                        >
                            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
                            <span>{project.stats.stars + (isStarred ? 1 : 0)}</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <GitFork className="w-4 h-4" />
                            <span>{project.stats.forks}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span>{project.stats.views}</span>
                        </div>
                    </div>
                </div>
            </PremiumCard>

            {/* Project Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-[2000]"
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-[#0f1419] border border-black/10 dark:border-white/10 rounded-2xl p-8 z-[2000] shadow-2xl"
                        >
                            {/* Close button */}
                            <button aria-label="Action button" 
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors text-gray-900 dark:text-white"
                            >
                                ✕
                            </button>

                            {/* Content */}
                            <div className="space-y-6">
                                <div
                                    className="w-full h-64 rounded-xl mb-6"
                                    style={{
                                        background: `linear-gradient(45deg, ${project.color}, #1a1f35)`,
                                    }}
                                />

                                <div>
                                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{project.title}</h2>
                                    <p className="text-gray-600 dark:text-gray-400">by {project.author}</p>
                                </div>

                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                                    {project.description || "A detailed description of this amazing project would go here, explaining the problem it solves, technologies used, and implementation challenges overcome. This project demonstrates best practices in modern web development and has received significant community attention."}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {project.technologies.map((tech) => (
                                        <span
                                            key={tech}
                                            className="px-4 py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/20 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <a
                                        href={project.liveUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all flex items-center justify-center gap-2 font-semibold text-white shadow-lg shadow-cyan-500/20"
                                    >
                                        <ExternalLink className="w-5 h-5" />
                                        View Live Demo
                                    </a>

                                    <a
                                        href={project.githubUrl || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 px-6 rounded-xl border border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2 font-semibold text-gray-900 dark:text-white"
                                    >
                                        <Github className="w-5 h-5" />
                                        View Source
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
