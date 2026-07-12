'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Camera, ChevronLeft, ChevronRight, X, ZoomIn, Play, Pause } from 'lucide-react'

type Photo = {
  id: string
  image_url: string
  caption: string
}

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1) // 1 for right, -1 for left
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const supabase = createClient()
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('order_index', { ascending: true })

      if (!error && data) {
        setPhotos(data as Photo[])
      }
      setLoading(false)
    }
    fetchPhotos()
  }, [supabase])

  // Auto-play timer
  useEffect(() => {
    if (photos.length <= 1 || !isPlaying || selectedPhoto !== null) {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
      return
    }

    autoPlayTimer.current = setInterval(() => {
      handleNext()
    }, 4000) // Change every 4 seconds

    return () => {
      if (autoPlayTimer.current) clearInterval(autoPlayTimer.current)
    }
  }, [photos, currentIndex, isPlaying, selectedPhoto])

  const handleNext = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % photos.length)
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    )
  }

  if (photos.length === 0) return null

  const activePhoto = photos[currentIndex]

  // Slide Animation Variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.05
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.6, ease: 'easeOut' }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
        scale: { duration: 0.6, ease: 'easeIn' }
      }
    })
  }

  return (
    <div className="py-8 w-full max-w-full font-sans">
      {/* Header */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <Camera size={14} className="text-[#D4AF37]" />
        <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold">
          Dokumentasi Pelayanan
        </span>
      </div>

      {/* Main Slideshow Viewport */}
      <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-[#D4AF37]/30 bg-[#020C1B] shadow-2xl group">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full cursor-zoom-in"
            onClick={() => setSelectedPhoto(activePhoto)}
          >
            {/* Slide Image */}
            <img
              src={activePhoto.image_url}
              alt={activePhoto.caption || 'Foto Galeri'}
              className="w-full h-full object-cover select-none"
              loading="eager"
            />
            {/* Glassmorphic Caption Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] via-transparent to-transparent opacity-90 pointer-events-none" />
            
            {/* Caption Content */}
            {activePhoto.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-6 pt-12 text-center pointer-events-none">
                <motion.p 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="text-white text-xs sm:text-sm font-serif italic leading-relaxed break-words px-2"
                >
                  "{activePhoto.caption}"
                </motion.p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hover / Active Overlays (Chevrons & Zoom) */}
        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-full text-white/80 hover:text-white cursor-pointer opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={() => setSelectedPhoto(activePhoto)}>
          <ZoomIn size={16} className="text-[#D4AF37]" />
        </div>

        {/* Play/Pause control */}
        {photos.length > 1 && (
          <div 
            className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/10 p-2 rounded-full text-white/80 hover:text-white cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation()
              setIsPlaying(!isPlaying)
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="text-[#D4AF37]" />}
          </div>
        )}

        {/* Chevron Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all z-10 cursor-pointer active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-all z-10 cursor-pointer active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Slide Indicators / Dots */}
      {photos.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-1.5 transition-all rounded-full cursor-pointer
                ${idx === currentIndex 
                  ? 'w-6 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB]' 
                  : 'w-1.5 bg-white/20 hover:bg-white/45'
                }
              `}
            />
          ))}
        </div>
      )}

      {/* Lightbox / Large Preview Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/95 backdrop-blur-xl">
            {/* Backdrop click to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute inset-0 cursor-zoom-out"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-[#020C1B]/80 border border-[#D4AF37]/35 rounded-3xl overflow-hidden shadow-2xl z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 bg-[#0A192F]/80 border border-white/10 text-[#D4AF37] p-2 rounded-full hover:bg-white/5 transition-colors z-20 cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Large Image */}
              <div className="w-full aspect-[4/5] bg-black relative">
                <img
                  src={selectedPhoto.image_url}
                  alt={selectedPhoto.caption || 'Foto Galeri'}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Caption */}
              {selectedPhoto.caption && (
                <div className="p-6 bg-[#0A192F]/90 border-t border-[#D4AF37]/20 text-center">
                  <p className="text-white font-serif italic text-sm leading-relaxed">
                    "{selectedPhoto.caption}"
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}