import type { Metadata } from 'next';
import ProfileClient from '../client';

export function generateStaticParams() {
    return [];
}

export async function generateMetadata(
    { params }: { params: Promise<{ uid: string }> }
): Promise<Metadata> {
    const { uid } = await params;

    return {
        title: 'DevPath User Profile',
        description: 'View a public DevPath community profile.',
        alternates: {
            canonical: `/u/${uid}`,
        },
        openGraph: {
            title: 'DevPath User Profile',
            description: 'Check out this public DevPath community profile.',
            url: `/u/${uid}`,
        },
    };
}

export default async function UserProfilePage(
    { params }: { params: Promise<{ uid: string }> }
) {
    const { uid } = await params;

    return <ProfileClient uid={uid} />;
}
