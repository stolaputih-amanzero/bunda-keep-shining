'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Guest {
    full_name: string
    title: string
}

interface EnvelopeProps {
    guest: Guest
    children: React.ReactNode
}

export default function Envelope({ guest, children }: EnvelopeProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <AnimatePresence mode="wait">
            {!isOpen ? (
                <motion.div
                    key="envelope"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center justify-center min-h-screen px-6"
                >
                    {/* Envelope Icon with 3D Float Effect */}
                    <motion.div
                        style={{ perspective: 1000 }}
                        initial={{ y: 20 }}
                        animate={{ 
                            y: 0,
                            rotateX: [-2, 2, -2],
                            rotateY: [-2, 2, -2] 
                        }}
                        transition={{ 
                            y: { delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                            rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                            rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="relative mb-8 flex flex-col items-center"
                    >
                        <div className="w-64 h-40 bg-gradient-to-br from-[#0A192F] to-[#05101E] rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden border border-[#D4AF37]/50 metallic-shadow">
                            {/* Envelope Side Flaps Illusion */}
                            <div className="absolute top-0 w-full h-full border-t border-[#D4AF37]/20 opacity-50"></div>
                            
                            {/* Envelope Top Flap Accent */}
                            <div className="absolute top-[-60%] left-1/2 -translate-x-1/2 w-[280px] h-[280px] rotate-45 border-b border-r border-[#D4AF37]/40 rounded-br-2xl bg-gradient-to-br from-[#05101E]/40 to-[#D4AF37]/5 shadow-[0_6px_15px_rgba(0,0,0,0.6)] z-10 pointer-events-none"></div>
                            
                            {/* Guest Name - The Focal Point */}
                            <motion.div 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-20 px-6 mt-2"
                                animate={{ opacity: [0.8, 1, 0.8], scale: [0.98, 1, 0.98] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <p className="text-[8px] text-[#D4AF37]/70 uppercase tracking-[0.4em] font-bold mb-2">Kepada Yth.</p>
                                <p className="text-gradient-gold font-serif italic text-2xl leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                    {guest.title ? `${guest.title} ` : ''}{guest.full_name}
                                </p>
                            </motion.div>
                        </div>
                        {/* Interactive Wax Seal with Ripple */}
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
                            {/* Subtle Breathing Glow to Indicate Interactivity */}
                            <motion.div
                                animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.4, 0.1] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 rounded-full bg-[#D4AF37] pointer-events-none blur-[4px]"
                            />
                            <motion.button 
                                onClick={() => setIsOpen(true)}
                                whileHover={{ scale: 1.1, rotate: 10 }}
                                whileTap={{ scale: 0.9 }}
                                className="relative w-14 h-14 bg-gradient-to-br from-[#E6C875] via-[#D4AF37] to-[#B8860B] rounded-full metallic-shadow flex items-center justify-center border border-white/30 shadow-[0_0_20px_rgba(212,175,55,0.4)] cursor-pointer z-10"
                            >
                                <span className="text-[#05101E] font-serif text-2xl font-bold drop-shadow-sm">M</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Elegant Theme Text Lockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col items-center mt-16 pb-8"
                    >
                        <h2 className="text-gradient-gold font-serif italic text-4xl leading-normal drop-shadow-lg mb-1">
                            Keep Shining
                        </h2>
                        <p className="text-[#D4AF37]/80 text-[8px] tracking-[0.5em] uppercase font-bold text-center mt-1">
                            in His Grace
                        </p>
                    </motion.div>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    )
}