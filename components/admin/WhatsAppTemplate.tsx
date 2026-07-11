'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from './Toast'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Copy, 
  Send, 
  Sparkles, 
  Search, 
  Download, 
  FileText, 
  Check,
  HelpCircle,
  Loader2
} from 'lucide-react'

type Guest = {
  id: string
  title: string | null
  full_name: string
  unique_token: string
  phone: string | null
}

const DEFAULT_TEMPLATE = `Shalom {title} {full_name},

Dengan penuh sukacita, kami mengundang Anda ke Ibadah Emeritus:
✨ Pdt. Ny. Meinita M.E. Wungo-Damping ✨
"Keep Shining in His Grace"

📅 {event_date}
⏰ {event_time}
📍 {event_location}

Buka undangan digital Anda:
{invitation_link}

Tuhan Yesus memberkati.`

export default function WhatsAppTemplate() {
  const supabase = createClient()
  const { success, error } = useToast()

  // Template states
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [eventDate, setEventDate] = useState('Minggu, 16 Agustus 2026')
  const [eventTime, setEventTime] = useState('09:00 WIB')
  const [eventLocation, setEventLocation] = useState('GPIB "Bukit Moria", Tebet')

  // Guest list states
  const [guests, setGuests] = useState<Guest[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  // Actions states
  const [copied, setCopied] = useState(false)
  const [generatingTxt, setGeneratingTxt] = useState(false)

  // Fetch guests for preview
  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true)
      try {
        const { data, error: err } = await supabase.rpc('admin_get_guests', {
          p_limit: 100, // Fetch top 100 for dropdown/search
        })
        if (err) throw err
        if (data) {
          const formatted = (data as any[]).map(g => ({
            id: g.id,
            title: g.title,
            full_name: g.full_name,
            unique_token: g.unique_token,
            phone: g.phone
          }))
          setGuests(formatted)
          if (formatted.length > 0) {
            setSelectedGuest(formatted[0])
          }
        }
      } catch (e) {
        error('Gagal memuat daftar tamu untuk pratinjau')
      } finally {
        setLoading(false)
      }
    }
    fetchGuests()
  }, [supabase, error])

  // Helper to compile message for a guest
  const compileMessage = (guest: Guest | null) => {
    if (!guest) return ''
    const titleVal = guest.title ? `${guest.title} ` : ''
    const link = `${window.location.origin}/invite/${guest.unique_token}`
    
    return template
      .replace(/{title}/g, titleVal)
      .replace(/{full_name}/g, guest.full_name)
      .replace(/{event_date}/g, eventDate)
      .replace(/{event_time}/g, eventTime)
      .replace(/{event_location}/g, eventLocation)
      .replace(/{invitation_link}/g, link)
  }

  const activeMessage = compileMessage(selectedGuest)

  // Copy rendered template to clipboard
  const handleCopy = () => {
    if (!activeMessage) return
    navigator.clipboard.writeText(activeMessage)
    setCopied(true)
    success('Pesan disalin ke clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Send WhatsApp Web redirect
  const handleSend = () => {
    if (!selectedGuest || !selectedGuest.phone) {
      error('Tamu terpilih tidak memiliki nomor HP')
      return
    }
    const cleanPhone = selectedGuest.phone.replace(/[^0-9]/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(activeMessage)}`
    window.open(url, '_blank')
    success('Membuka WhatsApp...')
  }

  // Export all messages to TXT
  const handleDownloadTxt = async () => {
    if (guests.length === 0) {
      error('Tidak ada data tamu untuk diekspor')
      return
    }

    setGeneratingTxt(true)
    try {
      // Fetch ALL guests to generate bulk text
      const { data: allGuests, error: fetchErr } = await supabase.rpc('admin_get_guests', {
        p_limit: 1000, // Large limit for exporting all
      })

      if (fetchErr) throw fetchErr

      if (allGuests) {
        const txtRows = (allGuests as any[]).map((g) => {
          const guestMsg = compileMessage({
            id: g.id,
            title: g.title,
            full_name: g.full_name,
            unique_token: g.unique_token,
            phone: g.phone
          })
          return `==========================================\nTAMU: ${g.title || ''} ${g.full_name} (${g.phone || 'Tanpa No HP'})\n==========================================\n\n${guestMsg}\n\n`
        })

        const blob = new Blob([txtRows.join('\n')], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Pesan_Undangan_WhatsApp_${new Date().toISOString().split('T')[0]}.txt`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        success('File TXT pesan massal berhasil diunduh')
      }
    } catch (e: any) {
      error('Gagal mengekspor teks: ' + e.message)
    } finally {
      setGeneratingTxt(false)
    }
  }

  // Filter guest list by search term
  const filteredGuests = guests.filter(g => 
    g.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
      
      {/* Column 1: Template Composer */}
      <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-sm font-serif font-bold text-gradient-gold flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Template Editor
          </h2>
          <p className="text-[10px] text-white/40 mt-1">
            Gunakan tag variabel di bawah ini untuk menyusun template pesan otomatis.
          </p>
        </div>

        {/* Template Variables Guide */}
        <div className="bg-white/2 border border-white/5 p-4 rounded-xl space-y-2">
          <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] font-bold flex items-center">
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            Variabel yang Tersedia:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-white/60">
            <code>{"{title}"}</code>
            <code>{"{full_name}"}</code>
            <code>{"{invitation_link}"}</code>
            <code>{"{event_date}"}</code>
            <code>{"{event_time}"}</code>
            <code>{"{event_location}"}</code>
          </div>
        </div>

        {/* Global Variables Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-white/50 font-bold">Tanggal Acara</label>
            <input 
              type="text" 
              value={eventDate} 
              onChange={(e) => setEventDate(e.target.value)} 
              className="w-full bg-[#020C1B] border border-white/10 p-2.5 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-white/50 font-bold">Waktu Acara</label>
            <input 
              type="text" 
              value={eventTime} 
              onChange={(e) => setEventTime(e.target.value)} 
              className="w-full bg-[#020C1B] border border-white/10 p-2.5 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-white/50 font-bold">Lokasi Acara</label>
            <input 
              type="text" 
              value={eventLocation} 
              onChange={(e) => setEventLocation(e.target.value)} 
              className="w-full bg-[#020C1B] border border-white/10 p-2.5 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]" 
            />
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-1 flex-1">
          <label className="text-[9px] uppercase tracking-wider text-white/50 font-bold block mb-1">Body Template</label>
          <textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="w-full h-80 bg-[#020C1B]/80 border border-white/10 p-4 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/25 rounded-xl resize-none leading-relaxed"
          />
        </div>

        {/* Export All Messages */}
        <button
          onClick={handleDownloadTxt}
          disabled={generatingTxt}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {generatingTxt ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
              <span>Memproses Berkas...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              <span>Unduh Seluruh Pesan (.TXT)</span>
            </>
          )}
        </button>
      </div>

      {/* Column 2: Live Preview & Sender */}
      <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-sm font-serif font-bold text-gradient-gold flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Live Preview
          </h2>
          <p className="text-[10px] text-white/40 mt-1">
            Pilih tamu untuk melihat hasil kompilasi pesan undangan secara spesifik.
          </p>
        </div>

        {/* Guest Selector Search */}
        <div className="space-y-3">
          <label className="text-[9px] uppercase tracking-wider text-white/50 font-bold block">Pilih Tamu Penerima</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40 pointer-events-none">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Cari nama tamu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#020C1B] border border-white/10 placeholder-white/30 text-white text-xs pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Quick Select List */}
          <div className="border border-white/5 bg-[#020C1B]/50 rounded-xl overflow-hidden h-32 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-white/30">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37] mr-2" />
                Memuat Tamu...
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-white/30 italic">
                Tamu tidak ditemukan
              </div>
            ) : (
              filteredGuests.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGuest(g)}
                  className={`w-full text-left px-4 py-2 text-xs flex justify-between items-center transition-colors cursor-pointer border-b border-white/2
                    ${selectedGuest?.id === g.id 
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] font-semibold' 
                      : 'text-white/70 hover:bg-white/2'
                    }
                  `}
                >
                  <span>{g.title ? `${g.title} ` : ''}{g.full_name}</span>
                  <span className="text-[9px] text-white/30">{g.phone || 'Tanpa No HP'}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Rendered Preview Box */}
        <div className="flex-1 flex flex-col space-y-1">
          <label className="text-[9px] uppercase tracking-wider text-white/50 font-bold block mb-1">Rendered Message Preview</label>
          <div className="flex-1 bg-[#020C1B]/80 border border-white/10 rounded-xl p-4 text-xs font-sans text-white leading-relaxed overflow-y-auto min-h-[220px] whitespace-pre-wrap">
            {selectedGuest ? activeMessage : <span className="text-white/25 italic">Silakan pilih tamu di atas terlebih dahulu.</span>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCopy}
            disabled={!selectedGuest}
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Salin Teks</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleSend}
            disabled={!selectedGuest || !selectedGuest.phone}
            className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-[#D4AF37]/15 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  )
}
