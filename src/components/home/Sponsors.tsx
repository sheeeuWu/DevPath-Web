"use client";

import Image from 'next/image';
import styles from './Sponsors.module.css';

export default function Sponsors() {
    const communitySponsors = [
        {
            name: "OSCG",
            logo: "https://raw.githubusercontent.com/devpathindcommunity-india/DevPath-Web/master/src/assets/oscg26.png",
            url: "https://osconnect.org/"
        },
        {
            name: "Elite Coders",
            logo: "https://github.com/devpathindcommunity-india/OpenSourceData-DevPath/blob/main/logo%20(2).png?raw=true",
            url: "https://www.elitecoders.xyz/"
        },
        {
            name: "Aprtre 3.0",
            logo: "https://apertre.resourcio.in/assets/vector.svg",
            url: "https://apertre.resourcio.in/"
        },
        {
            name: "Resourcio Community",
            logo: "https://raw.githubusercontent.com/Resourcio-Community/Resourcio_Community-Website/react/frontend/src/Images/site_assets/Updated-logo.svg",
            url: "https://github.com/Resourcio-Community"
        }
    ];

    const eventSponsors = [
        {
            name: "Devfolio",
            logo: "https://github.com/devfolioco/brand-assets/blob/main/Logo/Logo.png?raw=true",
            url: "https://devfolio.co/"
        },
        {
            name: "ETH India",
            logo: "https://ethindia-villa.devfolio.co/_next/image?url=https%3A%2F%2Fassets.devfolio.co%2Fhackathons%2Fefff72dc6d0f45ee8ae27e5831e4cbe3%2Fassets%2Ffavicon%2F935.png&w=1440&q=75",
            url: "https://ethindia-villa.devfolio.co/"
        },
        {
            name: "Code Crafters.io",
            logo: "https://github.com/Aditya948351/Used-Images/blob/main/7408d202b2bb110054fc.png?raw=true",
            url: "https://codecrafters.io/"
        },
        {
            name: "Lovable",
            logo: "https://github.com/Aditya948351/Used-Images/blob/main/lovable-color%20(1).png?raw=true",
            url: "https://lovable.dev/"
        },
        {
            name: ".xyz",
            logo: "https://github.com/Aditya948351/Used-Images/blob/main/download%20(1).png?raw=true",
            url: "https://gen.xyz/"
        },
        {
            name: "Give My Certificate",
            logo: "https://github.com/Aditya948351/Used-Images/blob/main/givemycert.png?raw=true",
            url: "https://givemycertificate.com/"
        }
    ];

    return (
        <section className={styles.sponsors}>
            <div className={styles.header}>
                <h2 className={styles.title}>Our Sponsors</h2>
                <p className={styles.subtitle}>
                    Supported by industry leaders who believe in our mission.
                </p>
            </div>

            {/* Community Sponsors */}
            <div className="mb-12">
                <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground">Trusted By</h3>
                <div className={styles.marqueeContainer}>
                    <div className={styles.marqueeTrack}>
                        {[...communitySponsors, ...communitySponsors].map((sponsor, index) => (
                            <a
                                key={index}
                                href={sponsor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.sponsorCard}
                            >
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        width={200}
                                        height={100}
                                        className={styles.logo}
                                        style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
                                    />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Event Sponsors */}
            <div>
                <h3 className="text-xl font-semibold text-center mb-8 text-muted-foreground">Event Sponsors</h3>
                <div className={styles.marqueeContainer}>
                    <div className={styles.marqueeTrack}>
                        {[...eventSponsors, ...eventSponsors].map((sponsor, index) => (
                            <a
                                key={index}
                                href={sponsor.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.sponsorCard}
                            >
                                <div className={styles.imageWrapper}>
                                    <Image
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        width={200}
                                        height={100}
                                        className={styles.logo}
                                        style={{ width: 'auto', height: 'auto', objectFit: 'contain' }}
                                    />
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
