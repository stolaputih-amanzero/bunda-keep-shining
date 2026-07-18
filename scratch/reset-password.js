const userId = 'ba3d8a67-d222-4eb3-8573-1b8681130a2a'
const url = `https://razanxfefihxrbdqdlcm.supabase.co/auth/v1/admin/users/${userId}`
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhemFueGZlZmloeHJiZHFkbGNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMDMzNSwiZXhwIjoyMDk4NDk2MzM1fQ.wTRFKTUc3aWoSyaIIc0iy95DIJaN13uoq0YPdTpQePs'

// Set password to command line argument if provided, otherwise default to a secure generated one
const newPassword = process.argv[2] || 'MeinitaAmanloka2026#'

async function resetPassword() {
  console.log(`Resetting password for admin@meinita.amanloka.com to: "${newPassword}"`)
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: newPassword,
        email_confirm: true // automatically confirms email if needed
      })
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Error updating password:', res.status, errText)
      return
    }

    const data = await res.json()
    console.log('Password successfully reset! User metadata updated:', {
      id: data.id,
      email: data.email,
      updated_at: data.updated_at
    })
  } catch (error) {
    console.error('Network/Fetch error:', error)
  }
}

resetPassword()
