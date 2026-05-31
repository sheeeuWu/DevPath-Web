"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Github, Linkedin, Instagram, ArrowRight, MapPin, Key, Sparkles, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { sanitizeSocialLinks } from '@/lib/safe-social-url';

// const ADMIN_KEY = "DEVPATH_CORE_2025"; // Removed in favor of dynamic key

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [github, setGithub] = useState('');
    const [instagram, setInstagram] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [isAdminSignup, setIsAdminSignup] = useState(false);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, isLoading } = useAuth(); // Import useAuth

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    useEffect(() => {
        if (user) {
            router.push('/profile');
        }
    }, [user, router]);

    if (user) return null;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);

        try {
            if (isAdminSignup) {
                // Fetch dynamic admin key
                const keyDoc = await getDoc(doc(db, 'admin_keys', 'config'));
                if (!keyDoc.exists()) {
                    throw new Error("System Configuration Error: Admin Key not found.");
                }
                const currentAdminKey = keyDoc.data().value;

                if (adminKey !== currentAdminKey) {
                    throw new Error("Invalid Admin Key. Please contact the Super Admin.");
                }
            }

            // 1. Create Authentication User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Profile Name
            await updateProfile(user, { displayName: name });
            const safeSocialLinks = sanitizeSocialLinks({ linkedin, github, instagram });

            // 3. Create Document in Firestore
            if (isAdminSignup) {
                // For admins, we update the existing doc with uid and other details if needed, 
                // or just ensure they can access it. 
                // The 'admins' collection is already seeded. We might want to add the UID to it.
                await setDoc(doc(db, 'admins', email), {
                    uid: user.uid, // Link Auth UID to Admin Doc
                    name, // Ensure name is saved
                    mobile: `${countryCode} ${mobile}`,
                    state,
                    city,
                    district,
                    ...safeSocialLinks,
                    // Preserve existing fields if any (merge is true by default for setDoc if we use { merge: true } but here we want to overwrite/add)
                    // Actually, let's use merge to not lose seeded data like role/name if they match
                }, { merge: true });
            } else {
                // Member Signup
                await setDoc(doc(db, 'members', user.uid), {
                    uid: user.uid,
                    name,
                    email,
                    mobile: `${countryCode} ${mobile}`,
                    state,
                    city,
                    district,
                    ...safeSocialLinks,
                    role: 'member',
                    createdAt: serverTimestamp(),
                    points: 0,
                    rank: 0,
                    streak: 0,
                    projects: 0
                });
            }

            router.push('/profile');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.14),transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.9),rgba(15,23,42,0.96))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-cyan-400/10 to-transparent" />

            <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
                >
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                        <div className="relative overflow-hidden border-r border-white/10 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(34,211,238,0.16),rgba(15,23,42,0.42),rgba(2,6,23,0.92))]" />
                            <div className="pointer-events-none absolute -right-10 top-10 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-8 left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

                            <div className="relative z-10 flex h-full flex-col">
                                <div className="mb-8 inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/85 shadow-lg shadow-cyan-950/10">
                                    <Sparkles size={14} />
                                    Create your profile
                                </div>

                                <div className="max-w-xl">
                                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl xl:text-5xl">
                                        Join DevPath and build a profile that actually feels premium.
                                    </h1>
                                    <p className="mt-4 max-w-lg text-sm leading-6 text-white/72 sm:text-base">
                                        Sign up once, keep your details organized, and connect with the community from a cleaner, more polished onboarding flow.
                                    </p>
                                </div>

                                <div className="mt-8 grid gap-3 text-sm text-white/82 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                                        <div className="mb-2 text-cyan-300">
                                            <ShieldCheck size={18} />
                                        </div>
                                        Secure account creation
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                                        <div className="mb-2 text-cyan-300">
                                            <Sparkles size={18} />
                                        </div>
                                        Polished profile setup
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                                        <div className="mb-2 text-cyan-300">
                                            <MapPin size={18} />
                                        </div>
                                        Community-ready details
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/65">
                                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">Member signup</span>
                                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">Admin registration</span>
                                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">Social links</span>
                                </div>

                                <div className="mt-8 rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm sm:p-5">
                                    <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-white/70">
                                        <ShieldCheck size={14} />
                                        Community access
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <a
                                            href="https://www.linkedin.com/company/devpath-community/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/12"
                                        >
                                            <div className="rounded-2xl bg-[#0077b5]/15 p-2 text-[#7cc5ff] transition-colors group-hover:bg-[#0077b5] group-hover:text-white">
                                                <Linkedin size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-white">LinkedIn</div>
                                                <div className="text-[11px] text-white/60">Professional updates</div>
                                            </div>
                                        </a>

                                        <a
                                            href="https://www.instagram.com/devpath_community/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/12"
                                        >
                                            <div className="rounded-2xl bg-[#E1306C]/15 p-2 text-[#ff8ab1] transition-colors group-hover:bg-[#E1306C] group-hover:text-white">
                                                <Instagram size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-white">Instagram</div>
                                                <div className="text-[11px] text-white/60">Community highlights</div>
                                            </div>
                                        </a>

                                        <a
                                            href="https://github.com/devpathindcommunity-india"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-white/12"
                                        >
                                            <div className="rounded-2xl bg-white/10 p-2 text-white transition-colors group-hover:bg-white group-hover:text-slate-950">
                                                <Github size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-white">GitHub</div>
                                                <div className="text-[11px] text-white/60">Open source projects</div>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-950/40 px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
                            <div className="mb-8 text-center lg:text-left">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200 shadow-lg shadow-cyan-950/10">
                                    <User size={14} />
                                    Sign Up
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Create your account</h2>
                                <p className="mt-2 text-sm text-muted-foreground">Set up your DevPath profile in a few steps.</p>
                            </div>

                            <form onSubmit={handleSignup} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Full Name</label>
                                    <div className="relative">
                                        <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Email</label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="name@example.com"
                                            required
                                        />
                                    </div>
                                    <label htmlFor="isAdminToggle" className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
                                        <input
                                            type="checkbox"
                                            id="isAdminToggle"
                                            checked={isAdminSignup}
                                            onChange={(e) => setIsAdminSignup(e.target.checked)}
                                            className="h-4 w-4 rounded border-border text-cyan-400 focus:ring-cyan-400/60"
                                        />
                                        Register as Admin
                                    </label>
                                </div>

                                {isAdminSignup && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4"
                                    >
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">Admin Key</label>
                                        <div className="relative">
                                            <Key className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-200" size={18} />
                                            <input
                                                type="password"
                                                value={adminKey}
                                                onChange={(e) => setAdminKey(e.target.value)}
                                                className="w-full rounded-2xl border border-cyan-400/30 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                                placeholder="Enter admin key"
                                                required={isAdminSignup}
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Mobile Number</label>
                                    <div className="flex gap-2">
                                        <div className="relative w-28 shrink-0">
                                            <select
                                                value={countryCode}
                                                onChange={(e) => setCountryCode(e.target.value)}
                                                className="w-full appearance-none rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-foreground outline-none transition-all duration-200 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            >
                                                <option value="+91">+91 (IN)</option>
                                                <option value="+1">+1 (US)</option>
                                                <option value="+44">+44 (UK)</option>
                                                <option value="+61">+61 (AU)</option>
                                                <option value="+81">+81 (JP)</option>
                                                <option value="+86">+86 (CN)</option>
                                                <option value="+49">+49 (DE)</option>
                                                <option value="+33">+33 (FR)</option>
                                            </select>
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <input
                                                type="tel"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                                placeholder="98765 43210"
                                                pattern="[0-9]{10}"
                                                maxLength={10}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">State</label>
                                        <div className="relative">
                                            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                            <input
                                                type="text"
                                                value={state}
                                                onChange={(e) => setState(e.target.value)}
                                                className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                                placeholder="State"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">City</label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="City"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">District</label>
                                        <input
                                            type="text"
                                            value={district}
                                            onChange={(e) => setDistrict(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="District"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">LinkedIn URL</label>
                                    <div className="relative">
                                        <Linkedin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="url"
                                            value={linkedin}
                                            onChange={(e) => setLinkedin(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="https://linkedin.com/in/username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">GitHub URL</label>
                                    <div className="relative">
                                        <Github className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="url"
                                            value={github}
                                            onChange={(e) => setGithub(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="https://github.com/username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Instagram URL</label>
                                    <div className="relative">
                                        <Instagram className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="url"
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="https://instagram.com/username"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Password</label>
                                    <div className="relative">
                                        <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3.5 font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? 'Creating Account...' : 'Sign Up'}
                                    <ArrowRight size={18} />
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm text-muted-foreground lg:text-left">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-cyan-300 transition-colors hover:text-cyan-200">
                                    Login
                                </Link>
                            </div>
                        </div>

                    </div>
                </motion.div>
            </div>
        </div>
    );
}
