"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Chrome,
  Eye,
  EyeOff,
  Github,
  Loader2,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import AdminKeyModal from "@/components/auth/AdminKeyModal";
import { useAuth } from "@/context/AuthContext";
import { useNotificationActions } from "@/stores/ui-store";
import { useMaintenance } from "@/hooks/useMaintenance";
import { auth, db } from "@/lib/firebase";
import { db, auth } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeProvider, setActiveProvider] = useState<
    "google" | "github" | null
  >(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [showAdminKeyModal, setShowAdminKeyModal] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);

  const { login, user, isLoading, logout, isAdminVerified } = useAuth();
  const { showSuccess, showError, showInfo } = useNotificationActions();
  const router = useRouter();
  const { isMaintenanceMode, maintenanceMessage } = useMaintenance();

  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const timer = window.setInterval(() => {
      setCooldownSeconds((current: number) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        if (!isAdminVerified && !showAdminKeyModal && !isCheckingAdmin) {
          setShowAdminKeyModal(true);
        } else if (isAdminVerified) {
          router.push("/profile");
        }
      } else {
        router.push("/profile");
      }
    }
  }, [
    user,
    isLoading,
    router,
    isAdminVerified,
    showAdminKeyModal,
    isCheckingAdmin,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
      </div>
    );
  }

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      const message = "Enter both your email and password.";
      setError(message);
      showError(message);
      return;
    }

    if (cooldownSeconds > 0) {
      const message = `Too many attempts. Try again in ${cooldownSeconds} seconds.`;
      setError(message);
      showError(message);
      return;
    }

    setIsSubmitting(true);
    setIsCheckingAdmin(true);

    try {
      await login(normalizedEmail, password);
      const adminDoc = await getDoc(doc(db, "admins", normalizedEmail));

      setFailedAttempts(0);
      showSuccess("Signed in successfully.");

      if (adminDoc.exists()) {
        showInfo("Admin account detected. Please complete verification.");
        setShowAdminKeyModal(true);
      } else {
        setIsCheckingAdmin(false);
        router.push("/profile");
      }
    } catch (err: any) {
      console.error(err);

      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      const message =
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/wrong-password"
          ? "Invalid email or password."
          : "Login failed. Please check your credentials.";

      if (nextAttempts >= 3) {
        setCooldownSeconds(30);
        const cooldownMessage =
          "Too many failed attempts. Please wait 30 seconds and try again.";
        setError(cooldownMessage);
        showError(cooldownMessage);
      } else {
        setError(message);
        showError(message);
      }

      setIsCheckingAdmin(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderLogin = async (providerName: "google" | "github") => {
    if (
      isMaintenanceMode ||
      isSubmitting ||
      activeProvider ||
      cooldownSeconds > 0
    )
      return;
    setError("");
    setActiveProvider(providerName);
    setIsCheckingAdmin(true);

    try {
      const provider =
        providerName === "google"
          ? new GoogleAuthProvider()
          : new GithubAuthProvider();

      if (providerName === "github") {
        provider.addScope("read:user");
        provider.addScope("user:email");
      }

      const result = await signInWithPopup(auth, provider);
      const signedInEmail =
        result.user.email?.toLowerCase() ||
        auth.currentUser?.email?.toLowerCase() ||
        "";

      setFailedAttempts(0);
      showSuccess(
        `Signed in with ${providerName === "google" ? "Google" : "GitHub"}.`,
      );

      if (!signedInEmail) {
        setIsCheckingAdmin(false);
        router.push("/profile");
        return;
      }

      const adminDoc = await getDoc(doc(db, "admins", signedInEmail));

      if (adminDoc.exists()) {
        showInfo("Admin account detected. Please complete verification.");
        setShowAdminKeyModal(true);
      } else {
        setIsCheckingAdmin(false);
        router.push("/profile");
      }
    } catch (err: any) {
      console.error(err);
      const message =
        err?.code === "auth/popup-closed-by-user"
          ? "Sign-in popup closed before finishing."
          : `Unable to sign in with ${providerName === "google" ? "Google" : "GitHub"}.`;
      setError(message);
      showError(message);
      setIsCheckingAdmin(false);
    } finally {
      setActiveProvider(null);
    }
  };

  const handleAdminVerified = () => {
    setShowAdminKeyModal(false);
    setIsCheckingAdmin(false);
    router.push("/profile");
  };

  const handleAdminCancel = async () => {
    setShowAdminKeyModal(false);
    setIsCheckingAdmin(false);
    await logout();
  };

  const providerBusy = !!activeProvider;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.75),rgba(2,6,23,0.95))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-cyan-400/10 to-transparent" />

      <AdminKeyModal
        isOpen={showAdminKeyModal}
        onVerified={handleAdminVerified}
        onCancel={handleAdminCancel}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden flex-col justify-between border-r border-white/10 bg-[linear-gradient(160deg,rgba(15,118,110,0.35),rgba(15,23,42,0.65),rgba(2,6,23,0.85))] p-10 text-white lg:flex">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90">
                <Sparkles size={16} />
                Secure access for the DevPath community
              </div>
              <h1 className="max-w-md text-4xl font-bold tracking-tight xl:text-5xl">
                Modern sign-in for a faster return to your learning path.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-white/70">
                Smooth feedback, better validation, and a cleaner authentication
                flow that adapts to mobile and desktop.
              </p>
            </div>

            <div className="grid gap-4 text-sm text-white/80">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                <ShieldCheck className="text-cyan-300" size={18} />
                <span>Verified admin flow and protected session handling</span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                <Lock className="text-cyan-300" size={18} />
                <span>
                  Password reset, visibility toggle, and remember-me support
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/8 p-4">
                <Sparkles className="text-cyan-300" size={18} />
                <span>
                  Responsive UI with stronger feedback on every state change
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <LogIn size={14} />
                Sign In
              </div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to continue to DevPath.
              </p>
            </div>

            {isMaintenanceMode && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-amber-200">
                <AlertTriangle className="mt-0.5 shrink-0" size={18} />
                <div className="text-sm">
                  <p className="mb-1 font-semibold">
                    Login temporarily disabled
                  </p>
                  <p className="text-amber-100/80">{maintenanceMessage}</p>
                </div>
              </div>
            )}

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleProviderLogin("google")}
                disabled={
                  isMaintenanceMode ||
                  isSubmitting ||
                  providerBusy ||
                  cooldownSeconds > 0
                }
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeProvider === "google" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Chrome size={18} />
                )}
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleProviderLogin("github")}
                disabled={
                  isMaintenanceMode ||
                  isSubmitting ||
                  providerBusy ||
                  cooldownSeconds > 0
                }
                className="inline-flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/40 hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeProvider === "github" ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Github size={18} />
                )}
                Continue with GitHub
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
              <span className="h-px flex-1 bg-white/10" />
              or use email
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="name@example.com"
                    autoComplete="email"
                    aria-invalid={!!error}
                    required
                    disabled={isMaintenanceMode}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-10 pr-12 text-sm text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-cyan-300/60 focus:bg-black/30 focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    required
                    disabled={isMaintenanceMode}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-cyan-400 focus:ring-cyan-400/60"
                    disabled={isMaintenanceMode}
                  />
                  Remember me on this device
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Forgot password?
                </Link>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-100"
                  >
                    <AlertCircle
                      className="mt-0.5 shrink-0 text-red-300"
                      size={18}
                    />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {cooldownSeconds > 0 && (
                <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4 text-sm text-amber-100">
                  Rate limiting is active. Try again in {cooldownSeconds}{" "}
                  seconds.
                </div>
              )}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3.5 font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={
                  isMaintenanceMode || isSubmitting || cooldownSeconds > 0
                }
              >
                {isSubmitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {isSubmitting ? "Signing in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-4 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <p>
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-medium text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  Sign up
                </Link>
              </p>
              <p className="inline-flex items-center justify-center gap-2 text-xs text-muted-foreground/80 sm:justify-start">
                <ShieldCheck size={14} />
                Secure session management enabled
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
