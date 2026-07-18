const url = 'https://razanxfefihxrbdqdlcm.supabase.co/auth/v1/admin/users'
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhemFueGZlZmloeHJiZHFkbGNtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMDMzNSwiZXhwIjoyMDk4NDk2MzM1fQ.wTRFKTUc3aWoSyaIIc0iy95DIJaN13uoq0YPdTpQePs'

async function listUsers() {
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error('Error fetching users:', res.status, errText)
      return
    }
    const data = await res.json()
    console.log('Users found:', JSON.stringify(data.users.map(u => ({ id: u.id, email: u.email })), null, 2))
  } catch (error) {
    console.error('Fetch error:', error)
  }
}

listUsers()
