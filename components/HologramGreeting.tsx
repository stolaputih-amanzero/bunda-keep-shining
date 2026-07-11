'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Sparkles, Video, Volume2 } from 'lucide-react'

interface HologramGreetingProps {
  token: string
}

export default function HologramGreeting({ token }: HologramGreetingProps) {
  const supabase = createClient()
  const [videoData, setVideoData] = useState<{ youtube_id: string; title: string } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch video tribute configuration to use as greeting video
  useEffect(() => {
    const fetchVideo = async () => {
      const { data, error } = await supabase
        .from('event_config')
        .select('value')
        .eq('key', 'video_tribute')
        .single()

      if (!error && data) {
        setVideoData(data.value as any)
      }
      setLoading(false)
    }
    fetchVideo()
  }, [supabase])

  if (loading || !videoData?.youtube_id) return null

  const youtubeUrl = `https://www.youtube.com/embed/${videoData.youtube_id}?autoplay=1&rel=0&modestbranding=1&mute=0`

  return (
    <div className="w-full px-6 py-8 flex flex-col items-center select-none">
      
      {/* Projection Platform Wrapper */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-xs mt-4">
        
        {/* Animated Scanner Cone (Light Projection) */}
        <div className="absolute bottom-[40px] w-48 h-56 bg-gradient-to-t from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent clip-path-cone pointer-events-none blur-md z-0" />
        
        {/* Floating Hologram Card */}
        <motion.div
          animate={{ 
            y: [-8, 8, -8],
            rotateY: [-4, 4, -4]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          onClick={() => setIsPlaying(true)}
          className="relative z-10 w-full max-w-[220px] aspect-[3/4] premium-glass bg-gradient-to-b from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/45 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-[0_0_30px_rgba(212,175,55,0.2)] cursor-pointer group hover:border-[#D4AF37]/80 hover:shadow-[0_0_40px_rgba(212,175,55,0.35)] transition-all"
        >
          {/* Scanline overlay effect */}
          <div className="absolute inset-0 bg-scanlines opacity-20 pointer-events-none rounded-2xl" />

          {/* Top Label */}
          <span className="text-[7px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold">Hologram Transmission</span>

          {/* Visual Indicator of video / person */}
          <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-[#D4AF37]/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            {/* Pulsing ring inside */}
            <div className="absolute inset-1 rounded-full border border-[#D4AF37]/20 animate-ping opacity-60" />
            <div className="w-16 h-16 rounded-full bg-[#0A192F] border border-[#D4AF37]/30 flex items-center justify-center shadow-inner">
              <Video className="w-7 h-7 text-[#D4AF37] opacity-80" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text Title */}
          <div className="space-y-1">
            <h3 className="text-gradient-gold text-xs font-serif font-bold tracking-wide italic">Sapaan Hangat</h3>
            <p className="text-white/60 text-[9px] font-sans leading-tight">Sentuh untuk memutar pesan pribadi Bunda Meinita</p>
          </div>

          {/* Play CTA Icon */}
          <div className="w-9 h-9 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0A192F] shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-4 h-4 fill-[#0A192F] ml-0.5" />
          </div>
        </motion.div>

        {/* Projection Source Base */}
        <div className="relative mt-4 w-32 h-6 flex items-center justify-center">
          {/* Base outer ring */}
          <div className="absolute w-full h-2.5 rounded-full bg-[#0A192F] border border-[#D4AF37]/40 z-10 shadow-lg" />
          {/* Glowing central lens */}
          <div className="absolute w-12 h-1.5 rounded-full bg-[#D4AF37] animate-pulse blur-[2px] z-20" />
          {/* Scan light rays */}
          <div className="absolute w-16 h-1 rounded-full bg-white animate-pulse z-30" />
        </div>

      </div>

      {/* Hologram Video Playing Modal */}
      <AnimatePresence>
        {isPlaying && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlaying(false)}
              className="absolute inset-0 bg-[#0A192F]/95 backdrop-blur-md"
            />
            
            {/* Futuristic Holographic Video Player Frame */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md aspect-video bg-black rounded-2xl overflow-hidden border-2 border-[#D4AF37]/50 shadow-[0_0_50px_rgba(212,175,55,0.4)] z-10 flex flex-col justify-between"
            >
              {/* Scanline overlay over the iframe */}
              <div className="absolute inset-0 bg-scanlines opacity-15 pointer-events-none z-20" />

              {/* Close Button */}
              <button 
                onClick={() => setIsPlaying(false)}
                className="absolute top-4 right-4 z-30 p-2 bg-[#0A192F]/80 hover:bg-[#0A192F] text-white hover:text-[#D4AF37] rounded-full border border-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Autoplay Iframe */}
              <iframe
                src={youtubeUrl}
                title={videoData.title || "Greeting Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0 relative z-10 bg-black"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Styles for scanner clip-path and scanlines */}
      <style jsx global>{`
        .clip-path-cone {
          clip-path: polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%);
        }
        .bg-scanlines {
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.15),
            rgba(255, 255, 255, 0.15) 50%,
            transparent 50%,
            transparent
          );
          background-size: 100% 4px;
        }
      `}</style>

    </div>
  )
}
