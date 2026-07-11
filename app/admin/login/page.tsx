'use client'

import { useState } from 'react'
import { loginAdmin } from '../actions'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { KeyRound, Mail, Loader2, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await loginAdmin(formData)

    if (result.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-[#0A192F] relative overflow-hidden">
      {/* Background Gold Dust Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.05),transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-[#D4AF37]/20 p-8 rounded-2xl shadow-2xl z-10"
      >
        {/* Monogram / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-[#D4AF37]/40 p-0.5 mb-4 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0A192F] to-[#020C1B] flex items-center justify-center text-[#D4AF37] italic font-serif text-xl border border-white/5">
              M
            </div>
          </div>
          <h1 className="text-xl font-serif text-white tracking-wide text-center">
            Keep Shining in His Grace
          </h1>
          <p className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-bold mt-1">
            Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/60 font-semibold block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                defaultValue="admin@meinita.amanloka.com"
                placeholder="admin@example.com"
                className="w-full bg-[#020C1B]/50 border border-white/10 text-white placeholder-white/20 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all rounded-lg font-sans"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/60 font-semibold block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-white/40">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-[#020C1B]/50 border border-white/10 text-white placeholder-white/20 pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 transition-all rounded-lg font-sans"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-400 text-xs bg-red-950/20 border border-red-500/10 p-3 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-[#0A192F] py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:shadow-lg hover:shadow-[#D4AF37]/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 cursor-pointer font-sans"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#0A192F]" />
                <span>Masuk...</span>
              </>
            ) : (
              <span>Masuk Dashboard</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
