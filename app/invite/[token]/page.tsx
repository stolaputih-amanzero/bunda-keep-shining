import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createClient } from '@/utils/supabase/server'
import RSVPForm from '@/components/RSVPForm'
import Guestbook from '@/components/Guestbook'
import CountdownTimer from '@/components/CountdownTimer'
import FadeIn from '@/components/FadeIn'
import ShareButton from '@/components/ShareButton'
import PhotoGallery from '@/components/PhotoGallery'
import MapModal from '@/components/MapModal'
import BackgroundMusic from '@/components/BackgroundMusic'
import DownloadPDF from '@/components/DownloadPDF'
import ScrollProgress from '@/components/ScrollProgress'
import VideoTribute from '@/components/VideoTribute'
import Envelope from '@/components/landing/Envelope'
import Greeting from '@/components/landing/Greeting'
import Timeline from '@/components/Timeline'
import GoldDust from '@/components/GoldDust'
import HologramGreeting from '@/components/HologramGreeting'

const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_APP_URL || 'https://meinita.amanloka.com'
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`
  }
  return url
}
const baseUrl = getBaseUrl()

// ✅ WHATSAPP PREVIEW METADATA (PERSONALIZED PER TAMU)
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: guests } = await supabase.rpc('get_guest_by_token', {
    p_token: resolvedParams.token
  })
  const guest = guests?.[0]

  const guestName = guest
    ? (guest.title ? `${guest.title} ${guest.full_name}` : guest.full_name)
    : 'Tamu Undangan'

  return {
    title: 'Undangan Emeritus - Pdt. Ny. Meinita M.E. Wungo-Damping',
    description: `Shalom ${guestName}, Anda diundang ke Ibadah Emeritus Pdt. Ny. Meinita M.E. Wungo-Damping (38 Tahun Pelayanan) pada Minggu, 16 Agustus 2026 di GPIB Bukit Moria.`,
    openGraph: {
      title: 'Undangan Emeritus - Pdt. Ny. Meinita M.E. Wungo-Damping',
      description: `Shalom ${guestName}, Anda diundang ke Ibadah Emeritus Pdt. Ny. Meinita M.E. Wungo-Damping (38 Tahun Pelayanan).`,
      url: `${baseUrl}/invite/${resolvedParams.token}`,
      siteName: 'Keep Shining in His Grace',
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Undangan Emeritus Pdt. Ny. Meinita M.E. Wungo-Damping',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Undangan Emeritus - Pdt. Ny. Meinita M.E. Wungo-Damping',
      description: `Shalom ${guestName}, Anda diundang ke Ibadah Emeritus...`,
      images: [`${baseUrl}/og-image.png`],
    },
  }
}

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  // ✅ SECURE: Menggunakan RPC Function
  const { data: guests, error } = await supabase.rpc('get_guest_by_token', {
    p_token: resolvedParams.token
  })

  const guest = guests?.[0]

  if (error || !guest) {
    notFound()
  }

  const { data: prayers } = await supabase
    .from('prayers_guestbook')
    .select('id, message, created_at, guests(full_name)')
    .order('created_at', { ascending: false })

  const initialPrayers = (prayers as any) || []

  return (
    <>
      {/* ✅ MOBILE-CENTRIC WRAPPER */}
      <main className="relative mx-auto w-full flex min-h-screen max-w-md flex-col bg-[#0A192F] bg-spotlight text-white overflow-x-hidden">
        <GoldDust />

        {/* ✅ ENVELOPE ANIMATION */}
        <Envelope guest={guest}>

          {/* ✅ FLOATING BUTTONS - DI DALAM ENVELOPE (Clean Design) */}
          <BackgroundMusic />
          <ShareButton
            title="Undangan Emeritus - Pdt. Ny. Meinita M.E. Wungo-Damping"
            text={`Shalom, Anda diundang ke Ibadah Emeritus Pdt. Ny. Meinita M.E. Wungo-Damping (38 Tahun Pelayanan) pada Minggu, 16 Agustus 2026 di GPIB Bukit Moria, Tebet. Tuhan Yesus memberkati.`}
          />
          <ScrollProgress />

          {/* ✅ GREETING COMPONENT */}
          <Greeting guest={guest} />

          {/* ✅ HOLOGRAM VIDEO GREETING */}
          <HologramGreeting token={resolvedParams.token} />

          {/* ✅ TIMELINE 38 TAHUN */}
          <Timeline />

          {/* ✅ DETAIL ACARA */}
          <FadeIn delay={0.4} className="bg-[#0A192F] text-white px-4 py-8 border-t border-[#D4AF37]/20">
            <div className="flex flex-col space-y-6">

              {/* Tanggal & Waktu */}
              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div className="flex flex-col">
                  <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-semibold">Hari / Tanggal</span>
                  <span className="text-base font-serif italic mt-1 text-white">Minggu, 16 Agustus 2026</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-semibold">Waktu</span>
                  <span className="text-base font-serif italic mt-1 text-white">09:00 WIB</span>
                </div>
              </div>

              {/* Lokasi */}
              <div className="flex flex-col">
                <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-semibold mb-2">Tempat</span>
                <p className="text-white font-serif text-base mb-1">GPIB "Bukit Moria"</p>
                <p className="text-white/70 text-xs font-sans mb-3">Jl. Soepomo No. 4, Tebet, Jakarta Selatan</p>
                <MapModal />
              </div>

              {/* Countdown */}
              <CountdownTimer targetDate="2026-08-16T09:00:00+07:00" />

              {/* Photo & Video */}
              <div className="w-full max-w-full overflow-hidden">
                <PhotoGallery />
                <VideoTribute />
              </div>

              {/* ✅ RSVP - Typo FIXED */}
              <RSVPForm
                token={guest.unique_token}
                guestName={guest.title ? `${guest.title} ${guest.full_name}` : guest.full_name}
                initialStatus={guest.rsvp_status}
                initialCount={guest.attendance_count}
              />
            </div>
          </FadeIn>

          {/* ✅ GUESTBOOK */}
          <FadeIn delay={0.2} className="bg-[#FDFBF7] text-[#0A192F]">
            <Guestbook
              token={guest.unique_token}
              guestName={guest.full_name}
              initialPrayers={initialPrayers}
            />
            <div className="pb-12 flex justify-center pt-8 px-4">
              <DownloadPDF guestName={guest.full_name} guestTitle={guest.title} />
            </div>
          </FadeIn>

          <div className="sticky bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full mx-auto my-4 z-50"></div>
        </Envelope>
      </main>
    </>
  )
}