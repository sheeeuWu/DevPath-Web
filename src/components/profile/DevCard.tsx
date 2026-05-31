"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import {
  Download, Link2, Check, MapPin, Calendar,
  Trophy, Zap, Flame, Star, Award, Github,
  Layers, Code2, Globe, Users, Brain,
  ChevronRight, Sparkles, Medal,
} from 'lucide-react';
import { calculateLevel } from '@/lib/points';
import { copyToClipboard } from '@/lib/clipboard';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useNotification } from '@/context/NotificationContext';
import styles from './DevCard.module.css';

// ── Badge registry ────────────────────────────────────────────────────────────
const BADGE_REGISTRY: Record<string, { name: string; Icon: any; color: string }> = {
  'early-adopter':     { name: 'Early Adopter',     Icon: Sparkles,    color: '#60a5fa' },
  'profile-perfect':   { name: 'Profile Perfect',   Icon: Check,       color: '#34d399' },
  'builder-1':         { name: 'Builder',            Icon: Layers,      color: '#fb923c' },
  'builder-3':         { name: 'Prolific Builder',   Icon: Layers,      color: '#fb923c' },
  'builder-5':         { name: 'Architect',          Icon: Layers,      color: '#f59e0b' },
  'builder-10':        { name: 'Master Builder',     Icon: Layers,      color: '#f59e0b' },
  'connector-social':  { name: 'Super Connector',    Icon: Globe,       color: '#a78bfa' },
  'social-github':     { name: 'Coder',              Icon: Github,      color: '#94a3b8' },
  'social-linkedin':   { name: 'Professional',       Icon: Globe,       color: '#0ea5e9' },
  'social-instagram':  { name: 'Socialite',          Icon: Globe,       color: '#f472b6' },
  'storyteller':       { name: 'Storyteller',        Icon: Code2,       color: '#c084fc' },
  'face-of-community': { name: 'Face of Community',  Icon: Users,       color: '#34d399' },
  'local-hero':        { name: 'Local Hero',         Icon: MapPin,      color: '#fb923c' },
  'streak-7':          { name: 'Dedicated',          Icon: Flame,       color: '#f87171' },
  'rising-star':       { name: 'Rising Star',        Icon: Star,        color: '#fbbf24' },
  'top-collaborator':  { name: 'Top Collaborator',   Icon: Users,       color: '#2dd4bf' },
};

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f7df1e', Python: '#3572A5',
  Java: '#b07219', Go: '#00ADD8', Rust: '#dea584', 'C++': '#f34b7d',
  'C#': '#178600', CSS: '#563d7c', HTML: '#e34c26', Ruby: '#701516',
  PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
  Shell: '#89e051', Vue: '#41b883',
};
const getLangColor = (lang: string) => LANG_COLORS[lang] ?? '#94a3b8';

function resolveLevelColor(colorClass: string): string {
  const map: Record<string, string> = {
    'text-gray-500': '#6b7280',   'text-slate-500': '#64748b',
    'text-blue-500': '#3b82f6',   'text-green-500': '#22c55e',
    'text-teal-500': '#14b8a6',   'text-cyan-500': '#06b6d4',
    'text-indigo-500': '#6366f1', 'text-purple-500': '#a855f7',
    'text-rose-500': '#f43f5e',   'text-orange-500': '#f97316',
    'text-emerald-500': '#10b981',
  };
  return map[colorClass] ?? '#94a3b8';
}
function resolveLevelBg(bgClass: string): string {
  const map: Record<string, string> = {
    'bg-gray-500/10': 'rgba(107,114,128,0.12)',   'bg-slate-500/10': 'rgba(100,116,139,0.12)',
    'bg-blue-500/10': 'rgba(59,130,246,0.12)',    'bg-green-500/10': 'rgba(34,197,94,0.12)',
    'bg-teal-500/10': 'rgba(20,184,166,0.12)',    'bg-cyan-500/10': 'rgba(6,182,212,0.12)',
    'bg-indigo-500/10': 'rgba(99,102,241,0.12)',  'bg-purple-500/10': 'rgba(168,85,247,0.12)',
    'bg-rose-500/10': 'rgba(244,63,94,0.12)',     'bg-orange-500/10': 'rgba(249,115,22,0.12)',
    'bg-emerald-500/10': 'rgba(16,185,129,0.12)',
  };
  return map[bgClass] ?? 'rgba(148,163,184,0.12)';
}

function useAnimatedCount(target: number, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let current = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function fmtPoints(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
function fmtDate(raw: any): string {
  if (raw === null || raw === undefined) return 'Recent Member';
  try {
    let d: Date;
    if (typeof raw === 'string' || typeof raw === 'number') {
      d = new Date(raw);
    } else if (typeof raw.toDate === 'function') {
      d = raw.toDate();
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return 'Recent Member';
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch { return 'Recent Member'; }
}

export default function DevCard({ user }: { user: any }) {
  const IMAGE_WAIT_TIMEOUT_MS = 5000;
  const cardRef = useRef<HTMLDivElement>(null);
  const [rank, setRank]             = useState<number | null>(null);
  const [rankLoading, setRankLoading] = useState(true);
  const [copied, setCopied]         = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [langMounted, setLangMounted] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    const fetch = async () => {
      if (!user?.points) { setRankLoading(false); return; }
      try {
        const snap = await getCountFromServer(
          query(collection(db, 'leaderboard'), where('points', '>', user.points))
        );
        setRank(snap.data().count + 1);
      } catch { /* silent */ } finally { setRankLoading(false); }
    };
    fetch();
  }, [user?.points]);

  useEffect(() => {
    const t = setTimeout(() => setLangMounted(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.photoURL]);

  const levelInfo   = calculateLevel(user?.points ?? 0);
  const level       = levelInfo.currentLevel;
  const levelColor  = resolveLevelColor(level.color);
  const levelBg     = resolveLevelBg(level.bg);

  const earnedBadges = (user?.achievements ?? [])
    .filter((id: string) => BADGE_REGISTRY[id])
    .map((id: string) => ({ id, ...BADGE_REGISTRY[id] }));

  const topBadges  = earnedBadges.slice(0, 4);
  const extraCount = Math.max(0, earnedBadges.length - 4);
  const topLangs = ((user?.githubStats?.topLanguages ?? []) as { language: string; count: number }[]).slice(0, 4);
  const totalLang = topLangs.reduce((s, l) => s + l.count, 0);

  const animXP     = useAnimatedCount(user?.points ?? 0);
  const animStreak = useAnimatedCount(user?.streak ?? 0, 900);

  const profileUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/u/${user?.uid}`
    : `devpath.in/u/${user?.uid}`;

  const waitForCardImages = async (root: HTMLElement) => {
    const imgs = Array.from(root.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        if (img.complete) {
          // complete + naturalWidth 0 means a failed image; treat as terminal.
          if (img.naturalWidth === 0) return;
          return;
        }
        if (typeof img.decode === 'function') {
          try {
            await Promise.race([
              img.decode(),
              new Promise<void>((resolve) => {
                setTimeout(resolve, IMAGE_WAIT_TIMEOUT_MS);
              }),
            ]);
            return;
          } catch {
            // Fallback to load/error listeners if decode rejects.
          }
        }

        await new Promise<void>((resolve) => {
          const timeoutId = setTimeout(() => {
            done();
          }, IMAGE_WAIT_TIMEOUT_MS);

          const done = () => {
            img.removeEventListener('load', done);
            img.removeEventListener('error', done);
            clearTimeout(timeoutId);
            resolve();
          };

          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
        });
      })
    );
  };

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await waitForCardImages(cardRef.current);
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
      });
      const a = document.createElement('a');
      a.download = `devcard-${(user?.name ?? 'dev').replace(/\s+/g, '-')}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error('DevCard download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopy = async () => {
    const copiedSuccessfully = await copyToClipboard(profileUrl);

    if (copiedSuccessfully) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showSuccess('Profile link copied to clipboard.');
    } else {
      showError('Copying the profile link is not supported in this browser.');
    }
  };

  // ── Motion variants ───────────────────────────────────────────────────────
  const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
  const item: Variants = {
    hidden: { opacity: 0, y: 14 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] } },
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        ref={cardRef}
        className={styles.card}
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] as any }}
        id="devcard-render"
      >
        <div className={styles.cardInner}>
          <motion.div className={styles.leftPanel} variants={container} initial="hidden" animate="show">
            <motion.div className={styles.avatarRing} variants={item}>
              <div className={styles.avatarRingInner} />
              {user?.photoURL && !avatarLoadFailed ? (
                <Image
                  src={user.photoURL}
                  alt={user?.name ?? 'Developer'}
                  fill
                  className={styles.avatar}
                  unoptimized
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                  priority
                  onError={() => setAvatarLoadFailed(true)}
                />
              ) : (
                <div className={styles.avatarFallback}>{user?.name?.charAt(0)?.toUpperCase() ?? '?'}</div>
              )}
            </motion.div>
            <motion.h2 className={styles.name} variants={item}>{user?.name ?? 'Developer'}</motion.h2>
            <motion.div className={styles.levelBadge} variants={item} style={{ background: levelBg, color: levelColor, borderColor: `${levelColor}44` }}>
              <Medal size={11} />
              <span>{level.name}</span>
            </motion.div>
            <motion.div className={styles.meta} variants={item}>
              {(user?.city || user?.state) && (
                <span className={styles.metaRow}><MapPin size={10} />{[user.city, user.state].filter(Boolean).join(', ')}</span>
              )}
              <span className={styles.metaRow}><Calendar size={10} />Joined {fmtDate(user?.createdAt)}</span>
              {user?.githubStats?.username && <span className={styles.metaRow}><Github size={10} />{user.githubStats.username}</span>}
            </motion.div>
            <motion.div className={styles.progressSection} variants={item}>
              <div className={styles.progressMeta}><span className={styles.progressLabel}>Level Progress</span><span className={styles.progressPct}>{Math.round(levelInfo.progress)}%</span></div>
              <div className={styles.progressTrack}>
                <motion.div className={styles.progressFill} initial={{ width: 0 }} animate={{ width: `${levelInfo.progress}%` }} transition={{ delay: 0.6, duration: 1.2, ease: [0.19, 1, 0.22, 1] as any }} style={{ background: `linear-gradient(90deg, ${levelColor}, ${levelColor}99)` }} />
              </div>
            </motion.div>
          </motion.div>

          <motion.div className={styles.rightPanel} variants={container} initial="hidden" animate="show">
            <motion.div className={styles.statsGrid} variants={item}>
              <div className={styles.statCard}><div className={styles.statIconWrap} style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}><Zap size={14} strokeWidth={2.5} /></div><span className={`${styles.statValue} ${styles.cyan}`}>{fmtPoints(animXP)}</span><span className={styles.statLabel}>Dev XP</span></div>
              <div className={styles.statCard}><div className={styles.statIconWrap} style={{ background: 'rgba(168,85,247,0.1)', color: '#c084fc' }}><Trophy size={14} strokeWidth={2.5} /></div><span className={`${styles.statValue} ${styles.purple}`}>{rankLoading ? '—' : rank ? `#${rank}` : '—'}</span><span className={styles.statLabel}>Global Rank</span></div>
              <div className={styles.statCard}><div className={styles.statIconWrap} style={{ background: 'rgba(249,115,22,0.1)', color: '#fb923c' }}><Flame size={14} strokeWidth={2.5} /></div><span className={`${styles.statValue} ${styles.flame}`}>{animStreak}d</span><span className={styles.statLabel}>Streak</span></div>
              <div className={styles.statCard}><div className={styles.statIconWrap} style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}><Award size={14} strokeWidth={2.5} /></div><span className={styles.statValue}>{earnedBadges.length}</span><span className={styles.statLabel}>Badges</span></div>
              <div className={styles.statCard}><div className={styles.statIconWrap} style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}><Brain size={14} strokeWidth={2.5} /></div><span className={styles.statValue}>{user?.completedQuizzes?.length ?? 0}</span><span className={styles.statLabel}>Quizzes</span></div>
              <div className={styles.statCard}><div className={styles.statIconWrap} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>{user?.githubStats?.connected ? <Github size={14} strokeWidth={2.5} /> : <Users size={14} strokeWidth={2.5} />}</div><span className={styles.statValue}>{user?.githubStats?.connected ? fmtPoints(user.githubStats.totalStars ?? user.githubStats.stars ?? 0) : (user?.followers?.length ?? 0)}</span><span className={styles.statLabel}>{user?.githubStats?.connected ? 'GH Stars' : 'Followers'}</span></div>
            </motion.div>
            {topBadges.length > 0 && (
              <motion.div variants={item} className={styles.badgesSection}>
                <span className={styles.sectionLabel}>
                  <Award size={11} /> Top Achievements
                </span>
                <div className={styles.badgesRow}>
                  {topBadges.map((b: { id: string; name: string; Icon: any; color: string }) => {
                    const BadgeIcon = b.Icon;
                    return (
                      <span key={b.id} className={styles.badge} style={{ borderColor: `${b.color}33` }}>
                        <BadgeIcon size={12} color={b.color} strokeWidth={2.5} />
                        <span>{b.name}</span>
                      </span>
                    );
                  })}
                  {extraCount > 0 && (
                    <span className={styles.badgeMore}>
                      +{extraCount} more
                    </span>
                  )}
                </div>
              </motion.div>
            )}
            {topLangs.length > 0 && (
              <motion.div variants={item} className={styles.languagesSection}>
                <span className={styles.sectionLabel}><Code2 size={11} /> Top Languages</span>
                {topLangs.map(({ language, count }) => { const pct = totalLang > 0 ? Math.round((count / totalLang) * 100) : 0; return (<div key={language} className={styles.langRow}><span className={styles.langDot} style={{ background: getLangColor(language) }} /><span className={styles.langName}>{language}</span><div className={styles.langBar}><div className={styles.langBarFill} style={{ width: langMounted ? `${pct}%` : '0%', background: getLangColor(language) }} /></div><span className={styles.langPct}>{pct}%</span></div>); })}
              </motion.div>
            )}
          </motion.div>

          <div className={styles.footer}>
            <span className={styles.footerBrand}>DevPath · Developer Network</span>
            <span className={styles.footerUrl}><ChevronRight size={11} style={{ opacity: 0.5 }} />devpath.in</span>
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.actions} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5, ease: [0.19, 1, 0.22, 1] as any }}>
        <button id="devcard-download-btn" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleDownload} disabled={downloading} aria-label="Download Dev Card as PNG"><Download size={15} />{downloading ? 'Generating...' : 'Download Card'}</button>
        <button id="devcard-copy-btn" className={`${styles.btn} ${copied ? styles.btnSuccess : styles.btnSecondary}`} onClick={handleCopy} aria-label="Copy profile link">{copied ? <Check size={15} /> : <Link2 size={15} />}{copied ? 'Copied!' : 'Copy Profile Link'}</button>
      </motion.div>
    </div>
  );
}