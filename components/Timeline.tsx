'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, useInView } from 'framer-motion'

type Milestone = {
    id: string
    year: number
    title: string
    description: string
    image_url: string | null
}

function TimelineItem({ milestone, isLast }: { milestone: Milestone; isLast: boolean }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: "-50px" })

    return (
        <div ref={ref} className="relative flex gap-4">
            {/* Left Column: Dot + Line */}
            <div className="flex flex-col items-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 1.2, type: "spring", bounce: 0.3 }}
                    className="w-4 h-4 rounded-full bg-gradient-to-br from-[#E6C875] via-[#D4AF37] to-[#B8860B] border-2 border-[#0A192F] metallic-shadow z-10 shrink-0 mt-1"
                />
                {!isLast && (
                    <div className="w-px flex-1 bg-gradient-to-b from-[#D4AF37]/40 to-transparent min-h-[20px]" />
                )}
            </div>

            {/* Right Column: Content */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="flex-1 pb-10"
            >
                {/* Year Badge */}
                <span className="inline-block bg-[#0A192F] text-[#FFDF73] text-[9px] uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full border border-[#D4AF37]/50 mb-2 metallic-shadow">
                    {milestone.year}
                </span>

                {/* Title */}
                <h3 className="text-white font-serif text-lg leading-tight mb-2">
                    {milestone.title}
                </h3>

                {/* Description - NO line-clamp, show full text */}
                <p className="text-white/70 text-xs leading-relaxed font-sans">
                    {milestone.description}
                </p>

                {/* Image */}
                {milestone.image_url && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-4 rounded-lg overflow-hidden border border-[#D4AF37]/20 shadow-xl bg-[#020C1B]/60 flex items-center justify-center"
                    >
                        <img
                            src={milestone.image_url}
                            alt={milestone.title}
                            className="w-full h-auto max-h-64 object-contain"
                            loading="lazy"
                        />
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

export default function Timeline() {
    const [milestones, setMilestones] = useState<Milestone[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchMilestones = async () => {
            const { data, error } = await supabase
                .from('timeline_milestones')
                .select('*')
                .order('year', { ascending: true })

            if (!error && data) {
                setMilestones(data as Milestone[])
            }
            setLoading(false)
        }

        fetchMilestones()
    }, [supabase])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
            </div>
        )
    }

    if (milestones.length === 0) return null

    return (
        <div className="bg-gradient-to-b from-[#0A192F] to-[#020C1B] py-16 px-6">
            {/* Header */}
            <div className="text-center mb-12">
                <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-[#E6C875] text-[9px] uppercase tracking-[0.3em] font-bold drop-shadow-sm"
                >
                    Perjalanan Iman
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="text-gradient-gold font-serif italic text-3xl mt-2 mb-3"
                >
                    38 Years of Grace
                </motion.h2>
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-12 h-px bg-gradient-to-r from-transparent via-[#FFDF73] to-transparent mx-auto"
                />
            </div>

            {/* Timeline Container - Left aligned, full width cards */}
            <div className="relative max-w-md mx-auto">
                {milestones.map((milestone, index) => (
                    <TimelineItem
                        key={milestone.id}
                        milestone={milestone}
                        isLast={index === milestones.length - 1}
                    />
                ))}
            </div>

            {/* Footer Quote */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-center mt-8 px-4"
            >
                <div className="border-t border-[#D4AF37]/20 pt-8">
                    <p className="text-white/60 text-xs italic font-serif leading-relaxed">
                        "Karena itu, saudara-saudaraku yang kekasih, berdirilah teguh, jangan goyah, dan giatlah selalu dalam pekerjaan Tuhan! Sebab kamu tahu, bahwa dalam persekutuan dengan Tuhan jerih payahmu tidak sia-sia."
                    </p>
                    <p className="text-[#D4AF37] text-[9px] uppercase tracking-widest mt-4 font-bold">
                        1 Korintus 15:58
                    </p>
                </div>
            </motion.div>
        </div>
    )
}