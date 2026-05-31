import Link from 'next/link';
import Image from 'next/image';
import { Github, Book, Flag, Users, RefreshCw, Code, MessageSquare } from 'lucide-react';
import logo from '@/assets/logo.png';
import styles from './Footer.module.css';
import { MagneticText } from '../ui/magnetic-text';
import { siteConfig } from '@/config/siteConfig';
import AppStoreButtons from '../ui/AppStoreButtons';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.content}>
                    <div className={styles.brand}>
                        <h3>
                            <Image src={logo} alt="DevPath Logo" width={32} height={32} className="rounded-full" style={{ marginRight: '12px' }} />
                            {siteConfig.name}
                        </h3>
                        <p className={styles.tagline}>
                            {siteConfig.tagline}
                        </p>
                    </div>

                    <div className={styles.column}>
                        <div className="mb-6">
                            <MagneticText
                                text="RESOURCES"
                                hoverText="EXPLORE"
                                className="text-xl font-bold"
                            />
                        </div>
                        <div className={styles.links}>
                            <Link href="/wiki" className={styles.link}>
                                <Book size={16} /> Wiki &amp; Docs
                            </Link>
                            <Link href="/flags" className={styles.link}>
                                <Flag size={16} /> Feature Flags
                            </Link>
                            <Link href="/contributors" className={styles.link}>
                                <Users size={16} /> Contributors
                            </Link>
                        </div>
                    </div>

                    <div className={styles.column}>
                        <div className="mb-6">
                            <MagneticText
                                text="LINKS"
                                hoverText="VISIT"
                                className="text-xl font-bold"
                            />
                        </div>
                        <div className={styles.links}>
                            <Link href="/complaints" className={styles.link}>
                                <MessageSquare size={16} /> Community Complaint
                            </Link>
                            <Link href="/updater" className={styles.link}>
                                <RefreshCw size={16} /> Updater
                            </Link>
                            <Link href="/source-code" className={styles.link}>
                                <Code size={16} /> Source Code
                            </Link>
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-semibold text-gray-400 mb-4">Get the App</h4>
                            <AppStoreButtons variant="footer" className="flex-col !items-start" />
                        </div>

                        <div className="mt-8">
                            <h4 className="text-sm font-semibold text-gray-400 mb-4">Contact Us</h4>
                            <a
                                href={`mailto:${siteConfig.contact.email}`}
                                className="text-sm text-cyan-400 hover:underline"
                            >
                                {siteConfig.contact.email}
                            </a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <div className={styles.copyright}>
                        <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
                    </div>
                    <div className={styles.socials}>
                        {/* GitHub */}
                        <a
                            href={siteConfig.social.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialIcon} hover:scale-110 hover:text-cyan-400 transition-all`}
                            aria-label="GitHub"
                        >
                            <Github size={20} />
                        </a>

                        {/* Instagram */}
                        <a
                            href={siteConfig.social.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialIcon} hover:scale-110 hover:text-pink-500 transition-all`}
                            aria-label="Instagram"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>

                        {/* LinkedIn */}
                        <a
                            href={siteConfig.social.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.socialIcon} hover:scale-110 hover:text-blue-500 transition-all`}
                            aria-label="LinkedIn"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                <rect x="2" y="9" width="4" height="12"></rect>
                                <circle cx="4" cy="4" r="2"></circle>
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
