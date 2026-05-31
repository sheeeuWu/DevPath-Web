"use client";

import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import styles from './Profile.module.css';

interface MarkdownBioProps {
    bio?: string;
}

export default function MarkdownBio({ bio }: MarkdownBioProps) {
    return (
        <div className={`markdown-body ${styles.profileBioMarkdown}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                {DOMPurify.sanitize(bio || "No biography details supplied yet.")}
            </ReactMarkdown>
        </div>
    );
}
