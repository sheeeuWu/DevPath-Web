"use client";

import React from "react";
import { SearchResult, highlightText } from "@/utils/wikiSearch";
import { FileText, Tag, ArrowRight } from "lucide-react";
import styles from "./WikiSearchResults.module.css";

type Props = {
    results: SearchResult[];
    query: string;
    onSelect: (id: string) => void;
};

function Highlight({ text, query }: { text: string; query: string }) {
    const parts = highlightText(text, query);
    return (
        <>
            {parts.map((part, i) =>
                part.highlight ? (
                    <mark key={i} className={styles.highlight}>
                        {part.text}
                    </mark>
                ) : (
                    <span key={i}>{part.text}</span>
                )
            )}
        </>
    );
}

export default function WikiSearchResults({ results, query, onSelect }: Props) {
    if (results.length === 0) {
        return (
            <div className={styles.empty}>
                <FileText size={32} className={styles.emptyIcon} />
                <p>No articles found for <strong>&ldquo;{query}&rdquo;</strong></p>
                <span>Try different keywords or browse the sidebar.</span>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <p className={styles.resultCount}>
                {results.length} article{results.length !== 1 ? "s" : ""} found for{" "}
                <strong>&ldquo;{query}&rdquo;</strong>
            </p>

            <div className={styles.list}>
                {results.map(result => (
                    <button
                        key={result.id}
                        className={styles.card}
                        onClick={() => onSelect(result.id)}
                    >
                        <div className={styles.cardTop}>
                            <span className={styles.category}>{result.category}</span>
                            <ArrowRight size={14} className={styles.arrow} />
                        </div>

                        <h3 className={styles.cardTitle}>
                            <Highlight text={result.title} query={query} />
                        </h3>

                        <p className={styles.cardDesc}>
                            <Highlight text={result.description} query={query} />
                        </p>

                        {result.keywordMatches.length > 0 && (
                            <div className={styles.tags}>
                                <Tag size={11} className={styles.tagIcon} />
                                {result.keywordMatches.slice(0, 4).map(kw => (
                                    <span key={kw} className={styles.tag}>
                                        <Highlight text={kw} query={query} />
                                    </span>
                                ))}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
