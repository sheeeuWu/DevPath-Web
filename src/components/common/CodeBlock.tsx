"use client";

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
    code: string;
    language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);
    const resetTimerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (resetTimerRef.current !== null) {
                clearTimeout(resetTimerRef.current);
            }
        };
    }, []);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setIsCopied(true);

            if (resetTimerRef.current !== null) {
                clearTimeout(resetTimerRef.current);
            }

            resetTimerRef.current = window.setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch {
            // Clipboard access can fail in unsupported or insecure contexts.
        }
    };

    return (
        <div className="relative group my-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/95 shadow-lg">
            <button
                type="button"
                aria-label="Copy code"
                onClick={handleCopy}
                className="absolute right-3 top-3 z-10 inline-flex items-center gap-2 rounded-md border border-white/10 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-200 opacity-0 shadow-md backdrop-blur-sm transition-all duration-200 hover:bg-zinc-800 hover:text-white group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
            >
                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>

            <pre className="overflow-x-auto p-4 pt-12 text-sm leading-6 text-zinc-200">
                <code className={`block whitespace-pre font-mono language-${language}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
}