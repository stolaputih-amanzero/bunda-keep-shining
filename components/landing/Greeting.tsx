'use client'

import { motion } from 'framer-motion'

interface Guest {
    full_name: string
    title: string
}

interface GreetingProps {
    guest: Guest
}

// Variabel animasi untuk efek muncul berurutan (staggered)
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2, // Jeda antar elemen
            delayChildren: 0.3,   // Jeda awal sebelum animasi dimulai
        },
    },
} as const

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: 'easeOut' },
    },
} as const

export default function Greeting({ guest }: GreetingProps) {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full px-6 py-12 flex flex-col items-center"
        >
            {/* Header Section: Welcome --- Guest */}
            <motion.div variants={itemVariants} className="w-full flex justify-between items-center mb-12">
                <span className="text-[10px] tracking-[0.2em] text-white font-bold uppercase">Welcome</span>
                <div className="w-8 h-px bg-[#D4AF37]"></div>
                <span className="text-[10px] tracking-[0.2em] text-white font-bold uppercase underline decoration-[#D4AF37] decoration-2 underline-offset-4">
                    Guest
                </span>
            </motion.div>

            {/* Name Section */}
            <motion.div variants={itemVariants} className="text-center mb-10">
                <h2 className="text-xl text-[#FFDF73]/80 mb-2 font-serif italic drop-shadow-md">Dearest</h2>
                <h1 className="text-gradient-gold font-serif text-3xl leading-tight tracking-tight px-2">
                    {guest.title ? `${guest.title} ` : ''}{guest.full_name}
                </h1>
                <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-[#FFDF73] to-transparent mt-6 mx-auto"></div>
            </motion.div>

            {/* Arch/Card Section */}
            <motion.div variants={itemVariants} className="relative w-full flex-1 mt-4 mb-8 flex justify-center">
                <div className="premium-glass rounded-t-full flex flex-col items-center justify-center text-center px-6 py-10 w-full max-w-sm">
                    <p className="text-white/80 text-sm italic font-serif leading-relaxed mb-6">
                        We are deeply honored to invite you to the Emeritus Ceremony of
                    </p>

                    {/* Monogram M */}
                    <div className="w-20 h-20 rounded-full border border-[#D4AF37]/50 p-1 mb-4 metallic-shadow">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0A192F] to-[#05101E] flex items-center justify-center text-[#FFDF73] italic font-serif text-2xl border border-white/10 metallic-shadow">
                            M
                        </div>
                    </div>

                    <h2 className="text-white/90 font-serif text-xl px-2 leading-snug drop-shadow-sm">
                        Pdt. Ny. Meinita M.E. Wungo-Damping
                    </h2>
                    <p className="mt-4 text-[#E6C875] text-[9px] tracking-[0.2em] uppercase font-bold drop-shadow-sm">
                        38 Years of Faithful Service
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}