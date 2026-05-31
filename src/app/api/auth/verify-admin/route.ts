import { NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { rateLimit } from '@/lib/rateLimiter';

/**
 * POST /api/auth/verify-admin
 *
 * Verifies the submitted admin key against the value stored in Firestore.
 * Rate limited to 5 attempts per IP per minute to prevent brute-force attacks.
 */
export async function POST(request: Request) {
    // Rate limit: 5 attempts per IP per 60 seconds
    const limit = rateLimit(request, {
        limit: 5,
        windowMs: 60_000,
        message: 'Too many key attempts. Please wait before trying again.',
    });

    if (!limit.success) {
        return limit.response;
    }

    try {
        const body = await request.json();
        const { key } = body;

        if (!key) {
            return NextResponse.json({ success: false, message: 'Key is required' }, { status: 400 });
        }

        // Fetch the key securely on the server side
        const docRef = doc(db, 'admin_keys', 'config');
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            console.error('Admin key config not found in Firestore');
            return NextResponse.json({ success: false, message: 'Server configuration error' }, { status: 500 });
        }

        const actualKey = docSnap.data().value;

        // Perform the verification securely away from the browser
        if (key === actualKey) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid Admin Key. Please try again.' },
                {
                    status: 401,
                    headers: {
                        'X-RateLimit-Remaining': String(limit.remaining - 1),
                    },
                }
            );
        }

    } catch (error) {
        console.error('Error verifying admin key:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}