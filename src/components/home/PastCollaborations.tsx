"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PastCollaborations() {
    return (
        <section className="py-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                            Past Collaborations
                        </span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        We are proud to have collaborated with these amazing organizations.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center items-center"
                >
                    <div className="relative w-full max-w-4xl aspect-video md:aspect-[21/9] bg-white/5 rounded-2xl border border-white/10 overflow-hidden p-8 flex items-center justify-center hover:border-white/20 transition-colors">
                        <div className="relative w-full h-full">
                            <Image
                                src="https://res.cloudinary.com/dsj0vaews/image/upload/v1766937095/r8ra3fwkfp9n68lemuud.png"
                                alt="Logos of DevPath past collaboration partners"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
