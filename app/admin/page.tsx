import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import AdminLogin from '@/components/AdminLogin'
import FadeIn from '@/components/FadeIn'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.email !== 'admin@meinita.amanloka.com') {
    return (
      <div className="p-8 bg-[#FDFBF7] min-h-screen flex items-center justify-center">
        <p className="text-[#0A192F]">Akses tidak sah. Silakan login terlebih dahulu.</p>
      </div>
    )
  }
  
  // Fetch stats from guests table
  const { data: guests, error } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error || !guests) {
    return (
      <div className="p-8 bg-[#FDFBF7] min-h-screen flex items-center justify-center">
        <p className="text-[#0A192F]">Error loading data or no data available.</p>
      </div>
    )
  }

  const totalInvited = guests.length
  const totalResponded = guests.filter(g => g.rsvp_status !== null).length
  const totalAttending = guests.filter(g => g.rsvp_status === true).length
  const totalDeclined = guests.filter(g => g.rsvp_status === false).length
  const projectedAttendees = guests
    .filter(g => g.rsvp_status === true)
    .reduce((sum, g) => sum + (g.attendance_count || 1), 0)

  return (
    <div className="p-8 bg-[#FDFBF7] min-h-screen w-full pb-20">
      <FadeIn direction="none" delay={0.1}>
        <div className="flex flex-col items-center mb-8 text-center mt-6">
          <span className="text-[10px] tracking-[0.2em] text-[#0A192F] font-bold uppercase mb-2">Dashboard</span>
          <h1 className="text-3xl font-serif text-[#0A192F] italic">Attendance</h1>
          <div className="w-8 h-px bg-[#D4AF37] mt-4"></div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2}>
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#0A192F]/5 p-4 flex flex-col items-center justify-center border border-[#0A192F]/10">
            <p className="text-[9px] uppercase tracking-widest text-[#0A192F]/60 font-bold mb-1 text-center">Invites</p>
            <p className="text-2xl font-serif text-[#0A192F]">{totalInvited}</p>
          </div>
          <div className="bg-[#0A192F]/5 p-4 flex flex-col items-center justify-center border border-[#0A192F]/10">
            <p className="text-[9px] uppercase tracking-widest text-[#0A192F]/60 font-bold mb-1 text-center">Responses</p>
            <p className="text-2xl font-serif text-[#0A192F]">{totalResponded}</p>
          </div>
          <div className="bg-[#0A192F] p-4 flex flex-col items-center justify-center">
            <p className="text-[9px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1 text-center">Attending</p>
            <p className="text-2xl font-serif text-white">{totalAttending}</p>
          </div>
          <div className="bg-white p-4 flex flex-col items-center justify-center border border-[#0A192F]/10">
            <p className="text-[9px] uppercase tracking-widest text-[#0A192F]/60 font-bold mb-1 text-center">Declined</p>
            <p className="text-2xl font-serif text-[#0A192F]">{totalDeclined}</p>
          </div>
        </div>

        <div className="bg-[#D4AF37] p-8 mb-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/5"></div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#0A192F] font-bold mb-2 relative z-10 text-center">Projected Headcount</p>
          <p className="text-6xl font-serif text-[#0A192F] relative z-10">{projectedAttendees}</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-serif text-[#0A192F] border-b border-[#0A192F]/20 pb-2 italic">Guest List</h2>
          {guests.length === 0 ? (
            <p className="text-sm text-[#0A192F]/60 text-center py-4 italic">No guests found.</p>
          ) : (
            guests.map(guest => (
              <div key={guest.id} className="flex justify-between items-center border-b border-[#0A192F]/10 pb-3">
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-[#0A192F]">{guest.title ? `${guest.title} ` : ''}{guest.full_name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-[#0A192F]/60 mt-0.5">{guest.category || 'Guest'}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  {guest.rsvp_status === true ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded uppercase tracking-widest">Attending ({guest.attendance_count})</span>
                  ) : guest.rsvp_status === false ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded uppercase tracking-widest">Declined</span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded uppercase tracking-widest">Pending</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </FadeIn>
    </div>
  )
}
