import { useState, useEffect } from 'react';

export interface BookmarkItem {
    id: string;
    title: string;
    description: string;
    type: 'roadmap' | 'project';
    color?: string;
    path?: string;
}

const listeners = new Set<() => void>();

const getSavedBookmarks = (): BookmarkItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem('devpath_saved_roadmaps');
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error('Error reading bookmarks from localStorage', e);
        return [];
    }
};

export function useBookmarks() {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setBookmarks(getSavedBookmarks());

        const handleChange = () => {
            setBookmarks(getSavedBookmarks());
        };

        listeners.add(handleChange);
        window.addEventListener('storage', handleChange);

        return () => {
            listeners.delete(handleChange);
            window.removeEventListener('storage', handleChange);
        };
    }, []);

    const addBookmark = (item: BookmarkItem) => {
        const current = getSavedBookmarks();
        if (current.some(b => b.id === item.id)) return;
        const updated = [...current, item];
        try {
            localStorage.setItem('devpath_saved_roadmaps', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to write bookmark to localStorage', e);
        }
        listeners.forEach(listener => listener());
    };

    const removeBookmark = (id: string) => {
        const current = getSavedBookmarks();
        const updated = current.filter(b => b.id !== id);
        try {
            localStorage.setItem('devpath_saved_roadmaps', JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to remove bookmark from localStorage', e);
        }
        listeners.forEach(listener => listener());
    };

    const isBookmarked = (id: string) => {
        return bookmarks.some(b => b.id === id);
    };

    const toggleBookmark = (item: BookmarkItem) => {
        if (isBookmarked(item.id)) {
            removeBookmark(item.id);
        } else {
            addBookmark(item);
        }
    };

    return {
        bookmarks: mounted ? bookmarks : [],
        addBookmark,
        removeBookmark,
        isBookmarked,
        toggleBookmark,
        isReady: mounted
    };
}

