import WhatsAppTemplate from '@/components/admin/WhatsAppTemplate'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FadeIn from '@/components/FadeIn'

export const dynamic = 'force-dynamic'

export default async function WhatsAppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'admin@meinita.amanloka.com') {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-6 text-white font-sans pb-16">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-3xl font-serif font-bold text-gradient-gold">Integrasi WhatsApp</h1>
        <p className="text-white/50 text-xs mt-1">
          Kirim undangan personal dengan mudah ke masing-masing tamu menggunakan template dinamis.
        </p>
      </div>

      <FadeIn delay={0.1}>
        <WhatsAppTemplate />
      </FadeIn>
    </div>
  )
}
