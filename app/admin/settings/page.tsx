'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useToast } from '@/components/admin/Toast'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Video, 
  MapPin, 
  Music, 
  Image as ImageIcon,
  Save, 
  Loader2, 
  Music2
} from 'lucide-react'

type EventInfo = {
  date: string
  time: string
  location: string
  address: string
  map_link: string
}

type VideoTribute = {
  youtube_id: string
  title: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const { success, error } = useToast()

  // Configurations states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [youtubeId, setYoutubeId] = useState('')
  const [videoTitle, setVideoTitle] = useState('')

  const [hologramVideoUrl, setHologramVideoUrl] = useState('')
  const [uploadingHologram, setUploadingHologram] = useState(false)

  const [eventDate, setEventDate] = useState('Minggu, 16 Agustus 2026')
  const [eventTime, setEventTime] = useState('09:00 WIB')
  const [eventLocation, setEventLocation] = useState('GPIB "Bukit Moria"')
  const [eventAddress, setEventAddress] = useState('Jl. Soepomo No. 4, Tebet, Jakarta Selatan')
  const [mapLink, setMapLink] = useState('https://maps.app.goo.gl/...')

  const [musicUrl, setMusicUrl] = useState('/audio/theme.mp3')
  const [ogImageUrl, setOgImageUrl] = useState('/og-image.png')

  // Load configuration on mount
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      try {
        const { data, error: err } = await supabase.rpc('admin_get_event_configs')
        if (err) throw err

        if (data) {
          data.forEach((cfg: any) => {
            if (cfg.key === 'video_tribute') {
              setYoutubeId(cfg.value?.youtube_id || '')
              setVideoTitle(cfg.value?.title || '')
            }
            if (cfg.key === 'event_info') {
              setEventDate(cfg.value?.date || '')
              setEventTime(cfg.value?.time || '')
              setEventLocation(cfg.value?.location || '')
              setEventAddress(cfg.value?.address || '')
              setMapLink(cfg.value?.map_link || '')
            }
            if (cfg.key === 'music_config') {
              setMusicUrl(cfg.value?.music_url || '')
            }
            if (cfg.key === 'seo_config') {
              setOgImageUrl(cfg.value?.og_image_url || '')
            }
            if (cfg.key === 'hologram_config') {
              setHologramVideoUrl(cfg.value?.video_url || '')
            }
          })
        }
      } catch (e: any) {
        error('Gagal mengambil konfigurasi: ' + e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchConfigs()
  }, [supabase, error])

  // Save configurations action
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // 1. Save Video Tribute
      const { error: err1 } = await supabase.rpc('admin_update_event_config', {
        p_key: 'video_tribute',
        p_value: { youtube_id: youtubeId, title: videoTitle }
      })
      if (err1) throw err1

      // 2. Save Event Info
      const { error: err2 } = await supabase.rpc('admin_update_event_config', {
        p_key: 'event_info',
        p_value: { 
          date: eventDate, 
          time: eventTime, 
          location: eventLocation, 
          address: eventAddress, 
          map_link: mapLink 
        }
      })
      if (err2) throw err2

      // 3. Save Music Config
      const { error: err3 } = await supabase.rpc('admin_update_event_config', {
        p_key: 'music_config',
        p_value: { music_url: musicUrl }
      })
      if (err3) throw err3

      // 4. Save SEO Config
      const { error: err4 } = await supabase.rpc('admin_update_event_config', {
        p_key: 'seo_config',
        p_value: { og_image_url: ogImageUrl }
      })
      if (err4) throw err4

      // 5. Save Hologram Greeting Config
      const { error: err5 } = await supabase.rpc('admin_update_event_config', {
        p_key: 'hologram_config',
        p_value: { video_url: hologramVideoUrl }
      })
      if (err5) throw err5

      success('Konfigurasi berhasil disimpan')
    } catch (e: any) {
      error('Gagal menyimpan konfigurasi: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle OG image file upload to Supabase Storage
  const handleOgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSaving(true)
    try {
      // Upload to storage bucket named 'gallery'
      const fileExt = file.name.split('.').pop()
      const fileName = `og_image_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `settings/${fileName}`

      const { data, error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadErr) throw uploadErr

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      setOgImageUrl(publicUrl)
      success('OG Image berhasil diunggah')
    } catch (err: any) {
      error('Gagal mengunggah gambar: ' + err.message + '. Pastikan bucket "gallery" telah dibuat dan memiliki izin publik.')
    } finally {
      setSaving(false)
    }
  }

  // Handle Hologram Video file upload to Supabase Storage
  const handleHologramVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingHologram(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `hologram_greeting_${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`
      const filePath = `videos/${fileName}`

      const { data, error: uploadErr } = await supabase.storage
        .from('gallery')
        .upload(filePath, file)

      if (uploadErr) throw uploadErr

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      setHologramVideoUrl(publicUrl)
      success('Video sapaan hangat berhasil diunggah')
    } catch (err: any) {
      error('Gagal mengunggah video: ' + err.message + '. Pastikan bucket "gallery" telah dibuat dan memiliki izin publik.')
    } finally {
      setUploadingHologram(false)
    }
  }

  if (loading) {
    return (
      <div className="p-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        <p className="text-xs text-white/50 tracking-widest uppercase font-bold">Memuat Pengaturan...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-white font-sans pb-16">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-serif font-bold text-gradient-gold">Pengaturan</h1>
        <p className="text-white/50 text-xs mt-1">
          Konfigurasi detail acara, media tribute, latar musik, dan penyesuaian SEO sosial media.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Section 1: Event Details */}
        <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-serif font-bold text-white/95 flex items-center border-b border-white/5 pb-3">
            <MapPin className="w-4 h-4 mr-2 text-[#D4AF37]" />
            Detail Informasi Acara
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Hari &amp; Tanggal</label>
              <input 
                type="text" 
                value={eventDate} 
                onChange={(e) => setEventDate(e.target.value)} 
                placeholder="contoh: Minggu, 16 Agustus 2026"
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Waktu Pelaksanaan</label>
              <input 
                type="text" 
                value={eventTime} 
                onChange={(e) => setEventTime(e.target.value)} 
                placeholder="contoh: 09:00 WIB"
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Nama Tempat / Gedung</label>
              <input 
                type="text" 
                value={eventLocation} 
                onChange={(e) => setEventLocation(e.target.value)} 
                placeholder="contoh: GPIB Bukit Moria"
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Tautan Google Maps</label>
              <input 
                type="url" 
                value={mapLink} 
                onChange={(e) => setMapLink(e.target.value)} 
                placeholder="https://maps.app.goo.gl/..."
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Alamat Lengkap Lokasi</label>
              <textarea 
                value={eventAddress} 
                onChange={(e) => setEventAddress(e.target.value)} 
                placeholder="Masukkan alamat lengkap lokasi acara..."
                rows={2}
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37] resize-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Video Tribute */}
        <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-serif font-bold text-white/95 flex items-center border-b border-white/5 pb-3">
            <Video className="w-4 h-4 mr-2 text-[#D4AF37]" />
            Integrasi Video Tribute (YouTube)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">YouTube Video ID</label>
              <input 
                type="text" 
                value={youtubeId} 
                onChange={(e) => setYoutubeId(e.target.value)} 
                placeholder="contoh: dQw4w9WgXcQ (11 karakter kode ID)"
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Judul / Caption Video</label>
              <input 
                type="text" 
                value={videoTitle} 
                onChange={(e) => setVideoTitle(e.target.value)} 
                placeholder="contoh: 38 Years of Faithful Service"
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2.5: Hologram Greeting Video */}
        <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-serif font-bold text-white/95 flex items-center border-b border-white/5 pb-3">
            <Video className="w-4 h-4 mr-2 text-[#D4AF37]" />
            Hologram Transmission (Sapaan Hangat Video)
          </h2>

          <div className="space-y-4 text-xs">
            {hologramVideoUrl && (
              <div className="aspect-video w-full max-w-sm rounded-xl overflow-hidden bg-black border border-white/10">
                <video src={hologramVideoUrl} controls className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">File Video Sapaan Hangat (MP4/WebM)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={hologramVideoUrl} 
                  onChange={(e) => setHologramVideoUrl(e.target.value)}
                  placeholder="Belum ada video sapaan hangat diunggah..."
                  className="flex-1 bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37] text-white/60 truncate"
                />
                <label className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-lg font-bold flex items-center justify-center cursor-pointer shrink-0 transition-colors text-xs text-[#D4AF37]">
                  {uploadingHologram ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                  ) : (
                    <span>Unggah</span>
                  )}
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={handleHologramVideoUpload}
                    className="hidden" 
                  />
                </label>
              </div>
              <p className="text-[9px] text-white/40 leading-relaxed">
                Tip: Kompres video menggunakan encoder H.264 (MP4) agar video lancar diputar pada semua perangkat mobile (ukuran disarankan di bawah 10MB).
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Audio & Social Media Metadata */}
        <div className="premium-glass bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg space-y-4">
          <h2 className="text-sm font-serif font-bold text-white/95 flex items-center border-b border-white/5 pb-3">
            <Music className="w-4 h-4 mr-2 text-[#D4AF37]" />
            Audio Latar &amp; Gambar Sosial Media
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">Tautan File Audio / Lagu</label>
              <input 
                type="text" 
                value={musicUrl} 
                onChange={(e) => setMusicUrl(e.target.value)} 
                placeholder="contoh: /audio/theme.mp3 atau URL absolute"
                className="w-full bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-white/50 font-bold">URL Gambar Pratinjau (OG Image)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={ogImageUrl} 
                  onChange={(e) => setOgImageUrl(e.target.value)} 
                  placeholder="/og-image.png"
                  className="flex-1 bg-[#020C1B] border border-white/10 p-3 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                  required
                />
                <label className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-lg font-bold flex items-center justify-center cursor-pointer shrink-0 transition-colors">
                  <span>Unggah</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleOgImageUpload}
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center sm:justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:shadow-lg hover:shadow-[#D4AF37]/25 transition-all cursor-pointer disabled:opacity-50 w-full sm:w-auto"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>

      </form>
    </div>
  )
}
