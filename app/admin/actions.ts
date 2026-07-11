'use server'

import { createClient } from '@/utils/supabase/server'

export async function loginAdmin(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi' }
  }

  if (email !== 'admin@meinita.amanloka.com') {
    return { error: 'Akses ditolak' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Return friendly message if translation is useful
    let message = error.message
    if (message.includes('Invalid login credentials')) {
      message = 'Email atau password salah'
    }
    return { error: message }
  }

  return { success: true }
}

export async function logoutAdmin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
