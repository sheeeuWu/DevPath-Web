"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { auth, db, firebaseAvailable } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { leaderboardSyncErrorEmitter } from '@/lib/leaderboard-sync-error';

interface User {
    uid: string;
    email: string | null;
    name: string | null;
    photoURL: string | null;
    role: 'admin' | 'member';
    mobile?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    bio?: string;
    state?: string;
    city?: string;
    district?: string;
    coverPhotoURL?: string;
    communityRole?: string;
    displayRole?: string;
    roleId?: string;
    roleTasks?: string[];
    aboutMarkdown?: string;
    privacySettings?: {
        showMobile: boolean;
        showLocation: boolean;
        showEmail: boolean;
        showProjects?: boolean;
        showRewards?: boolean;
        isPublic?: boolean;
        showInCommunity?: boolean;
    };
    preferences?: {
        theme?: 'light' | 'dark';
    };
    points?: number;
    achievements?: string[]; // Array of achievement IDs
    completedQuizzes?: string[]; // Array of completed quiz IDs
    claimedRewards?: string[]; // Array of claimed reward IDs
    githubStats?: {
        connected: boolean;
        username?: string;
        repos?: number;
        stars?: number;
        followers?: number;
        following?: number;
        contributions?: number;
        lastFetched?: any;
        recentActivity?: {
            id: string;
            type: string;
            repo: { name: string; url: string };
            created_at: string;
        }[];
        totalStars?: number;
        topLanguages?: { language: string; count: number }[];
        bio?: string;
        company?: string;
        location?: string;
        createdAt?: string;
        linesAdded?: number;
        linesRemoved?: number;
        linesContributed?: number;
    };
    followers?: string[]; // Array of user UIDs
    following?: string[]; // Array of user UIDs
    loginDates?: string[]; // Array of dates in YYYY-MM-DD format
    streak?: number;
    skills?: string[];
    badges?: string[];
    sessionId?: string;
    docId?: string; // Actual Firestore Document ID (Email or UID)
    createdAt?: any;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserProfile: (data: Partial<User>) => Promise<void>;
    awardPoints: (pointsDelta: number) => Promise<void>;
    followUser: (targetUserId: string, targetRole?: string, targetEmail?: string) => Promise<void>;
    unfollowUser: (targetUserId: string, targetRole?: string, targetEmail?: string) => Promise<void>;
    followCommunity: () => Promise<void>;
    isLoading: boolean;
    isAdminVerified: boolean;
    verifyAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdminVerified, setIsAdminVerified] = useState(false);
    const unsubscribeSnapshot = useRef<(() => void) | null>(null);
    const firebaseReady = firebaseAvailable && auth && db;

    const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'devpathind.community@gmail.com';


    useEffect(() => {
        if (!firebaseReady) {
            setIsLoading(false);
            return;
        }

        // Ensure persistence is set to local
        setPersistence(auth, browserLocalPersistence).catch((error) => {
            console.error("Error setting persistence:", error);
        });

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Cleanup previous listener if any
            if (unsubscribeSnapshot.current) {
                unsubscribeSnapshot.current();
                unsubscribeSnapshot.current = null;
            }

            if (firebaseUser) {
                try {
                    // REMOVED SUPER ADMIN BYPASS: The super admin now goes through the standard listener flow.
                    // This ensures their session is tracked and they are validated securely via Firestore `admins` collection.

                    let role: 'admin' | 'member' = 'member';
                    let userData: any = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                        showMobile: false,
                        showLocation: true,
                        showEmail: false,
                        showProjects: true,
                        showRewards: true,
                        isPublic: true,
                        showInCommunity: true
                    };

                    // Check if user is admin (only if email exists)
                    if (firebaseUser.email) {
                        try {
                            // 1. Try by Email
                            const adminDocRef = doc(db, 'admins', firebaseUser.email.toLowerCase());
                            const adminDoc = await getDoc(adminDocRef);
                            if (adminDoc.exists()) {
                                role = 'admin';
                                userData = { ...userData, ...adminDoc.data(), docId: adminDoc.id };
                            } else {
                                // 2. Try by UID (Fallback)
                                const adminUidDocRef = doc(db, 'admins', firebaseUser.uid);
                                const adminUidDoc = await getDoc(adminUidDocRef);
                                if (adminUidDoc.exists()) {
                                    role = 'admin';
                                    userData = { ...userData, ...adminUidDoc.data(), docId: adminUidDoc.id };
                                }
                            }
                        } catch (error) {
                            console.error('Error fetching admin data:', error);
                            // Fallback to member if admin fetch fails
                        }
                    }

                    // If not admin, check member
                    if (role === 'member') {
                        try {
                            // Check for member by UID (New Standard)
                            const memberDocRef = doc(db, 'members', firebaseUser.uid);
                            const memberDoc = await getDoc(memberDocRef);

                            if (memberDoc.exists()) {
                                // Valid member - Load data
                                userData = { ...userData, ...memberDoc.data() };
                            } else {
                                // New Member - Initialize Full Profile
                                const defaultUserData = {
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    name: firebaseUser.displayName || '',
                                    photoURL: firebaseUser.photoURL || '',
                                    role: 'member',
                                    points: 0,
                                    streak: 0,
                                    level: 0,
                                    badges: [],
                                    achievements: [],
                                    completedQuizzes: [],
                                    claimedRewards: [],
                                    followers: [],
                                    following: [],
                                    loginDates: [],
                                    privacySettings: {
                                        showMobile: false,
                                        showLocation: true,
                                        showEmail: false,
                                        showProjects: true,
                                        showRewards: true,
                                        isPublic: true,
                                        showInCommunity: true
                                    },
                                    preferences: {
                                        theme: 'dark'
                                    },
                                    githubStats: {
                                        connected: false,
                                        repos: 0,
                                        stars: 0,
                                        followers: 0,
                                        contributions: 0
                                    },
                                    bio: '',
                                    city: '',
                                    state: '',
                                    socialLinks: {},
                                    createdAt: new Date().toISOString()
                                };

                                // Create the new member document
                                await setDoc(memberDocRef, defaultUserData);
                                userData = { ...userData, ...defaultUserData };
                            }
                        } catch (error) {
                            console.error('Error fetching/creating member data:', error);
                            setUser(null);
                            setIsLoading(false);
                            return; // Stop execution on critical failure to prevent hanging
                        }
                    }

                    // Setup Real-time Listener
                    const collectionName = role === 'admin' ? 'admins' : 'members';
                    // Use email for admins, UID for members
                    const docId = role === 'admin' ? firebaseUser.email!.toLowerCase() : firebaseUser.uid;

                    const { onSnapshot } = await import('firebase/firestore');

                    unsubscribeSnapshot.current = onSnapshot(doc(db, collectionName, docId), (docSnapshot) => {
                        if (docSnapshot.exists()) {
                            const data = docSnapshot.data();
                            const updatedUser = {
                                uid: firebaseUser.uid,
                                email: firebaseUser.email,
                                name: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                role: role,
                                ...data
                            };

                            // Single Session Enforcement
                            const localSessionId = localStorage.getItem('devpath_session_id');
                            if (data.sessionId && localSessionId && data.sessionId !== localSessionId) {
                                console.warn("Session mismatch. Logging out.");
                                signOut(auth);
                                localStorage.removeItem('devpath_session_id');
                                setUser(null);
                                setIsLoading(false);
                                return;
                            }

                            setUser(updatedUser as User);
                        }
                        setIsLoading(false);
                    });

                    // Track Login Date & Streak Logic (Run once per session, update Firestore only)
                    const { calculateStreak, getISTDateString } = await import('@/lib/streakUtils');
                    const today = getISTDateString(new Date());
                    let loginDates = userData.loginDates || [];
                    let shouldUpdate = false;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const updateData: Record<string, any> = {};
                    let pointsDelta = 0;

                    // 1. Check if new day login
                    if (!loginDates.includes(today)) {
                        loginDates.push(today);
                        updateData.loginDates = loginDates;
                        shouldUpdate = true;
                    }

                    // 2. Calculate Streak & Ensure Consistency
                    const { POINTS } = await import('@/lib/points');
                    const { currentStreak } = calculateStreak(loginDates);

                    if (shouldUpdate || userData.streak !== currentStreak) {
                        // Award 1 XP if streak increased (Daily Login)
                        if (currentStreak > (userData.streak || 0)) {
                            pointsDelta += POINTS.DAILY_LOGIN;

                            // 7-Day Streak Bonus
                            if (currentStreak % 7 === 0 && currentStreak > 0) {
                                pointsDelta += POINTS.WEEKLY_STREAK_BONUS;
                            }
                        }

                        updateData.streak = currentStreak;
                        shouldUpdate = true;
                    }

                    // 3. Update Firestore if needed (This will trigger the listener above)
                    if (shouldUpdate) {
                        const { increment } = await import('firebase/firestore');

                        const firestoreUpdate: any = { ...updateData };
                        if (pointsDelta > 0) {
                            firestoreUpdate.points = increment(pointsDelta);
                        }

                        // Sync to Leaderboard (XP)
                        if (pointsDelta > 0 || updateData.points !== undefined) {
                            const leaderboardRef = doc(db, 'leaderboard', firebaseUser.uid);
                            setDoc(leaderboardRef, {
                                uid: firebaseUser.uid,
                                name: userData.name,
                                photoURL: userData.photoURL,
                                points: increment(pointsDelta),
                                role: role,
                                lastActive: today
                            }, { merge: true }).catch(err => {
                                leaderboardSyncErrorEmitter.emit(err, 'login-streak-sync');
                            });
                        }

                        setDoc(doc(db, collectionName, docId), firestoreUpdate, { merge: true }).catch(err => console.error("Error updating user data:", err));
                    }

                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // No fallback - rely on DB
                    setUser(null);
                    setIsLoading(false);
                }
                setIsLoading(false);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            unsubscribe();
            if (unsubscribeSnapshot.current) {
                unsubscribeSnapshot.current();
            }
        };
    }, []);



    const verifyAdmin = () => {
        setIsAdminVerified(true);
    };

    const login = async (email: string, pass: string) => {
        if (!firebaseReady) {
            throw new Error('Firebase is not configured. Login is unavailable in local UI-only mode.');
        }

        // Generate Session ID
        const sessionId = crypto.randomUUID();
        localStorage.setItem('devpath_session_id', sessionId);

        const userCredential = await signInWithEmailAndPassword(auth, email, pass);

        // Update Firestore with Session ID
        if (userCredential.user) {

            const { doc, getDoc, setDoc } = await import('firebase/firestore');

            // Check Admin
            const adminRef = doc(db, 'admins', email.toLowerCase());
            const adminSnap = await getDoc(adminRef);

            if (adminSnap.exists()) {
                // Sync UID to Admin doc to ensure client.tsx can find it by UID query
                await setDoc(adminRef, {
                    sessionId,
                    uid: userCredential.user.uid
                }, { merge: true });
            } else {
                // Check Member
                const memberRef = doc(db, 'members', userCredential.user.uid);
                await setDoc(memberRef, { sessionId }, { merge: true });
            }
        }
    };

    const logout = async () => {
        localStorage.removeItem('devpath_session_id');
        setIsAdminVerified(false);
        if (!firebaseReady) return;
        await signOut(auth);
    };

    const updateUserProfile = async (data: Partial<User>) => {
        if (!firebaseReady || !user || !auth.currentUser) return;
        if (user.email === SUPER_ADMIN_EMAIL) return; // Super Admin Guard

        try {
            // 1. Update Firestore
            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            // Use email for admins, UID for members
            const docId = user.role === 'admin' ? user.email!.toLowerCase() : user.uid;

            // Remove undefined fields
            const cleanData = Object.fromEntries(
                Object.entries(data).filter(([_, v]) => v !== undefined)
            );

            if ((cleanData as any).points !== undefined) {
                console.warn("[updateUserProfile] Ignoring `points` field. Use awardPoints(pointsDelta) instead.");
                delete (cleanData as any).points;
            }

            await setDoc(doc(db, collectionName, docId), cleanData, { merge: true });

            // 2. Update Auth Profile (if name or photoURL changed)
            if (data.name || data.photoURL) {
                // Dynamic import to avoid SSR issues if any, though updateProfile is standard
                const { updateProfile } = await import('firebase/auth');
                await updateProfile(auth.currentUser, {
                    displayName: data.name || auth.currentUser.displayName,
                    photoURL: data.photoURL || auth.currentUser.photoURL
                });
            }

            // 3. Update Local State
            setUser(prev => prev ? { ...prev, ...data } : null);

        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const awardPoints = async (pointsDelta: number) => {
        if (!firebaseReady || !user || !auth.currentUser) return;
        if (user.email === SUPER_ADMIN_EMAIL) return; // Super Admin Guard
        if (!Number.isFinite(pointsDelta) || pointsDelta === 0) return;

        const { writeBatch, increment } = await import('firebase/firestore');
        const batch = writeBatch(db);

        const collectionName = user.role === 'admin' ? 'admins' : 'members';
        const docId = user.docId || (user.role === 'admin' ? user.email!.toLowerCase() : user.uid);
        const userRef = doc(db, collectionName, docId);

        batch.set(userRef, { points: increment(pointsDelta) }, { merge: true });

        const today = new Date().toISOString().split('T')[0];
        const leaderboardRef = doc(db, 'leaderboard', user.uid);
        batch.set(leaderboardRef, {
            uid: user.uid,
            name: user.name,
            photoURL: user.photoURL,
            points: increment(pointsDelta),
            role: user.role,
            lastActive: today
        }, { merge: true });

        try {
            await batch.commit();
        } catch (error) {
            leaderboardSyncErrorEmitter.emit(error, 'awardPoints');
            throw error; // Re-throw so callers know it failed
        }

        setUser(prev => prev ? {
            ...prev,
            points: (prev.points || 0) + pointsDelta
        } : null);
    };

    const followUser = async (targetUserId: string, targetRole: string = 'member', targetEmail?: string) => {
        if (!firebaseReady || !user) return;
        if (user.uid === targetUserId) return; // Cannot follow self
        if (user.following?.includes(targetUserId)) return; // Prevent double follow

        try {
            const batch = (await import('firebase/firestore')).writeBatch(db);
            const arrayUnion = (await import('firebase/firestore')).arrayUnion;
            const increment = (await import('firebase/firestore')).increment;
            const { POINTS } = await import('@/lib/points');

            // Update current user's following list
            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            // Use the stored docId if available, otherwise fallback to email/uid logic
            const docId = user.docId || (user.role === 'admin' ? user.email!.toLowerCase() : user.uid);

            const currentUserRef = doc(db, collectionName, docId);
            batch.update(currentUserRef, {
                following: arrayUnion(targetUserId)
            });

            // Update target user's followers list & Award Points
            const targetCollection = targetRole === 'admin' ? 'admins' : 'members';
            // Use targetUserId directly as it is resolved correctly by client.tsx (Document ID)
            const targetDocId = targetUserId;

            const targetUserRef = doc(db, targetCollection, targetDocId);

            const updateData: any = {
                followers: arrayUnion(user.uid)
            };

            // Only award points if target is NOT an admin
            if (targetRole !== 'admin') {
                updateData.points = increment(POINTS.FOLLOWER_GAINED);
            }

            // Revert to update to ensure we hit the 'allow update' rule in Firestore
            batch.update(targetUserRef, updateData);

            // Sync target user points to leaderboard (Only if target is member or has leaderboard entry)
            // We'll try to update leaderboard using UID. If it fails (e.g. admin not in leaderboard), we catch it.
            if (targetRole === 'member') {
                const targetLeaderboardRef = doc(db, 'leaderboard', targetUserId);
                batch.set(targetLeaderboardRef, {
                    points: increment(POINTS.FOLLOWER_GAINED)
                }, { merge: true });
            }

            try {
                await batch.commit();
            } catch (error) {
                leaderboardSyncErrorEmitter.emit(error, 'followUser-leaderboard-sync');
                throw error;
            }

            // Update local state
            setUser(prev => prev ? { ...prev, following: [...(prev.following || []), targetUserId] } : null);
        } catch (error) {
            console.error("Error following user:", error);
            throw error;
        }
    };

    const unfollowUser = async (targetUserId: string, targetRole: string = 'member', targetEmail?: string) => {
        if (!firebaseReady || !user) return;
        if (user.email === SUPER_ADMIN_EMAIL) return; // Super Admin Guard
        try {
            const batch = (await import('firebase/firestore')).writeBatch(db);
            const arrayRemove = (await import('firebase/firestore')).arrayRemove;
            const increment = (await import('firebase/firestore')).increment;
            const { POINTS } = await import('@/lib/points');


            // Update current user's following list
            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            // Use the stored docId if available, otherwise fallback to email/uid logic
            const docId = user.docId || (user.role === 'admin' ? user.email!.toLowerCase() : user.uid);

            const currentUserRef = doc(db, collectionName, docId);
            batch.update(currentUserRef, {
                following: arrayRemove(targetUserId)
            });

            // Update target user's followers list & Deduct Points
            const targetCollection = targetRole === 'admin' ? 'admins' : 'members';
            // Use targetUserId directly
            const targetDocId = targetUserId;

            const targetUserRef = doc(db, targetCollection, targetDocId);
            
            const updateData: any = {
                followers: arrayRemove(user.uid)
            };

            // Only deduct points if target is NOT an admin
            if (targetRole !== 'admin') {
                updateData.points = increment(-POINTS.FOLLOWER_GAINED);
            }

            batch.update(targetUserRef, updateData);

            // Sync target user points to leaderboard (Only if target is member or has leaderboard entry)
            if (targetRole === 'member') {
                const targetLeaderboardRef = doc(db, 'leaderboard', targetUserId);
                batch.set(targetLeaderboardRef, {
                    points: increment(-POINTS.FOLLOWER_GAINED)
                }, { merge: true });
            }

            try {
                await batch.commit();
            } catch (error) {
                leaderboardSyncErrorEmitter.emit(error, 'unfollowUser-leaderboard-sync');
                throw error;
            }

            // Update local state
            setUser(prev => prev ? { ...prev, following: (prev.following || []).filter(id => id !== targetUserId) } : null);
        } catch (error) {
            console.error("Error unfollowing user:", error);
            throw error;
        }
    };

    const followCommunity = async () => {
        if (!firebaseReady || !user) return;
        if (user.email === SUPER_ADMIN_EMAIL) return; // Super Admin Guard
        // Check if already followed (using a flag or badge)
        if (user.achievements?.includes('community_follower')) return;

        try {
            const { POINTS } = await import('@/lib/points');
            const { arrayUnion, increment, writeBatch } = await import('firebase/firestore');

            const collectionName = user.role === 'admin' ? 'admins' : 'members';
            const docId = user.role === 'admin' ? user.email!.toLowerCase() : user.uid;
            const userRef = doc(db, collectionName, docId);
            const leaderboardRef = doc(db, 'leaderboard', user.uid);

            const batch = writeBatch(db);

            batch.set(userRef, {
                achievements: arrayUnion('community_follower'),
                points: increment(POINTS.FOLLOW_COMMUNITY)
            }, { merge: true });

            batch.set(leaderboardRef, {
                points: increment(POINTS.FOLLOW_COMMUNITY)
            }, { merge: true });

            await batch.commit();

            setUser(prev => prev ? {
                ...prev,
                achievements: [...(prev.achievements || []), 'community_follower'],
                points: (prev.points || 0) + POINTS.FOLLOW_COMMUNITY
            } : null);

        } catch (error) {
            console.error("Error following community:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserProfile, awardPoints, followUser, unfollowUser, followCommunity, isLoading, isAdminVerified, verifyAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
