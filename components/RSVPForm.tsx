'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import confetti from 'canvas-confetti'
import DigitalRSVPCard from '@/components/DigitalRSVPCard'

interface RSVPFormProps {
  token: string
  guestName: string
  initialStatus: boolean | null
  initialCount: number
  initialNotes?: string
}

export default function RSVPForm({
  token,
  guestName,
  initialStatus,
  initialCount,
  initialNotes = '',
}: RSVPFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<boolean | null>(initialStatus)
  const [count, setCount] = useState<number>(initialCount || 1)
  const [notes, setNotes] = useState<string>(initialNotes)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(initialStatus !== null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleUpdate = async () => {
    if (status === null) return

    setIsSubmitting(true)
    setError(null)

    // ✅ SECURITY FIX: Menggunakan RPC Function (Bukan direct update)
    const { error: updateError } = await supabase.rpc('update_rsvp_by_token', {
      p_token: token,
      p_status: status,
      p_count: status ? count : 0,
      p_notes: notes || ''
    })

    setIsSubmitting(false)

    if (updateError) {
      console.error('RSVP Error:', updateError)
      setError('Terjadi kesalahan sistem. Silakan coba lagi.')
    } else {
      setIsSuccess(true)
      setIsOpen(false)

      // Efek Confetti jika tamu menerima undangan
      if (status === true) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#ffffff', '#0A192F']
        })
      }
    }
  }

  // Tampilan jika sudah berhasil RSVP
  if (isSuccess && !isOpen) {
    return (
      <div className="flex flex-col items-center w-full mt-6">
        <div className="w-full border border-[#D4AF37]/30 p-6 text-center bg-white/5 backdrop-blur-sm rounded-lg">
          <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-2">
            RSVP Confirmed
          </p>
          <p className="text-white/90 text-lg font-serif italic mb-1">
            {status ? `Joyfully attending (${count})` : 'Respectfully declining'}
          </p>
          {notes && (
            <p className="text-white/50 text-xs mt-3 italic">"{notes}"</p>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="text-[#D4AF37] text-[9px] uppercase tracking-widest underline underline-offset-4 mt-4 hover:text-white transition-colors"
          >
            Update RSVP
          </button>
        </div>
        {status && (
          <div className="mt-4 w-full">
            <DigitalRSVPCard token={token} guestName={guestName} count={count} />
          </div>
        )}
      </div>
    )
  }

  // Tampilan tombol awal
  if (!isOpen && !isSuccess) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] py-4 mt-6 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-amber-500/20 transition-all active:scale-95"
      >
        Konfirmasi Kehadiran (RSVP)
      </button>
    )
  }

  // Tampilan Form
  return (
    <div className="mt-6 border border-[#D4AF37]/30 p-6 flex flex-col space-y-6 bg-white/5 backdrop-blur-sm rounded-lg">
      <div className="flex flex-col space-y-4">
        <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold text-center">
          Apakah Anda dapat hadir?
        </span>
        <div className="flex space-x-3">
          <button
            onClick={() => setStatus(true)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold rounded-full border transition-all ${status === true
                ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37] shadow-lg shadow-amber-500/20'
                : 'bg-transparent text-white border-white/20 hover:border-[#D4AF37]/50'
              }`}
          >
            Hadir
          </button>
          <button
            onClick={() => setStatus(false)}
            className={`flex-1 py-3 text-[10px] uppercase tracking-widest font-bold rounded-full border transition-all ${status === false
                ? 'bg-[#D4AF37] text-[#0A192F] border-[#D4AF37] shadow-lg shadow-amber-500/20'
                : 'bg-transparent text-white border-white/20 hover:border-[#D4AF37]/50'
              }`}
          >
            Maaf, Tidak Bisa
          </button>
        </div>
      </div>

      {status === true && (
        <div className="flex flex-col space-y-4 items-center border-t border-white/10 pt-6">
          <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold text-center">
            Jumlah Tamu
          </span>
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setCount(Math.max(1, count - 1))}
              className="w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center text-xl font-serif hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            >
              -
            </button>
            <span className="text-2xl font-serif text-white w-6 text-center">{count}</span>
            <button
              onClick={() => setCount(Math.min(5, count + 1))}
              className="w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center text-xl font-serif hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Sentuhan Personal: Catatan Khusus */}
      <div className="flex flex-col space-y-2 border-t border-white/10 pt-6">
        <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold text-center">
          Catatan Khusus / Doa (Opsional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Tulis doa atau catatan singkat untuk Pdt. Meinita..."
          className="w-full bg-[#0A192F]/50 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none h-20"
        />
      </div>

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <div className="flex flex-col space-y-3 pt-2">
        <button
          onClick={handleUpdate}
          disabled={status === null || isSubmitting}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
        </button>
        {isSuccess && (
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/60 text-[9px] uppercase tracking-widest py-2 hover:text-white transition-colors"
          >
            Batal
          </button>
        )}
      </div>
    </div>
  )
}