"use client";

import { useState, useEffect } from 'react';
import { Search, ChevronRight, Book, Code, FileText, HelpCircle, ThumbsUp, ThumbsDown, Github, Users, MapPin, MessageCircle, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import styles from './Wiki.module.css';

import { wikiContent } from '@/data/wikiContent';

const categories = [
    {
        title: "Getting Started",
        items: [
            { id: "intro", title: "Introduction to DevPath", icon: <Book size={16} /> },
            { id: "setup", title: "Setting Up Your Profile", icon: <FileText size={16} /> },
            { id: "xp", title: "Understanding XP System", icon: <HelpCircle size={16} /> }
        ]
    },
    {
        title: "Learning Paths",
        items: [
            { id: "react", title: "Full Stack React Guide", icon: <Code size={16} /> },
            { id: "python", title: "Python for AI Roadmap", icon: <Code size={16} /> }
        ]
    },
    {
        title: "Community",
        items: [
            { id: "community-offerings", title: "What Community Offers", icon: <Users size={16} /> },
            { id: "city-leads", title: "City Leads", icon: <MapPin size={16} /> },
            { id: "technical-heads", title: "Technical Heads", icon: <Code size={16} /> },
            { id: "wp-community", title: "WhatsApp Community", icon: <MessageCircle size={16} /> },
            { id: "hackfiesta", title: "HackFiesta", icon: <Calendar size={16} /> },
            { id: "guidelines", title: "Code of Conduct", icon: <FileText size={16} /> },
            { id: "contributing", title: "How to Contribute", icon: <Github size={16} /> },
            { id: "open-source", title: "Open Source", icon: <Github size={16} /> }
        ]
    }
];

export default function WikiPage() {
    const [activeArticle, setActiveArticle] = useState("intro");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const articleBody = document.querySelector(`.${styles.articleBody}`);
        if (!articleBody) return;
        const preElements = articleBody.querySelectorAll('pre');

        preElements.forEach((pre) => {
            if (pre.parentElement?.classList.contains('code-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper relative group w-full';

            pre.parentNode?.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);

            const button = document.createElement('button');
            button.className = 'absolute right-3 top-3 px-2 py-1 text-xs font-semibold bg-zinc-900/80 text-zinc-300 rounded border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 hover:text-white transition-all duration-200 shadow-md cursor-pointer backdrop-blur-sm';
            button.innerHTML = 'Copy';
            button.type = 'button';

            button.addEventListener('click', async () => {
                const codeText = pre.textContent || '';
                try {
                    await navigator.clipboard.writeText(codeText);
                    button.innerHTML = 'Copied!';
                    button.className = 'absolute right-3 top-3 px-2 py-1 text-xs font-semibold bg-emerald-600 text-white rounded border border-emerald-500 transition-all duration-200 shadow-md';
                    setTimeout(() => {
                        button.innerHTML = 'Copy';
                        button.className = 'absolute right-3 top-3 px-2 py-1 text-xs font-semibold bg-zinc-900/80 text-zinc-300 rounded border border-white/10 opacity-0 group-hover:opacity-100 hover:bg-zinc-800 hover:text-white transition-all duration-200 shadow-md cursor-pointer backdrop-blur-sm';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            });

            wrapper.appendChild(button);
        });
    }, [activeArticle]);

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={16} />
                    <input
                        type="text"
                        placeholder="Search documentation..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <nav>
                    {categories.map((category, index) => (
                        <div key={index} className={styles.category}>
                            <h3 className={styles.categoryTitle}>{category.title}</h3>
                            {category.items.map(item => (
                                <div
                                    key={item.id}
                                    className={`${styles.navLink} ${activeArticle === item.id ? styles.active : ''}`}
                                    onClick={() => setActiveArticle(item.id)}
                                >
                                    {item.icon}
                                    {item.title}
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>

            <main className={styles.content}>
                <div className={styles.breadcrumb}>
                    <span>Docs</span>
                    <ChevronRight size={14} />
                    <span>{categories.find(c => c.items.some(i => i.id === activeArticle))?.title}</span>
                    <ChevronRight size={14} />
                    <span>{wikiContent[activeArticle]?.title}</span>
                </div>

                <article>
                    <div className={styles.articleHeader}>
                        <h1 className={styles.title}>{wikiContent[activeArticle]?.title}</h1>
                        <div className={styles.meta}>
                            <span>Last updated: {wikiContent[activeArticle]?.lastUpdated}</span>
                            <span>Reading time: {wikiContent[activeArticle]?.readingTime}</span>
                        </div>
                    </div>

                    <div className={styles.articleBody}>
                        {wikiContent[activeArticle]?.content || <p>Content coming soon...</p>}
                    </div>

                    <div className={styles.feedback}>
                        <span>Was this article helpful?</span>
                        <div className={styles.feedbackButtons}>
                            <Button variant="ghost" icon={<ThumbsUp size={16} />}>Yes</Button>
                            <Button variant="ghost" icon={<ThumbsDown size={16} />}>No</Button>
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
