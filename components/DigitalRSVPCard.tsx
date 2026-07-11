'use client'

import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas-pro'
import QRCode from 'qrcode'
import { Download } from 'lucide-react'
import { motion } from 'framer-motion'

interface DigitalRSVPCardProps {
  token: string
  guestName: string
  count: number
}

export default function DigitalRSVPCard({ token, guestName, count }: DigitalRSVPCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  // Generate scannable QR Code on mount
  useEffect(() => {
    const generateQR = async () => {
      try {
        const inviteUrl = `${window.location.origin}/invite/${token}`
        const url = await QRCode.toDataURL(inviteUrl, {
          width: 300,
          margin: 1.5,
          color: {
            dark: '#D4AF37',   // Gold color code
            light: '#05101E'  // Deep Navy background
          }
        })
        setQrCodeUrl(url)
      } catch (err) {
        console.error('Failed to generate QR Code:', err)
      }
    }
    generateQR()
  }, [token])

  const handleDownload = async () => {
    if (!cardRef.current) return
    setIsGenerating(true)

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2.5, // High resolution capture
        backgroundColor: '#0A192F', // Background matches parent wrapper
        logging: false,
        useCORS: true // Allow rendering QR code image correctly
      })

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `VIP_Pass_${guestName.replace(/\s+/g, '_')}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to generate image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-center mt-6 w-full font-sans select-none">
      <motion.div 
        style={{ perspective: 1000 }}
        animate={{ rotateX: [-2.5, 2.5, -2.5], rotateY: [-2.5, 2.5, -2.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-[300px]"
      >
        {/* VIP Pass Card */}
        <div 
          ref={cardRef}
          className="w-full bg-[#05101E] relative flex flex-col items-center justify-center border border-[#D4AF37]/50 rounded-2xl overflow-hidden shadow-2xl shadow-[#D4AF37]/10"
        >
          {/* Top Section - Gold Border Accent */}
          <div className="w-full p-6 text-center border-b-[2px] border-dashed border-[#D4AF37]/35 bg-[#0A192F]">
            <span className="text-[#D4AF37] text-[8px] tracking-[0.4em] uppercase font-bold block mb-2">
              VIP Entry Pass
            </span>
            <h3 className="text-xl font-serif text-[#FFDF73] italic leading-snug truncate px-1">
              {guestName}
            </h3>
            <p className="text-white/50 text-[8px] uppercase tracking-[0.2em] font-semibold mt-2.5">
              Konfirmasi: {count} Tamu
            </p>
          </div>

          {/* Bottom Section */}
          <div className="w-full p-6 flex flex-col items-center bg-gradient-to-b from-[#05101E] to-[#0A192F]">
            
            {/* Real QR Code instead of static icon */}
            <div className="w-32 h-32 p-1.5 bg-[#05101E] border border-[#D4AF37]/30 rounded-xl flex items-center justify-center mb-4 shadow-lg">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="Scannable QR Code" 
                  className="w-full h-full object-contain rounded-lg"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="w-full h-full bg-[#0A192F] animate-pulse rounded-lg" />
              )}
            </div>

            <p className="text-white/40 text-[7px] font-sans uppercase tracking-[0.3em] mb-1">
              Ibadah Emeritus
            </p>
            <p className="text-[#D4AF37] text-xs font-serif italic mb-4 text-center">
              Pdt. Ny. Meinita M.E. Wungo-Damping
            </p>
            
            {/* Unique VIP Pass Hex Code */}
            <div className="text-[8px] text-white/30 font-mono tracking-[0.3em]">
              PASS: {Math.abs(guestName.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString(16).toUpperCase()}-{count}
            </div>
          </div>
          
          {/* Ticket Edge Cutouts */}
          <div className="absolute top-[37.5%] -left-3.5 w-7 h-7 bg-[#0A192F] border-r border-[#D4AF37]/50 rounded-full" />
          <div className="absolute top-[37.5%] -right-3.5 w-7 h-7 bg-[#0A192F] border-l border-[#D4AF37]/50 rounded-full" />
        </div>
      </motion.div>

      {/* Elegant CTA Download Button (Plain Monochromatic/Gold/Navy styling) */}
      <button
        onClick={handleDownload}
        disabled={isGenerating || !qrCodeUrl}
        className="mt-6 flex items-center justify-center space-x-2 text-[9px] uppercase tracking-widest font-bold text-[#0A192F] bg-gradient-to-r from-[#E6C875] via-[#D4AF37] to-[#B8860B] px-7 py-3.5 rounded-full hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        <Download size={13} className="text-[#0A192F]" />
        <span>{isGenerating ? 'Menyimpan...' : 'Unduh Kartu VIP'}</span>
      </button>
    </div>
  )
}
