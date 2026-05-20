export type SearchableArticle = {
    id: string;
    title: string;
    description: string;
    keywords: string[];
    category: string;
};

export type SearchResult = {
    id: string;
    title: string;
    description: string;
    keywords: string[];
    category: string;
    score: number;
    titleMatch: boolean;
    descriptionMatch: boolean;
    keywordMatches: string[];
};

/**
 * Simple fuzzy/partial match: checks if every word in the query
 * appears somewhere in the target string (case-insensitive).
 */
function fuzzyMatch(query: string, target: string): boolean {
    const words = query.toLowerCase().trim().split(/\s+/);
    const t = target.toLowerCase();
    return words.every(word => t.includes(word));
}

/**
 * Score an article against the query. Higher = better match.
 * Title matches are worth more than keyword or description matches.
 */
function scoreArticle(article: SearchableArticle, query: string): number {
    let score = 0;
    const q = query.toLowerCase().trim();

    if (article.title.toLowerCase().includes(q)) score += 10;
    else if (fuzzyMatch(query, article.title)) score += 6;

    const keywordMatchCount = article.keywords.filter(k =>
        k.toLowerCase().includes(q) || fuzzyMatch(query, k)
    ).length;
    score += keywordMatchCount * 4;

    if (article.description.toLowerCase().includes(q)) score += 3;
    else if (fuzzyMatch(query, article.description)) score += 1;

    return score;
}

/**
 * Search articles and return scored, sorted results.
 */
export function searchArticles(
    articles: SearchableArticle[],
    query: string
): SearchResult[] {
    if (!query.trim()) return [];

    return articles
        .map(article => {
            const score = scoreArticle(article, query);
            const q = query.toLowerCase().trim();

            const titleMatch =
                article.title.toLowerCase().includes(q) ||
                fuzzyMatch(query, article.title);

            const descriptionMatch =
                article.description.toLowerCase().includes(q) ||
                fuzzyMatch(query, article.description);

            const keywordMatches = article.keywords.filter(
                k => k.toLowerCase().includes(q) || fuzzyMatch(query, k)
            );

            return { ...article, score, titleMatch, descriptionMatch, keywordMatches };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score);
}

/**
 * Highlight all occurrences of the query inside text.
 * Returns an array of { text, highlight } segments.
 */
export function highlightText(
    text: string,
    query: string
): { text: string; highlight: boolean }[] {
    if (!query.trim()) return [{ text, highlight: false }];

    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);

    return parts.map(part => ({
        text: part,
        highlight: regex.test(part),
    }));
}
